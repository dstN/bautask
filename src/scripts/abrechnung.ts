// The live sheet: reads the fields, runs the engine, fills the [data-aus] slots of src/components/Zeile.astro. The
// markup of a line comes from the server (first example) or from the <template>; this file never builds one.
import { type Abrechnung, type Befund, type Faltung, type Feld, type Schicht, abrechnen, datumText, liesDatum, stunden, zeitraum } from '../core/abrechnung';
import { folgetag } from '../core/zeit';
import { VORLAGEN } from '../data/vorlagen';

const MAX_ZEILEN = 12;

const liste = document.querySelector<HTMLOListElement>('[data-zeilen]');
const vorlage = document.querySelector<HTMLTemplateElement>('[data-zeile-vorlage]');
const leer = document.querySelector<HTMLElement>('[data-leer]');
const neu = document.querySelector<HTMLButtonElement>('[data-neu]');
const ansage = document.querySelector<HTMLElement>('[data-ansage]');

let naechsteId = 100;

const zeilen = (): HTMLLIElement[] => [...(liste?.querySelectorAll<HTMLLIElement>('[data-zeile]') ?? [])];
const aus = (z: Element, name: string): HTMLElement[] => [...z.querySelectorAll<HTMLElement>(`[data-aus="${name}"]`)];
const feld = (z: Element, name: string): HTMLInputElement | HTMLSelectElement | null =>
  z.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${name}"]`);

function faltung(z: Element, name: string): Faltung | undefined {
  const s = feld(z, name);
  return s instanceof HTMLSelectElement && !s.hidden ? (Number(s.value) as Faltung) : undefined;
}

function lies(z: Element): Schicht {
  const wert = (n: string): string => feld(z, n)?.value ?? '';
  const s: Schicht = { datum: wert('datum'), kommen: wert('kommen'), gehen: wert('gehen'), pause: wert('pause') };
  const k = faltung(z, 'kommenFaltung');
  const g = faltung(z, 'gehenFaltung');
  if (k !== undefined) s.kommenFaltung = k;
  if (g !== undefined) s.gehenFaltung = g;
  return s;
}

/** Sets a printed figure; returns whether it changed, so only changed figures print anew. */
function drucke(el: HTMLElement | undefined, text: string): boolean {
  if (!el || el.textContent === text) return false;
  el.textContent = text;
  el.classList.remove('druckt');
  void el.offsetWidth; // restart the print animation
  el.classList.add('druckt');
  return true;
}

const ART: Record<Befund['art'], string> = { verstoss: 'VERSTOSS', entscheidung: 'ENTSCHEIDUNG', hinweis: 'HINWEIS' };

function befundListe(ul: HTMLElement | undefined, befunde: readonly Befund[]): void {
  if (!ul) return;
  const alt = ul.textContent;
  ul.replaceChildren(
    ...befunde.map((b) => {
      const li = document.createElement('li');
      li.className = `befund befund--${b.art}`;
      for (const [klasse, text] of [
        ['befund__art', ART[b.art]],
        ['befund__regel', b.regel],
        ['befund__text', b.text],
      ] as const) {
        const span = document.createElement('span');
        span.className = `${klasse} druck`;
        span.textContent = text;
        li.append(span);
      }
      return li;
    }),
  );
  if (ul.textContent !== alt) for (const li of ul.children) li.classList.add('druckt');
}

function nummeriere(): void {
  zeilen().forEach((z, i) => {
    const nr = String(i + 1);
    drucke(aus(z, 'pos')[0], nr.padStart(2, '0'));
    for (const el of aus(z, 'zeile-nr')) el.textContent = `, Zeile ${nr}`;
  });
}

