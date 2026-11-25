import { test, expect } from "@playwright/test";

test.describe("Prayer Times & Countdown", () => {
  test("renders prayer schedule section", async ({ page }) => {
    await page.goto("/");
    const prayerSection = page.locator("#prayer-times").first();
    await expect(prayerSection).toBeVisible();
  });
});
