import { describe, expect, it } from "vitest";
import {
  filterPostsByTopic,
  filterPublishedPosts,
  formatPostDate,
  getAdjacentPosts,
  getPostBySlug,
  getPostHref,
  sortPostsByDateDesc,
  type PostEntry,
} from "../../src/lib/posts";

const samplePosts: PostEntry[] = [
  {
    slug: "a",
    title: "A",
    excerpt: "",
    date: new Date("2022-01-01"),
    readTime: "5 min",
    tags: ["test"],
    draft: false,
  },
  {
    slug: "b",
    title: "B",
    excerpt: "",
    date: new Date("2022-05-22"),
    readTime: "9 min",
    tags: ["test", "first"],
    draft: false,
  },
  {
    slug: "c",
    title: "C",
    excerpt: "",
    date: new Date("2022-02-20"),
    readTime: "6 min",
    tags: ["sample"],
    draft: true,
  },
];

describe("posts", () => {
  it("sorts posts by date descending", () => {
    const sorted = sortPostsByDateDesc(samplePosts);
    expect(sorted.map((post) => post.slug)).toEqual(["b", "c", "a"]);
  });

  it("filters out draft posts", () => {
    const published = filterPublishedPosts(samplePosts);
    expect(published).toHaveLength(2);
  });

  it("filters posts by topic slug", () => {
    expect(filterPostsByTopic(samplePosts, "first")).toHaveLength(1);
    expect(filterPostsByTopic(samplePosts, "all")).toHaveLength(3);
    expect(filterPostsByTopic(samplePosts, "")).toHaveLength(3);
  });

  it("builds post hrefs", () => {
    expect(getPostHref(samplePosts[0])).toBe("/posts/a/");
    expect(getPostHref("b")).toBe("/posts/b/");
  });

  it("finds post by slug", () => {
    expect(getPostBySlug(samplePosts, "a")?.title).toBe("A");
  });

  it("formats dates as YYYY-MM-DD", () => {
    expect(formatPostDate(new Date("2022-05-22T12:00:00Z"))).toBe("2022-05-22");
  });

  it("returns adjacent posts in sorted order", () => {
    const sorted = sortPostsByDateDesc(filterPublishedPosts(samplePosts));
    const { prev, next } = getAdjacentPosts(sorted, "b");
    expect(prev?.slug).toBe("a");
    expect(next).toBeUndefined();
  });

  it("returns empty adjacent for unknown slug", () => {
    expect(getAdjacentPosts(samplePosts, "missing")).toEqual({});
  });
});
