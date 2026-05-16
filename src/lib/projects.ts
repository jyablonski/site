import type { ProjectMeta } from './schemas';

/** Always pinned to the top of `/projects/` with highlighted styling. */
export const HIGHLIGHTED_PROJECT_SLUG = 'nba-elt-pipeline';

/** When `featured`, always listed last on the home featured row (within `limit`). */
export const HOME_FEATURED_LAST_SLUG = 'homelab';

export type ProjectEntry = ProjectMeta & {
  slug: string;
};

/** Sort key from labels like `2025`, `2022-23`, or `2025 - present` (uses latest year). */
export function parseProjectYear(year: string): number {
  const range = year.trim().match(/^(\d{4})\s*[-–]\s*(\d{2,4})$/);
  if (range) {
    const start = Number(range[1]);
    let end = Number(range[2]);
    if (end < 100) {
      end = Math.floor(start / 100) * 100 + end;
    }
    return Math.max(start, end);
  }

  const years = [...year.matchAll(/\d{4}/g)].map((match) => Number(match[0]));
  if (years.length === 0) {
    return 0;
  }
  return Math.max(...years);
}

export function sortProjectsByYearDesc(
  projects: ProjectEntry[],
): ProjectEntry[] {
  return [...projects].sort(
    (a, b) =>
      parseProjectYear(b.year) - parseProjectYear(a.year) ||
      a.name.localeCompare(b.name),
  );
}

export function getFeaturedProjects(
  projects: ProjectEntry[],
  limit = 3,
): ProjectEntry[] {
  const featured = sortProjectsByYearDesc(projects.filter((p) => p.featured));
  const tail = getProjectBySlug(featured, HOME_FEATURED_LAST_SLUG);
  const pool = featured.filter((p) => p.slug !== HOME_FEATURED_LAST_SLUG);

  const pinned = getProjectBySlug(pool, HIGHLIGHTED_PROJECT_SLUG);
  const rest = pool.filter((p) => p.slug !== HIGHLIGHTED_PROJECT_SLUG);
  const head = pinned ? [pinned, ...rest] : [...rest];

  if (!tail || limit <= 0) {
    return head.slice(0, limit);
  }

  const trimmedHead = head.slice(0, Math.max(0, limit - 1));
  return [...trimmedHead, tail];
}

export function getProjectBySlug(
  projects: ProjectEntry[],
  slug: string,
): ProjectEntry | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getProjectHref(project: ProjectEntry | string): string {
  const slug = typeof project === 'string' ? project : project.slug;
  return `/projects/${slug}/`;
}

export function getProjectsPageList(projects: ProjectEntry[]): {
  highlighted: ProjectEntry | undefined;
  rest: ProjectEntry[];
} {
  const sorted = sortProjectsByYearDesc(projects);
  const highlighted = getProjectBySlug(sorted, HIGHLIGHTED_PROJECT_SLUG);
  const rest = sorted.filter((p) => p.slug !== HIGHLIGHTED_PROJECT_SLUG);

  return { highlighted, rest };
}
