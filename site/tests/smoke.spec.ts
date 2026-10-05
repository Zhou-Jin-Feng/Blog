import { expect, test } from '@playwright/test';

const p0Routes = [
  '/',
  '/blog/',
  '/projects/',
  '/docs/',
  '/video/',
  '/downloads/',
  '/resume/',
  '/timeline/',
  '/about/',
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
    await expect(navigation.locator('a')).toHaveCount(9);

    const hrefs = await navigation.locator('a').evaluateAll((links) =>
      links.map((link) => link.getAttribute('href')),
    );
    for (const route of ['/', '/blog/', '/projects/', '/docs/', '/video/', '/downloads/', '/resume/', '/timeline/', '/about/']) {
      expect(hrefs).toContain(route);
    }

    expect(browserErrors).toEqual([]);
  });
});
