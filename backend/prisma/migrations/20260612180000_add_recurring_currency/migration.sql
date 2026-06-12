-- Add currency tracking to RecurringTransaction templates
ALTER TABLE "RecurringTransaction" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'USD';
