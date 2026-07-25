import { test, expect } from "@playwright/test";
import { openPublishedPostMatching } from "./helpers/posts";

test("project masthead shows link buttons and tags in one row", async ({
  page,
}) => {
  await page.goto("/projects/nba-elt-pipeline/");

  const utilRow = page.locator(".util-row");
  await expect(utilRow.getByRole("link", { name: "Live site" })).toBeVisible();
  await expect(utilRow.getByRole("link", { name: "Repository" })).toBeVisible();
  await expect(utilRow.locator(".chip", { hasText: "Python" })).toBeVisible();
});

test("on-this-page rail lists the content headings", async ({ page }) => {
  await page.goto("/projects/nba-elt-pipeline/");

  const rail = page.locator(".toc-rail");
  await expect(rail).toBeVisible();
  await expect(rail.getByText("On this page")).toBeVisible();
  await expect(rail.getByRole("link", { name: "What it is" })).toBeVisible();
  await expect(rail.getByRole("link", { name: "Tech stack" })).toBeVisible();
});

test("on-this-page rail highlights the section you click", async ({ page }) => {
  await page.goto("/projects/nba-elt-pipeline/");

  const rail = page.locator(".toc-rail");
  // Defaults to the first section so the rail is never blank at the top.
  await expect(rail.locator("a.is-active")).toHaveText("What it is");

  await rail.getByRole("link", { name: "Why I built it" }).click();
  await expect(rail.locator("a.is-active")).toHaveText("Why I built it");

  // A short section near the page end still highlights on click.
  await rail.getByRole("link", { name: "Tech stack" }).click();
  await expect(rail.locator("a.is-active")).toHaveText("Tech stack");
});

test("on-this-page rail tracks the active section while scrolling", async ({
  page,
}) => {
  await page.goto("/projects/nba-elt-pipeline/");

  const rail = page.locator(".toc-rail");
  // Bring "What it does" just below the sticky nav so it crosses the
  // activation line.
  await page.evaluate(() => {
    const target = document.querySelector("#what-it-does");
    if (target) {
      window.scrollTo(
        0,
        target.getBoundingClientRect().top + window.scrollY - 60,
      );
    }
  });
  await expect(rail.locator("a.is-active")).toHaveText("What it does");

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(rail.locator("a.is-active")).toHaveText("What it is");
});

test("post table of contents mirrors its rendered headings", async ({
  page,
}) => {
  await openPublishedPostMatching(page, [".toc-rail", ".prose h3"]);

  const headings = page.locator(".prose h2, .prose h3");
  const headingText = (await headings.allTextContents()).map((text) =>
    text.trim(),
  );
  const tocText = (await page.locator(".toc-rail a").allTextContents()).map(
    (text) => text.trim(),
  );
  expect(tocText).toEqual(headingText);

  const subheadingIds = await page
    .locator(".prose h3")
    .evaluateAll((elements) => elements.map((element) => `#${element.id}`));
  const nestedLinks = await page
    .locator(".toc-rail .toc-sub a")
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("href")),
    );
  expect(nestedLinks).toEqual(subheadingIds);
});
