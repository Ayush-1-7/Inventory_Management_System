"""
Order endpoints.
POST (create with stock deduction), GET (all), GET (by id), DELETE (cancel + restore stock)
Mounted at /api/orders
"""

from decimal import Decimal
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Customer, Order, OrderItem, Product
from ..schemas import OrderCreate, OrderListOut, OrderOut

router = APIRouter()


# ── Helpers ──────────────────────────────────────────────────────────────────

def _serialize_order_detail(order: Order) -> dict:
    """Build a dict matching OrderOut, enriching items with product info."""
    return {
        "id": order.id,
        "customer_id": order.customer_id,
        "customer_name": order.customer.full_name if order.customer else None,
        "total_amount": float(order.total_amount),
        "status": order.status,
        "created_at": order.created_at,
        "item_count": len(order.items),
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product.name if item.product else None,
                "product_sku": item.product.sku if item.product else None,
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
            }
            for item in order.items
        ],
    }


def _serialize_order_list(order: Order) -> dict:
    """Build a dict matching OrderListOut (no items array)."""
    return {
        "id": order.id,
        "customer_id": order.customer_id,
        "customer_name": order.customer.full_name if order.customer else None,
        "total_amount": float(order.total_amount),
        "status": order.status,
        "created_at": order.created_at,
        "item_count": len(order.items),
    }


def _load_order(db: Session, order_id: int) -> Order:
    """Eagerly load an order with customer + items + products."""
    order = (
        db.query(Order)
        .options(
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.customer),
        )
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    return order


# ── Routes ───────────────────────────────────────────────────────────────────


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    """
    Create an order inside a DB transaction:
    1. Validate customer exists
    2. Validate each product exists and has sufficient stock
    3. Deduct stock atomically
    4. Snapshot unit_price from current product price
    5. Calculate total_amount = Σ(unit_price × quantity)
    """
    # 1 — Validate customer
    customer = db.query(Customer).get(data.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")

    total = Decimal("0")
    order_items: list[OrderItem] = []

    for item_data in data.items:
        # 2 — Validate product
        product = db.query(Product).get(item_data.product_id)
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product with id {item_data.product_id} not found.",
            )

        # 3 — Check sufficient stock
        if product.quantity_in_stock < item_data.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Insufficient stock for product: {product.name}. "
                    f"Available: {product.quantity_in_stock}, "
                    f"Requested: {item_data.quantity}"
                ),
            )

        # 4 — Deduct stock
        product.quantity_in_stock -= item_data.quantity

        # 5 — Snapshot price and accumulate total
        unit_price = product.price
        line_total = unit_price * item_data.quantity
        total += line_total

        order_items.append(
            OrderItem(
                product_id=product.id,
                quantity=item_data.quantity,
                unit_price=unit_price,
            )
        )

    order = Order(
        customer_id=data.customer_id,
        total_amount=total,
        items=order_items,
    )
    db.add(order)
    db.commit()

    # Re-fetch with joined loads for a complete response
    full_order = _load_order(db, order.id)
    return _serialize_order_detail(full_order)


@router.get("", response_model=List[OrderListOut])
def list_orders(db: Session = Depends(get_db)):
    """List all orders with customer name and item count (no full item details)."""
    orders = (
        db.query(Order)
        .options(
            joinedload(Order.items),
            joinedload(Order.customer),
        )
        .order_by(Order.id.desc())
        .all()
    )
    return [_serialize_order_list(o) for o in orders]


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Full order detail with items and product names."""
    order = _load_order(db, order_id)
    return _serialize_order_detail(order)


@router.delete("/{order_id}", response_model=OrderOut)
def cancel_order(order_id: int, db: Session = Depends(get_db)):
    """
    Cancel (delete) an order AND restore stock for every item.
    This prevents stock from being permanently lost on cancellation.
    """
    order = _load_order(db, order_id)
    result = _serialize_order_detail(order)

    # Restore stock for each order item
    for item in order.items:
        product = db.query(Product).get(item.product_id)
        if product:
            product.quantity_in_stock += item.quantity

    db.delete(order)
    db.commit()
    return result
