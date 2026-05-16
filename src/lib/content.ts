import { getCollection, type CollectionEntry } from "astro:content";
import type { PostEntry } from "./posts";
import type { ProjectEntry } from "./projects";
import { resolveContentReadTime } from "./read-time";
import { filterPublishedPosts, sortPostsByDateDesc } from "./posts";
import { sortProjectsByYearDesc } from "./projects";

type PostCollectionEntry = CollectionEntry<"posts">;
type ProjectCollectionEntry = CollectionEntry<"projects">;

export function mapProjectEntry(entry: ProjectCollectionEntry): ProjectEntry {
  return {
    slug: entry.id,
    name: entry.data.name,
    year: entry.data.year,
    kind: entry.data.kind,
    summary: entry.data.summary,
    tags: entry.data.tags,
    featured: entry.data.featured,
    readTime: resolveContentReadTime(entry.body ?? "", entry.data.readTime),
    repo: entry.data.repo,
    site: entry.data.site,
  };
}

export function mapPostEntry(entry: PostCollectionEntry): PostEntry {
  return {
    slug: entry.id,
    title: entry.data.title,
    excerpt: entry.data.excerpt,
    date: entry.data.date,
    readTime:
      resolveContentReadTime(entry.body ?? "", entry.data.readTime) ?? "",
    tags: entry.data.tags,
    draft: entry.data.draft,
  };
}

export async function loadPublishedPosts(): Promise<PostEntry[]> {
  const entries = await getCollection("posts");
  const posts = entries.map(mapPostEntry);

  return sortPostsByDateDesc(filterPublishedPosts(posts));
}

export async function loadProjects(): Promise<ProjectEntry[]> {
  const entries = await getCollection("projects");
  const projects = entries.map(mapProjectEntry);

  return sortProjectsByYearDesc(projects);
}
