import { describe, expect, it } from "vitest";
import { site } from "../../src/data/site";
import {
  buildArticleJsonLd,
  formatSitePageTitle,
  getPostDocumentTitle,
  shouldShowUpdatedDate,
} from "../../src/lib/post-seo";
import type { PostEntry } from "../../src/lib/posts";

const basePost: PostEntry = {
  slug: "snowflake-dedup",
  title: "How I fixed incremental dedup",
  seoTitle: "Debugging dbt Test Failures with Snowflake Regex Behavior",
  excerpt: "Specific failure mode and fix on Snowflake.",
  date: new Date("2026-01-15"),
  updated: new Date("2026-02-01"),
  readTime: "8 min read",
  tags: ["dbt", "Snowflake"],
  draft: false,
};

describe("post-seo", () => {
  it("uses seoTitle for the document title when provided", () => {
    expect(getPostDocumentTitle(basePost)).toBe(
      "Debugging dbt Test Failures with Snowflake Regex Behavior",
    );
  });

  it("falls back to title when seoTitle is omitted", () => {
    const { seoTitle: _seoTitle, ...post } = basePost;
    expect(getPostDocumentTitle(post)).toBe("How I fixed incremental dedup");
  });

  it("formats site page titles with the site name suffix", () => {
    expect(formatSitePageTitle("Debugging dbt Test Failures")).toBe(
      "Debugging dbt Test Failures | Jacob Yablonski",
    );
    expect(formatSitePageTitle(site.name)).toBe(site.name);
  });

  it("shows updated date only when it differs from publish date", () => {
    expect(shouldShowUpdatedDate(basePost)).toBe(true);
    expect(
      shouldShowUpdatedDate({
        ...basePost,
        updated: new Date("2026-01-15"),
      }),
    ).toBe(false);
    expect(
      shouldShowUpdatedDate({
        ...basePost,
        updated: undefined,
      }),
    ).toBe(false);
  });

  it("builds Article and Person JSON-LD", () => {
    const jsonLd = buildArticleJsonLd(
      basePost,
      "https://jyablonski.dev/posts/snowflake-dedup/",
    );

    expect(jsonLd).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "How I fixed incremental dedup",
      description: "Specific failure mode and fix on Snowflake.",
      datePublished: "2026-01-15",
      dateModified: "2026-02-01",
      author: {
        "@type": "Person",
        name: site.name,
        url: site.url,
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": "https://jyablonski.dev/posts/snowflake-dedup/",
      },
    });
  });

  it("uses publish date for dateModified when updated is omitted", () => {
    const { updated: _updated, ...post } = basePost;
    const jsonLd = buildArticleJsonLd(
      post,
      "https://jyablonski.dev/posts/snowflake-dedup/",
    );

    expect(jsonLd.dateModified).toBe("2026-01-15");
  });
});
