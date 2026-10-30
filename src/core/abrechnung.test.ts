// The names of these tests are printed on the page as the test report (src/data/pruefung.json, written by
// `npm run pruefung` before every build). They are sentences a payroll clerk could check.
import { describe, expect, it } from 'vitest';

import { type Ergebnis, type Schicht, type Zeile, abrechnen, angesetztePause, berechneSchicht, stunden, vorgeschriebenePause, zeitraum } from './abrechnung';
import { instants } from './zeit';

const schicht = (datum: string, kommen: string, gehen: string, pause = '0', mehr: Partial<Schicht> = {}): Schicht => ({ datum, kommen, gehen, pause, ...mehr });

function zeile(e: Ergebnis): Zeile {
  if (!e.ok) throw new Error(`Eingabefehler: ${e.fehler.map((f) => f.text).join(' ')}`);
  return e.zeile;
}

const regeln = (z: Zeile, art: string): string[] => z.befunde.filter((b) => b.art === art).map((b) => b.regel);

describe('Zeitumstellung', () => {
  it('von 22 bis 6 Uhr sind es in der Nacht zum 25.10.2026 neun Stunden', () => {
    const z = zeile(berechneSchicht(schicht('24.10.2026', '22:00', '06:00', '45')));
    expect(z.dauer).toBe(9 * 60);
    expect(z.dauerWanduhr).toBe(8 * 60);
    expect(stunden(z.arbeit)).toBe('8,25');
  });

  it('von 22 bis 6 Uhr sind es in der Nacht zum 29.03.2026 sieben Stunden', () => {
    const z = zeile(berechneSchicht(schicht('28.03.2026', '22:00', '06:00', '30')));
    expect(z.dauer).toBe(7 * 60);
    expect(z.dauerWanduhr).toBe(8 * 60);
  });

  it('02:30 gibt es am 25.10.2026 zweimal, beim Nachtragen muss man eins auswählen', () => {
    expect(instants({ jahr: 2026, monat: 10, tag: 25, stunde: 2, minute: 30 })).toHaveLength(2);
    const erstes = zeile(berechneSchicht(schicht('25.10.2026', '02:30', '07:00')));
    const zweites = zeile(berechneSchicht(schicht('25.10.2026', '02:30', '07:00', '0', { kommenFaltung: 1 })));
    expect(erstes.dauer).toBe(5 * 60 + 30);
    expect(zweites.dauer).toBe(4 * 60 + 30);
    expect(erstes.mehrdeutig.kommen).toBe(true);
    expect(regeln(erstes, 'entscheidung')).toContain('Zeitumstellung');
  });

  it('02:30 gibt es am 29.03.2026 nicht', () => {
    const e = berechneSchicht(schicht('29.03.2026', '02:30', '08:00'));
    expect(e.ok).toBe(false);
    if (!e.ok) expect(e.fehler[0]?.text).toMatch(/gibt es am 29\.03\.2026 nicht/);
  });

  it('von 02:30 Sommerzeit bis 02:15 Winterzeit sind es 45 Minuten', () => {
    const z = zeile(berechneSchicht(schicht('25.10.2026', '02:30', '02:15')));
    expect(z.dauer).toBe(45);
  });

  it('in der langen Nacht liegen 8 Stunden zwischen 23 und 6 Uhr', () => {
    const z = zeile(berechneSchicht(schicht('24.10.2026', '22:00', '06:00', '45')));
    expect(z.nacht).toBe(8 * 60);
    expect(regeln(z, 'hinweis')).toContain('§ 2 Abs. 4 ArbZG');
  });

  it('der Sonntag 25.10.2026 hat von 0 bis 6 Uhr sieben Stunden', () => {
    const z = zeile(berechneSchicht(schicht('24.10.2026', '22:00', '06:00', '45')));
    expect(z.sonntag).toBe(7 * 60);
  });
});

