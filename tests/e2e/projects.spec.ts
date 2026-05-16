import { test, expect } from '@playwright/test';

test('projects page lists rows', async ({ page }) => {
  await page.goto('/projects/');
  await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
  await expect(
    page.locator('.project-name', { hasText: 'NBA ELT Pipeline' }),
  ).toBeVisible();
  await expect(
    page.locator('.project-name').filter({ hasText: /^arc$/ }),
  ).toBeVisible();
});

test('projects page highlights NBA ELT at the top', async ({ page }) => {
  await page.goto('/projects/');
  const firstRow = page.locator('.project-list .project-row').first();
  await expect(firstRow).toHaveClass(/project-row--highlighted/);
  await expect(firstRow.locator('.project-name')).toHaveText(
    'NBA ELT Pipeline',
  );
  await expect(page.getByText('Flagship project')).toBeVisible();
  await expect(firstRow.locator('.project-read-time')).toHaveText(
    /\d+(-\d+)? min read/,
  );
});

test('project detail page loads', async ({ page }) => {
  await page.goto('/projects/nba-elt-pipeline/');
  await expect(
    page.getByRole('heading', { name: 'NBA ELT Pipeline' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Live site' })).toBeVisible();
});
