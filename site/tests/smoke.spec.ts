import { expect, test } from '@playwright/test';

test.describe('Stage 1 Astro baseline', () => {
  test('homepage serves the generated baseline page', async ({ page }) => {
    const browserErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') browserErrors.push(message.text());
    });
    page.on('pageerror', (error) => browserErrors.push(error.message));

    const response = await page.goto('/');

    expect(response).not.toBeNull();
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle('Astro');
    await expect(page.locator('h1')).toHaveText('Astro');
    expect(browserErrors).toEqual([]);
  });

  test('unknown routes return a 404 response', async ({ request }) => {
    const response = await request.get('/stage-1-missing-route');

    expect(response.status()).toBe(404);
  });
});
