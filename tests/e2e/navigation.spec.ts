import { test, expect } from '@playwright/test';

const routes = ['/', '/posts/', '/projects/', '/resume/'];

for (const route of routes) {
  test(`navigation returns 200 for ${route}`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.ok()).toBeTruthy();
  });
}

test('nav links are present', async ({ page }) => {
  await page.goto('/');
  for (const label of ['Home', 'Posts', 'Projects', 'Resume']) {
    await expect(
      page.getByRole('navigation', { name: 'Primary' }).getByRole('link', {
        name: label,
      }),
    ).toBeVisible();
  }
});
