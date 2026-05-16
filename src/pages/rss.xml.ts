import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { site } from '../data/site';
import { mapPostEntry } from '../lib/content';
import {
  getPostHref,
  sortPostsByDateDesc,
  filterPublishedPosts,
} from '../lib/posts';

export async function GET(context: { site: string | undefined }) {
  const entries = await getCollection('posts');
  const posts = sortPostsByDateDesc(
    filterPublishedPosts(entries.map(mapPostEntry)),
  );

  return rss({
    title: site.name,
    description: site.description,
    site: context.site ?? site.url,
    items: posts.map((post) => ({
      title: post.title,
      pubDate: post.date,
      description: post.excerpt,
      link: getPostHref(post),
    })),
  });
}
