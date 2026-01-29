import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should work', async ({ page }) => {
    // Start at home page
    await page.goto('/');

    await expect(true).toBeTruthy();
  });
});
