import { z } from "astro/zod";
import {
  formatTopicSlugCollisions,
  getTopicSlugCollisions,
  tagToSlug,
} from "./tags";

const trimmed = z.string().trim().min(1);

const yearSchema = trimmed.refine(isValidYear, {
  message:
    "Year must be a four-digit year, a short range (e.g. 2022-23), or a range ending in present",
});

const readTimeSchema = trimmed
  .regex(/^\d+(?:-\d+)?\s*min(?:\s*read)?$/i, {
    message: 'Read time must look like "5 min", "5-7 min", or "5 min read"',
  })
  .transform(normalizeReadTime);

const tagSchema = trimmed.refine((tag) => tagToSlug(tag).length > 0, {
  message: "Tag must contain at least one letter or number",
});

export const postSchema = z
  .object({
    title: trimmed,
    seoTitle: trimmed.optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    readTime: readTimeSchema.optional(),
    tags: z
      .array(tagSchema)
      .default([])
      .superRefine((tags, ctx) => {
        const collisions = getTopicSlugCollisions(tags);
        if (collisions.length === 0) return;
        ctx.addIssue({
          code: "custom",
          message: `Tags share the same topic slug: ${formatTopicSlugCollisions(collisions)}`,
        });
      }),
    excerpt: trimmed,
    draft: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (!data.updated) {
      return;
    }
    if (data.updated.getTime() < data.date.getTime()) {
      ctx.addIssue({
        code: "custom",
        path: ["updated"],
        message: "Updated date must be on or after the publish date",
      });
    }
  });

export const projectSchema = z.object({
  name: trimmed,
  year: yearSchema,
  kind: trimmed,
  summary: trimmed,
  tags: z.array(tagSchema).default([]),
  featured: z.boolean().default(false),
  images: z
    .array(
      z.object({
        src: trimmed,
        alt: trimmed,
        caption: trimmed.optional(),
        maxWidth: trimmed.optional(),
      }),
    )
    .default([]),
  readTime: readTimeSchema.optional(),
  repo: z.url().optional(),
  site: z.url().optional(),
});

export type PostMeta = z.infer<typeof postSchema>;
export type ProjectMeta = z.infer<typeof projectSchema>;

function isValidYear(value: string): boolean {
  const year = value.trim();
  if (/^\d{4}$/.test(year)) {
    return true;
  }
  if (/^\d{4}\s*[-–]\s*present$/i.test(year)) {
    return true;
  }

  const match = year.match(/^(\d{4})\s*[-–]\s*(\d{2,4})$/);
  if (!match) {
    return false;
  }

  const start = Number(match[1]);
  const endRaw = Number(match[2]);
  const end = expandRangeEndYear(start, endRaw);

  if (end < start) {
    return false;
  }

  if (endRaw < 100) {
    return end - start <= 1;
  }

  return end - start <= 99;
}

/** Match project sort parsing for range validation. */
function expandRangeEndYear(start: number, endRaw: number): number {
  let end = endRaw;
  if (end < 100) {
    end = Math.floor(start / 100) * 100 + end;
    if (end < start) {
      end += 100;
    }
  }
  return end;
}

function normalizeReadTime(value: string): string {
  const match = value.trim().match(/^(\d+(?:-\d+)?)\s*min(?:\s*read)?$/i);
  if (!match) {
    return value.trim();
  }
  return `${match[1]} min read`;
}
