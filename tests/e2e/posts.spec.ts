import { test, expect } from "@playwright/test";
import { getPublishedPostSummaries } from "./helpers/posts";

test("posts index lists published posts newest first", async ({ page }) => {
  const posts = await getPublishedPostSummaries(page);

  await expect(page.getByRole("heading", { name: "Posts" })).toBeVisible();
  await expect(page.locator(".post-row")).toHaveCount(posts.length);

  const noun = posts.length === 1 ? "post" : "posts";
  await expect(page.locator(".page-meta")).toHaveText(
    `${posts.length} ${noun} · sorted by date`,
  );

  const dates = posts.map((post) => post.date);
  expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)));
  expect(new Set(posts.map((post) => post.href)).size).toBe(posts.length);
});
