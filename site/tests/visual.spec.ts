import { expect, test } from '@playwright/test';
import { features } from '../src/data/site';

const baseURL = 'http://127.0.0.1:4321';
const routes = ['/', '/blog/', '/projects/', '/docs/', ...(features.videos ? ['/video/'] : []), '/downloads/', '/resume/', '/timeline/', '/about/'];
const viewports = [
  { width: 360, height: 800 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

test.describe('Stage 3 responsive and accessibility baseline', () => {
  test('information architecture remains readable at the three baseline viewports', async ({ browser }) => {
    const context = await browser.newContext();

    for (const viewport of viewports) {
      for (const route of routes) {
        const page = await context.newPage();
        await page.setViewportSize(viewport);
        await page.goto(`${baseURL}${route}`);

        const dimensions = await page.evaluate(() => ({
          innerWidth: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
        }));
        expect(dimensions.scrollWidth, `${route} at ${viewport.width}px`).toBeLessThanOrEqual(dimensions.innerWidth);
        await expect(page.locator('h1'), `${route} at ${viewport.width}px should have one H1`).toHaveCount(1);
        await expect(page.locator('a.skip-link'), `${route} should expose a skip link`).toHaveCount(1);
        await expect(page.locator('nav[aria-label="主导航"] a[aria-current="page"]'), `${route} should mark the active navigation item`).toHaveCount(1);
        const headingLevels = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));
        expect(headingLevels[0], `${route} should start with H1`).toBe(1);
        for (let index = 1; index < headingLevels.length; index += 1) {
          expect(headingLevels[index] - headingLevels[index - 1], `${route} heading level at index ${index}`).toBeLessThanOrEqual(1);
        }
        await page.locator('a.skip-link').focus();
        await expect(page.locator('a.skip-link')).toBeFocused();
        await page.close();
      }
    }

    await context.close();
  });

  test('reduced-motion preference disables visual transitions', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(`${baseURL}/`);

    const transitionDuration = await page.locator('.card').first().evaluate((element) => getComputedStyle(element).transitionDuration);
    expect(Number.parseFloat(transitionDuration)).toBeLessThanOrEqual(0.001);
    await context.close();
  });
});
