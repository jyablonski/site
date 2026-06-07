import { describe, expect, it } from "vitest";
import { postSchema, projectSchema } from "../../src/lib/schemas";

describe("schemas", () => {
  it("accepts valid post metadata", () => {
    const result = postSchema.parse({
      title: "Hello",
      date: "2022-05-22",
      tags: ["dbt"],
      excerpt: "Summary",
    });
    expect(result.draft).toBe(false);
    expect(result.date).toBeInstanceOf(Date);
  });

  it("normalizes manual readTime override", () => {
    const result = postSchema.parse({
      title: "Hello",
      date: "2022-05-22",
      readTime: "9 min",
      excerpt: "Summary",
    });
    expect(result.readTime).toBe("9 min read");
  });

  it("rejects invalid post metadata", () => {
    expect(() =>
      postSchema.parse({
        title: "",
        date: "2022-05-22",
        readTime: "9 min",
        excerpt: "x",
      }),
    ).toThrow();

    expect(() =>
      postSchema.parse({
        title: "Hello",
        date: "2022-05-22",
        tags: ["   "],
        excerpt: "Summary",
      }),
    ).toThrow();
  });

  it("accepts valid project metadata", () => {
    const result = projectSchema.parse({
      name: "NBA ELT",
      year: "2025",
      kind: "Data platform",
      summary: "End to end pipeline",
      tags: ["Python"],
      featured: true,
      images: [
        {
          src: "/images/projects/example.png",
          alt: "example project screenshot",
          caption: "Optional caption",
          maxWidth: "16rem",
        },
      ],
    });
    expect(result.featured).toBe(true);
    expect(result.images).toHaveLength(1);
    expect(result.images[0]?.maxWidth).toBe("16rem");
  });

  it("accepts project year ranges and present", () => {
    expect(
      projectSchema.parse({
        name: "Homelab",
        year: "2023 - present",
        kind: "Infrastructure",
        summary: "K3s cluster",
      }).year,
    ).toBe("2023 - present");

    expect(
      projectSchema.parse({
        name: "GraphQL API",
        year: "2022-23",
        kind: "API",
        summary: "GraphQL layer",
      }).year,
    ).toBe("2022-23");
  });

  it("rejects invalid project years and read times", () => {
    expect(() =>
      projectSchema.parse({
        name: "NBA ELT",
        year: "soon",
        kind: "Data platform",
        summary: "End to end pipeline",
      }),
    ).toThrow();

    expect(() =>
      projectSchema.parse({
        name: "NBA ELT",
        year: "2022-99",
        kind: "Data platform",
        summary: "End to end pipeline",
      }),
    ).toThrow();

    expect(() =>
      projectSchema.parse({
        name: "NBA ELT",
        year: "2025",
        kind: "Data platform",
        summary: "End to end pipeline",
        readTime: "about five minutes",
      }),
    ).toThrow();
  });

  it("accepts optional seoTitle and updated fields", () => {
    const result = postSchema.parse({
      title: "Voice-forward H1",
      seoTitle: "Debugging dbt Test Failures with Snowflake Regex Behavior",
      date: "2026-01-15",
      updated: "2026-02-01",
      excerpt: "Summary",
    });

    expect(result.seoTitle).toBe(
      "Debugging dbt Test Failures with Snowflake Regex Behavior",
    );
    expect(result.updated).toBeInstanceOf(Date);
  });

  it("rejects updated dates before publish date", () => {
    expect(() =>
      postSchema.parse({
        title: "Hello",
        date: "2026-02-01",
        updated: "2026-01-15",
        excerpt: "Summary",
      }),
    ).toThrow(/on or after the publish date/);
  });

  it("rejects post tags that share a topic slug", () => {
    expect(() =>
      postSchema.parse({
        title: "Hello",
        date: "2022-05-22",
        tags: ["C++", "C#"],
        excerpt: "Summary",
      }),
    ).toThrow(/same topic slug/);
  });
});
