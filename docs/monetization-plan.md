# FinHealth Monetization Plan

## Executive Summary

FinHealth is a manual expense tracker with web and mobile clients. The Spending Insights feature establishes the first clear value differentiation between free and paid usage. This document outlines a phased monetization strategy starting with a freemium model, progressing toward subscription revenue, and identifies the implementation work required at each stage.

---

## 1. Pricing Model: Freemium + Subscription

### Free Tier

Everything needed to track expenses:

- Unlimited transactions (manual entry)
- Categories and subcategories
- Monthly summary and breakdown charts
- Basic dashboard (pie chart, trend chart, top categories)
- Single-device access (web OR mobile)
- Data export (CSV)

### Pro Tier — $4.99/month or $39.99/year

Intelligence and power features:

- **Spending Insights** (the feature we just built — pace, over-budget alerts, unusual spending, month-over-month changes)
- **Budget tracking** with alerts and rollover
- **Multi-device sync** (web + mobile simultaneously)
- **Custom categories** with icons and colors
- **Recurring transactions** (auto-logged)
- **Advanced reports** (yearly overview, category drilldowns, custom date ranges)
- **Data export** (CSV + PDF reports)

### Why This Split Works

| Signal | Rationale |
|--------|-----------|
| Tracking is free | Removes friction for adoption — users need to build a data history before insights have value |
| Insights are paid | Insights require accumulated data, creating natural upgrade moments ("you have 3 months of data — unlock trends") |
| Budgets are paid | Budget alerts are high-value for committed users who already track consistently |
| Multi-device is paid | Users who track on both web and mobile are highly engaged — willing to pay |

---

## 2. Implementation Phases

### Phase 1: Entitlements Infrastructure (Week 1-2)

The backend needs a way to know what a user can access.

**Database changes:**

- Add `plan` field to User model (`free` | `pro`, default `free`)
- Add `planExpiresAt` field (nullable timestamp)
- Add `trialEndsAt` field (nullable, for 14-day trial)

**Backend changes:**

- Create `entitlements` middleware that reads `req.user.plan` and attaches feature flags to the request
- Create `requirePro` middleware for gating pro-only endpoints
- Gate existing endpoints: `GET /dashboard/insights`, `GET /budgets`, recurring transaction CRUD
- Add `GET /api/account/plan` endpoint returning current plan, expiry, and feature list

**Frontend/Mobile changes:**

- Add plan context/hook (`usePlan`) that caches the user's entitlements
- Add `<ProGate>` wrapper component that shows upgrade prompt when feature is locked
- Show lock icon on gated features in navigation/UI

**Estimated effort:** 3-5 days for a single developer.

### Phase 2: Payment Integration (Week 2-3)

**Web (Stripe Checkout):**

- Create `POST /api/billing/checkout` — generates a Stripe Checkout Session URL
- Create `POST /api/billing/webhook` — handles `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`
- Create `GET /api/billing/portal` — returns Stripe Customer Portal URL for self-serve management
- Add billing page in frontend settings with plan selector, current status, and manage subscription link

**Mobile (In-App Purchases):**

- Integrate `expo-in-app-purchases` or `react-native-purchases` (RevenueCat)
- RevenueCat recommended — handles both App Store and Play Store receipts, server-side validation, and webhook to our backend
- Create `POST /api/billing/mobile-receipt` — validates receipt and activates plan
- Add subscription screen in mobile settings

**Why Stripe + RevenueCat:**

- Stripe handles web payments, invoicing, tax, and customer portal out of the box
- RevenueCat abstracts App Store/Play Store differences and handles receipt validation
- Both send webhooks to our backend so plan state stays in our database as the source of truth
- Avoids building receipt validation, retry logic, and refund handling from scratch

**Estimated effort:** 5-7 days (Stripe is straightforward; mobile IAP is the time sink).

### Phase 3: Trial & Upgrade Flows (Week 3-4)

**14-day Pro trial for new users:**

