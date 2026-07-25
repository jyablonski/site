import { expect, type Page } from "@playwright/test";

export interface PublishedPostSummary {
  date: string;
  excerpt: string;
  href: string;
  title: string;
}

export async function getPublishedPostSummaries(
  page: Page,
): Promise<PublishedPostSummary[]> {
  await page.goto("/posts/");

  const rows = page.locator(".post-row");
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);

  return Promise.all(
    Array.from({ length: count }, async (_, index) => {
      const row = rows.nth(index);
      const href = await row.getAttribute("href");
      const date = await row.locator("time").getAttribute("datetime");
      const title = (await row.locator(".post-title").innerText()).trim();
      const excerpt = (await row.locator(".post-excerpt").innerText()).trim();

      expect(href).toMatch(/^\/posts\/[^/]+\/$/);
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(title).not.toBe("");
      expect(excerpt).not.toBe("");

      return {
        date: date ?? "",
        excerpt,
        href: href ?? "",
        title,
      };
    }),
  );
}

export async function openPublishedPost(
  page: Page,
  post?: PublishedPostSummary,
): Promise<PublishedPostSummary> {
  const selected = post ?? (await getPublishedPostSummaries(page))[0];
  if (!selected) throw new Error("Expected at least one published post");

  const response = await page.goto(selected.href);
  expect(response?.ok()).toBe(true);
  return selected;
}

export async function openPublishedPostMatching(
  page: Page,
  selectors: string[],
): Promise<PublishedPostSummary> {
  const posts = await getPublishedPostSummaries(page);

  for (const post of posts) {
    await openPublishedPost(page, post);
    const matches = await Promise.all(
      selectors.map((selector) => page.locator(selector).count()),
    );
    if (matches.every((count) => count > 0)) return post;
  }

  throw new Error(
    `No published post renders all required selectors: ${selectors.join(", ")}`,
  );
}
