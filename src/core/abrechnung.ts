// The time statement: shifts as typed on a timesheet in, minutes worked and the rules that fire out. Framework-free
// and DOM-free; the page and the tests call the same function. What it checks is the Arbeitszeitgesetz as far as a
// single timesheet can tell; what it cannot tell is listed in NICHT_ABGEBILDET and printed on the page.

import { type Datum, type Wanduhr, MINUTE, alsUtc, folgetag, instants, versatz, wanduhr, wochentag } from './zeit';

/** Which of two equal wall times in the autumn overlap: 0 the first (summer time), 1 the second (winter time). */
export type Faltung = 0 | 1;

export interface Schicht {
  /** TT.MM.JJJJ */
  datum: string;
  /** HH:MM */
  kommen: string;
  /** HH:MM; not later than kommen on the wall clock means the next day */
  gehen: string;
  /** recorded break in minutes, or H:MM */
  pause: string;
  kommenFaltung?: Faltung;
  gehenFaltung?: Faltung;
}

export type Feld = 'datum' | 'kommen' | 'gehen' | 'pause';

export interface Eingabefehler {
  feld: Feld;
  text: string;
}

/** verstoss: a rule is broken · entscheidung: the law leaves it open and the engine picked, saying so · hinweis: worth knowing */
export type Art = 'verstoss' | 'entscheidung' | 'hinweis';

export interface Befund {
  art: Art;
  regel: string;
  text: string;
}

export interface Zeile {
  beginn: number;
  ende: number;
  /** real minutes between coming and going */
  dauer: number;
  /** what subtracting the two wall-clock times gives */
  dauerWanduhr: number;
  pauseErfasst: number;
  pauseVorgeschrieben: number;
  pauseAngesetzt: number;
  arbeit: number;
  /** minutes present between 23 and 6 o'clock (§ 2 Abs. 3) */
  nacht: number;
  /** minutes present on a Sunday (§ 9) */
  sonntag: number;
  mehrdeutig: { kommen: boolean; gehen: boolean };
  befunde: Befund[];
  herleitung: string[];
}

export type Ergebnis = { ok: true; zeile: Zeile } | { ok: false; fehler: Eingabefehler[] };

export interface Summe {
  arbeit: number;
  nacht: number;
  sonntag: number;
  /** the lines rounded to hundredths of an hour first and added up after: the classic payroll error */
  zeilenGerundet: number;
  befunde: Befund[];
}

export interface Abrechnung {
  zeilen: Ergebnis[];
  summe: Summe;
}

export const NICHT_ABGEBILDET: readonly string[] = [
  'Lohn und tarifliche Zuschläge, etwa nach BRTV Bau. Die Abrechnung zeigt nur Stunden.',
  'Gesetzliche Feiertage nach Bundesland. Der 31.10. ist zum Beispiel in Hamburg einer.',
  'Wann die Pause gemacht wurde. Deshalb wird auch nicht geprüft, ob jemand mehr als sechs Stunden am Stück gearbeitet hat (§ 4 S. 3).',
  'Der Ausgleich über sechs Monate oder einen Monat (§ 3 S. 2, § 6 Abs. 2). Jede Schicht wird für sich geprüft.',
  'Geteilte Dienste. Jede Zeile zählt als eigener Arbeitstag.',
  'Abweichungen, die ein Tarifvertrag oder die Aufsichtsbehörde erlaubt (§§ 7, 12, 15), und die eigenen Regeln für Jugendliche und Schwangere.',
];

const STUNDE = 60 * MINUTE;
const ELF_STUNDEN = 11 * 60;

// ---------------------------------------------------------------------------------------------------------------
// Reading what was typed

export function liesDatum(text: string): Datum | null {
  const m = /^\s*(\d{1,2})\.(\d{1,2})\.(\d{4})\s*$/.exec(text);
  if (!m) return null;
  const d = { jahr: Number(m[3]), monat: Number(m[2]), tag: Number(m[1]) };
  const probe = new Date(Date.UTC(d.jahr, d.monat - 1, d.tag));
  return probe.getUTCMonth() === d.monat - 1 && probe.getUTCDate() === d.tag ? d : null;
}

export function liesUhrzeit(text: string): { stunde: number; minute: number } | null {
  const m = /^\s*(\d{1,2}):(\d{2})\s*$/.exec(text);
  if (!m) return null;
  const stunde = Number(m[1]);
  const minute = Number(m[2]);
  return stunde < 24 && minute < 60 ? { stunde, minute } : null;
}

