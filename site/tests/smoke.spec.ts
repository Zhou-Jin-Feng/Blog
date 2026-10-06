import { expect, test } from '@playwright/test';
import { features } from '../src/data/site';

/** 导航里的栏目。视频栏目按 features.videos 开关显示。 */
const sections = ['/', '/blog/', '/projects/', '/docs/', ...(features.videos ? ['/video/'] : []), '/downloads/', '/resume/', '/timeline/', '/about/'];

const p0Routes = [
  ...sections,
  '/404.html',
  '/rss.xml',
  '/sitemap-index.xml',
  '/robots.txt',
];

test.describe('Stage 2 P0 route baseline', () => {
  test('all P0 routes respond successfully', async ({ request }) => {
    for (const route of p0Routes) {
      const response = await request.get(route);
      expect(response.status(), route).toBe(200);
    }
  });

  test('representative detail and download routes respond successfully', async ({ request }) => {
    const routes = [
      '/blog/python-debugging/',
      '/blog/python-debugging.md',
      '/projects/documind/',
      '/docs/llm-app-learning-roadmap/',
      '/docs/llm-app-learning-roadmap.md',
      '/images/blog/fastapi-notes/1781778460556.webp',
    ];

    for (const route of routes) {
      const response = await request.get(route);
      expect(response.status(), route).toBe(200);
    }
  });

  test('draft content is excluded from public index, RSS, and sitemap', async ({ request }) => {
    const [blogIndex, feed, sitemapIndex, draftRoute] = await Promise.all([
      request.get('/blog/'),
      request.get('/rss.xml'),
      request.get('/sitemap-index.xml'),
      request.get('/blog/template-draft/'),
    ]);

    expect(blogIndex.status()).toBe(200);
    expect(await blogIndex.text()).not.toContain('模板草稿：不会出现在公开列表');
    expect(feed.status()).toBe(200);
    expect(await feed.text()).not.toContain('template-draft');
    expect(sitemapIndex.status()).toBe(200);
    expect(await sitemapIndex.text()).not.toContain('template-draft');
    expect(draftRoute.status()).toBe(404);
  });

  test('main navigation reaches every information-architecture section', async ({ page }) => {
    const browserErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') browserErrors.push(message.text());
    });
    page.on('pageerror', (error) => browserErrors.push(error.message));

    await page.goto('/');
    const navigation = page.locator('nav[aria-label="主导航"]');
    await expect(navigation.locator('a')).toHaveCount(sections.length);

    const hrefs = await navigation.locator('a').evaluateAll((links) =>
      links.map((link) => link.getAttribute('href')),
    );
    for (const route of sections) {
      expect(hrefs).toContain(route);
    }

    expect(browserErrors).toEqual([]);
  });

  test('the video section stays out of sight while its switch is off', async ({ page, request }) => {
    test.skip(features.videos, '视频栏目已开启');
    expect((await request.get('/video/')).status()).toBe(404);
    expect(await (await request.get('/sitemap-0.xml')).text()).not.toContain('/video/');

    await page.goto('/');
    await expect(page.locator('nav[aria-label="主导航"] a[href="/video/"]')).toHaveCount(0);
    await expect(page.locator('[data-graph] .node[data-kind="item"]')).not.toHaveCount(0);
    await expect(page.locator('[data-graph] [data-legend="video"]')).toHaveCount(0);
  });

  test('every page shares a generated image that exists', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap-0.xml')).text();
    const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
    expect(paths.length).toBeGreaterThan(10);

    const checked = new Set<string>();
    for (const path of paths) {
      const html = await (await request.get(path)).text();
      const meta = (property: string) => html.match(new RegExp(`<meta (?:property|name)="${property}" content="([^"]*)"`))?.[1];
      // 详情页用自己的分享图，路径跟着页面走；其余页面用全站通用图。
      const detail = /^\/(blog|projects|docs)\/[^/]+\/$/.test(path);
      const image = new URL(meta('og:image') ?? '').pathname;
      expect(image, path).toBe(detail ? `/og${path.slice(0, -1)}.png` : '/og/site.png');
      expect(meta('og:type'), path).toBe(detail ? 'article' : 'website');
      expect(meta('twitter:card'), path).toBe('summary_large_image');
      if (checked.has(image)) continue;
      checked.add(image);

      const response = await request.get(image);
      expect(response.status(), image).toBe(200);
      expect(response.headers()['content-type'], image).toContain('image/png');
      const png = await response.body();
      expect([png.readUInt32BE(16), png.readUInt32BE(20)], image).toEqual([1200, 630]);
    }
  });

  test('posts declare their publish date and tags for sharing', async ({ request }) => {
    const html = await (await request.get('/blog/python-debugging/')).text();
    expect(html).toContain('<meta property="article:published_time" content="2026-08-26T00:00:00.000Z">');
    expect(html).toContain('<meta property="article:tag" content="Python">');
    expect(html).toContain('<meta property="og:image:alt" content="Python 调试技巧：从错误现象到根因修复">');
  });
});
