import { test, expect } from '@playwright/test';

test('resume page embeds Google Drive preview', async ({ page }) => {
  await page.goto('/resume/');
  await expect(page.getByRole('heading', { name: 'Resume' })).toBeVisible();
  const frame = page.locator('iframe.resume-frame');
  await expect(frame).toHaveAttribute(
    'src',
    /drive\.google\.com\/file\/d\/1PjtiPVPcTMJHrhnOF-xkvP8EPHpWWhkN\/preview/,
  );
});
