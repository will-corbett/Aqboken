import { expect, test } from '@playwright/test';
import { fresh } from './helpers.ts';

test.beforeEach(async ({ page }) => fresh(page));

test('search finds a word from one of its forms, and "/" opens it', async ({ page }) => {
  await page.goto('');
  await page.keyboard.press('/');
  await expect(page).toHaveURL(/search/);
  await page.getByRole('searchbox').fill('кітабымда');
  await expect(page.locator('.hits li').first()).toContainText('кітап');
});

test('grammar test: start, answer, finish, result', async ({ page }) => {
  await page.goto('test/?seed=3');
  await page.getByRole('button', { name: 'Start the test' }).click();
  await page.locator('.opt').first().click();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('Question 2 of 36')).toBeVisible();
  await page.getByRole('button', { name: 'Finish now' }).click();
  await expect(page.getByRole('heading', { name: 'Your result' })).toBeVisible();
  await expect(page.locator('.review li')).toHaveCount(36);
});

test('progress and my words: add a theme, review the due words', async ({ page }) => {
  await page.goto('progress/');
  await page.getByRole('button', { name: 'Turn on progress' }).click();
  await page.goto('vocabulary/body/');
  await page.getByRole('button', { name: 'Add all to my words' }).click();
  await page.goto('');
  await expect(page.getByText(/12 of your words are due/)).toBeVisible();
  await page.getByRole('button', { name: 'Review them' }).click();
  await expect(page.getByText('0 of 12 cleared')).toBeVisible();
});

test('reading: a word explains itself; the questions answer back', async ({ page }) => {
  await page.goto('reading/tulki-eshki/');
  await page.locator('.w', { hasText: /^апанға$/ }).first().click();
  await expect(page.locator('.box')).toContainText('pit');
  await page.locator('.q').first().locator('.opt').nth(1).click();
  await expect(page.locator('.why').first()).toContainText('Right');
});
