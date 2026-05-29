"""
Product CRUD endpoints.
POST, GET (all), GET (by id), PUT, DELETE — mounted at /api/products
"""

import csv
import io
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Product
from ..schemas import ProductCreate, ProductOut, ProductUpdate

router = APIRouter()


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(data: ProductCreate, db: Session = Depends(get_db)):
    # Enforce unique SKU with a clear error
    if db.query(Product).filter(Product.sku == data.sku).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A product with SKU '{data.sku}' already exists.",
        )
    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.post("/bulk")
async def bulk_create_products(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    content = await file.read()
    decoded = content.decode('utf-8')
    reader = csv.DictReader(io.StringIO(decoded))
    
    # Check headers first
    if not reader.fieldnames or not all(k in reader.fieldnames for k in ['name', 'sku', 'price', 'quantity_in_stock']):
        raise HTTPException(
            status_code=400, 
            detail="CSV file must contain headers: name, sku, price, quantity_in_stock"
        )
    
    created = []
    errors = []
    seen_skus = set()
    
    for i, row in enumerate(reader, start=2):  # start=2 because row 1 is header
        try:
            # Validate required fields
            if not all(k in row for k in ['name', 'sku', 'price', 'quantity_in_stock']):
                errors.append(f"Row {i}: Missing required columns")
                continue

            sku = row['sku'].strip()
            name = row['name'].strip()
            price_str = row['price'].strip()
            qty_str = row['quantity_in_stock'].strip()

            if not name or not sku or not price_str or not qty_str:
                errors.append(f"Row {i}: Missing required fields or empty values")
                continue

            if sku in seen_skus:
                errors.append(f"Row {i}: Duplicate SKU '{sku}' within the file")
                continue
            seen_skus.add(sku)

            # Check duplicate SKU in DB
            existing = db.query(Product).filter(Product.sku == sku).first()
            if existing:
                errors.append(f"Row {i}: SKU '{sku}' already exists in database")
                continue

            product = Product(
                name=name,
                sku=sku,
                price=float(price_str),
                quantity_in_stock=int(qty_str)
            )
            db.add(product)
            db.flush()  # get ID without committing
            created.append(sku)

        except ValueError as e:
            errors.append(f"Row {i}: Invalid data — {str(e)}")
        except Exception as e:
            errors.append(f"Row {i}: {str(e)}")

    db.commit()

    return {
        "created": len(created),
        "errors": errors,
        "message": f"{len(created)} products created, {len(errors)} failed"
    }


@router.get("", response_model=List[ProductOut])
def list_products(db: Session = Depends(get_db)):
    return db.query(Product).order_by(Product.id).all()


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    return product


@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int, data: ProductUpdate, db: Session = Depends(get_db)
):
    product = db.query(Product).get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    update_data = data.model_dump(exclude_unset=True)

    # If SKU is changing, verify uniqueness
    if "sku" in update_data and update_data["sku"] != product.sku:
        existing = db.query(Product).filter(Product.sku == update_data["sku"]).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A product with SKU '{update_data['sku']}' already exists.",
            )

    for key, value in update_data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", response_model=ProductOut)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    db.delete(product)
    db.commit()
    return product
