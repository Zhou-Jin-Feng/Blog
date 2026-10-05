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

    await page.locator('[data-palette-input]').fill('断点');
    const options = palette.locator('[role="option"]');
    await expect(options.first()).toContainText('Python 调试技巧');

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/blog\/python-debugging\/$/);
    await expect(page.locator('h1')).toHaveText('Python 调试技巧：从错误现象到根因修复');
    await expect(palette).toBeHidden();
  });

  test('search palette shows a loading state until Pagefind is ready', async ({ page }) => {
    // 人为拖慢 Pagefind 的下载，模拟首次搜索时的冷启动。
    await page.route('**/pagefind/pagefind.js', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await route.continue();
    });
    await page.goto('/');
    await page.keyboard.press('Control+k');
    await page.locator('[data-palette-input]').fill('断点');
    const loading = page.locator('[data-palette-loading]');
    await expect(loading).toBeVisible();
    await expect(page.locator('[data-palette] [role="option"]').first()).toContainText('Python 调试技巧');
    await expect(loading).toBeHidden();
  });

  test('search palette links cards on listing pages to their anchors', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Control+k');
    await page.locator('[data-palette-input]').fill('演示占位');
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

    expect(await urlsFor('断点')).toContain('/blog/python-debugging/');
    expect((await urlsFor('模板草稿')).some((url) => url.includes('template-draft'))).toBe(false);
  });

  test('code blocks get a copy button and follow the site theme', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce', colorScheme: 'light' });
    const page = await context.newPage();
    await page.goto('/blog/python-debugging/');
    const blocks = page.locator('.prose .expressive-code');
    expect(await blocks.count()).toBeGreaterThan(0);
    await expect(blocks.first().locator('.copy button')).toHaveCount(1);

    const background = () => blocks.first().locator('pre').evaluate((pre) => getComputedStyle(pre).backgroundColor);
    const light = await background();
    await page.locator('[data-theme-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect.poll(background).not.toBe(light);
    await context.close();
  });

  test('blog tag filter narrows the list and syncs the URL', async ({ page }) => {
    await page.goto('/blog/?tag=Docker');
    const rows = page.locator('[data-filter-list] > .post-row');
    await expect(rows.filter({ visible: true })).toHaveCount(1);

    await page.locator('[data-filter] [data-tag=""]').click();
    await expect(rows.filter({ visible: true })).toHaveCount(6);
    await expect(page).toHaveURL(/\/blog\/$/);

    await page.locator('[data-filter] [data-tag="Python"]').click();
    await expect(rows.filter({ visible: true })).toHaveCount(2);
    await expect(page).toHaveURL(/tag=Python/);
  });

  test('long notes list only second-level headings and credit AI assistance', async ({ page }) => {
    await page.goto('/blog/langchain-langgraph-langsmith/');
    const toc = page.locator('[data-toc]');
    await expect(toc.locator('.toc-depth-3')).toHaveCount(0);
    await expect(toc.locator('a')).toHaveCount(await page.locator('.prose h2').count());
    await expect(page.locator('.prose .ai-note')).toHaveText('本文由作者整理，AI 辅助润色。');
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

  test('graph labels never cover each other or other nodes', async ({ browser, isMobile }) => {
    test.skip(isMobile, '窄屏是紧凑模式，技术栈标签的文字不显示');
    // 1060px 宽时星图刚好不进紧凑模式，标签字号最大，最容易重叠。
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    for (const width of [1060, 1280, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      // 等 ResizeObserver 按当前宽度更新完标签字号再量。
      await page.waitForFunction(() => {
        const figure = document.querySelector<HTMLElement>('[data-graph]')!;
        const svg = figure.querySelector('svg')!;
        const expected = 1 / Math.pow(svg.clientWidth / svg.viewBox.baseVal.width, 0.75);
        return !figure.classList.contains('is-compact') && Math.abs(parseFloat(figure.style.getPropertyValue('--lk')) - expected) < 1e-3;
      });
      const collisions = await page.locator('[data-graph]').evaluate((figure) => {
        const shapes = [...figure.querySelectorAll('.node')].flatMap((node, owner) => {
          const text = node.querySelector('text');
          return [
            { owner, name: `dot ${owner}`, isText: false, box: node.querySelector('.dot')!.getBoundingClientRect() },
            ...(text ? [{ owner, name: text.textContent!, isText: true, box: text.getBoundingClientRect() }] : []),
          ];
        });
        const found: string[] = [];
        shapes.forEach((a, i) => shapes.slice(i + 1).forEach((b) => {
          if (a.owner === b.owner || (!a.isText && !b.isText)) return;
          const x = Math.min(a.box.right, b.box.right) - Math.max(a.box.left, b.box.left);
          const y = Math.min(a.box.bottom, b.box.bottom) - Math.max(a.box.top, b.box.top);
          if (x > 0.5 && y > 0.5) found.push(`${a.name} × ${b.name}`);
        }));
        return found;
      });
      expect(collisions, `${width}px`).toEqual([]);
    }
    await context.close();
  });
});
