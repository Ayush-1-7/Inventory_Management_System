# 📦 Premium Inventory Management System

A production-ready, beautiful, and fully-functional Full-Stack Inventory Management System built with **Next.js 14 (App Router)**, **Prisma ORM**, and **PostgreSQL** (configured for seamless Neon & Vercel deployment).

## ✨ Features

- **Premium UI Design**: Built with a gorgeous deep navy dark-mode aesthetic, frosted glass layout (glassmorphic cards), smooth transitions, custom scrollbars, and micro-animations.
- **Full Products CRUD**: Complete management of catalog items (Create, Read, Update, Delete) with interactive confirmations.
- **Stock Adjustment Tool**: Easy-to-use dedicated interface to increment (Stock In) or decrement (Stock Out) item stock with audit comments and references.
- **Historical Movements Ledger**: Clean audit timeline filtering stock transactions by type and linked directly to corresponding products.
- **Dynamic Category Breakdowns**: Automatically aggregate product counts and total stock levels grouped by categories.
- **CSV Data Exchange**: Download the current catalog status via instant CSV export, and bulk upload/update items using the flexible CSV import tool.
- **Vercel & Neon Native**: Pre-configured build pipes for serverless edge execution with server-side pooling database support.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Database ORM**: [Prisma](https://www.prisma.io/) (PostgreSQL client)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **CSV Parser**: [PapaParse](https://www.papaparse.org/)

---

## 🚀 Local Development Setup

Follow these steps to run the application on your computer:

### 1. Prerequisites
- **Node.js** (v18.x or later)
- **npm** (v9.x or later)
- **PostgreSQL Database** (either running locally or a cloud database instance on [Neon](https://neon.tech/))

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables Configuration
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill in your PostgreSQL connection string:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
```

### 4. Database Initialization
Generate the Prisma Client and sync schemas:
```bash
npx prisma generate
npx prisma db push
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🌐 Production Deployment (Vercel + Neon)

### Step 1: Set up Neon PostgreSQL (Recommended)
1. Go to [Neon Console](https://neon.tech/) and sign up for a free account.
2. Create a new project.
3. Under **Connection Details**, copy the connection string (`DATABASE_URL`). It will look like:
   `postgresql://[user]:[password]@[host]/[dbname]?sslmode=require`

### Step 2: Deploy to Vercel
1. Import your GitHub repository to [Vercel](https://vercel.com/new).
2. Under **Environment Variables**, add:
   - `DATABASE_URL` = (Paste the Neon connection string from Step 1)
3. Deploy! Vercel automatically runs the `postinstall` step (`prisma generate`) and builds the Next.js bundle successfully.
