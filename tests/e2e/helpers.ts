import { expect, type Page } from '@playwright/test';

/** Collects console errors and failed requests (except audio, which may not be built locally). */
export function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' && !/audio\/|Failed to load resource/.test(m.text())) errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

/** Fresh settings, the beta note and the guide card dismissed, so pages look as for a returning visitor. */
export async function fresh(page: Page, settings: Record<string, unknown> = {}) {
  await page.addInitScript((s) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.clear();
      localStorage.setItem('aqboken.settings.v1', JSON.stringify({ betaNoteHidden: true, guideSeen: true, ...s }));
      sessionStorage.setItem('seeded', '1');
    }
  }, settings);
}

/** Open a drill's settings and start a round. */
export async function startDrill(page: Page, mode: string) {
  await page.goto(`drill/${mode}/?seed=7`);
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.locator('.drill')).toBeVisible();
}

export async function noHorizontalScroll(page: Page) {
  const [scroll, width] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  expect(scroll, 'page scrolls sideways').toBeLessThanOrEqual(width);
}
