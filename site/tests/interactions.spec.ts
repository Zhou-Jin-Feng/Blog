import { expect, test, type Page } from '@playwright/test';

async function openNavIfCollapsed(page: Page) {
  const toggle = page.locator('[data-nav-toggle]');
  if (await toggle.isVisible()) await toggle.click();
}

test.describe('Interactive enhancements', () => {
  test('client-side navigation swaps pages and moves the active nav item', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto('/');
    await openNavIfCollapsed(page);
    await page.locator('nav[aria-label="主导航"] a[href="/projects/"]').click();
    await expect(page).toHaveURL(/\/projects\/$/);
    await expect(page.locator('h1')).toHaveText('项目');
    await expect(page.locator('nav[aria-label="主导航"] a[aria-current="page"]')).toHaveAttribute('href', '/projects/');
    expect(errors).toEqual([]);
  });

  test('theme toggle persists across reloads and navigation', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const root = page.locator('html');
    await expect(root).toHaveAttribute('data-theme', 'light');

    await page.locator('[data-theme-toggle]').click();
    await expect(root).toHaveAttribute('data-theme', 'dark');

    await page.reload();
    await expect(root).toHaveAttribute('data-theme', 'dark');

    await openNavIfCollapsed(page);
    await page.locator('nav[aria-label="主导航"] a[href="/blog/"]').click();
    await expect(page).toHaveURL(/\/blog\/$/);
    await expect(root).toHaveAttribute('data-theme', 'dark');
  });

  test('search palette finds content and opens it with the keyboard', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Control+k');
    const palette = page.locator('[data-palette]');
    await expect(palette).toBeVisible();

    await page.locator('[data-palette-input]').fill('发布前');
    const options = palette.locator('[role="option"]');
    await expect(options.first()).toContainText('一次发布前检查清单');

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/blog\/template-release\/$/);
    await expect(page.locator('h1')).toHaveText('模板文章：一次发布前检查清单');
    await expect(palette).toBeHidden();
  });

  test('search palette links cards on listing pages to their anchors', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Control+k');
    await page.locator('[data-palette-input]').fill('演示');
    const option = page.locator('[data-palette] [role="option"] a[href="/video/#video-template-demo"]');
    await expect(option).toContainText('模板视频：项目演示占位');
    await expect(option.locator('.option-type')).toHaveText('视频');
  });

  test('search index covers published posts but never drafts', async ({ page }) => {
    await page.goto('/');
    const urlsFor = (term: string) =>
      page.evaluate(async (query) => {
        // 用变量传路径，避免类型检查去解析构建产物里的模块。
        const url = '/pagefind/pagefind.js';
        const pagefind = await import(url);
        const search = await pagefind.search(query);
        const data: { url: string }[] = await Promise.all(search.results.map((result: { data: () => Promise<{ url: string }> }) => result.data()));
        return data.map((item) => item.url);
      }, term);

    expect(await urlsFor('发布前')).toContain('/blog/template-release/');
    expect((await urlsFor('模板草稿')).some((url) => url.includes('template-draft'))).toBe(false);
  });

  test('code blocks get a copy button, a title and follow the site theme', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce', colorScheme: 'light' });
    const page = await context.newPage();
    await page.goto('/blog/template-architecture/');
    const blocks = page.locator('.prose .expressive-code');
    await expect(blocks).toHaveCount(2);
    await expect(blocks.first().locator('figcaption')).toContainText('src/lib/content.ts');
    await expect(blocks.first().locator('.copy button')).toHaveCount(1);

    const background = () => blocks.first().locator('pre').evaluate((pre) => getComputedStyle(pre).backgroundColor);
    const light = await background();
    await page.locator('[data-theme-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect.poll(background).not.toBe(light);
    await context.close();
  });

  test('blog tag filter narrows the list and syncs the URL', async ({ page }) => {
    await page.goto('/blog/?tag=%E5%A4%8D%E7%9B%98');
    const rows = page.locator('[data-filter-list] > .post-row');
    await expect(rows.filter({ visible: true })).toHaveCount(1);

    await page.locator('[data-filter] [data-tag=""]').click();
    await expect(rows.filter({ visible: true })).toHaveCount(3);
    await expect(page).toHaveURL(/\/blog\/$/);

    await page.locator('[data-filter] [data-tag="发布"]').click();
    await expect(rows.filter({ visible: true })).toHaveCount(1);
    await expect(page).toHaveURL(/tag=/);
  });

  test('content graph renders real content and highlights a legend group', async ({ page }) => {
    await page.goto('/');
    const graph = page.locator('[data-graph]');
    await expect(graph.locator('.node[data-kind="item"]')).not.toHaveCount(0);
    const legend = graph.locator('[data-legend="post"]');
    await legend.click();
    await expect(legend).toHaveAttribute('aria-pressed', 'true');
    await expect(graph.locator('svg')).toHaveClass(/has-focus/);
  });

  test('graph labels move as smooth sprites and re-render after a theme change', async ({ browser }) => {
    // 减少动态效果时主题是同步切换的，最容易读到旧颜色，所以专门覆盖这种情况。
    const context = await browser.newContext({ reducedMotion: 'reduce', colorScheme: 'light' });
    const page = await context.newPage();
    await page.goto('/');
    const graph = page.locator('[data-graph]');
    await expect(graph).toHaveClass(/use-sprites/);
    const missing = await graph.locator('.node').evaluateAll((nodes) =>
      nodes.filter((node) => {
        const text = node.querySelector('text');
        return text && getComputedStyle(text).display !== 'none' && !node.querySelector('.label-sprite')?.getAttribute('href');
      }).length,
    );
    expect(missing).toBe(0);

    const hubSprite = graph.locator('.node[data-kind="hub"] .label-sprite').first();
    const before = await hubSprite.getAttribute('href');
    await page.locator('[data-theme-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect.poll(() => hubSprite.getAttribute('href')).not.toBe(before);
    await expect(graph).toHaveClass(/use-sprites/);
    await context.close();
  });
});
