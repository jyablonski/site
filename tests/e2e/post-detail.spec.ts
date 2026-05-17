import { test, expect } from "@playwright/test";

test("draft posts are not published", async ({ page }) => {
  await page.goto("/posts/draft-only-post/");
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
});

test("published post exposes SEO metadata", async ({ page }) => {
  await page.goto("/posts/example-post/");

  await expect(page).toHaveTitle(
    "Example post for search snippets and document titles | Jacob Yablonski",
  );
  await expect(
    page.locator('meta[property="og:type"][content="article"]'),
  ).toHaveCount(1);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /SEO frontmatter/,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/posts\/example-post\/$/,
  );

  await expect(
    page.getByRole("heading", { level: 1, name: "Example post" }),
  ).toBeVisible();

  await expect(page.getByText(/Published 2026-01-15/)).toBeVisible();
  await expect(page.getByText(/Updated 2026-02-01/)).toBeVisible();

  const jsonLd = page.locator('script[type="application/ld+json"]');
  await expect(jsonLd).toHaveCount(1);
  const structuredData = JSON.parse((await jsonLd.textContent()) ?? "{}");
  expect(structuredData).toMatchObject({
    "@type": "Article",
    headline: "Example post",
    datePublished: "2026-01-15",
    dateModified: "2026-02-01",
    author: {
      "@type": "Person",
      name: "Jacob Yablonski",
    },
  });
});
