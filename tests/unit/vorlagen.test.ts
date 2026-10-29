// The examples the page offers must load without an input error and must show what their name promises.
import { describe, expect, it } from 'vitest';

import { abrechnen } from '../../src/core/abrechnung';
import { VORLAGEN } from '../../src/data/vorlagen';

const vorlage = (id: string) => {
  const v = VORLAGEN.find((x) => x.id === id);
  if (!v) throw new Error(`no example ${id}`);
  return abrechnen(v.schichten);
};

const regeln = (id: string) => vorlage(id).zeilen.flatMap((e) => (e.ok ? e.zeile.befunde.map((b) => `${b.art}:${b.regel}`) : []));

describe('Beispiele auf der Seite', () => {
  it('jedes Beispiel lässt sich ohne Eingabefehler rechnen', () => {
    for (const v of VORLAGEN) expect(abrechnen(v.schichten).zeilen.every((e) => e.ok)).toBe(true);
  });

  it('bei „Pause vergessen“ erscheinen der Verstoß und der begrenzte Abzug', () => {
    expect(regeln('pause')).toEqual(expect.arrayContaining(['verstoss:§ 4 S. 1 ArbZG', 'entscheidung:Pausenabzug']));
  });

  it('bei „Ruhezeit im Frühjahr“ erscheint die zu kurze Ruhezeit', () => {
    expect(regeln('ruhe')).toContain('verstoss:§ 5 Abs. 1 ArbZG');
  });

  it('bei „Zweimal 02:30“ wird nachgefragt, welches gemeint ist', () => {
    expect(regeln('doppelt')).toContain('entscheidung:Zeitumstellung');
  });

  it('bei „Gerundet“ erscheint der Rundungsfehler der Summe', () => {
    expect(vorlage('rundung').summe.befunde.map((b) => b.regel)).toContain('Rundung');
  });

  it('bei „Zu lang“ erscheinen mehr als 10 Stunden als Verstoß', () => {
    expect(regeln('lang')).toContain('verstoss:§ 3 ArbZG');
  });
});