export function liesPause(text: string): number | null {
  const t = text.trim();
  if (t === '') return 0;
  if (/^\d{1,3}$/.test(t)) return Number(t);
  const hm = liesUhrzeit(t);
  return hm ? hm.stunde * 60 + hm.minute : null;
}

// ---------------------------------------------------------------------------------------------------------------
// Printing

const zwei = (n: number): string => String(n).padStart(2, '0');

/** 495 → "8:15" */
export function hm(minuten: number): string {
  return `${Math.floor(minuten / 60)}:${zwei(minuten % 60)}`;
}

/** minutes → hundredths of an hour, rounded half up, as payroll prints them */
export function hundertstel(minuten: number): number {
  return Math.round((minuten * 100) / 60);
}

/** hundredths → "8,25" */
export function dezimal(h: number): string {
  return `${Math.floor(h / 100)},${zwei(h % 100)}`;
}

/** 495 → "8,25" */
export function stunden(minuten: number): string {
  return dezimal(hundertstel(minuten));
}

export function datumText(d: Datum): string {
  return `${zwei(d.tag)}.${zwei(d.monat)}.${d.jahr}`;
}

const uhrText = (u: { stunde: number; minute: number }): string => `${zwei(u.stunde)}:${zwei(u.minute)}`;

/** The zone's own name for its offset: MEZ or MESZ */
export function zonenname(instant: number): string {
  return versatz(instant) === 120 ? 'MESZ' : 'MEZ';
}

function utcText(instant: number): string {
  const d = new Date(instant);
  return `${zwei(d.getUTCHours())}:${zwei(d.getUTCMinutes())} UTC`;
}

// ---------------------------------------------------------------------------------------------------------------
// The rules

/** § 4 S. 1 ArbZG: more than six up to nine hours of work, 30 minutes; more than nine, 45. */
export function vorgeschriebenePause(arbeit: number): number {
  return arbeit > 9 * 60 ? 45 : arbeit > 6 * 60 ? 30 : 0;
}

/**
 * The break to deduct when too little was recorded: the smallest break at or above the recorded one that the
 * resulting working time no longer outgrows. Deducting the full shortfall can push the time below the threshold that
 * required it (6:20 minus 30 is 5:50, which needs no break at all), so the deduction stops at the threshold.
 */
export function angesetztePause(dauer: number, erfasst: number): number {
  let pause = erfasst;
  while (pause < vorgeschriebenePause(dauer - pause)) pause++;
  return pause;
}

/** Minutes of [beginn, ende) whose wall clock passes the test. Berlin's offsets are whole hours, so the wall hour can
 * only change on a full UTC hour; walking hour by hour is exact. */
function minutenIn(beginn: number, ende: number, passt: (w: Wanduhr) => boolean): number {
  let summe = 0;
  for (let t = beginn; t < ende; ) {
    const weiter = Math.min(ende, (Math.floor(t / STUNDE) + 1) * STUNDE);
    if (passt(wanduhr(t))) summe += (weiter - t) / MINUTE;
    t = weiter;
  }
  return summe;
}

const istNacht = (w: Wanduhr): boolean => w.stunde >= 23 || w.stunde < 6;
const istSonntag = (w: Wanduhr): boolean => wochentag(w) === 0;

function faltungText(f: Faltung): string {
  return f === 0 ? 'ersten, noch in Sommerzeit' : 'zweiten, schon in Winterzeit';
}

// ---------------------------------------------------------------------------------------------------------------
// One line

