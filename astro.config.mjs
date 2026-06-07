// @ts-check
import { readFileSync } from "node:fs";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import { remarkMermaid } from "./src/lib/mermaid.ts";

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf-8"),
);

// https://astro.build/config
export default defineConfig({
  site: "https://jyablonski.dev",
  trailingSlash: "always",
  output: "static",
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkMermaid],
  },
  vite: {
    // Pre-bundle mermaid so its lazy client-side import() doesn't hit a
    // 504 (Outdated Optimize Dep) on cold dev loads, which leaves diagrams
    // rendered as raw text.
    optimizeDeps: {
      include: ["mermaid"],
    },
    define: {
      "import.meta.env.PUBLIC_SITE_VERSION": JSON.stringify(pkg.version),
    },
  },
});
