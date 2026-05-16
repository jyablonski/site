import type { Code, Parent, Root, Table, TableRow } from "mdast";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";

/** Words per minute for prose (paragraphs, lists, blockquotes). */
export const PROSE_WPM = 230;

/** Seconds to read one diagram (Mermaid, PlantUML, etc.). */
export const DIAGRAM_SECONDS = 15;

/** Seconds to read one image. */
export const IMAGE_SECONDS = 15;

/** Seconds per table row. */
export const TABLE_ROW_SECONDS = 3;

/** Seconds per display/inline math node. */
export const MATH_BLOCK_SECONDS = 20;

/** Default seconds per line of code when language is unknown. */
export const DEFAULT_CODE_LINE_SECONDS = 0.25;

/** Seconds per code line by language (denser or unfamiliar langs read slower). */
export const CODE_LINE_SECONDS: Record<string, number> = {
  default: DEFAULT_CODE_LINE_SECONDS,
  python: 0.22,
  py: 0.22,
  go: 0.28,
  golang: 0.28,
  typescript: 0.24,
  ts: 0.24,
  javascript: 0.23,
  js: 0.23,
  rust: 0.3,
  sql: 0.26,
  yaml: 0.2,
  yml: 0.2,
  shell: 0.21,
  bash: 0.21,
  sh: 0.21,
  json: 0.18,
  html: 0.2,
  css: 0.2,
};

const DIAGRAM_LANGS = new Set(["mermaid", "plantuml"]);

export interface ReadTimeBreakdown {
  proseWords: number;
  codeLines: number;
  diagrams: number;
  images: number;
  tableRows: number;
  mathBlocks: number;
}

export interface ReadTimeCategorySeconds {
  prose: number;
  code: number;
  diagrams: number;
  images: number;
  tables: number;
  math: number;
}

export interface ReadTimeEstimate {
  totalSeconds: number;
  minutes: number;
  breakdown: ReadTimeBreakdown;
  categorySeconds: ReadTimeCategorySeconds;
  /** Use a minute range when non-prose content dominates. */
  useRange: boolean;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function collectText(node: Parent): string {
  let text = "";
  visit(node, "text", (child) => {
    text += `${child.value} `;
  });
  return text;
}

function isMathNode(node: { type: string }): boolean {
  return node.type === "math" || node.type === "inlineMath";
}

function countTableRows(table: Table): number {
  return table.children.filter(
    (row): row is TableRow => row.type === "tableRow",
  ).length;
}

function codeLineSeconds(lang: string, lines: number): number {
  const perLine = CODE_LINE_SECONDS[lang] ?? CODE_LINE_SECONDS.default;
  return lines * perLine;
}

function countCodeLines(value: string): number {
  const lines = value.split("\n");
  const nonEmpty = lines.filter((line) => line.trim().length > 0).length;
  return Math.max(nonEmpty, 1);
}

export function estimateReadTimeFromTree(tree: Root): ReadTimeEstimate {
  const breakdown: ReadTimeBreakdown = {
    proseWords: 0,
    codeLines: 0,
    diagrams: 0,
    images: 0,
    tableRows: 0,
    mathBlocks: 0,
  };

  let codeSeconds = 0;

  visit(tree, (node) => {
    switch (node.type) {
      case "paragraph":
      case "heading":
        breakdown.proseWords += countWords(collectText(node));
        break;
      case "code": {
        const block = node as Code;
        const lang = (block.lang ?? "").toLowerCase();
        if (DIAGRAM_LANGS.has(lang)) {
          breakdown.diagrams += 1;
          break;
        }
        const lines = countCodeLines(block.value);
        breakdown.codeLines += lines;
        codeSeconds += codeLineSeconds(lang, lines);
        break;
      }
      case "image":
        breakdown.images += 1;
        break;
      case "table":
        breakdown.tableRows += countTableRows(node as Table);
        break;
      default:
        if (isMathNode(node)) {
          breakdown.mathBlocks += 1;
        }
        break;
    }
  });

  const categorySeconds: ReadTimeCategorySeconds = {
    prose: (breakdown.proseWords / PROSE_WPM) * 60,
    code: codeSeconds,
    diagrams: breakdown.diagrams * DIAGRAM_SECONDS,
    images: breakdown.images * IMAGE_SECONDS,
    tables: breakdown.tableRows * TABLE_ROW_SECONDS,
    math: breakdown.mathBlocks * MATH_BLOCK_SECONDS,
  };

  const totalSeconds = Object.values(categorySeconds).reduce(
    (sum, value) => sum + value,
    0,
  );

  const nonProseSeconds =
    categorySeconds.code +
    categorySeconds.diagrams +
    categorySeconds.images +
    categorySeconds.tables +
    categorySeconds.math;

  const useRange = totalSeconds > 0 && nonProseSeconds / totalSeconds >= 0.4;

  const minutes = Math.max(1, Math.round(totalSeconds / 60));

  return {
    totalSeconds,
    minutes,
    breakdown,
    categorySeconds,
    useRange,
  };
}

export function estimateReadTimeFromMarkdown(
  markdown: string,
): ReadTimeEstimate {
  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .parse(markdown) as Root;
  return estimateReadTimeFromTree(tree);
}

/** Normalize display strings to `N min read` or `N-M min read`. */
export function formatReadTimeLabel(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "1 min read";
  }
  if (/\bread$/i.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed} read`;
}

export function formatReadTimeDisplay(estimate: ReadTimeEstimate): string {
  if (estimate.totalSeconds <= 0) {
    return formatReadTimeLabel("1 min");
  }

  const minutes = Math.max(1, Math.round(estimate.totalSeconds / 60));

  if (!estimate.useRange) {
    return formatReadTimeLabel(`${minutes} min`);
  }

  const low = Math.max(1, Math.floor((estimate.totalSeconds * 0.85) / 60));
  const high = Math.max(low + 1, Math.ceil((estimate.totalSeconds * 1.2) / 60));
  return formatReadTimeLabel(`${low}-${high} min`);
}

/** Prefer manual frontmatter override; otherwise estimate from markdown body. */
export function resolveContentReadTime(
  body: string,
  manualReadTime?: string,
): string | undefined {
  if (manualReadTime?.trim()) {
    return formatReadTimeLabel(manualReadTime);
  }

  if (!body.trim()) {
    return undefined;
  }

  return formatReadTimeDisplay(estimateReadTimeFromMarkdown(body));
}

/** @deprecated Use {@link resolveContentReadTime}. */
export const resolvePostReadTime = resolveContentReadTime;