export function berechneSchicht(s: Schicht): Ergebnis {
  const fehler: Eingabefehler[] = [];
  const datum = liesDatum(s.datum);
  const kommen = liesUhrzeit(s.kommen);
  const gehen = liesUhrzeit(s.gehen);
  const pause = liesPause(s.pause);
  if (!datum) fehler.push({ feld: 'datum', text: 'Datum als TT.MM.JJJJ, etwa 24.10.2026.' });
  if (!kommen) fehler.push({ feld: 'kommen', text: s.kommen.trim() === '24:00' ? '24:00 gibt es nicht. Nimm 00:00.' : 'Uhrzeit als HH:MM, etwa 22:00.' });
  if (!gehen) fehler.push({ feld: 'gehen', text: s.gehen.trim() === '24:00' ? '24:00 gibt es nicht. Nimm 00:00.' : 'Uhrzeit als HH:MM, etwa 06:00.' });
  if (pause === null) fehler.push({ feld: 'pause', text: 'Pause in Minuten, etwa 45.' });
  if (!datum || !kommen || !gehen || pause === null) return { ok: false, fehler };

  const befunde: Befund[] = [];
  const herleitung: string[] = [];

  // Coming: the date and time as typed, which in the autumn overlap names two instants.
  const kommenInstants = instants({ ...datum, ...kommen });
  if (kommenInstants.length === 0) {
    return { ok: false, fehler: [{ feld: 'kommen', text: `${uhrText(kommen)} gibt es am ${datumText(datum)} nicht, die Uhr springt dort von 2 auf 3 Uhr.` }] };
  }
  const kommenFaltung = s.kommenFaltung ?? 0;
  const beginn = kommenInstants.length === 2 ? kommenInstants[kommenFaltung]! : kommenInstants[0]!;

  // Going: the first matching instant after coming, the same day or the next.
  let ende: number | undefined;
  let gehenDatum = datum;
  let gehenMehrdeutig = false;
  const gehenFaltung = s.gehenFaltung ?? 0;
  for (const tag of [datum, folgetag(datum)]) {
    const alle = instants({ ...tag, ...gehen });
    const danach = alle.filter((i) => i > beginn);
    if (alle.length === 0 && (tag !== datum || gehen.stunde * 60 + gehen.minute > kommen.stunde * 60 + kommen.minute)) {
      return { ok: false, fehler: [{ feld: 'gehen', text: `${uhrText(gehen)} gibt es am ${datumText(tag)} nicht, die Uhr springt dort von 2 auf 3 Uhr.` }] };
    }
    if (danach.length > 0) {
      gehenMehrdeutig = danach.length === 2;
      ende = gehenMehrdeutig ? danach[gehenFaltung]! : danach[0]!;
      gehenDatum = tag;
      break;
    }
  }
  if (ende === undefined || ende - beginn >= 24 * STUNDE) {
    return { ok: false, fehler: [{ feld: 'gehen', text: 'Kommen und Gehen sind gleich. Eine Schicht über 24 Stunden bitte auf zwei Zeilen verteilen.' }] };
  }

  const dauer = (ende - beginn) / MINUTE;
  const dauerWanduhr = (alsUtc(wanduhr(ende)) - alsUtc(wanduhr(beginn))) / MINUTE;
  if (pause >= dauer) return { ok: false, fehler: [{ feld: 'pause', text: `Die Pause ist so lang wie die Schicht (${hm(dauer)}) oder länger.` }] };

  herleitung.push(`Kommen ${datumText(datum)} ${uhrText(kommen)} ${zonenname(beginn)} = ${utcText(beginn)}`);
  herleitung.push(`Gehen ${datumText(gehenDatum)} ${uhrText(gehen)} ${zonenname(ende)} = ${utcText(ende)}`);
  herleitung.push(`Dauer ${hm(dauer)}` + (dauer !== dauerWanduhr ? `, nach den Uhrzeiten ${hm(dauerWanduhr)}` : ''));

  if (kommenInstants.length === 2) {
    befunde.push({
      art: 'entscheidung',
      regel: 'Zeitumstellung',
      text: `${uhrText(kommen)} gibt es am ${datumText(datum)} zweimal. Gerechnet wird mit dem ${faltungText(kommenFaltung)}. Wurde die Zeit nachgetragen, sollte jemand nachfragen, welches gemeint war.`,
    });
  }
  if (gehenMehrdeutig) {
    befunde.push({
      art: 'entscheidung',
      regel: 'Zeitumstellung',
      text: `${uhrText(gehen)} gibt es am ${datumText(gehenDatum)} zweimal. Gerechnet wird mit dem ${faltungText(gehenFaltung)}. Wurde die Zeit nachgetragen, sollte jemand nachfragen, welches gemeint war.`,
    });
  }
  if (versatz(beginn) !== versatz(ende)) {
    const herbst = versatz(beginn) > versatz(ende);
    befunde.push({
      art: 'hinweis',
      regel: 'Zeitumstellung',
      text: herbst
        ? `In dieser Schicht wird die Uhr um 3 Uhr auf 2 Uhr zurückgestellt. Die Schicht dauert deshalb ${hm(dauer)} Stunden, aus den Uhrzeiten allein kämen ${hm(dauerWanduhr)} heraus.`
        : `In dieser Schicht springt die Uhr um 2 Uhr auf 3 Uhr. Die Schicht dauert deshalb nur ${hm(dauer)} Stunden, aus den Uhrzeiten allein kämen ${hm(dauerWanduhr)} heraus.`,
    });
  }

  // § 4: the break
  const vorgeschrieben = vorgeschriebenePause(dauer - pause);
  const angesetzt = angesetztePause(dauer, pause);
  herleitung.push(`Pause erfasst ${pause} min, vorgeschrieben bei ${hm(dauer - pause)} Arbeit: ${vorgeschrieben} min`);
  if (angesetzt > pause) {
    befunde.push({
      art: 'verstoss',
      regel: '§ 4 S. 1 ArbZG',
      text: `Pause zu kurz. Bei ${hm(dauer - pause)} Stunden Arbeit sind ${vorgeschrieben} Minuten vorgeschrieben, ${pause === 0 ? 'erfasst ist keine' : `erfasst sind ${pause}`}.`,
    });
    const abzug = angesetzt - pause;
    if (angesetzt < vorgeschrieben) {
      const voll = dauer - vorgeschrieben;
      const dannNoetig = vorgeschriebenePause(voll);
      befunde.push({
        art: 'entscheidung',
        regel: 'Pausenabzug',
        text:
          `Abgezogen werden ${abzug} Minuten. Mit vollen ${vorgeschrieben - pause} blieben ${hm(voll)} Stunden Arbeit, und dafür ` +
          (dannNoetig === 0 ? 'wäre gar keine Pause vorgeschrieben' : `würden schon ${dannNoetig} Minuten reichen`) +
          `. Deshalb hört der Abzug bei ${hm(dauer - angesetzt)} auf. Ob überhaupt automatisch abgezogen werden darf, muss der Betrieb festlegen.`,
      });
      herleitung.push(`Abzug ${abzug} min, bis ${hm(dauer - angesetzt)} erreicht sind`);
    } else {
      befunde.push({
        art: 'entscheidung',
        regel: 'Pausenabzug',
        text: `Abgezogen werden die fehlenden ${abzug} Minuten. Ob überhaupt automatisch abgezogen werden darf, muss der Betrieb festlegen.`,
      });
      herleitung.push(`Abzug der fehlenden ${abzug} min`);
    }
  }

  const arbeit = dauer - angesetzt;
  herleitung.push(`Arbeitszeit ${hm(dauer)} − ${hm(angesetzt)} = ${hm(arbeit)} = ${stunden(arbeit)} Std.`);

  // § 3: daily maximum
  if (arbeit > 10 * 60) {
    befunde.push({ art: 'verstoss', regel: '§ 3 ArbZG', text: `${hm(arbeit)} Stunden Arbeit. Erlaubt sind höchstens 10.` });
  } else if (arbeit > 8 * 60) {
    befunde.push({
      art: 'hinweis',
      regel: '§ 3 S. 2 ArbZG',
      text: 'Mehr als 8 Stunden sind erlaubt, wenn der Durchschnitt über sechs Monate bei 8 bleibt. Für Nachtarbeitnehmer gilt ein Monat (§ 6 Abs. 2).',
    });
  }

  // § 2: night, § 9: Sunday
  const nacht = minutenIn(beginn, ende, istNacht);
  const sonntag = minutenIn(beginn, ende, istSonntag);
  if (nacht > 0) herleitung.push(`Nachtzeit 23 bis 6 Uhr (§ 2 Abs. 3): ${hm(nacht)} anwesend`);
  if (nacht > 120) {
    befunde.push({ art: 'hinweis', regel: '§ 2 Abs. 4 ArbZG', text: `${hm(nacht)} Stunden fallen in die Nachtzeit. Bei mehr als zwei Stunden gilt das als Nachtarbeit.` });
  }
  if (sonntag > 0) {
    herleitung.push(`Sonntag 0 bis 24 Uhr (§ 9): ${hm(sonntag)} anwesend`);
    befunde.push({
      art: 'hinweis',
      regel: '§ 9 ArbZG',
      text: `${hm(sonntag)} Stunden liegen auf dem Sonntag. Das geht nur mit einer Ausnahme nach § 10 oder § 13, und ob es die gibt, prüft diese Rechnung nicht.`,
    });
  }

  return {
    ok: true,
    zeile: {
      beginn,
      ende,
      dauer,
      dauerWanduhr,
      pauseErfasst: pause,
      pauseVorgeschrieben: vorgeschrieben,
      pauseAngesetzt: angesetzt,
      arbeit,
      nacht,
      sonntag,
      mehrdeutig: { kommen: kommenInstants.length === 2, gehen: gehenMehrdeutig },
      befunde,
      herleitung,
    },
  };
}

