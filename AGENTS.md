# Agent guide — jyablonski.dev

Personal site and blog ([Astro](https://astro.build), static deploy to S3/CloudFront). Use this file for conventions agents should follow when editing content or layout.

## Commands

```bash
make setup   # npm ci
make up      # dev server http://localhost:4321
make test    # unit tests only
make e2e     # build + Playwright (see package.json test:e2e)
npm run test # astro check, lint, unit + e2e
```

## Blog posts (`src/content/posts/*.md`)

### URL slugs

- Slug = markdown filename (no extension). Example: `snowflake-incremental-dedup.md` → `/posts/snowflake-incremental-dedup/`.
- **Flat, evergreen slugs.** No dates or categories in the path.
- Pick the slug once; changing it breaks URLs unless you add redirects.

### Frontmatter

| Field      | Required | Purpose                                                                            |
| ---------- | -------- | ---------------------------------------------------------------------------------- |
| `title`    | yes      | **H1** on the page — voice, hooks, personality                                     |
| `seoTitle` | no       | **`<title>` / OG / Twitter** — boring, specific, matches what someone would Google |
| `date`     | yes      | Publish date (`YYYY-MM-DD`)                                                        |
| `updated`  | no       | Last meaningful revision; must be ≥ `date`. Shown only when different from `date`  |
| `excerpt`  | yes      | Meta description, RSS summary, JSON-LD `description` — write like a search snippet |
| `tags`     | no       | Topic filters on `/posts/topic/...` only (not in post URL)                         |
| `draft`    | no       | `true` = excluded from build, sitemap, and RSS                                     |

**Title split (CalMatters-style):** search bots and tabs use `seoTitle` (or `title` if omitted); readers see `title` as the H1.

```yaml
title: How I stopped fighting Snowflake regex in dbt tests
seoTitle: Debugging dbt Test Failures with Snowflake Regex Behavior
date: 2026-03-10
updated: 2026-03-12
excerpt: Why a dbt test failed on Snowflake regex, and the exact `where` clause that fixed it.
tags: [dbt, Snowflake]
draft: false
```

### On-page SEO (automatic)

`PostLayout.astro` renders:

- Published / updated dates and read time
- `og:type=article`, canonical URL, Article + Person JSON-LD
- Real Markdown code fences as `<pre><code>` (not images)

### Writing guidance

- Target **long-tail, specific problems** (lived experience + code), not broad keywords.
- Link **primary sources** in the body (dbt/Snowflake docs, GitHub issues, etc.).
- **Distribution** (HN, Slack, Reddit) matters more than schema tuning at low traffic.
- Skip: breadcrumb schema, keyword density, heavy internal-linking strategy until you have many posts.

## Projects (`src/content/projects/*.md`)

Separate collection; URLs are `/projects/{slug}/`. Not covered by post SEO helpers.

## Tests

When changing post SEO behavior, update:

- `tests/unit/post-seo.test.ts` — title/JSON-LD helpers
- `tests/unit/schemas.test.ts` — frontmatter validation
- `tests/e2e/post-detail.spec.ts` — rendered metadata on `/posts/example-post/`
- `tests/e2e/posts.spec.ts` — index lists published posts

`example-post.md` is the published fixture for e2e; `draft-only-post.md` stays draft for 404 coverage.

## Layout map

| Path                          | Layout                                    |
| ----------------------------- | ----------------------------------------- |
| `/posts/[slug]/`              | `PostLayout` → `BaseLayout` (article SEO) |
| `/posts/`, `/projects/`, home | `BaseLayout` (`og:type=website`)          |

SEO helpers live in `src/lib/post-seo.ts`.
