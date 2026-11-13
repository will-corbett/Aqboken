import { expect, test } from '@playwright/test';
import { fresh, noHorizontalScroll, watchErrors } from './helpers.ts';

const PAGES = [
  '', 'start/', 'paths/', 'learn/', 'learn/alphabet/', 'learn/cases/', 'learn/present/', 'learn/time/', 'learn/posscases/',
  'drill/', 'drill/cases/', 'drill/vocab/', 'drill/mixed/', 'drill/translate/', 'vocabulary/', 'vocabulary/family/',
  'vocabulary/feelings/', 'reading/', 'reading/tulki-eshki/', 'writing/', 'test/', 'culture/', 'search/?q=кітап', 'progress/',
  'settings/', 'about/',
];

for (const path of PAGES)
  test(`/${path} opens cleanly`, async ({ page }) => {
    const errors = watchErrors(page);
    await fresh(page);
    await page.goto(path);
    await expect(page.locator('main h1').first()).toBeVisible();
    await page.waitForLoadState('networkidle');
    await noHorizontalScroll(page);
    expect(errors).toEqual([]);
  });

test('an unknown address shows the app, not a blank page', async ({ page }) => {
  await page.goto('learn/no-such-topic/');
  await expect(page.getByText('There is no Learn page called')).toBeVisible();
});

test('each page has its own title and canonical address', async ({ page }) => {
  await page.goto('learn/cases/');
  await expect(page).toHaveTitle(/The seven cases/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://will-corbett.github.io/Aqboken/learn/cases/');
});