// ---------------------------------------------------------------------------------------------------------------
// The sheet

/** The days the valid lines cover, as the head prints them: "24.10.2026" or "24.10.–25.10.2026". */
export function zeitraum(zeilen: readonly Ergebnis[]): string | null {
  const gueltig = zeilen.flatMap((e) => (e.ok ? [e.zeile] : []));
  if (gueltig.length === 0) return null;
  const von = wanduhr(Math.min(...gueltig.map((z) => z.beginn)));
  // the last minute worked, so a shift that ends at midnight stays on its day
  const bis = wanduhr(Math.max(...gueltig.map((z) => z.ende)) - MINUTE);
  if (datumText(von) === datumText(bis)) return datumText(von);
  return von.jahr === bis.jahr ? `${datumText(von).slice(0, 6)}–${datumText(bis)}` : `${datumText(von)}–${datumText(bis)}`;
}

export function abrechnen(schichten: readonly Schicht[]): Abrechnung {
  const zeilen = schichten.map(berechneSchicht);

  // § 5 Abs. 1: eleven hours between the end of one shift and the start of the next, in real time.
  const folge = zeilen
    .map((e, nr) => ({ e, nr }))
    .filter((x): x is { e: { ok: true; zeile: Zeile }; nr: number } => x.e.ok)
    .sort((a, b) => a.e.zeile.beginn - b.e.zeile.beginn);
  for (let i = 1; i < folge.length; i++) {
    const vorher = folge[i - 1]!;
    const jetzt = folge[i]!;
    const v = vorher.e.zeile;
    const z = jetzt.e.zeile;
    const ruhe = (z.beginn - v.ende) / MINUTE;
    if (ruhe < 0) {
      zeilen[jetzt.nr] = { ok: false, fehler: [{ feld: 'kommen', text: `Überschneidet sich mit Zeile ${vorher.nr + 1}.` }] };
      continue;
    }
    const ruheWanduhr = (alsUtc(wanduhr(z.beginn)) - alsUtc(wanduhr(v.ende))) / MINUTE;
    const pos = `Seit Zeile ${vorher.nr + 1}`;
    if (ruhe < ELF_STUNDEN) {
      z.befunde.push({
        art: 'verstoss',
        regel: '§ 5 Abs. 1 ArbZG',
        text:
          `${pos} sind nur ${hm(ruhe)} Stunden Ruhe vergangen, vorgeschrieben sind 11.` +
          (ruheWanduhr >= ELF_STUNDEN ? ` Nach den Uhrzeiten sähe es nach ${hm(ruheWanduhr)} aus, aber in dieser Nacht fehlt eine Stunde.` : ''),
      });
    } else if (ruheWanduhr < ELF_STUNDEN) {
      z.befunde.push({
        art: 'hinweis',
        regel: '§ 5 Abs. 1 ArbZG',
        text: `${pos} sind ${hm(ruhe)} Stunden Ruhe vergangen, das reicht. Wer nur die Uhrzeiten abzieht, kommt auf ${hm(ruheWanduhr)} und meldet einen Verstoß, den es nicht gibt.`,
      });
    }
    if (ruhe < 24 * 60) z.herleitung.push(`Ruhezeit seit Zeile ${vorher.nr + 1}: ${hm(ruhe)}` + (ruhe !== ruheWanduhr ? `, nach den Uhrzeiten ${hm(ruheWanduhr)}` : ''));
  }

  const gueltig = zeilen.flatMap((e) => (e.ok ? [e.zeile] : []));
  const arbeit = gueltig.reduce((s, z) => s + z.arbeit, 0);
  const zeilenGerundet = gueltig.reduce((s, z) => s + hundertstel(z.arbeit), 0);
  const befunde: Befund[] = [];
  if (zeilenGerundet !== hundertstel(arbeit)) {
    befunde.push({
      art: 'hinweis',
      regel: 'Rundung',
      text: `Wer jede Zeile einzeln rundet und dann addiert, kommt auf ${dezimal(zeilenGerundet)} Stunden. Hier werden die Minuten addiert und erst die Summe gerundet, das ergibt ${stunden(arbeit)}.`,
    });
  }

  return {
    zeilen,
    summe: {
      arbeit,
      nacht: gueltig.reduce((s, z) => s + z.nacht, 0),
      sonntag: gueltig.reduce((s, z) => s + z.sonntag, 0),
      zeilenGerundet,
      befunde,
    },
  };
}
