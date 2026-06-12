-- Overall (no-category) budgets were duplicated on every save because the
-- application upsert used categoryId = '' as the lookup key while rows were
-- created with categoryId = NULL, and Postgres unique indexes treat NULLs as
-- distinct. This migration removes duplicate overall-budget rows (keeping the
-- most recently updated one per userId/month/year) and recreates the unique
-- index with NULLS NOT DISTINCT so the database itself prevents duplicates.

-- 1. Delete duplicate overall-budget rows (categoryId IS NULL), keeping the
--    most recently updated row per (userId, month, year).
DELETE FROM "Budget" b
WHERE b."categoryId" IS NULL
  AND b."id" <> (
    SELECT b2."id"
    FROM "Budget" b2
    WHERE b2."categoryId" IS NULL
      AND b2."userId" = b."userId"
      AND b2."month" = b."month"
      AND b2."year" = b."year"
    ORDER BY b2."updatedAt" DESC, b2."id" DESC
    LIMIT 1
  );

-- 2. Recreate the unique index so NULL categoryId values are treated as equal.
DROP INDEX IF EXISTS "Budget_userId_categoryId_month_year_key";

CREATE UNIQUE INDEX "Budget_userId_categoryId_month_year_key"
  ON "Budget"("userId", "categoryId", "month", "year") NULLS NOT DISTINCT;
