"""
Dashboard aggregate stats endpoint.
Mounted at /api/dashboard
"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Customer, Order, Product, OrderItem
from ..schemas import DashboardStats

router = APIRouter()

LOW_STOCK_THRESHOLD = 5


@router.get("/dashboard", response_model=DashboardStats)
def dashboard(db: Session = Depends(get_db)):
    """Aggregate stats: totals + low stock + top products + weekly orders + total revenue."""
    total_products = db.query(Product).count()
    total_customers = db.query(Customer).count()
    total_orders = db.query(Order).count()
    
    # 1. Low Stock Alerts
    low_stock = (
        db.query(Product)
        .filter(Product.quantity_in_stock <= LOW_STOCK_THRESHOLD)
        .order_by(Product.quantity_in_stock)
        .all()
    )

    # 2. Total Revenue (Coalesce NULL sum to 0.0)
    total_revenue_decimal = db.query(func.coalesce(func.sum(Order.total_amount), 0)).scalar()
    total_revenue = float(total_revenue_decimal)

    # 3. Top Products by quantity sold
    top_products_query = (
        db.query(Product.name, func.sum(OrderItem.quantity).label("total_quantity_sold"))
        .join(OrderItem, Product.id == OrderItem.product_id)
        .group_by(Product.id, Product.name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
        .all()
    )
    top_products = [
        {"name": name, "total_quantity_sold": int(qty)}
        for name, qty in top_products_query
    ]

    # 4. Orders per day for the last 7 days (including zero-order days)
    today = datetime.now(timezone.utc).date()
    last_7_days = [today - timedelta(days=i) for i in range(6, -1, -1)]
    start_date = datetime.combine(today - timedelta(days=6), datetime.min.time(), tzinfo=timezone.utc)
    
    orders = db.query(Order).filter(Order.created_at >= start_date).all()
    
    orders_dict = {}
    for o in orders:
        date_str = o.created_at.astimezone(timezone.utc).strftime("%Y-%m-%d")
        orders_dict[date_str] = orders_dict.get(date_str, 0) + 1
        
    orders_per_day = [
        {"date": d.strftime("%Y-%m-%d"), "count": orders_dict.get(d.strftime("%Y-%m-%d"), 0)}
        for d in last_7_days
    ]

    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_products": low_stock,
        "top_products": top_products,
        "orders_per_day": orders_per_day,
        "total_revenue": total_revenue,
    }
