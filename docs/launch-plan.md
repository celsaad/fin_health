---
title: FinHealth Launch Plan
tags: [launch, planning, deployment, stripe, app-store]
type: plan
---

# FinHealth Launch Plan

## What We're Shipping

- Web app (React + Vite)
- Backend API (Express + Prisma + PostgreSQL)
- Mobile app (Expo / React Native — iOS + Android)
- Payments (Stripe web + RevenueCat mobile IAP)

> [!NOTE] See [monetization-plan](./monetization-plan.md) for the full pricing strategy, upgrade flows, and revenue projections.

---

## Phase 0 — Pre-launch Housekeeping (1–2 days)

Before touching hosting, close these gaps:

1. **Finish the entitlements flow** — `requirePro` middleware and `ProGate.tsx` exist in both web and mobile, but verify the billing webhook handler actually activates `plan: "pro"` on the user record after a successful Stripe event.
2. **Privacy policy + Terms of Service** — required for App Store and Play Store (both will reject without them). Use a generator like Termly or Iubenda, host them at your domain (e.g. `yourapp.com/privacy`, `yourapp.com/terms`).
3. **App icons + splash screens** — Expo needs properly sized assets before a production build.
4. **`app.json` review** — set `bundleIdentifier` (iOS), `package` (Android), `version`, and `buildNumber` correctly before the first EAS build.

---

## Phase 1 — Web Hosting (1 day)

### Frontend → Vercel

Free tier covers launch traffic comfortably.

- Connect the GitHub repo, target the `frontend/` workspace
- Build command: `npm run build -w @fin-health/frontend`
- Output directory: `frontend/dist`
- Environment variable: `VITE_API_URL=https://api.yourdomain.com`

### Backend + Database → Railway

- Create a Railway project, add a **PostgreSQL** service (managed, automatic backups)
- Deploy the backend as a Node.js service from the `backend/` directory
- Set the release command to `npx prisma migrate deploy` so migrations run on every deploy
- Set all required environment variables (from `backend/src/lib/env.ts`):

| Variable | Description |
|---|---|
| `DATABASE_URL` | Railway PostgreSQL connection string |
| `JWT_SECRET` | Long random secret (use `openssl rand -hex 32`) |
| `CORS_ORIGIN` | Your Vercel frontend URL |
| `CLIENT_URL` | Same as `CORS_ORIGIN` |
| `STRIPE_SECRET_KEY` | Stripe live secret key |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhook registration |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | From Stripe product dashboard |
| `STRIPE_PRO_YEARLY_PRICE_ID` | From Stripe product dashboard |
| `SENTRY_DSN` | From Sentry project settings |

> [!TIP] Full list of backend env vars: [backend — Configuration](./backend.md#configuration)

### Domain

Buy one domain. Point `app.yourdomain.com` to Vercel and `api.yourdomain.com` to Railway. Both support custom domains with automatic TLS.

### Cost Estimate at Launch

~$5–10/month. Railway Hobby plan covers a small PostgreSQL instance + backend service. Vercel is free.

---

## Phase 2 — Mobile App Stores (3–7 days, gated by review)

### Build Tooling: Expo EAS

```bash
npm install -g eas-cli
eas build:configure    # generates eas.json
eas build --platform all --profile production
```

### Developer Accounts

| Store | Cost | Review Turnaround |
|---|---|---|
| Apple Developer Program | $99/year | 2–5 days |
| Google Play Console | $25 one-time | 1–3 days |

### Before Submitting

- Set `EXPO_PUBLIC_API_URL` to the production Railway URL as an EAS secret:
  ```bash
  eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://api.yourdomain.com
  ```
- Fill out App Store Connect + Play Console listings: description, screenshots, age rating, and the privacy policy URL from Phase 0.
- Verify the `bundleIdentifier` and `package` in `mobile/app.json` match what you registered in each developer console.

### Submit to Stores

```bash
eas submit --platform ios
eas submit --platform android
```

---

## Phase 3 — Payments Activation (1–2 days)

### Web: Stripe

1. Create products and prices in the Stripe dashboard; copy the price IDs into Railway env vars (`STRIPE_PRO_MONTHLY_PRICE_ID`, `STRIPE_PRO_YEARLY_PRICE_ID`).
2. Register the production webhook endpoint: `POST https://api.yourdomain.com/api/billing/webhook`
3. Enable these webhook events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`
4. Copy the generated webhook signing secret → `STRIPE_WEBHOOK_SECRET` on Railway.
5. Switch Stripe from **test mode → live mode** on launch day.

### Mobile: RevenueCat

1. Create a RevenueCat project and connect both App Store Connect and Google Play.
2. Register a webhook from RevenueCat → `POST https://api.yourdomain.com/api/billing/mobile-receipt` (to sync plan state into your database).
3. Add the RevenueCat SDK (`react-native-purchases`) to the mobile app and initialize it with your public API key.

---

## Phase 4 — Observability

### Error Monitoring: Sentry

Sentry is already wired into the backend (`backend/src/lib/sentry.ts`). Extend it to the other surfaces:

- **Frontend:** `npm install @sentry/react` + wrap `<App>` with `Sentry.init`
- **Mobile:** `npx expo install @sentry/react-native` + `Sentry.init` in `mobile/index.js`

### Product Analytics: PostHog

Add PostHog for DAU/MAU tracking, funnel analysis, and upgrade conversion measurement (free tier is generous).

- **Web:** `npm install posthog-js` + one `<PostHogProvider>` in `frontend/src/main.tsx`
- **Mobile:** `npm install posthog-react-native` + provider in `mobile/App.tsx`

Key events to track from day one: `signup`, `login`, `transaction_created`, `upgrade_prompt_shown`, `subscription_started`, `subscription_cancelled`.

### Uptime Monitoring

Set up Better Uptime or UptimeRobot (both have free tiers) pointing at `https://api.yourdomain.com/health`. You'll get an email/SMS alert if the Railway service goes down.

---

## Phase 5 — Trial & Upgrade Flow

> [!NOTE] These are high-impact conversion features to build before or shortly after launch. Full details in [monetization-plan](./monetization-plan.md).

- **14-day Pro trial on signup** — set `trialEndsAt = now + 14 days` at registration; no credit card required
- **Trial banner on dashboard** — show days remaining, link to upgrade
- **Reminder emails at day 10 + day 13** — use SendGrid (free up to 100 emails/day)
- **Contextual upgrade prompts** — see [monetization-plan](./monetization-plan.md) for the full trigger list

---

## Launch Sequence

1. **Deploy web** (Vercel + Railway) — no review required, goes live the same day
2. **Submit mobile to stores in parallel** — start immediately since review takes days
3. **Activate Stripe live mode** on web launch day
4. **Announce** once both web and at least Android are live (Android review is consistently faster than iOS)

---

## Risk Register

| Risk | Likelihood | Mitigation |
|---|---|---|
| App Store rejection | Medium | Ensure privacy policy URL is live and the app doesn't crash on first launch before submitting |
| Stripe live-mode verification delay | Medium | Apply for live mode access a few days before launch; Stripe sometimes requests business documentation |
| Database migration failure on first Railway deploy | Low | Test `prisma migrate deploy` against a staging DB before going live |
| RevenueCat receipt validation mismatch | Low | Test purchase flow end-to-end in sandbox before going live |
