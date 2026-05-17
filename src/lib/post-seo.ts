import { site } from "../data/site";
import { formatPostDate, type PostEntry } from "./posts";

export function getPostDocumentTitle(post: PostEntry): string {
  return post.seoTitle ?? post.title;
}

export function formatSitePageTitle(title: string): string {
  return title === site.name ? title : `${title} | ${site.name}`;
}

export function shouldShowUpdatedDate(post: PostEntry): boolean {
  if (!post.updated) {
    return false;
  }
  return formatPostDate(post.updated) !== formatPostDate(post.date);
}

export function buildArticleJsonLd(
  post: PostEntry,
  canonicalUrl: string,
): Record<string, unknown> {
  const dateModified = post.updated ?? post.date;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: formatPostDate(post.date),
    dateModified: formatPostDate(dateModified),
    author: {
      "@type": "Person",
      name: site.name,
      url: site.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
  };
}