describe('Pausen nach § 4', () => {
  it('Pflichtpause bis 6 Stunden keine, darüber 30 Minuten und über 9 Stunden 45', () => {
    expect(vorgeschriebenePause(360)).toBe(0);
    expect(vorgeschriebenePause(361)).toBe(30);
    expect(vorgeschriebenePause(540)).toBe(30);
    expect(vorgeschriebenePause(541)).toBe(45);
  });

  it('bei 6:20 ohne Pause werden 20 Minuten abgezogen, weil nach 30 gar keine Pause mehr nötig wäre', () => {
    const z = zeile(berechneSchicht(schicht('20.10.2026', '07:00', '13:20')));
    expect(z.pauseAngesetzt).toBe(20);
    expect(z.arbeit).toBe(360);
    expect(regeln(z, 'verstoss')).toContain('§ 4 S. 1 ArbZG');
    expect(regeln(z, 'entscheidung')).toContain('Pausenabzug');
  });

  it('bei 9:40 mit 30 Minuten Pause werden 10 Minuten abgezogen', () => {
    expect(angesetztePause(580, 30)).toBe(40);
  });

  it('für jede Schichtlänge bis 14 Stunden reicht der Abzug genau bis zur Pflichtpause', () => {
    for (let dauer = 1; dauer <= 14 * 60; dauer++) {
      for (let erfasst = 0; erfasst <= 60 && erfasst < dauer; erfasst++) {
        const p = angesetztePause(dauer, erfasst);
        expect(p).toBeGreaterThanOrEqual(vorgeschriebenePause(dauer - p));
        if (p > erfasst) expect(p - 1).toBeLessThan(vorgeschriebenePause(dauer - (p - 1)));
      }
    }
  });

  it('mehr als sechs Stunden ganz ohne erfasste Pause sind auch ein Verstoß gegen § 4 S. 3', () => {
    expect(regeln(zeile(berechneSchicht(schicht('20.10.2026', '07:00', '13:20'))), 'verstoss')).toContain('§ 4 S. 3 ArbZG');
    expect(regeln(zeile(berechneSchicht(schicht('20.10.2026', '07:00', '13:20', '10'))), 'verstoss')).not.toContain('§ 4 S. 3 ArbZG');
  });

  it('wer genug Pause erfasst hat, dem wird nichts abgezogen', () => {
    const z = zeile(berechneSchicht(schicht('19.10.2026', '06:00', '15:00', '45')));
    expect(z.pauseAngesetzt).toBe(45);
    expect(regeln(z, 'verstoss')).toEqual([]);
  });
});

describe('Höchstarbeitszeit nach § 3', () => {
  it('über 10 Stunden ist ein Verstoß, über 8 ein Hinweis', () => {
    const lang = zeile(berechneSchicht(schicht('21.10.2026', '05:30', '17:00', '30')));
    expect(lang.arbeit).toBe(10 * 60 + 45);
    expect(regeln(lang, 'verstoss')).toContain('§ 3 ArbZG');
    const mittel = zeile(berechneSchicht(schicht('21.10.2026', '06:00', '15:30', '45')));
    expect(regeln(mittel, 'hinweis')).toContain('§ 3 S. 2 ArbZG');
    expect(regeln(mittel, 'verstoss')).toEqual([]);
  });

  it('10:40 ohne erfasste Pause sind zu lang, auch wenn der Pausenabzug auf 9:55 käme', () => {
    const z = zeile(berechneSchicht(schicht('21.10.2026', '06:00', '16:40')));
    expect(z.arbeit).toBe(9 * 60 + 55);
    expect(regeln(z, 'verstoss')).toContain('§ 3 ArbZG');
  });
});

