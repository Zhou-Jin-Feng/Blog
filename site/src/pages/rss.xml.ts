import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { siteConfig } from '../data/site';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());

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
