import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { fresh, startDrill } from './helpers.ts';

const scan = async (page: Page, where: string) => {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(r.violations.map((v) => `${where} ${v.id}: ${v.nodes.map((n) => n.target).join(' ')}`)).toEqual([]);
};

for (const theme of ['aqboken', 'light', 'dark'] as const)
  test(`no accessibility violations (${theme} theme)`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await fresh(page, { theme });
    for (const p of ['', 'start/', 'learn/cases/', 'vocabulary/family/', 'reading/', 'culture/', 'paths/', 'settings/']) {
      await page.goto(p);
      await expect(page.locator('main h1').first()).toBeVisible();
      await scan(page, p || 'home');
    }
    await page.goto('reading/tulki-eshki/');
    await page.locator('.w').first().click();
    await scan(page, 'reading text');
    await page.goto('search/?q=book');
    await expect(page.locator('.hits li').first()).toBeVisible();
    await scan(page, 'search');
    await startDrill(page, 'cases');
    await scan(page, 'drill question');
    await page.getByRole('textbox', { name: 'Your answer' }).fill('ъъъ');
    await page.getByRole('textbox', { name: 'Your answer' }).press('Enter');
    await scan(page, 'drill feedback');
    await startDrill(page, 'translate');
    await page.getByRole('textbox', { name: 'Your answer' }).fill('бір');
    await page.getByRole('textbox', { name: 'Your answer' }).press('Enter');
    await scan(page, 'self-marking');
    await page.goto('test/?seed=1');
    await page.getByRole('button', { name: 'Start the test' }).click();
    await scan(page, 'grammar test');
  });
