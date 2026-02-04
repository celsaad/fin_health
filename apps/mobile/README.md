# Fin Health Mobile App

React Native mobile app built with Expo and Expo Router.

## Features

- ✅ Authentication (Sign up / Sign in)
- ✅ Month budget overview with progress bars
- ✅ Category and subcategory management
- ✅ User settings
- ✅ Type-safe tRPC integration
- ✅ Supabase authentication
- ✅ Offline-ready with AsyncStorage

## Tech Stack

- **Framework**: Expo (React Native)
- **Routing**: Expo Router (file-based)
- **State**: React Query (via tRPC)
- **API Client**: tRPC React Query
- **Auth**: Supabase
- **Storage**: AsyncStorage
- **TypeScript**: Strict mode enabled

## Getting Started

### Prerequisites
- Node.js >= 18
- pnpm >= 8
- iOS Simulator (Mac) or Android Emulator
- Or Expo Go app on your phone

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
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Note: For iOS simulator, use `http://localhost:3001`. For Android emulator, use `http://10.0.2.2:3001`. For physical devices, use your computer's IP address.

### Running the App

```bash
# Start Expo dev server
pnpm start

# Or run on specific platform
pnpm ios
pnpm android
pnpm web
```

## Project Structure

```
/apps/mobile
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout with providers
│   ├── index.tsx          # Entry redirect
│   ├── auth/              # Auth screens
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── signup.tsx
│   └── tabs/              # Main app tabs
│       ├── _layout.tsx
│       ├── index.tsx      # Budget overview
│       ├── categories.tsx
│       └── settings.tsx
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   └── budget/            # Budget-specific components
│       ├── CategoryCard.tsx
│       └── ProgressBar.tsx
├── hooks/
│   ├── useAuth.ts         # Authentication hook
│   └── useCurrentMonth.ts # Month navigation hook
├── lib/
│   ├── trpc.ts            # tRPC client setup
│   └── supabase.ts        # Supabase client setup
├── app.json
├── package.json
└── tsconfig.json
```

## Screens

### Authentication
- **Login** (`/auth/login`) - Sign in with email/password
- **Sign Up** (`/auth/signup`) - Create new account

### Main Tabs
- **Budget** (`/tabs`) - Month overview with budget progress
- **Categories** (`/tabs/categories`) - Manage categories and subcategories
- **Settings** (`/tabs/settings`) - User preferences and sign out

## Key Features

### Budget Overview
- Month navigation (previous/next)
- Total budget summary
- Category-wise breakdown
- Progress bars showing spending
- Pull-to-refresh

### Categories Management
- Create/edit categories
- Create/edit subcategories
- Archive categories
- Sort order management

### Settings
- View user email
- Currency selection (coming soon)
- Timezone selection (coming soon)
- Month start day selection (coming soon)
- Sign out

## Type Safety

The mobile app enjoys full type safety through:
- Shared `@fin-health/domain` package for business logic
- tRPC client inferring types from `AppRouter`
- Zod validation ensuring runtime type safety
- TypeScript strict mode

## Authentication Flow

1. User lands on index, redirected to login if not authenticated
2. Login/signup calls tRPC auth endpoints
3. Supabase returns session token
4. Token stored in AsyncStorage
5. Token attached to all tRPC requests via HTTP header
6. API verifies token and extracts userId

## Offline Support

- Auth tokens cached in AsyncStorage
- React Query caching for read operations
- Automatic retry on network errors
- Pull-to-refresh for manual updates

## Development

### Type Checking
```bash
pnpm typecheck
```

### Linting
```bash
pnpm lint
```

## Deployment

### EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### App Store / Play Store
Follow Expo documentation for publishing to stores.

## Troubleshooting

### API Connection Issues
- Make sure API server is running on port 3001
- Use correct IP address for physical devices
- Check CORS settings in API

### Supabase Auth Issues
- Verify SUPABASE_URL and SUPABASE_ANON_KEY
- Check Supabase dashboard for auth provider settings
- Ensure email/password auth is enabled

### Type Errors
- Rebuild API package to regenerate types: `pnpm --filter @fin-health/api build`
- Clear Metro cache: `pnpm start --clear`

## Future Enhancements

- [ ] Expense entry modal/bottom sheet
- [ ] Category/subcategory selection in expense entry
- [ ] Budget allocation editing
- [ ] Copy budget from previous month
- [ ] Expense list with filters
- [ ] Charts and visualizations
- [ ] Push notifications for budget alerts
- [ ] Dark mode support
- [ ] Biometric authentication

## License

MIT
