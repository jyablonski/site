import { test, expect } from "@playwright/test";
import {
  expectSansFont,
  pickBoxStyles,
  pickMetaStyles,
  pickStyles,
} from "./helpers/styles";

test.describe("typography alignment", () => {
  test("home featured work matches index row typography", async ({ page }) => {
    await page.goto("/");
    const featuredName = await pickStyles(page, ".featured-list .project-name");
    const featuredRow = await pickStyles(page, ".featured-list .project-row");
    const featuredPostTitle = await pickStyles(
      page,
      ".featured-list .post-title",
    );
    const featuredPostRow = await pickStyles(page, ".featured-list .post-row");

    await page.goto("/projects/");
    const projectName = await pickStyles(page, ".project-row .project-name");
    const projectRow = await pickStyles(page, ".project-row");

    expect(featuredName.fontSize).toBe(projectName.fontSize);
    expect(featuredName.fontWeight).toBe(projectName.fontWeight);
    expect(featuredRow.paddingLeft).toBe(projectRow.paddingLeft);
    expect(featuredRow.paddingRight).toBe(projectRow.paddingRight);

    await page.goto("/posts/");
    const postTitle = await pickStyles(page, ".post-row .post-title");
    const postRow = await pickStyles(page, ".post-row");

    expect(featuredPostTitle.fontSize).toBe(postTitle.fontSize);
    expect(featuredPostTitle.fontWeight).toBe(postTitle.fontWeight);
    expect(featuredPostRow.paddingLeft).toBe(postRow.paddingLeft);
    expect(featuredPostRow.paddingRight).toBe(postRow.paddingRight);
  });

  test("entry-row list titles share size and horizontal padding", async ({
    page,
  }) => {
    await page.goto("/projects/");
    const firstName = await pickStyles(
      page,
      ".project-row:not(.project-row--highlighted) .project-name",
    );
    const firstRow = await pickStyles(
      page,
      ".project-row:not(.project-row--highlighted)",
    );
    const highlightedName = await pickStyles(
      page,
      ".project-row--highlighted .project-name",
    );
    const highlightedRow = await pickStyles(page, ".project-row--highlighted");

    expect(firstName.fontSize).toBe(highlightedName.fontSize);
    expect(firstName.fontWeight).toBe(highlightedName.fontWeight);
    expect(firstRow.paddingLeft).toBe(highlightedRow.paddingLeft);
    expect(firstRow.paddingRight).toBe(highlightedRow.paddingRight);
  });

  test("meta columns stack on the right on project rows", async ({ page }) => {
    await page.goto("/projects/");
    const projectMeta = await pickMetaStyles(page.locator(".project-meta"));

    expect(projectMeta.flexDirection).toBe("column");
    expect(projectMeta.alignItems).toBe("flex-end");
    expect(projectMeta.textAlign).toBe("right");
  });

  test("list dates and read times use the unslashed-zero sans font", async ({
    page,
  }) => {
    await page.goto("/posts/");
    const postDate = await pickBoxStyles(page.locator(".post-date").first());
    const postReadTime = await pickBoxStyles(
      page.locator(".post-read-time").first(),
    );

    expectSansFont(postDate.fontFamily);
    expectSansFont(postReadTime.fontFamily);
    expect(postDate.fontSize).toBe(postReadTime.fontSize);

    await page.goto("/projects/");
    const projectYear = await pickBoxStyles(
      page.locator(".project-year").first(),
    );
    const projectReadTime = await pickBoxStyles(
      page.locator(".project-read-time").first(),
    );

    expectSansFont(projectYear.fontFamily);
    expectSansFont(projectReadTime.fontFamily);
    expect(projectYear.fontSize).toBe(projectReadTime.fontSize);
  });

  test("entry-row list cards share hover background on projects index", async ({
    page,
  }) => {
    await page.goto("/projects/");
    const rows = page.locator(".project-row:not(.project-row--highlighted)");
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

  test("list row cards are fully clickable", async ({ page }) => {
    await page.goto("/projects/");
    await page.locator(".project-summary").first().click();
    await expect(page).toHaveURL(/\/projects\//);
  });

  test("body text uses the site sans stack", async ({ page }) => {
    await page.goto("/");

    const bodyFont = await page.locator("body").evaluate((el) => {
      return getComputedStyle(el).fontFamily;
    });

    expect(bodyFont.toLowerCase()).toMatch(/geist|system-ui|sans-serif/);
  });

  test("article pages share the home page's column alignment", async ({
    page,
  }) => {
    const leftOf = (selector: string) =>
      page
        .locator(selector)
        .first()
        .evaluate((el) => Math.round(el.getBoundingClientRect().left));

    await page.goto("/");
    const homeBrand = await leftOf(".site-nav a");
    const homeContent = await leftOf(".hero-subtitle");

    await page.goto("/projects/nba-elt-pipeline/");
    // The TOC rail overflows into the right margin, so the nav and content keep
    // the same left edge as every other page rather than shifting outward.
    expect(await leftOf(".site-nav a")).toBe(homeBrand);
    expect(await leftOf(".masthead-title")).toBe(homeContent);

    const overflowX = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflowX).toBe(false);
  });
});
