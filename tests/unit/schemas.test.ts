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
    });
    expect(result.featured).toBe(true);
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
