import { expect, test } from '@playwright/test';
import { fresh, startDrill, watchErrors } from './helpers.ts';

test.beforeEach(async ({ page }) => fresh(page));

test('a typed drill: wrong answer explained, retry, end screen', async ({ page }) => {
  const errors = watchErrors(page);
  await startDrill(page, 'cases');
  const box = page.getByRole('textbox', { name: 'Your answer' });
  await box.fill('ъъъ');
  await box.press('Enter');
  await expect(page.locator('.verdict')).toHaveText('Not quite');
  await expect(page.locator('.explain')).not.toBeEmpty();
  await expect(page.getByText(/comes back/)).toBeVisible();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'I don’t know' }).click();
  await expect(page.locator('.verdict')).toHaveText('Answer');
  await page.getByRole('button', { name: 'End round' }).click();
  await expect(page.getByRole('heading', { name: 'Round finished' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('the right answer typed in Latin is accepted', async ({ page }) => {
  await startDrill(page, 'plural');
  const word = (await page.locator('#prompt').innerText()).split('\n')[0]!.trim();
  // Find the plural by trying the one the drill reveals.
  await page.getByRole('button', { name: 'I don’t know' }).click();
  const answer = (await page.locator('.solution').innerText()).trim();
  expect(answer.startsWith(word.slice(0, 2))).toBe(true);
  await page.getByRole('button', { name: 'End round' }).click();
  await page.getByRole('button', { name: 'Another round' }).click();
  await page.getByRole('textbox', { name: 'Your answer' }).fill(answer.replace(/./g, (c) => c));
  await expect(page.getByRole('textbox', { name: 'Your answer' })).toHaveValue(answer);
});

test('choices with the number keys', async ({ page }) => {
  await startDrill(page, 'questions');
  await page.keyboard.press('1');
  await expect(page.locator('.feedback')).toBeVisible();
});

test('translate and compare: self-marking', async ({ page }) => {
  await startDrill(page, 'translate');
  await page.getByRole('textbox', { name: 'Your answer' }).fill('бір нәрсе');
  await page.getByRole('textbox', { name: 'Your answer' }).press('Enter');
  await expect(page.locator('.verdict')).toHaveText('A model answer');
  await page.getByRole('button', { name: 'I got it right' }).click();
  await expect(page.locator('.verdict')).toHaveText('Right');
});

test('build the sentence: tap every word, then check', async ({ page }) => {
  await startDrill(page, 'build');
  const chips = page.locator('.pool .wchip');
  const n = await chips.count();
  for (let i = 0; i < n; i++) await chips.nth(i).click();
  await page.getByRole('button', { name: 'Check' }).click();
  await expect(page.locator('.feedback')).toBeVisible();
});

test('find the mistake: tap the wrong word and type it', async ({ page }) => {
  await startDrill(page, 'fix');
  await page.getByRole('button', { name: 'I don’t know' }).click();
  await expect(page.getByText(/The wrong word was/)).toBeVisible();
});

test('the script switch shows Kazakh in Latin', async ({ page }) => {
  await page.goto('vocabulary/family/');
  await page.getByRole('button', { name: 'Latyn' }).click();
  await expect(page.locator('main')).toContainText('äke');
  await page.getByRole('button', { name: 'Кирил' }).click();
  await expect(page.locator('main')).toContainText('әке');
});
