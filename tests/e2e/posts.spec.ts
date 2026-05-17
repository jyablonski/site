import { test, expect } from "@playwright/test";

test("posts index lists published posts", async ({ page }) => {
  await page.goto("/posts/");
  await expect(page.getByRole("heading", { name: "Posts" })).toBeVisible();
  await expect(page.getByText(/1 post · sorted by date/)).toBeVisible();
  await expect(page.locator(".post-row")).toHaveCount(1);
  await expect(page.getByRole("link", { name: /Example post/ })).toBeVisible();
});
