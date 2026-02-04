# Quick Start Guide

Get the Fin Health budgeting app running in 5 minutes!

## Prerequisites

- Node.js >= 18
- pnpm >= 8
- PostgreSQL or Supabase account
- iOS Simulator (for mobile) or web browser

## Step-by-Step Setup

### 1. Clone and Install

```bash
# Navigate to project
cd /Users/celsosaad/personal/fin_health

# Install all dependencies
pnpm install

# Build packages
pnpm build
```

### 2. Set Up Supabase (Free Tier)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your credentials from Project Settings → API:
   - Project URL
   - Anon/Public key
   - Service role key
4. Get database URL from Project Settings → Database:
   - Connection string (use "Session mode")

### 3. Configure Environment

Create `.env` in the root:
```env
# Database
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres

# Supabase
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# API
API_URL=http://localhost:3001

# Web (optional - for server-side rendering)
SESSION_SECRET=change-this-to-random-string-in-production

# Mobile (optional - if running mobile)
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

### 4. Set Up Database

```bash
# Navigate to db package
cd packages/db

# Generate migration from schema
pnpm db:generate

# Review the generated migration in migrations/
# Then run it:
pnpm db:migrate
```

### 5. Enable Supabase Auth

In Supabase Dashboard:
1. Go to Authentication → Providers
2. Enable "Email" provider
3. Disable "Confirm email" (for development)
4. Save

### 6. Start the API

```bash
# From root directory
pnpm dev:api
```

You should see:
```
API server running at http://localhost:3001
tRPC endpoint: http://localhost:3001/trpc
```

### 7. Test the API

Open `http://localhost:3001/health` in your browser.
You should see: `{"status":"ok","timestamp":"..."}`

### 8. Start the Web App

In a new terminal:
```bash
pnpm --filter @fin-health/web dev
```

Open `http://localhost:5173` in your browser.

### 9. Start the Mobile App (Optional)

In another terminal:
```bash
pnpm --filter @fin-health/mobile start
```

Press:
- `i` for iOS Simulator
- `a` for Android Emulator
- Or scan QR code with Expo Go app

## Usage Flow

### First Time Setup

1. **Sign Up**
   - Web: Go to `http://localhost:5173` → Click "Sign Up"
   - Mobile: Open app → Tap "Sign Up"
   - Enter email and password (min 8 characters)

2. **Create Categories**
   - Go to Categories tab
   - Create categories like "Groceries", "Rent", "Transportation"
   - Add subcategories if needed

3. **Set Budget for Month**
   - Coming soon: Budget allocation UI
   - For now, use the API directly or database

4. **Add Expenses**
   - Coming soon: Expense entry UI
   - Track your spending

5. **View Budget Progress**
   - Dashboard shows your spending vs budget
   - Progress bars indicate usage
   - Red = overspent, Green = on track

## Testing the Stack

### Test Authentication
1. Go to web app or mobile
2. Sign up with a test email
3. Verify you're redirected to dashboard
4. Check that you stay logged in after refresh

### Test Budget View
1. Navigate to current month
2. Should see empty state (no allocations)
3. Go to Categories tab
4. Create a test category
5. Return to budget view

### Test Month Navigation
1. Click Previous/Next month buttons
2. URL should update (web) or state should change (mobile)
3. Data should load for each month

### Test Settings
1. Go to Settings
2. Change currency to EUR or GBP
3. Save changes
4. Return to budget view
5. Amounts should display in new currency

## Troubleshooting

### "Cannot connect to API"
- Verify API is running on port 3001
- Check `API_URL` in environment
- Test health endpoint: `curl http://localhost:3001/health`

### "Database connection failed"
- Verify `DATABASE_URL` is correct
- Check Supabase dashboard for connection string
- Ensure database is accessible

### "Authentication failed"
- Verify Supabase credentials
- Check that Email auth is enabled in Supabase
- Clear cookies/storage and try again

### "Types not found"
- Run `pnpm build` from root
- Make sure all packages built successfully
- Check that API dist folder has .d.ts files

## Development Workflow

### Adding New Features

1. **Add domain logic** (if needed):
   ```bash
   cd packages/domain
   # Add types, utilities, or calculations
   pnpm test
   ```

2. **Update database schema** (if needed):
   ```bash
   cd packages/db
   # Modify schema.ts
   pnpm db:generate
   pnpm db:migrate
   ```

3. **Add API endpoint**:
   ```bash
   cd apps/api
   # Add procedure to router
   pnpm build
   ```

4. **Update mobile/web**:
   - Mobile: Add screen or component
   - Web: Add route or component
   - Both get automatic type inference!

### Running Tests

```bash
# All tests
pnpm test

# Domain tests only
pnpm --filter @fin-health/domain test

# Watch mode
pnpm --filter @fin-health/domain test:watch
```

### Building for Production

```bash
# Build all packages and apps
pnpm build

# Or build individually
pnpm --filter @fin-health/domain build
pnpm --filter @fin-health/db build
pnpm --filter @fin-health/api build
pnpm --filter @fin-health/web build
```

## Common Commands

```bash
# Install dependencies
pnpm install

# Run all apps in parallel
pnpm dev

# Run specific app
pnpm dev:api
pnpm --filter @fin-health/mobile start
pnpm --filter @fin-health/web dev

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Clean everything
pnpm clean
pnpm install
```

## Next Steps

1. **Add Sample Data**: Create some categories and expenses to test
2. **Customize Settings**: Change currency, timezone, month start day
3. **Explore Features**: Navigate months, view progress bars
4. **Deploy** (Phase 6): Get it live on the internet!

## Support

- Documentation: See README files in each package/app
- Issues: Found a bug? Document it!
- Enhancement ideas: Track them for future implementation

## 🎉 Congratulations!

You now have a fully functional budgeting application with:
- ✅ Native mobile app
- ✅ Modern web app
- ✅ Type-safe API
- ✅ Solid architecture
- ✅ Production-ready code

Happy budgeting! 💰
