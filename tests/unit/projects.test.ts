import { describe, expect, it } from "vitest";
import {
  getFeaturedProjects,
  getProjectBySlug,
  getProjectHref,
  getProjectsPageList,
  HIGHLIGHTED_PROJECT_SLUG,
  HOME_FEATURED_LAST_SLUG,
  parseProjectYear,
  sortProjectsByYearDesc,
  type ProjectEntry,
} from "../../src/lib/projects";

const sample: ProjectEntry[] = [
  {
    slug: "a",
    name: "Alpha",
    year: "2023",
    kind: "Tool",
    summary: "",
    tags: [],
    featured: false,
  },
  {
    slug: "b",
    name: "Beta",
    year: "2025",
    kind: "Platform",
    summary: "",
    tags: [],
    featured: true,
  },
  {
    slug: "c",
    name: "Gamma",
    year: "2024",
    kind: "App",
    summary: "",
    tags: [],
    featured: true,
  },
];

describe("projects", () => {
  it("sorts by year descending", () => {
    expect(sortProjectsByYearDesc(sample).map((p) => p.slug)).toEqual([
      "b",
      "c",
      "a",
    ]);
  });

  it("returns featured projects up to limit", () => {
    expect(getFeaturedProjects(sample, 2).map((p) => p.slug)).toEqual([
      "b",
      "c",
    ]);
  });

  it("pins NBA ELT first among featured projects on the home page", () => {
    const featured: ProjectEntry[] = [
      {
        slug: "lotus",
        name: "Lotus",
        year: "2025 - present",
        kind: "Full-stack app",
        summary: "",
        tags: [],
        featured: true,
      },
      {
        slug: HIGHLIGHTED_PROJECT_SLUG,
        name: "NBA ELT Pipeline",
        year: "2021 - present",
        kind: "Data platform",
        summary: "",
        tags: [],
        featured: true,
      },
    ];

    expect(getFeaturedProjects(featured).map((p) => p.slug)).toEqual([
      HIGHLIGHTED_PROJECT_SLUG,
      "lotus",
    ]);
  });

  it("places homelab last on the home featured row when featured", () => {
    const featured: ProjectEntry[] = [
      {
        slug: HOME_FEATURED_LAST_SLUG,
        name: "Homelab",
        year: "2025 - present",
        kind: "Infrastructure",
        summary: "",
        tags: [],
        featured: true,
      },
      {
        slug: "lotus",
        name: "Lotus",
        year: "2025 - present",
        kind: "Full-stack app",
        summary: "",
        tags: [],
        featured: true,
      },
      {
        slug: HIGHLIGHTED_PROJECT_SLUG,
        name: "NBA ELT Pipeline",
        year: "2021 - present",
        kind: "Data platform",
        summary: "",
        tags: [],
        featured: true,
      },
    ];

    expect(getFeaturedProjects(featured, 3).map((p) => p.slug)).toEqual([
      HIGHLIGHTED_PROJECT_SLUG,
      "lotus",
      HOME_FEATURED_LAST_SLUG,
    ]);
  });

  it("builds project href", () => {
    expect(getProjectHref(sample[0]!)).toBe("/projects/a/");
  });

  it("finds project by slug", () => {
    expect(getProjectBySlug(sample, "c")?.name).toBe("Gamma");
  });

  it("parses year as zero when no year digits are present", () => {
    expect(parseProjectYear("ongoing")).toBe(0);
  });

  it("parses year from present-style labels", () => {
    expect(parseProjectYear("2026 - present")).toBe(2026);
    expect(parseProjectYear("2021 - present")).toBe(2021);
  });

  it("parses year ranges using the latest year", () => {
    expect(parseProjectYear("2022-23")).toBe(2023);
    expect(parseProjectYear("2019-2022")).toBe(2022);
  });

  it("sorts ranged years ahead of a single earlier year", () => {
    const projects: ProjectEntry[] = [
      {
        ...sample[0]!,
        slug: "debezium",
        name: "Debezium Kafka Demo",
        year: "2022",
      },
      { ...sample[0]!, slug: "graphql", name: "GraphQL API", year: "2022-23" },
    ];
    expect(sortProjectsByYearDesc(projects).map((p) => p.slug)).toEqual([
      "graphql",
      "debezium",
    ]);
  });

  it("pins highlighted project first and removes it from the rest list", () => {
    const withHighlight: ProjectEntry[] = [
      ...sample,
      {
        slug: HIGHLIGHTED_PROJECT_SLUG,
        name: "NBA ELT Pipeline",
        year: "2021 - present",
        kind: "Data platform",
        summary: "",
        tags: [],
        featured: true,
      },
    ];

    const { highlighted, rest } = getProjectsPageList(withHighlight);

    expect(highlighted?.slug).toBe(HIGHLIGHTED_PROJECT_SLUG);
    expect(rest.map((p) => p.slug)).not.toContain(HIGHLIGHTED_PROJECT_SLUG);
    expect(rest[0]?.slug).toBe("b");
  });

  it("sorts same year alphabetically by name", () => {
    const sameYear: ProjectEntry[] = [
      { ...sample[0]!, slug: "z", name: "Zulu", year: "2024" },
      { ...sample[0]!, slug: "y", name: "Alpha", year: "2024" },
    ];
    expect(sortProjectsByYearDesc(sameYear).map((p) => p.slug)).toEqual([
      "y",
      "z",
    ]);
  });
});