describe('Nachtarbeit nach § 2 Abs. 4', () => {
  const nachtarbeit = (z: Zeile): string => z.befunde.find((b) => b.regel === '§ 2 Abs. 4 ArbZG')?.text ?? '';

  it('sie steht fest, wenn auch ohne die ganze Pause mehr als zwei Stunden in der Nachtzeit bleiben', () => {
    expect(nachtarbeit(zeile(berechneSchicht(schicht('19.10.2026', '22:00', '06:00', '45'))))).toMatch(/Selbst wenn/);
  });

  it('bei 2:30 Stunden in der Nachtzeit und 30 Minuten Pause hängt sie davon ab, wann die Pause lag', () => {
    expect(nachtarbeit(zeile(berechneSchicht(schicht('19.10.2026', '22:00', '01:30', '30'))))).toMatch(/wann die Pause lag/);
  });
});

describe('Ruhezeit nach § 5', () => {
  it('über die Umstellung im Herbst sind es 11:30 Stunden Ruhe, obwohl die Uhrzeiten 10:30 ergeben', () => {
    const a = abrechnen([schicht('24.10.2026', '13:00', '22:00', '45'), schicht('25.10.2026', '08:30', '14:00', '0')]);
    const z = zeile(a.zeilen[1]!);
    expect(regeln(z, 'verstoss')).not.toContain('§ 5 Abs. 1 ArbZG');
    expect(regeln(z, 'hinweis')).toContain('§ 5 Abs. 1 ArbZG');
  });

  it('über die Umstellung im Frühjahr sind es nur 10:30 Stunden Ruhe, obwohl die Uhrzeiten 11:30 ergeben', () => {
    const a = abrechnen([schicht('28.03.2026', '12:00', '22:00', '45'), schicht('29.03.2026', '09:30', '15:00', '15')]);
    expect(regeln(zeile(a.zeilen[1]!), 'verstoss')).toContain('§ 5 Abs. 1 ArbZG');
  });

  it('Schichten, die sich überschneiden, sind ein Eingabefehler', () => {
    const a = abrechnen([schicht('19.10.2026', '06:00', '14:00', '30'), schicht('19.10.2026', '13:00', '18:00', '0')]);
    expect(a.zeilen[1]?.ok).toBe(false);
  });
});

describe('Summe', () => {
  it('dreimal 7:20 ergibt 22,00 Stunden, weil erst die Summe gerundet wird', () => {
    const a = abrechnen(['19', '20', '21'].map((t) => schicht(`${t}.10.2026`, '06:40', '14:30', '30')));
    expect(stunden(a.summe.arbeit)).toBe('22,00');
    expect(a.summe.zeilenGerundet).toBe(2199);
    expect(a.summe.befunde.map((b) => b.regel)).toContain('Rundung');
  });
});

describe('Kopf', () => {
  it('der Abrechnungszeitraum reicht vom ersten bis zum letzten Arbeitstag', () => {
    expect(zeitraum(abrechnen([schicht('24.10.2026', '22:00', '06:00', '45')]).zeilen)).toBe('24.10.–25.10.2026');
    expect(zeitraum(abrechnen([schicht('19.10.2026', '16:00', '00:00', '30')]).zeilen)).toBe('19.10.2026');
  });
});

describe('Eingabe', () => {
  it('der 31.02.2026 ist kein Datum', () => {
    const e = berechneSchicht(schicht('31.02.2026', '06:00', '14:00'));
    expect(e.ok).toBe(false);
  });

  it('24:00 wird abgelehnt, mit dem Hinweis auf 00:00', () => {
    const e = berechneSchicht(schicht('19.10.2026', '16:00', '24:00'));
    expect(e.ok).toBe(false);
    if (!e.ok) expect(e.fehler[0]?.text).toContain('00:00');
  });

  it('liegt Gehen vor Kommen, endet die Schicht am nächsten Tag', () => {
    const z = zeile(berechneSchicht(schicht('19.10.2026', '22:00', '05:00', '30')));
    expect(z.dauer).toBe(7 * 60);
  });

  it('eine Pause, so lang wie die Schicht, wird abgelehnt', () => {
    expect(berechneSchicht(schicht('19.10.2026', '06:00', '07:00', '60')).ok).toBe(false);
  });
});
