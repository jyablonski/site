import { describe, expect, it } from "vitest";
import type { MarkdownHeading } from "astro";
import { TOC_MIN_HEADINGS, getTocItems, hasToc } from "../../src/lib/toc";

const heading = (depth: number, slug: string): MarkdownHeading => ({
  depth,
  slug,
  text: slug,
});

const sections = (count: number): MarkdownHeading[] =>
  Array.from({ length: count }, (_, index) => heading(2, `section-${index}`));

describe("toc", () => {
  it("keeps only h2 and h3 headings", () => {
    const items = getTocItems([
      heading(1, "title"),
      heading(2, "overview"),
      heading(3, "details"),
      heading(4, "footnote"),
    ]);

    expect(items.map((item) => item.slug)).toEqual(["overview", "details"]);
  });

  it("preserves heading order", () => {
    const items = getTocItems([
      heading(2, "a"),
      heading(3, "a-1"),
      heading(2, "b"),
    ]);

    expect(items.map((item) => item.slug)).toEqual(["a", "a-1", "b"]);
  });

  it("shows the toc once h2/h3 headings reach the threshold", () => {
    expect(hasToc(sections(TOC_MIN_HEADINGS))).toBe(true);
    expect(hasToc(sections(TOC_MIN_HEADINGS + 3))).toBe(true);
  });

  it("hides the toc below the threshold", () => {
    expect(hasToc(sections(TOC_MIN_HEADINGS - 1))).toBe(false);
    expect(hasToc([])).toBe(false);
  });

  it("counts only h2/h3 headings toward the threshold", () => {
    // Three real sections plus an h1 title and an h4 — still below threshold.
    const headings = [
      heading(1, "title"),
      heading(2, "one"),
      heading(2, "two"),
      heading(3, "two-a"),
      heading(4, "skip"),
    ];

    expect(getTocItems(headings)).toHaveLength(3);
    expect(hasToc(headings)).toBe(false);
  });
});
