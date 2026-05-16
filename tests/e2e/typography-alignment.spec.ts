import { test, expect } from '@playwright/test';
import {
  expectMonospaceFont,
  pickBoxStyles,
  pickMetaStyles,
  pickStyles,
} from './helpers/styles';

test.describe('typography alignment', () => {
  test('home featured projects match projects index row typography', async ({
    page,
  }) => {
    await page.goto('/');
    const featuredName = await pickStyles(page, '.featured-list .project-name');
    const featuredRow = await pickStyles(page, '.featured-list .project-row');

    await page.goto('/projects/');
    const projectName = await pickStyles(page, '.project-row .project-name');
    const projectRow = await pickStyles(page, '.project-row');

    expect(featuredName.fontSize).toBe(projectName.fontSize);
    expect(featuredName.fontWeight).toBe(projectName.fontWeight);
    expect(featuredRow.paddingLeft).toBe(projectRow.paddingLeft);
    expect(featuredRow.paddingRight).toBe(projectRow.paddingRight);
  });

  test('entry-row list titles share size and horizontal padding', async ({
    page,
  }) => {
    await page.goto('/projects/');
    const firstName = await pickStyles(
      page,
      '.project-row:not(.project-row--highlighted) .project-name',
    );
    const firstRow = await pickStyles(
      page,
      '.project-row:not(.project-row--highlighted)',
    );
    const highlightedName = await pickStyles(
      page,
      '.project-row--highlighted .project-name',
    );
    const highlightedRow = await pickStyles(page, '.project-row--highlighted');

    expect(firstName.fontSize).toBe(highlightedName.fontSize);
    expect(firstName.fontWeight).toBe(highlightedName.fontWeight);
    expect(firstRow.paddingLeft).toBe(highlightedRow.paddingLeft);
    expect(firstRow.paddingRight).toBe(highlightedRow.paddingRight);
  });

  test('meta columns stack on the right on project rows', async ({ page }) => {
    await page.goto('/projects/');
    const projectMeta = await pickMetaStyles(page.locator('.project-meta'));

    expect(projectMeta.flexDirection).toBe('column');
    expect(projectMeta.alignItems).toBe('flex-end');
    expect(projectMeta.textAlign).toBe('right');
  });

  test('project years and read times use monospace on the projects index', async ({
    page,
  }) => {
    await page.goto('/projects/');
    const projectYear = await pickBoxStyles(
      page.locator('.project-year').first(),
    );
    const projectReadTime = await pickBoxStyles(
      page.locator('.project-read-time').first(),
    );

    expectMonospaceFont(projectYear.fontFamily);
    expectMonospaceFont(projectReadTime.fontFamily);
    expect(projectYear.fontSize).toBe(projectReadTime.fontSize);
  });

  test('entry-row list cards share hover background on projects index', async ({
    page,
  }) => {
    await page.goto('/projects/');
    const rows = page.locator('.project-row:not(.project-row--highlighted)');
    const firstRow = rows.nth(0);
    const secondRow = rows.nth(1);

    await firstRow.hover();
    const firstHoverBg = await firstRow.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );

    await secondRow.hover();
    const secondHoverBg = await secondRow.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );

    expect(firstHoverBg).toBe(secondHoverBg);
  });

  test('list row cards are fully clickable', async ({ page }) => {
    await page.goto('/projects/');
    await page.locator('.project-summary').first().click();
    await expect(page).toHaveURL(/\/projects\//);
  });

  test('body text uses the site sans stack', async ({ page }) => {
    await page.goto('/');

    const bodyFont = await page.locator('body').evaluate((el) => {
      return getComputedStyle(el).fontFamily;
    });

    expect(bodyFont.toLowerCase()).toMatch(/geist|system-ui|sans-serif/);
  });
});
