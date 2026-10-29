// Every pair of ink and paper the page prints, against WCAG 2.2 AAA (7:1 for text, 1.4.6), in the day and the night
// shift. The colours are read from the light-dark() pairs in src/styles/seite.css, so a changed token is checked.
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../../src/styles/seite.css', import.meta.url), 'utf8');

type Schicht = 'Tagschicht' | 'Nachtschicht';

function farbe(name: string, schicht: Schicht): string {
  const m = new RegExp(`--${name}:\\s*light-dark\\((#[0-9a-f]{6}),\\s*(#[0-9a-f]{6})\\)`, 'i').exec(css);
  const wert = schicht === 'Tagschicht' ? m?.[1] : m?.[2];
  if (!wert) throw new Error(`--${name} has no light-dark() pair in seite.css`);
  return wert;
}

function leuchtdichte(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function kontrast(a: string, b: string, schicht: Schicht): number {
  const [hell, dunkel] = [leuchtdichte(farbe(a, schicht)), leuchtdichte(farbe(b, schicht))].sort((x, y) => y - x) as [number, number];
  return (hell + 0.05) / (dunkel + 0.05);
}

describe.each(['Tagschicht', 'Nachtschicht'] as const)('Kontrast nach WCAG 2.2 AAA, %s', (schicht) => {
  it.each([
    ['Schwarz auf Papier', 'farbband', 'papier'],
    ['Formulargrün auf Papier', 'vordruck', 'papier'],
    ['Rot auf Papier', 'rot', 'papier'],
    ['Schwarz auf dem grünen Streifen', 'farbband', 'gruenband'],
    ['Rot auf dem grünen Streifen', 'rot', 'gruenband'],
    ['Formulargrün auf dem grünen Streifen', 'vordruck', 'gruenband'],
    ['Eingabe auf hellgrünem Feld', 'farbband', 'vordruck-flaeche'],
    ['Weiß auf dem grünen Knopf', 'papier', 'vordruck'],
  ])('%s hat mindestens 7:1', (_name, vorne, hinten) => {
    expect(kontrast(vorne, hinten, schicht)).toBeGreaterThanOrEqual(7);
  });
});
