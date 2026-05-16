export interface TagCount {
  tag: string;
  count: number;
}

export interface TopicLink {
  label: string;
  slug: string;
}

/** Route-safe slug for post topic URLs. */
export function tagToSlug(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function tagMatchesSlug(tag: string, slug: string): boolean {
  return tagToSlug(tag) === slug;
}

/** Groups of tag labels that collapse to the same topic slug. */
export function getTopicSlugCollisions(tags: Iterable<string>): string[][] {
  const bySlug = new Map<string, string[]>();

  for (const tag of tags) {
    const slug = tagToSlug(tag);
    if (!slug) continue;
    const labels = bySlug.get(slug) ?? [];
    if (!labels.includes(tag)) {
      labels.push(tag);
    }
    bySlug.set(slug, labels);
  }

  return [...bySlug.values()].filter((labels) => labels.length > 1);
}

export function formatTopicSlugCollisions(collisions: string[][]): string {
  return collisions
    .map(
      (labels) =>
        `${labels.map((l) => `"${l}"`).join(", ")} → "${tagToSlug(labels[0]!)}"`,
    )
    .join("; ");
}

export function getAllTags(posts: { tags: string[] }[]): TagCount[] {
  const counts = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getTagNames(posts: { tags: string[] }[]): string[] {
  return getAllTags(posts).map((entry) => entry.tag);
}

export function getTopicLinks(posts: { tags: string[] }[]): TopicLink[] {
  const tags = posts.flatMap((post) => post.tags);
  const collisions = getTopicSlugCollisions(tags);
  if (collisions.length > 0) {
    throw new Error(
      `Duplicate topic slugs: ${formatTopicSlugCollisions(collisions)}`,
    );
  }

  return getAllTags(posts).map(({ tag }) => ({
    label: tag,
    slug: tagToSlug(tag),
  }));
}
