// Wall clock and instant for one IANA zone, with nothing but Intl. A wall time maps to no instant (the hour the
// clocks skip in spring), one, or two (the hour they repeat in autumn). Which of two is meant is not arithmetic, so
// this module returns both and leaves the decision to the caller.

export const ZONE = 'Europe/Berlin';
export const MINUTE = 60_000;

export interface Datum {
  jahr: number;
  monat: number;
  tag: number;
}

export interface Wanduhr extends Datum {
  stunde: number;
  minute: number;
}

const formate = new Map<string, Intl.DateTimeFormat>();

function format(zone: string): Intl.DateTimeFormat {
  let f = formate.get(zone);
  if (!f) {
    // hourCycle h23: midnight is 0, never 24
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
    formate.set(zone, f);
  }
  return f;
}

/** The wall clock in the zone at an instant (ms since the epoch, whole minutes). */
export function wanduhr(instant: number, zone = ZONE): Wanduhr {
  const t = Object.fromEntries(format(zone).formatToParts(instant).map((p) => [p.type, p.value]));
  return { jahr: Number(t['year']), monat: Number(t['month']), tag: Number(t['day']), stunde: Number(t['hour']), minute: Number(t['minute']) };
}

/** The wall time read as if it were UTC: the arithmetic a naive implementation does. */
export function alsUtc(w: Wanduhr): number {
  return Date.UTC(w.jahr, w.monat - 1, w.tag, w.stunde, w.minute);
}

/** Minutes the zone is ahead of UTC at an instant (Berlin: 60 in winter, 120 in summer). */
export function versatz(instant: number, zone = ZONE): number {
  return (alsUtc(wanduhr(instant, zone)) - instant) / MINUTE;
}

/** Every instant that shows this wall time in the zone, earliest first: none in the spring gap, two in the autumn overlap. */
export function instants(w: Wanduhr, zone = ZONE): number[] {
  const naiv = alsUtc(w);
  const halberTag = 12 * 60 * MINUTE;
  // The offsets in force half a day either side cover both sides of any transition on that date.
  const versaetze = new Set([versatz(naiv - halberTag, zone), versatz(naiv + halberTag, zone)]);
  return [...versaetze]
    .map((v) => naiv - v * MINUTE)
    .filter((i) => alsUtc(wanduhr(i, zone)) === naiv)
    .sort((a, b) => a - b);
}

export function folgetag(d: Datum): Datum {
  const n = new Date(Date.UTC(d.jahr, d.monat - 1, d.tag + 1));
  return { jahr: n.getUTCFullYear(), monat: n.getUTCMonth() + 1, tag: n.getUTCDate() };
}

/** 0 Sunday … 6 Saturday, of a calendar date (no zone involved). */
export function wochentag(d: Datum): number {
  return new Date(Date.UTC(d.jahr, d.monat - 1, d.tag)).getUTCDay();
}
