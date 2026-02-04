# Fin Health - Personal Budgeting App

A full-stack personal budgeting application built with a monorepo architecture featuring type-safe APIs, shared business logic, and multi-platform support.

## Architecture

### Technology Stack

- **Monorepo**: pnpm workspaces
- **Language**: TypeScript (strict mode)
- **API**: Node.js + Express + tRPC
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **Mobile**: Expo (React Native) - Planned
- **Web**: Remix - Planned
- **Validation**: Zod schemas
- **Testing**: Vitest

### Project Structure

```
/fin_health
├── apps/
│   ├── api/          # tRPC server (✅ Complete)
│   ├── mobile/       # Expo app (📋 Planned)
│   └── web/          # Remix app (📋 Planned)
├── packages/
│   ├── domain/       # Pure TS business logic (✅ Complete)
│   ├── db/           # Prisma schema + migrations (✅ Complete)
│   └── tsconfig/     # Shared TypeScript configs (✅ Complete)
└── package.json
```

## Completed Features

### ✅ Phase 0: Monorepo Foundation
- [x] pnpm workspace configuration
- [x] Shared TypeScript configurations
- [x] ESLint + Prettier setup
- [x] Vitest testing framework

### ✅ Phase 1: Domain Package
- [x] Core domain types (User, Category, Budget, Expense)
- [x] Money utilities (integer cents arithmetic)
- [x] MonthKey system (timezone + custom start day support)
- [x] Budget calculation logic
- [x] Copy-forward operations
- [x] Zod validation schemas
- [x] Comprehensive unit tests (49 tests passing)

### ✅ Phase 2: Database Package
- [x] Prisma ORM schema with all tables
- [x] Foreign keys and cascade rules
- [x] Database indexes for performance
- [x] Unique constraints
- [x] Migration system setup
- [x] Database client with singleton pattern

### ✅ Phase 3: API Implementation
- [x] tRPC server with Express
- [x] Supabase authentication integration
- [x] Auth router (signUp, signIn, me)
- [x] Settings router (get, update)
- [x] Categories router (CRUD for categories and subcategories)
- [x] Budgets router (get with calculations, create, update allocations, copy)
- [x] Expenses router (list, create, update, delete)
- [x] Type-safe end-to-end with AppRouter export

## Key Design Principles

### 1. Money as Integer Cents
All monetary amounts are stored and calculated as integer cents to avoid floating-point errors:
```typescript
const amount = toCents(10.99); // 1099
const total = sum([100, 200, 300]); // 600 cents
```

### 2. Flexible MonthKey System
Supports custom month start days and timezones:
```typescript
// Month can start on any day (e.g., 15th of each month)
const monthKey = toMonthKey(date, 'America/New_York', 15);
const range = monthKeyToRange('2026-01', 'America/New_York', 15);
```

### 3. Shared Business Logic
All budget calculations live in `packages/domain`:
```typescript
const overview = calculateMonthBudgetOverview({
  budgetId: 'abc123',
  monthKey: '2026-01',
  allocations,
  expenses,
  categories,
  subcategories,
});
```

### 4. Type-Safe APIs
Zod schemas ensure runtime validation + compile-time types:
```typescript
// Schema definition
export const createExpenseSchema = z.object({
  amountCents: z.number().int().positive(),
  categoryId: z.string(),
  // ...
});

// Inferred type
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
```

## Getting Started

### Prerequisites
- Node.js >= 18
- pnpm >= 8
- PostgreSQL database (or Supabase account)

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Environment Setup

Create `.env` file in the root:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/fin_health
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Database Setup

```bash
# Option 1: From root directory using filter
pnpm --filter @fin-health/db db:generate
pnpm --filter @fin-health/db db:migrate
pnpm --filter @fin-health/db db:studio

# Option 2: From packages/db directory
cd packages/db
pnpm db:generate  # Generate Prisma client
pnpm db:migrate   # Create and run migrations
pnpm db:studio    # Open Prisma Studio
```

### Running the API

```bash
# Development mode (with hot reload)
pnpm dev:api

# Production build
pnpm --filter @fin-health/api build
pnpm --filter @fin-health/api start
```

API will be available at:
- Health check: `http://localhost:3001/health`
- tRPC endpoint: `http://localhost:3001/trpc`

### Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @fin-health/domain test

