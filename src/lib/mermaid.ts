import type { Code, Root } from "mdast";
import { visit } from "unist-util-visit";

export function escapeMermaidHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Turn ```mermaid fences into <pre class="mermaid"> for client rendering. */
export function remarkMermaid() {
  return (tree: Root) => {
    visit(tree, "code", (node: Code, index, parent) => {
      if (node.lang !== "mermaid" || parent == null || index == null) {
        return;
      }

      parent.children[index] = {
        type: "html",
        value: `<pre class="mermaid">${escapeMermaidHtml(node.value)}</pre>`,
      };
    });
  };
}
