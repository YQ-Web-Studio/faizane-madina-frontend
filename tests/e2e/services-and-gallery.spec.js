import { test, expect } from '@playwright/test';

test.describe('Services & Gallery', () => {
  test('renders services and community gallery sections', async ({ page }) => {
    await page.goto('/');

    const servicesSection = page.locator('section#services');
    await expect(servicesSection).toBeVisible();

    const gallerySection = page.locator('section#gallery');
    await expect(gallerySection).toBeVisible();
  });
});
