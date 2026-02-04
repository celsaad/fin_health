# Fin Health Web App

Remix web application for the Fin Health budgeting platform.

## Features

- ✅ Server-side rendered with Remix
- ✅ Type-safe tRPC integration
- ✅ Supabase authentication with cookies
- ✅ Tailwind CSS styling
- ✅ Month budget overview
- ✅ Category management
- ✅ User settings

## Tech Stack

- **Framework**: Remix v2 with Vite
- **Styling**: Tailwind CSS
- **API Client**: tRPC (server-side)
- **Auth**: Supabase + Cookie sessions
- **TypeScript**: Strict mode enabled

## Getting Started

### Prerequisites
- Node.js >= 18
- pnpm >= 8
- API server running

### Installation

```bash
# From the root of the monorepo
pnpm install

# Or from this directory
pnpm install
```

### Configuration

Create `.env` file:
```env
API_URL=http://localhost:3001
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SESSION_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

### Running the App

```bash
# Development mode
pnpm dev

# Production build
pnpm build
pnpm start
```

The app will be available at `http://localhost:5173` (dev) or `http://localhost:3000` (production).

## Project Structure

```
/apps/web
├── app/
│   ├── routes/              # File-based routing
│   │   ├── _index.tsx       # Home redirect
│   │   ├── login.tsx        # Login page
│   │   ├── signup.tsx       # Sign up page
│   │   ├── logout.tsx       # Logout action
│   │   ├── dashboard.tsx    # Dashboard layout
│   │   ├── dashboard._index.tsx              # Dashboard home (redirects to month)
│   │   ├── dashboard.month.$monthKey.tsx     # Month budget view
│   │   ├── dashboard.categories.tsx          # Categories management
│   │   └── dashboard.settings.tsx            # User settings
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Card.tsx
│   │   └── budget/          # Budget-specific components
│   │       ├── CategoryCard.tsx
│   │       └── ProgressBar.tsx
│   ├── lib/
│   │   ├── trpc.server.ts   # Server-side tRPC client
│   │   └── auth.server.ts   # Auth utilities with cookies
│   ├── entry.client.tsx     # Client entry point
│   ├── entry.server.tsx     # Server entry point
│   ├── root.tsx             # Root layout
│   └── tailwind.css         # Tailwind directives
├── public/                  # Static assets
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind configuration
└── tsconfig.json            # TypeScript configuration
```

## Routes

### Public Routes
- `/` - Home (redirects to dashboard or login)
- `/login` - Login page
- `/signup` - Sign up page

### Protected Routes (require authentication)
- `/dashboard` - Main dashboard (redirects to current month)
- `/dashboard/month/:monthKey` - Month budget overview
- `/dashboard/categories` - Category management
- `/dashboard/settings` - User settings
- `/logout` - Logout action (POST only)

## Key Features

### Authentication Flow
1. User visits protected route
2. `requireAuth` checks for session cookie
3. If no session, redirect to `/login`
4. Login form posts to action
5. Action calls tRPC auth endpoint
6. On success, creates session cookie
7. Redirect to dashboard

### Server-Side tRPC
All tRPC calls happen on the server in loaders and actions:
```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  const { token } = await requireAuth(request);
  const trpc = createTRPCClient(token);

  const data = await trpc.budgets.get.query({ monthKey });

  return json({ data });
}
```

### Cookie-Based Sessions
- Sessions stored in encrypted cookies
- 7-day expiration
- HttpOnly and SameSite=Lax for security
- Auto-refresh on each request

### Tailwind CSS
- Utility-first styling
- Responsive design out of the box
- Custom components in `components/ui`
- Consistent design system

## Type Safety

The web app enjoys full type safety:
- Shared `@fin-health/domain` package for business logic
- tRPC client inferring types from `AppRouter`
- Zod validation ensuring runtime type safety
- TypeScript strict mode
- Remix type-safe loaders and actions

## Development

### Type Checking
```bash
pnpm typecheck
```

### Linting
```bash
pnpm lint
```

### Building
```bash
pnpm build
```

## Deployment

### Environment Variables
Make sure to set these in production:
- `API_URL` - Your API server URL
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon key
- `SESSION_SECRET` - A strong random secret (at least 32 characters)
- `NODE_ENV=production`

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
pnpm build

# Deploy
netlify deploy --prod
```

### Deploy to Fly.io
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Create app
fly launch

# Deploy
fly deploy
```

## Performance

- Server-side rendering for fast initial load
- Progressive enhancement
- Optimistic UI updates
- Code splitting by route
- Automatic prefetching of route data

## Security

- HttpOnly cookies for session storage
- CSRF protection via SameSite cookies
- Encrypted session data
- Server-side API calls (no token exposure to client)
- Input validation with Zod schemas

## Troubleshooting

### API Connection Issues
- Verify `API_URL` in `.env`
- Make sure API server is running
- Check CORS settings in API

### Supabase Auth Issues
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Check Supabase dashboard for auth settings
- Ensure email/password auth is enabled

### Build Errors
- Run `pnpm --filter @fin-health/api build` first
- Clear build cache: `pnpm clean`
- Reinstall dependencies: `rm -rf node_modules && pnpm install`

## Future Enhancements

- [ ] Expense entry form
- [ ] Budget allocation editing
- [ ] Expense list with filters
- [ ] Charts and visualizations
- [ ] Export data (CSV, PDF)
- [ ] Dark mode
- [ ] Mobile-optimized responsive design
- [ ] Progressive Web App (PWA)

## License

MIT
