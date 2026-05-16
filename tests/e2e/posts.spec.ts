import { test, expect } from '@playwright/test';

test('posts index shows empty state when no published posts', async ({
  page,
}) => {
  await page.goto('/posts/');
  await expect(page.getByRole('heading', { name: 'Posts' })).toBeVisible();
  await expect(page.getByText(/0 posts · sorted by date/)).toBeVisible();
  await expect(page.getByText('No published posts yet.')).toBeVisible();
  await expect(page.locator('.post-row')).toHaveCount(0);
});
