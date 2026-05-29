# 📦 Inventory & Order Management System

Full-stack application for managing products, customers, and orders with real-time stock tracking.

**Stack:** Python FastAPI · React 18 (Vite) · PostgreSQL 15 · Docker Compose

---

## 🚀 Local Setup

```bash
# 1. Clone and configure
cp .env.example .env

# 2. Start everything
docker compose up --build
```

| Service    | URL                          |
|------------|------------------------------|
| Frontend   | http://localhost:3000         |
| Backend    | http://localhost:8000         |
| API Docs   | http://localhost:8000/docs    |
| PostgreSQL | localhost:5432               |

> In Docker, the frontend nginx proxies all `/api` requests to the backend automatically.

---

## 📁 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI app, CORS, dashboard endpoint
│   │   ├── database.py      # SQLAlchemy engine & session
│   │   ├── models.py        # Product, Customer, Order, OrderItem
│   │   ├── schemas.py       # Pydantic request/response schemas
│   │   └── routers/
│   │       ├── products.py  # CRUD for products
│   │       ├── customers.py # CRUD for customers
│   │       └── orders.py    # Create/list/detail/cancel orders
│   ├── Dockerfile
│   ├── .dockerignore
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css         # Complete design system
│   │   ├── api/client.js     # Axios instance
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Customers.jsx
│   │   │   └── Orders.jsx
│   │   └── components/
│   │       ├── Navbar.jsx
│   │       ├── ProductForm.jsx
│   │       ├── CustomerForm.jsx
│   │       └── OrderForm.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── Dockerfile            # Multi-stage: Node build → nginx
│   ├── .dockerignore
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 📡 API Endpoints

| Method | Endpoint               | Description                              |
|--------|------------------------|------------------------------------------|
| GET    | `/api/dashboard`       | Stats + low-stock products (≤ 5 units)   |
| POST   | `/api/products/`       | Create product (409 on duplicate SKU)    |
| GET    | `/api/products/`       | List all products                        |
| GET    | `/api/products/{id}`   | Get product by ID (404 if missing)       |
| PUT    | `/api/products/{id}`   | Update product (409 on duplicate SKU)    |
| DELETE | `/api/products/{id}`   | Delete product                           |
| POST   | `/api/customers/`      | Create customer (409 on duplicate email) |
| GET    | `/api/customers/`      | List all customers                       |
| GET    | `/api/customers/{id}`  | Get customer by ID (404 if missing)      |
| DELETE | `/api/customers/{id}`  | Delete customer                          |
| POST   | `/api/orders/`         | Create order (deducts stock)             |
| GET    | `/api/orders/`         | List all orders with customer + count    |
| GET    | `/api/orders/{id}`     | Full order detail with line items        |
| DELETE | `/api/orders/{id}`     | Cancel order AND restore stock           |

---

## 🔒 Business Rules

1. **Unique SKU** — `POST`/`PUT` products reject duplicate SKUs with `409 Conflict`
2. **Unique email** — `POST` customers rejects duplicate emails with `409 Conflict`
3. **Stock validation** — Orders fail with `400 Bad Request` and message: `"Insufficient stock for product: {name}. Available: {qty}, Requested: {qty}"`
4. **Atomic stock deduction** — Stock is deducted inside a DB transaction during order creation
5. **Price snapshot** — `unit_price` is captured at order time; future price changes don't alter history
6. **Auto-calculated total** — `total_amount = Σ(unit_price × quantity)` for all items
7. **Stock restoration** — Cancelling (deleting) an order restores stock for every item
8. **Low stock threshold** — Dashboard flags products with `quantity_in_stock ≤ 5`

---

## 🌐 Deployment

### Backend → Render

1. Push repo to GitHub
2. Create a **Web Service** on Render:
   - **Root directory:** `backend`
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Add a **PostgreSQL** database on Render
4. Set environment variables:
   - `DATABASE_URL` — from the Render Postgres connection string
   - `ALLOWED_ORIGINS` — your Vercel frontend URL (e.g. `https://myapp.vercel.app`)

### Frontend → Vercel

1. Import the repo on Vercel
2. Set:
   - **Root directory:** `frontend`
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
3. Add environment variable:
   - `VITE_API_URL` — your Render backend URL (e.g. `https://inventory-api.onrender.com`)

### Docker Hub

```bash
docker build -t yourusername/inventory-backend ./backend
docker push yourusername/inventory-backend

docker build -t yourusername/inventory-frontend ./frontend
docker push yourusername/inventory-frontend
```

---

## ⚙️ Environment Variables

| Variable           | Service   | Description                                  |
|--------------------|-----------|----------------------------------------------|
| `DATABASE_URL`     | backend   | PostgreSQL connection string                 |
| `POSTGRES_USER`    | db        | PostgreSQL username                          |
| `POSTGRES_PASSWORD`| db        | PostgreSQL password                          |
| `POSTGRES_DB`      | db        | PostgreSQL database name                     |
| `ALLOWED_ORIGINS`  | backend   | Comma-separated CORS origins (default: `*`)  |
| `VITE_API_URL`     | frontend  | Backend URL (baked at build time)            |

---

## 🧑‍💻 Development (without Docker)

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export DATABASE_URL=postgresql://user:password@localhost:5432/inventory_db
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev                        # Runs on :3000, proxies /api to :8000
```