- Set `trialEndsAt = now + 14 days` on registration
- Show trial banner with days remaining on dashboard
- Send reminder email at day 10 and day 13 (integrate SendGrid or AWS SES)
- On trial expiry, downgrade to free — insights card shows "Upgrade to Pro" with a preview of what they're missing

**Contextual upgrade prompts (high-converting moments):**

| Trigger | Prompt |
|---------|--------|
| User views dashboard with 30+ transactions | "You have enough data for Spending Insights — upgrade to see them" |
| User tries to create a budget on free tier | "Budgets are a Pro feature — start your free trial" |
| User logs in on mobile when already using web | "Sync across devices with Pro" |
| Month rolls over | "Last month you spent $X — see how it compares with Pro Insights" |

**Estimated effort:** 3-4 days.

### Phase 4: Retention & Expansion (Month 2+)

**Reduce churn:**

- Weekly email digest for Pro users: "Your week in spending" with 2-3 key insights
- Monthly PDF report (auto-generated, emailed) — exclusive to Pro
- Push notifications on mobile for budget alerts and unusual spending

**Expand ARPU (future Pro+ or add-ons):**

- **Shared households** ($2/month add-on) — multiple users sharing one budget
- **AI categorization** — auto-categorize transactions using description text
- **Goal tracking** — savings goals with progress visualization
- **Bank CSV import** — bulk import from bank statements

---

## 3. Metrics to Track

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Free → Trial conversion | >40% | Users who start trial / total signups |
| Trial → Paid conversion | >15% | Users who subscribe / trial starts |
| Monthly churn rate | <5% | Cancellations / active subscribers |
| ARPU | $4.50+ | Revenue / active subscribers |
| DAU/MAU ratio | >30% | Daily active / monthly active users |
| Time to first upgrade prompt | <7 days | Days from signup to first gated feature encounter |

---

## 4. What NOT to Do

- **Don't gate basic tracking.** The free tier must be genuinely useful for expense logging. Users who can't track won't generate data, and without data there's nothing to upsell.
- **Don't show ads.** Ads in a finance app destroy trust. The data is sensitive.
- **Don't limit transaction count.** Artificial limits feel punitive and push users to competitors.
- **Don't require payment before value.** The trial should be frictionless (no credit card required). Let users experience insights with their own data before asking for money.
- **Don't build annual reports before you have monthly retention.** Expansion features only matter if users stick around.

---

## 5. Implementation Priority (Recommended Order)

1. **Entitlements infrastructure** — this unblocks everything else
2. **Stripe web payments** — fastest path to revenue; web users convert at higher rates
3. **Trial flow + upgrade prompts** — drive conversion from existing users
4. **Mobile IAP** — can lag behind web by a few weeks; users can subscribe via web in the interim
5. **Retention features** (email digest, push notifications) — once you have paying users to retain

---

## 6. Revenue Projections (Conservative)

| Milestone | Users | Paid | MRR |
|-----------|-------|------|-----|
| Month 1 (launch billing) | 500 | 25 (5%) | $125 |
| Month 3 | 2,000 | 200 (10%) | $1,000 |
| Month 6 | 5,000 | 600 (12%) | $3,000 |
| Month 12 | 10,000 | 1,500 (15%) | $7,500 |

Assumptions: $4.99/month average (mix of monthly and annual), 5% monthly churn, organic growth via App Store and word of mouth.

---

## 7. Technical Dependencies

| Dependency | Purpose | Cost |
|------------|---------|------|
| Stripe | Web payments | 2.9% + $0.30 per transaction |
| RevenueCat | Mobile IAP management | Free up to $2,500 MTR, then 1% |
| SendGrid | Transactional email (trial reminders, digests) | Free up to 100/day |
| Vercel / Railway | Hosting (already in place) | Existing cost |

No new backend dependencies for Phase 1 (entitlements). Stripe SDK and RevenueCat SDK are the only additions.
