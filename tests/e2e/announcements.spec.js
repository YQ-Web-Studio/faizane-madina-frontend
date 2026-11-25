import { test, expect } from "@playwright/test";

test.describe("Announcements & Community Notices", () => {
  test("displays announcements section in DOM", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#announcements").first();
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
  });
});