# Watch mode
pnpm --filter @fin-health/domain test:watch
```

## API Endpoints

### Authentication
- `auth.signUp({ email, password })` - Create new user
- `auth.signIn({ email, password })` - Sign in user
- `auth.me()` - Get current user (protected)

### Settings
- `settings.get()` - Get user settings (protected)
- `settings.update({ currency?, timezone?, monthStartDay? })` - Update settings (protected)

### Categories
- `categories.list()` - List all categories with subcategories (protected)
- `categories.create({ name, sortOrder? })` - Create category (protected)
- `categories.update({ id, name?, sortOrder?, archived? })` - Update category (protected)
- `categories.createSubcategory({ categoryId, name, sortOrder? })` - Create subcategory (protected)
- `categories.updateSubcategory({ id, name?, sortOrder?, archived? })` - Update subcategory (protected)

### Budgets
- `budgets.get({ monthKey })` - Get month budget with calculations (protected)
- `budgets.create({ monthKey, copyFromPrevious? })` - Create budget (protected)
- `budgets.updateAllocations({ budgetId, allocations })` - Update allocations (protected)
- `budgets.copyMonth({ sourceMonthKey, targetMonthKey })` - Copy allocations (protected)

### Expenses
- `expenses.list({ monthKey?, categoryId?, limit?, offset? })` - List expenses (protected)
- `expenses.create({ occurredAt, amountCents, categoryId, subcategoryId?, notes? })` - Create expense (protected)
- `expenses.update({ id, ...fields })` - Update expense (protected)
- `expenses.delete({ id })` - Delete expense (protected)

## Database Schema

### Tables

**users**
- `id` (uuid, pk) - Matches Supabase auth.users.id
- `email` (varchar, unique)
- `currency` (varchar(3)) - ISO 4217 code
- `timezone` (varchar) - IANA timezone
- `monthStartDay` (int) - 1-31
- `createdAt`, `updatedAt`

**categories**
- `id` (uuid, pk)
- `userId` (uuid, fk → users)
- `name` (varchar)
- `sortOrder` (int)
- `archived` (boolean)
- `createdAt`, `updatedAt`
- Unique: (userId, name)

**subcategories**
- `id` (uuid, pk)
- `userId` (uuid, fk → users)
- `categoryId` (uuid, fk → categories)
- `name` (varchar)
- `sortOrder` (int)
- `archived` (boolean)
- `createdAt`, `updatedAt`
- Unique: (categoryId, name)

**budgets**
- `id` (uuid, pk)
- `userId` (uuid, fk → users)
- `monthKey` (varchar(7)) - "YYYY-MM" format
- `createdAt`, `updatedAt`
- Unique: (userId, monthKey)

**budget_allocations**
- `id` (uuid, pk)
- `budgetId` (uuid, fk → budgets)
- `categoryId` (uuid, fk → categories)
- `subcategoryId` (uuid, fk → subcategories, nullable)
- `amountCents` (int) - Money as integer cents
- `createdAt`, `updatedAt`
- Unique: (budgetId, categoryId, subcategoryId)

**expenses**
- `id` (uuid, pk)
- `userId` (uuid, fk → users)
- `occurredAt` (timestamptz)
- `amountCents` (int) - Money as integer cents
- `categoryId` (uuid, fk → categories, restrict)
- `subcategoryId` (uuid, fk → subcategories, restrict, nullable)
- `notes` (varchar(500), nullable)
- `createdAt`, `updatedAt`

## Next Steps

### ✅ Phase 4: Mobile App (Expo) - COMPLETED
- [x] Initialize Expo app with TypeScript
- [x] Set up tRPC client with React Query
- [x] Implement Supabase auth flow
- [x] Create month overview screen
- [x] Category management screens
- [x] Settings screen
- [ ] Build expense entry UI (coming soon)

### ✅ Phase 5: Web App (Remix) - COMPLETED
- [x] Initialize Remix app
- [x] Server-side tRPC integration
- [x] Auth with cookie sessions
- [x] Month overview page
- [x] Category/settings pages
- [ ] Expense management (coming soon)

### Phase 6: Deployment
- [ ] Set up Supabase project
- [ ] Run database migrations
- [ ] Deploy API (Render/Railway/Fly.io)
- [ ] Deploy web (Vercel/Netlify)
- [ ] Build mobile with EAS

## Contributing

This is a personal project but open to suggestions. Feel free to open issues or PRs.

## License

MIT
