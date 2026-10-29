import AxeBuilder from '@axe-core/playwright';
import { type Page, expect, test } from '@playwright/test';

// WCAG 2.2 up to AAA plus best practices (PRODUCT.md, Accessibility).
const TAGS = ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

async function axe(page: Page): Promise<void> {
  const r = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

const zeile = (page: Page, nr: number) => page.locator('[data-zeile]').nth(nr - 1);
const wert = (page: Page, nr: number, name: string) => zeile(page, nr).locator(`[data-aus="${name}"]`);

test.use({ reducedMotion: 'reduce' });

test('kein Request verlässt die eigene Origin', async ({ page, baseURL }) => {
  const fremd: string[] = [];
  page.on('request', (r) => {
    if (new URL(r.url()).origin !== new URL(baseURL!).origin) fremd.push(r.url());
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.getByRole('radio', { name: 'Pause vergessen' }).check();
  expect(fremd).toEqual([]);
});

for (const pfad of ['/', '/datenschutz/', '/gibt-es-nicht/']) {
  test(`axe findet nichts auf ${pfad}`, async ({ page }) => {
    await page.goto(pfad);
    await axe(page);
  });
}

for (const pfad of ['/', '/datenschutz/']) {
  test(`axe findet nichts auf ${pfad} in der Nachtschicht`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(pfad);
    await axe(page);
  });
}

test('der Schalter wechselt in die Nachtschicht und zurück', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const papier = () => page.locator('.papier').evaluate((el) => getComputedStyle(el).backgroundColor);
  const hell = await papier();
  await page.getByRole('radio', { name: 'Nachtschicht' }).check();
  await expect(page.locator('html')).toHaveAttribute('data-ansicht', 'dunkel');
  expect(await papier()).not.toBe(hell);
  await axe(page);
  await page.getByRole('radio', { name: 'Automatisch' }).check();
  await expect(page.locator('html')).not.toHaveAttribute('data-ansicht', /.+/);
  expect(await papier()).toBe(hell);
});

test('axe findet nichts mit offener Herleitung, Verstoß und Eingabefehler', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('radio', { name: 'Pause vergessen' }).check();
  await zeile(page, 1).locator('[data-werte]').click();
  await page.getByRole('radio', { name: 'Zweimal 02:30' }).check();
  await zeile(page, 1).getByLabel(/^Gehen/).fill('25:00');
  await axe(page);
});

test('die längste Nacht steht im ersten Bildschirm: 9,00, nicht 8,00', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(wert(page, 1, 'dauer')).toHaveText('9,00');
  await expect(wert(page, 1, 'naiv-zahl')).toHaveText('8,00');
  await expect(wert(page, 1, 'dauer')).toBeInViewport();
  await expect(page.getByRole('link', { name: 'Schreibt mir' }).first()).toBeInViewport();
});

test('auf dem Handy steht die Zeile mit 9,00 im ersten Bildschirm', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(wert(page, 1, 'dauer')).toBeInViewport();
});

test('mit einer fehlerhaften Zeile druckt die Summe nichts Halbes', async ({ page }) => {
  await page.goto('/');
  await zeile(page, 1).getByLabel(/^Kommen/).fill('25:00');
  await expect(page.locator('[data-summe="arbeit"]')).toHaveText('–');
  await expect(page.locator('[data-summe="verstoesse"]')).toHaveText('–');
  await expect(page.locator('[data-summe="fehlt"]')).toContainText('Zeile 01');
  await expect(zeile(page, 1).locator('[data-werte]')).toBeDisabled();
  await expect(page.getByRole('radio', { name: 'Die längste Nacht' })).not.toBeChecked();
});

test('eine geänderte Uhrzeit wird neu gerechnet und angesagt', async ({ page }) => {
  await page.goto('/');
  await zeile(page, 1).getByLabel(/^Gehen/).fill('07:00');
  await expect(wert(page, 1, 'dauer')).toHaveText('10,00');
  await expect(page.locator('[data-ansage]')).toContainText('9,25 Stunden');
});

test('Pause vergessen: der Abzug stoppt bei 6,00', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('radio', { name: 'Pause vergessen' }).check();
  await expect(wert(page, 1, 'arbeit')).toHaveText('6,00');
  await expect(zeile(page, 1).locator('.befund--verstoss')).toContainText('Pause zu kurz');
  const knopf = zeile(page, 1).locator('[data-werte]');
  await knopf.click();
  await expect(knopf).toHaveAttribute('aria-expanded', 'true');
  await expect(zeile(page, 1).locator('[data-aus="herleitung"]')).toContainText('Abzug 20 min, bis 6:00 erreicht sind');
});

test('zweimal 02:30: MEZ gewählt, eine Stunde weniger', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('radio', { name: 'Zweimal 02:30' }).check();
  await expect(wert(page, 1, 'dauer')).toHaveText('5,50');
  await zeile(page, 1).getByLabel(/^Welches Kommen/).selectOption('1');
  await expect(wert(page, 1, 'dauer')).toHaveText('4,50');
});

test('ein Eingabefehler sagt, wie es richtig geht', async ({ page }) => {
  await page.goto('/');
  const kommen = zeile(page, 1).getByLabel(/^Kommen/);
  await kommen.fill('24:00');
  await expect(kommen).toHaveAttribute('aria-invalid', 'true');
  await expect(zeile(page, 1).locator('[data-aus="fehler"]')).toHaveText('24:00 gibt es nicht. Nimm 00:00.');
});

test('Zeile hinzufügen und stornieren, der Fokus bleibt auf dem Zettel', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Zeile hinzufügen' }).click();
  await expect(page.locator('[data-zeile]')).toHaveCount(2);
  await expect(zeile(page, 2).getByLabel(/^Datum/)).toBeFocused();
  await expect(zeile(page, 2).getByLabel(/^Datum/)).toHaveValue('25.10.2026');
  await zeile(page, 2).getByRole('button', { name: /Stornieren/ }).click();
  await expect(page.locator('[data-zeile]')).toHaveCount(1);
  await zeile(page, 1).getByRole('button', { name: /Stornieren/ }).click();
  await expect(page.locator('[data-leer]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Zeile hinzufügen' })).toBeFocused();
});

test('der Rundungshinweis steht unter der Summe, in ihrer Breite', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('radio', { name: 'Gerundet' }).check();
  const summe = await page.locator('.summe').boundingBox();
  const hinweis = await page.locator('.befunde--summe').boundingBox();
  expect(hinweis!.y).toBeGreaterThan(summe!.y + summe!.height - 1);
  expect(hinweis!.width).toBeGreaterThanOrEqual(summe!.width - 1);
});

for (const breite of [320, 390]) {
  test(`kein waagerechtes Scrollen bei ${breite} px`, async ({ page }) => {
    await page.setViewportSize({ width: breite, height: 800 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(breite);
  });
}
