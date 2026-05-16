import { tagMatchesSlug } from "./tags";
import type { PostMeta } from "./schemas";

export type PostEntry = PostMeta & {
  slug: string;
  readTime: string;
};

export function getPostHref(post: PostEntry | string): string {
  const slug = typeof post === "string" ? post : post.slug;
  return `/posts/${slug}/`;
}

export function sortPostsByDateDesc(posts: PostEntry[]): PostEntry[] {
  return [...posts].sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function filterPublishedPosts(posts: PostEntry[]): PostEntry[] {
  return posts.filter((post) => !post.draft);
}

export function filterPostsByTopic(
  posts: PostEntry[],
  topicSlug: string,
): PostEntry[] {
  if (!topicSlug || topicSlug === "all") {
    return posts;
  }
  return posts.filter((post) =>
    post.tags.some((tag) => tagMatchesSlug(tag, topicSlug)),
  );
}

export function getPostBySlug(
  posts: PostEntry[],
  slug: string,
): PostEntry | undefined {
  return posts.find((post) => post.slug === slug);
}

export function formatPostDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getAdjacentPosts(
  posts: PostEntry[],
  slug: string,
): { prev?: PostEntry; next?: PostEntry } {
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) {
    return {};
  }
  return {
    prev: posts[index + 1],
    next: posts[index - 1],
  };
}
