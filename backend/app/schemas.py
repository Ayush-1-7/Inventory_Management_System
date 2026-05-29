"""
Pydantic schemas for request validation and response serialisation.
All monetary fields use float for JSON compatibility (backed by Numeric in the DB).
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


# ══════════════════════════════════════════════════════════════════════════════
#  PRODUCT
# ══════════════════════════════════════════════════════════════════════════════

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    sku: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., gt=0, description="Must be positive")
    quantity_in_stock: int = Field(..., ge=0, description="Cannot be negative")


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[float] = Field(None, gt=0)
    quantity_in_stock: Optional[int] = Field(None, ge=0)


class ProductOut(ProductBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}

    # Numeric → float for JSON
    @field_validator("price", mode="before")
    @classmethod
    def _coerce_price(cls, v):
        return float(v) if v is not None else v


class ProductBrief(BaseModel):
    """Subset used in dashboard low-stock list."""
    id: int
    name: str
    sku: str
    quantity_in_stock: int

    model_config = {"from_attributes": True}


# ══════════════════════════════════════════════════════════════════════════════
#  CUSTOMER
# ══════════════════════════════════════════════════════════════════════════════

class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=50)


class CustomerCreate(CustomerBase):
    pass


class CustomerOut(CustomerBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ══════════════════════════════════════════════════════════════════════════════
#  ORDER
# ══════════════════════════════════════════════════════════════════════════════

class OrderStatus(str, Enum):
    pending = "pending"
    processing = "processing"
    shipped = "shipped"
    delivered = "delivered"


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    product_sku: Optional[str] = None
    quantity: int
    unit_price: float

    model_config = {"from_attributes": True}

    @field_validator("unit_price", mode="before")
    @classmethod
    def _coerce_unit_price(cls, v):
        return float(v) if v is not None else v


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate] = Field(..., min_length=1)


class OrderOut(BaseModel):
    id: int
    customer_id: int
    customer_name: Optional[str] = None
    total_amount: float
    status: str
    created_at: datetime
    items: List[OrderItemOut] = []
    item_count: Optional[int] = None

    model_config = {"from_attributes": True}

    @field_validator("total_amount", mode="before")
    @classmethod
    def _coerce_total(cls, v):
        return float(v) if v is not None else v


class OrderListOut(BaseModel):
    """Lighter schema for list endpoint — no full items array."""
    id: int
    customer_id: int
    customer_name: Optional[str] = None
    total_amount: float
    status: str
    created_at: datetime
    item_count: int = 0

    model_config = {"from_attributes": True}

    @field_validator("total_amount", mode="before")
    @classmethod
    def _coerce_total(cls, v):
        return float(v) if v is not None else v


# ══════════════════════════════════════════════════════════════════════════════
#  DASHBOARD
# ══════════════════════════════════════════════════════════════════════════════

class TopProductBrief(BaseModel):
    name: str
    total_quantity_sold: int


class OrdersPerDayBrief(BaseModel):
    date: str
    count: int


class DashboardStats(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: List[ProductBrief]
    top_products: List[TopProductBrief]
    orders_per_day: List[OrdersPerDayBrief]
    total_revenue: float
