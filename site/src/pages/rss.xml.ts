import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { siteConfig } from '../data/site';
import { getPublishedPosts } from '../lib/content';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();

  return rss({
    title: siteConfig.name,
    description: siteConfig.description,
    site: context.site ?? new URL('http://localhost:4321/'),
    customData: '<language>zh-CN</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: `/blog/${post.id}/`,
      pubDate: post.data.publishDate,
      categories: post.data.tags,
    })),
  });
}