function rechne(): void {
  const alle = zeilen();
  const a: Abrechnung = abrechnen(alle.map(lies));
  let verstoesse = 0;
  let entscheidungen = 0;

  alle.forEach((z, i) => {
    const e = a.zeilen[i]!;
    const fehlerFelder = new Set<Feld>(e.ok ? [] : e.fehler.map((f) => f.feld));
    for (const n of ['datum', 'kommen', 'gehen', 'pause'] as const) {
      const f = feld(z, n);
      if (fehlerFelder.has(n)) f?.setAttribute('aria-invalid', 'true');
      else f?.removeAttribute('aria-invalid');
    }
    const fehler = aus(z, 'fehler')[0];
    if (fehler) fehler.textContent = e.ok ? '' : e.fehler.map((f) => f.text).join(' ');

    const zl = e.ok ? e.zeile : undefined;
    // Without figures there is nothing to derive: the button rests and its derivation closes.
    const werte = z.querySelector<HTMLButtonElement>('[data-werte]');
    if (werte) {
      werte.disabled = !zl;
      if (!zl) {
        werte.setAttribute('aria-expanded', 'false');
        const h = aus(z, 'herleitung')[0];
        if (h) h.hidden = true;
      }
    }
    for (const n of ['kommen', 'gehen'] as const) {
      const s = feld(z, `${n}Faltung`);
      if (s) s.hidden = !zl?.mehrdeutig[n];
    }
    const naiv = aus(z, 'naiv')[0];
    if (naiv) {
      naiv.hidden = !zl || zl.dauer === zl.dauerWanduhr;
      const zahl = aus(z, 'naiv-zahl')[0];
      if (zl && zahl) zahl.textContent = stunden(zl.dauerWanduhr);
    }
    drucke(aus(z, 'dauer')[0], zl ? stunden(zl.dauer) : '–');
    drucke(aus(z, 'arbeit')[0], zl ? stunden(zl.arbeit) : '–');
    drucke(aus(z, 'nacht')[0], zl ? stunden(zl.nacht) : '–');
    drucke(aus(z, 'sonntag')[0], zl ? stunden(zl.sonntag) : '–');
    befundListe(aus(z, 'befunde')[0], zl?.befunde ?? []);
    const herleitung = aus(z, 'herleitung')[0];
    herleitung?.replaceChildren(
      ...(zl?.herleitung ?? []).map((h) => {
        const li = document.createElement('li');
        li.textContent = h;
        return li;
      }),
    );
    verstoesse += zl?.befunde.filter((b) => b.art === 'verstoss').length ?? 0;
    entscheidungen += zl?.befunde.filter((b) => b.art === 'entscheidung').length ?? 0;
  });

  // A sum over some of the lines would look complete; with any line unreadable the sheet prints none.
  const offen = a.zeilen.flatMap((e, i) => (e.ok ? [] : [String(i + 1).padStart(2, '0')]));
  const summe = (n: string): HTMLElement | undefined => document.querySelector<HTMLElement>(`[data-summe="${n}"]`) ?? undefined;
  drucke(summe('arbeit'), offen.length ? '–' : stunden(a.summe.arbeit));
  drucke(summe('nacht'), offen.length ? '–' : stunden(a.summe.nacht));
  drucke(summe('sonntag'), offen.length ? '–' : stunden(a.summe.sonntag));
  drucke(summe('verstoesse'), offen.length ? '–' : String(verstoesse));
  drucke(summe('entscheidungen'), offen.length ? '–' : String(entscheidungen));
  befundListe(summe('befunde'), offen.length ? [] : a.summe.befunde);
  const fehlt = summe('fehlt');
  const fehltText = offen.length
    ? `${offen.length === 1 ? `Zeile ${offen[0]} ist` : `Die Zeilen ${offen.join(', ')} sind`} unvollständig, deshalb steht hier keine Summe.`
    : '';
  if (fehlt) {
    fehlt.hidden = !offen.length;
    drucke(fehlt, fehltText);
  }
  drucke(document.querySelector<HTMLElement>('[data-zeitraum]') ?? undefined, zeitraum(a.zeilen) ?? '–');

  if (leer) leer.hidden = alle.length > 0;
  if (neu) neu.disabled = alle.length >= MAX_ZEILEN;
  if (ansage) {
    ansage.textContent = offen.length
      ? fehltText
      : `Neu gerechnet: ${stunden(a.summe.arbeit)} Stunden Arbeit, ` +
        `${verstoesse === 1 ? 'ein Verstoß' : `${verstoesse} Verstöße`}, ${entscheidungen} zu bestätigen.`;
  }
}

function neueZeile(s?: Schicht): HTMLLIElement | null {
  const li = vorlage?.content.firstElementChild?.cloneNode(true);
  if (!(li instanceof HTMLLIElement) || !liste) return null;
  const id = `z${naechsteId++}`;
  li.querySelector('[data-werte]')?.setAttribute('aria-controls', `${id}-herleitung`);
  li.querySelector('[data-aus="herleitung"]')?.setAttribute('id', `${id}-herleitung`);
  li.querySelector('[data-aus="fehler"]')?.setAttribute('id', `${id}-fehler`);
  for (const input of li.querySelectorAll('input')) input.setAttribute('aria-describedby', `${id}-fehler`);
  if (s) {
    for (const n of ['datum', 'kommen', 'gehen', 'pause'] as const) {
      const f = li.querySelector<HTMLInputElement>(`[name="${n}"]`);
      if (f) f.value = s[n];
    }
  }
  liste.append(li);
  return li;
}

function ladeVorlage(id: string): void {
  const v = VORLAGEN.find((x) => x.id === id);
  if (!v || !liste) return;
  liste.replaceChildren();
  for (const s of v.schichten) neueZeile(s);
  nummeriere();
  rechne();
}

// An edited sheet is no longer the ticked example.
const vorlagen = [...document.querySelectorAll<HTMLInputElement>('input[name="vorlage"]')];
function bearbeitet(): void {
  for (const r of vorlagen) r.checked = false;
  rechne();
}
liste?.addEventListener('input', bearbeitet);
liste?.addEventListener('change', bearbeitet);

liste?.addEventListener('click', (ev) => {
  const ziel = ev.target instanceof Element ? ev.target : null;
  const werte = ziel?.closest<HTMLButtonElement>('[data-werte]');
  if (werte) {
    const offen = werte.getAttribute('aria-expanded') === 'true';
    werte.setAttribute('aria-expanded', String(!offen));
    const h = document.getElementById(werte.getAttribute('aria-controls') ?? '');
    if (h) h.hidden = offen;
    return;
  }
  const storno = ziel?.closest('[data-storno]');
  if (storno) {
    const z = storno.closest('[data-zeile]');
    const alle = zeilen();
    const i = alle.findIndex((x) => x === z);
    z?.remove();
    nummeriere();
    rechne();
    // Focus goes where the line was: the next line's cancel button, else the previous one's, else "add a line".
    const rest = zeilen();
    const fokus = rest[i] ?? rest[i - 1];
    (fokus?.querySelector<HTMLButtonElement>('[data-storno]') ?? neu)?.focus();
  }
});

neu?.addEventListener('click', () => {
  // A new line copies the last one, a day later: the usual next entry on a timesheet.
  const letzte = zeilen().at(-1);
  const vorher = letzte ? lies(letzte) : VORLAGEN[0]!.schichten[0]!;
  const tag = liesDatum(vorher.datum);
  const z = neueZeile({ ...vorher, datum: tag ? datumText(folgetag(tag)) : vorher.datum });
  nummeriere();
  rechne();
  z?.querySelector<HTMLInputElement>('[name="datum"]')?.focus();
});

for (const r of vorlagen) {
  r.addEventListener('change', () => {
    if (r.checked) ladeVorlage(r.value);
  });
}
