# FinHealth - Personal Finance Tracker

Full-stack personal finance app built with React, Express, PostgreSQL, and Prisma.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) (for PostgreSQL)

## Quick Start

### 1. Start the database

```bash
docker compose up -d
```

### 2. Start the backend

```bash
cd backend
npm install
npx prisma db push
npm run dev
```

The API will be running at `http://localhost:3001`.

### 3. Start the frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will be running at `http://localhost:5173`.

### 4. (Optional) Seed demo data

```bash
cd backend
npm run db:seed
```

This creates a demo account with ~100 transactions, categories, budgets, and recurring templates.

**Demo login:** `demo@finhealth.app` / `demo1234`

## Available Scripts

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled output |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed database with demo data |
| `npm run db:studio` | Open Prisma Studio GUI |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Features

- **Authentication** — Sign up, log in, JWT-based sessions
- **Transactions** — CRUD with soft deletes, pagination, filters, search, bulk delete, CSV export
- **Categories** — Auto-created via autocomplete, rename, merge, subcategories
- **Budgets** — Per-category or overall, with color-coded progress bars
- **Recurring Transactions** — Templates auto-generate transactions on login
- **Dashboard** — Summary cards, expense pie chart, income/expense trend chart, monthly breakdown
- **Responsive** — Sidebar on desktop, bottom nav on mobile

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, shadcn/ui, Recharts, TanStack React Query, react-hook-form + Zod
- **Backend:** Express, TypeScript, Prisma ORM, JWT, bcrypt, Zod validation
- **Database:** PostgreSQL 16
