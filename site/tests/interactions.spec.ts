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

  test('search index never exposes drafts', async ({ request }) => {
    const response = await request.get('/search.json');
    expect(response.status()).toBe(200);
    expect(await response.text()).not.toContain('template-draft');
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
});
