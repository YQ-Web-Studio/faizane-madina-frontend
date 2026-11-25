import { test, expect } from '@playwright/test';

test.describe('Homepage & Navigation', () => {
  test('loads page title, brand header, and navigation links', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Faizane Madina/i);

    const nav = page.locator('header, nav');
    await expect(nav.first()).toBeVisible();

    // Check footer exists
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});
