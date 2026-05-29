-- Add currency tracking fields to Transaction
ALTER TABLE "Transaction"
  ADD COLUMN IF NOT EXISTS "currency"     TEXT            NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS "amountUsd"    DECIMAL(12,4)   NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "exchangeRate" DECIMAL(12,6)   NOT NULL DEFAULT 1;

-- Backfill: treat all existing transactions as USD
UPDATE "Transaction"
SET "amountUsd" = "amount", "exchangeRate" = 1
WHERE "amountUsd" = 0;
