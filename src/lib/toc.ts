import type { MarkdownHeading } from "astro";

/** Hide the TOC until the content has at least this many h2/h3 headings. */
export const TOC_MIN_HEADINGS = 4;

/**
 * Top-level sections (h2) and their immediate subsections (h3); deeper levels
 * add noise in a compact rail. Headings already carry GitHub-style `id`s from
 * Astro's Markdown pipeline, so these double as anchor targets.
 */
export function getTocItems(headings: MarkdownHeading[]): MarkdownHeading[] {
  return headings.filter(
    (heading) => heading.depth === 2 || heading.depth === 3,
  );
}

/** Whether a TOC rail is worth rendering for the given headings. */
export function hasToc(headings: MarkdownHeading[]): boolean {
  return getTocItems(headings).length >= TOC_MIN_HEADINGS;
}
