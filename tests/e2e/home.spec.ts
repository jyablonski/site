import { test, expect } from '@playwright/test';

test('home page shows hero heading and featured work', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', {
      name: /Building\s+quiet, reliable\s+data systems/i,
      level: 1,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/Data engineer in Southern California/i),
  ).toBeVisible();
  await expect(
    page.locator('.project-name', { hasText: 'NBA ELT Pipeline' }),
  ).toBeVisible();
  await expect(
    page.locator('.featured-list .project-row').nth(2).locator('.project-name'),
  ).toHaveText('Homelab');
  await expect(page.getByRole('link', { name: 'See all →' })).toBeVisible();
});
