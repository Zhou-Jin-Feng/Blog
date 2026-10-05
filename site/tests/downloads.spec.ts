import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

/** 打开列表页里的第一篇，核对详情页的“下载 Markdown”和它下载到的内容。 */
async function checkFirstEntry(page: Page, request: APIRequestContext, listUrl: string) {
  await page.goto(listUrl);
  await page.goto((await page.locator('.post-list .post-title a').first().getAttribute('href'))!);
  const title = (await page.locator('h1').textContent())!.trim();
  const link = page.locator('.detail-actions a[download]');
  await expect(link).toHaveAttribute('href', /\.md$/);
  await expect(link).toHaveAttribute('download', /\.md$/);

  const response = await request.get((await link.getAttribute('href'))!);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('text/markdown');
  const markdown = await response.text();
  expect(markdown.startsWith(`# ${title}\n`)).toBe(true);
  expect(markdown).toContain(`原文：`);
}

test.describe('Markdown downloads and printing', () => {
  test('posts and docs offer their Markdown source', async ({ page, request }) => {
    await checkFirstEntry(page, request, '/blog/');
    await checkFirstEntry(page, request, '/docs/');
  });

  test('downloads page lists every post and doc', async ({ page, request }) => {
    await page.goto('/blog/');
    const posts = await page.locator('[data-filter-list] > .post-row').count();
    await page.goto('/docs/');
    const docs = await page.locator('.post-list > .post-row').count();

    await page.goto('/downloads/');
    const links = page.locator('.download-row a[download]');
    await expect(links).toHaveCount(posts + docs);
    for (const href of await links.evaluateAll((items) => items.map((item) => item.getAttribute('href')!))) {
      expect((await request.get(href)).status(), href).toBe(200);
    }
  });

  test('print button prints with the light theme', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'dark' });
    const page = await context.newPage();
    await page.goto('/blog/');
    await page.goto((await page.locator('.post-list .post-title a').first().getAttribute('href'))!);
    const root = page.locator('html');
    await expect(root).toHaveAttribute('data-theme', 'dark');

    await page.evaluate(() => {
      window.print = () => document.documentElement.setAttribute('data-printed', 'true');
    });
    await page.locator('[data-print]').click();
    await expect(root).toHaveAttribute('data-printed', 'true');

    // 深色主题的浅色文字印到白纸上看不清，打印期间要切到浅色，打印完再恢复。
    await page.evaluate(() => dispatchEvent(new Event('beforeprint')));
    await expect(root).toHaveAttribute('data-theme', 'light');
    await page.evaluate(() => dispatchEvent(new Event('afterprint')));
    await expect(root).toHaveAttribute('data-theme', 'dark');
    await context.close();
  });
});
