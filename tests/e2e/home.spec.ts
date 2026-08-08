import { test, expect } from "@playwright/test";

test("home page shows hero heading and featured work", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: /Hey Im\s+Jacob/i,
      level: 1,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/Data engineer in Southern California/i),
  ).toBeVisible();
  await expect(
    page.locator(".project-name", { hasText: "NBA ELT Pipeline" }),
  ).toBeVisible();
  const featuredRows = page.locator(".featured-list .entry-row");
  await expect(featuredRows).toHaveCount(3);
  await expect(featuredRows.nth(0).locator(".project-name")).toHaveText(
    "NBA ELT Pipeline",
  );
  await expect(featuredRows.nth(0).locator(".project-kind")).toHaveText(
    "Project",
  );
  await expect(featuredRows.nth(1).locator(".post-title")).toHaveText(
    "Tips for Effective dbt Slim CI / CD",
  );
  await expect(featuredRows.nth(1).locator(".post-kind")).toHaveText("Post");
  await expect(featuredRows.nth(1).locator(".post-kind")).toHaveCSS(
    "text-transform",
    "uppercase",
  );
  await expect(featuredRows.nth(1)).toHaveAttribute(
    "href",
    "/posts/tips-for-effective-dbt-slim-ci/",
  );
  await expect(featuredRows.nth(2).locator(".project-name")).toHaveText(
    "Homelab",
  );
  await expect(featuredRows.nth(2).locator(".project-kind")).toHaveText(
    "Project",
  );
  await expect(page.getByRole("link", { name: "See more →" })).toBeVisible();
});
