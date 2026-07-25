import { test, expect } from "@playwright/test";
import { openPublishedPost, openPublishedPostMatching } from "./helpers/posts";

test("draft posts are not published", async ({ page }) => {
  await page.goto("/posts/draft-only-post/");
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
});

test("published post exposes SEO metadata", async ({ page }) => {
  const post = await openPublishedPost(page);

  await expect(page).toHaveTitle(/\S+ \| Jacob Yablonski$/);
  await expect(
    page.locator('meta[property="og:type"][content="article"]'),
  ).toHaveCount(1);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    post.excerpt,
  );

  await expect(
    page.getByRole("heading", { level: 1, name: post.title }),
  ).toBeVisible();
  await expect(
    page.locator(`.post-meta-row time[datetime="${post.date}"]`).first(),
  ).toBeVisible();

  const canonical = await page
    .locator('link[rel="canonical"]')
    .getAttribute("href");
  expect(canonical).toBeTruthy();
  expect(new URL(canonical ?? "").pathname).toBe(post.href);

  const jsonLd = page.locator('script[type="application/ld+json"]');
  await expect(jsonLd).toHaveCount(1);
  const structuredData = JSON.parse((await jsonLd.textContent()) ?? "{}");
  expect(structuredData).toMatchObject({
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: "Jacob Yablonski",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
  });
  expect(structuredData.dateModified >= post.date).toBe(true);
});

test("published Markdown renders semantic article content", async ({
  page,
}) => {
  await openPublishedPostMatching(page, [
    ".prose h2",
    ".prose pre code",
    ".prose blockquote",
  ]);

  await expect(page.locator(".prose h2").first()).toBeVisible();
  await expect(page.locator(".prose pre code").first()).not.toBeEmpty();
  await expect(page.locator(".prose blockquote").first()).not.toBeEmpty();
});
