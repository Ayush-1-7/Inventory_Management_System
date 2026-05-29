"""
Database engine, session factory, and FastAPI dependency.

Reads DATABASE_URL from environment. Handles the postgres:// → postgresql://
rewrite required by some PaaS providers (e.g. Render).
"""

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://user:password@db:5432/inventory_db",
)

# Render / Heroku emit "postgres://" which SQLAlchemy 2.x rejects
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,       # verify connections before use
    pool_size=10,             # connection pool
    max_overflow=20,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency — yields a session and ensures cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
