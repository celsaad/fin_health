# FinHealth - Personal Finance Tracker

Full-stack personal finance app built with React, Express, PostgreSQL, and Prisma. Managed as a monorepo with [Turborepo](https://turbo.build/) and npm workspaces.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) (for PostgreSQL)

## Quick Start

### 1. Start the database

```bash
docker compose up -d
```

### 2. Install dependencies

```bash
npm install
```

### 3. Push the database schema

```bash
npm run db:push
```

### 4. Start everything

```bash
npm run dev
```

This starts both the backend (`http://localhost:3001`) and frontend (`http://localhost:5173`) in parallel.

### 5. (Optional) Seed demo data

```bash
npm run db:seed
```

This creates a demo account with ~100 transactions, categories, budgets, and recurring templates.

**Demo login:** `demo@finhealth.app` / `demo1234`

## Project Structure

```
fin_health/
├── backend/          # Express API (@fin-health/backend)
├── frontend/         # React SPA (@fin-health/frontend)
├── turbo.json        # Turborepo task pipeline
└── package.json      # Root workspace config
```

## Available Scripts

All commands are run from the root directory.

### Root (Turborepo)

| Command | Description |
|---|---|
| `npm run dev` | Start backend + frontend dev servers in parallel |
| `npm run build` | Build all packages (cached) |
| `npm run typecheck` | Type-check all packages (cached) |
| `npm run lint` | Lint all packages (cached) |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed database with demo data |
| `npm run db:studio` | Open Prisma Studio GUI |

### Running a single workspace

```bash
# Run a script in a specific workspace
npm run dev -w @fin-health/backend
npm run dev -w @fin-health/frontend
```

## Features

- **Authentication** — Sign up, log in, JWT-based sessions
- **Transactions** — CRUD with soft deletes, pagination, filters, search, bulk delete, CSV export
- **Categories** — Auto-created via autocomplete, rename, merge, subcategories, icon/color picker
- **Budgets** — Per-category or overall, with color-coded progress bars
- **Recurring Transactions** — Templates auto-generate transactions on login
- **Dashboard** — Summary cards, expense pie chart, income/expense trend chart, monthly breakdown
- **Responsive** — Sidebar on desktop, bottom nav on mobile

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, shadcn/ui, Recharts, TanStack React Query, react-hook-form + Zod
- **Backend:** Express, TypeScript, Prisma ORM, JWT, bcrypt, Zod validation
- **Database:** PostgreSQL 16
- **Monorepo:** Turborepo, npm workspaces
