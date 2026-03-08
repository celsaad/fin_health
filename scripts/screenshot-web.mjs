/**
 * Automated web screenshot tool
 *
 * Takes screenshots of every page in the web app (desktop + mobile viewport).
 *
 * Prerequisites:
 *   1. Backend running:   cd backend && npm run dev
 *   2. Frontend running:  cd frontend && npm run dev
 *   3. Playwright:        npm install -D playwright && npx playwright install chromium
 *
 * Usage:
 *   TEST_EMAIL=you@example.com TEST_PASSWORD=yourpass node scripts/screenshot-web.mjs
 *
 * Options (env vars):
 *   BASE_URL       Frontend URL (default: http://localhost:5173)
 *   TEST_EMAIL     Login email (default: test@example.com)
 *   TEST_PASSWORD  Login password (default: password123)
 *   HEADED         Set to 1 to show the browser window
 *
 * Output: scripts/screenshots/web/*.png
 */
import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE_URL = process.env.BASE_URL || "http://localhost:5173";
const EMAIL = process.env.TEST_EMAIL || "test@example.com";
const PASSWORD = process.env.TEST_PASSWORD || "password123";
const OUT_DIR = path.join(__dirname, "screenshots", "web");

const PROTECTED_ROUTES = [
  { name: "dashboard", path: "/" },
  { name: "spending", path: "/spending" },
  { name: "transactions", path: "/transactions" },
  { name: "categories", path: "/categories" },
  { name: "budgets", path: "/budgets" },
  { name: "recurring", path: "/recurring" },
  { name: "settings", path: "/settings" },
];

const PUBLIC_PAGES = [
  { name: "login", path: "/login" },
  { name: "signup", path: "/signup" },
];

async function takeScreenshot(page, name) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  const filePath = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`  ✓ ${name}`);
}

// Client-side navigation without full page reload (preserves React state)
async function navigateTo(page, route) {
  await page.evaluate((r) => {
    window.history.pushState({}, "", r);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, route);
  await page.waitForLoadState("networkidle");
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: !process.env.HEADED,
    slowMo: process.env.HEADED ? 500 : 0,
  });

  // === Desktop ===
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // 1. Onboarding
  console.log("\n📸 Onboarding:");
  await page.goto(`${BASE_URL}/onboarding`);
  await takeScreenshot(page, "onboarding");

  // Set onboarding flag so we can access login/signup
  await page.evaluate(() => localStorage.setItem("hasOnboarded", "true"));

  // 2. Public pages
  console.log("\n📸 Public pages:");
  for (const { name, path: route } of PUBLIC_PAGES) {
    await page.goto(`${BASE_URL}${route}`);
    await takeScreenshot(page, name);
  }

  // 3. Log in
  console.log("\n🔐 Logging in (desktop)...");
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState("networkidle");
  await page.waitForSelector("#email", { timeout: 10000 });
  await page.fill("#email", EMAIL);
  await page.fill("#password", PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForFunction(
    () => !window.location.pathname.includes("/login"),
    { timeout: 15000 }
  );
  await page.waitForLoadState("networkidle");
  console.log("  ✓ Logged in");

  // 4. Protected pages — use link clicks to avoid full page reloads
  console.log("\n📸 Protected pages:");
  for (const { name, path: route } of PROTECTED_ROUTES) {
    await navigateTo(page, route);
    await takeScreenshot(page, name);
  }

  // === Mobile ===
  console.log("\n📱 Mobile viewport:");
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const mobilePage = await mobileContext.newPage();

  // Set onboarding flag, then log in
  await mobilePage.goto(`${BASE_URL}/onboarding`);
  await mobilePage.evaluate(() => localStorage.setItem("hasOnboarded", "true"));

  console.log("  🔐 Logging in (mobile)...");
  await mobilePage.goto(`${BASE_URL}/login`);
  await mobilePage.waitForLoadState("networkidle");
  await mobilePage.waitForSelector("#email", { timeout: 10000 });
  await mobilePage.fill("#email", EMAIL);
  await mobilePage.fill("#password", PASSWORD);
  await mobilePage.click('button[type="submit"]');
  await mobilePage.waitForFunction(
    () => !window.location.pathname.includes("/login"),
    { timeout: 15000 }
  );
  await mobilePage.waitForLoadState("networkidle");
  console.log("  ✓ Logged in");

  // Use link clicks for navigation (no full page reload)
  for (const { name, path: route } of PROTECTED_ROUTES) {
    await navigateTo(mobilePage, route);
    await takeScreenshot(mobilePage, `mobile-${name}`);
  }
  await mobileContext.close();

  await browser.close();
  console.log(`\n✅ Done! Screenshots saved to: ${OUT_DIR}\n`);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
