import { describe, expect, it } from "vitest";
import type { Root } from "mdast";
import {
  estimateReadTimeFromMarkdown,
  estimateReadTimeFromTree,
  formatReadTimeDisplay,
  formatReadTimeLabel,
  resolveContentReadTime,
} from "../../src/lib/read-time";

const SAMPLE = `---
ignored: frontmatter is not in the body passed to the estimator
---

Intro paragraph with ten words here for the read time estimator test.

## Section

- Bullet one
- Bullet two

1. First step
2. Second step

\`\`\`python
print("hello")
print("world")
\`\`\`

\`\`\`mermaid
flowchart LR
  A --> B
\`\`\`
`;

describe("read-time", () => {
  it("counts prose, code, and diagrams separately", () => {
    const estimate = estimateReadTimeFromMarkdown(SAMPLE);

    expect(estimate.breakdown.proseWords).toBeGreaterThan(10);
    expect(estimate.breakdown.codeLines).toBeGreaterThanOrEqual(2);
    expect(estimate.breakdown.diagrams).toBe(1);
    expect(estimate.categorySeconds.prose).toBeGreaterThan(0);
    expect(estimate.categorySeconds.code).toBeGreaterThan(0);
    expect(estimate.categorySeconds.diagrams).toBeGreaterThan(0);
    expect(estimate.totalSeconds).toBeGreaterThan(0);
  });

  it("uses a range when non-prose content dominates", () => {
    const heavyCode = "```go\n" + 'fmt.Println("x")\n'.repeat(40) + "```";
    const estimate = estimateReadTimeFromMarkdown(heavyCode);

    expect(estimate.useRange).toBe(true);
    expect(formatReadTimeDisplay(estimate)).toMatch(/^\d+-\d+ min read$/);
  });

  it("formats a single rounded minute for prose-heavy posts", () => {
    const prose = "word ".repeat(400);
    const estimate = estimateReadTimeFromMarkdown(prose);

    expect(estimate.useRange).toBe(false);
    expect(formatReadTimeDisplay(estimate)).toMatch(/^\d+ min read$/);
  });

  it("prefers manual frontmatter override", () => {
    expect(resolveContentReadTime("any body", "2 min")).toBe("2 min read");
  });

  it("estimates from body when manual read time is absent", () => {
    const display = resolveContentReadTime("Hello world from a short post.");
    expect(display).toMatch(/^\d+(-\d+)? min read$/);
  });

  it("normalizes manual labels that already include read", () => {
    expect(formatReadTimeLabel("3 min read")).toBe("3 min read");
  });

  it("returns undefined for an empty body", () => {
    expect(resolveContentReadTime("   ")).toBeUndefined();
  });

  it("counts table rows and images", () => {
    const markdown = `
| Col |
| --- |
| a |
| b |

![alt](/img.png)
`;
    const estimate = estimateReadTimeFromMarkdown(markdown);

    expect(estimate.breakdown.tableRows).toBe(3);
    expect(estimate.breakdown.images).toBe(1);
    expect(estimate.categorySeconds.tables).toBeGreaterThan(0);
    expect(estimate.categorySeconds.images).toBeGreaterThan(0);
  });

  it("returns at least one minute for empty content", () => {
    expect(formatReadTimeDisplay(estimateReadTimeFromMarkdown(""))).toBe(
      "1 min read",
    );
  });

  it("counts math nodes in the AST", () => {
    const tree = {
      type: "root",
      children: [
        { type: "math", value: "E = mc^2" },
        { type: "inlineMath", value: "x" },
      ],
    } as unknown as Root;

    const estimate = estimateReadTimeFromTree(tree);
    expect(estimate.breakdown.mathBlocks).toBe(2);
    expect(estimate.categorySeconds.math).toBeGreaterThan(0);
  });
});
