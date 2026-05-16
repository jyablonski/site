import { test, expect } from '@playwright/test';

test('draft posts are not published', async ({ page }) => {
  await page.goto('/posts/example-post/');
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
});
