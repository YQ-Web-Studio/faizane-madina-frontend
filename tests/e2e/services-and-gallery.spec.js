import { test, expect } from '@playwright/test';

test.describe('Services & Gallery', () => {
  test('renders services or community gallery elements', async ({ page }) => {
    await page.goto('/');
    const content = page.locator('main, section').first();
    await expect(content).toBeVisible();
  });
});
