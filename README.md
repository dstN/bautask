# Abrechnung der Arbeitszeit

Meine Bewerbung bei [BauTask](https://bautask.de/karriere). Die Seite ist eine Arbeitszeitabrechnung auf Endlospapier, in die man Schichten eintragen kann, und sie rechnet die Fälle richtig, bei denen einfache Stundenzettel danebenliegen. Online steht sie unter [bautask.yinside.de](https://bautask.yinside.de).

Gerechnet wird zum Beispiel die Zeitumstellung. Die Nacht zum 25.10.2026 hatte eine Stunde mehr, die zum 29.03.2026 eine weniger, und 02:30 gab es im Herbst zweimal und im Frühjahr gar nicht. Beim Pausenabzug nach § 4 ArbZG führt der volle Abzug manchmal unter die Grenze, ab der die Pause überhaupt vorgeschrieben ist; die Seite zieht dann nur bis zu dieser Grenze ab und sagt dazu, dass das eine Festlegung ist. Dazu kommen Ruhezeit, Höchstarbeitszeit, Nachtzeit, Sonntagsarbeit und die Rundung der Summe. Was nicht abgebildet ist, etwa Tarif und Feiertage, steht auf der Seite.

Das Ganze ist eine Demonstration. Lohnsoftware oder Rechtsberatung ist es nicht.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `src/core/` | Die Rechnung. `zeit.ts` übersetzt zwischen Uhrzeit und Zeitpunkt für Europe/Berlin (nur mit `Intl`), `abrechnung.ts` enthält die Regeln. Kein Framework, kein DOM. |
| `src/core/abrechnung.test.ts` | Die Tests. Ihre Namen stehen auf der Seite im Prüflauf, aus dem JSON-Bericht des Builds. |
| `src/components/Zeile.astro` | Das Markup einer Zeile. Server und Skript füllen dieselben Stellen. |
| `src/scripts/abrechnung.ts` | Rechnet beim Tippen neu, mit derselben Rechnung wie der Build. |
| `src/data/` | Beispiele, Lebenslauf, Projekte und Journal. |
| `tests/` | Kontrast nach WCAG AAA, Beispiele, E2E mit axe gegen WCAG 2.2 AAA und ein Test, dass keine Anfrage an fremde Server geht. |

## Lokal

```sh
npm ci
npm run build      # zuerst die Tests (sie schreiben src/data/pruefung.json), dann die Seite
npm run preview
npm run test:e2e
npm run lhci       # Lighthouse, mobil und Desktop, jede Kategorie muss 100 sein
```

Gebraucht wird Node 26 oder neuer. Die Schriften (Fira Sans, Fira Sans Condensed, Doto) liegen in `public/fonts` und kommen über [@dstn/fli](https://www.npmjs.com/package/@dstn/fli).

## Deploy

Nach einer grünen CI auf `master` lädt `.github/workflows/deploy.yml` die Seite per ssh und tar auf den Netcup-Webspace, mit festgelegtem Host-Key und den Zugangsdaten aus der Environment `production`. Vorher prüft `scripts/vor-dem-deploy.mjs`, ob in `src/config/legal.ts` eingetragen ist, wie lange der Server seine Protokolle aufbewahrt.

## Wer was gemacht hat

Auftrag, Stack, Gestaltungsrichtung und Abnahme kommen von mir. Rechnung, Seite und Tests hat ein Coding-Agent (Claude Code) geschrieben, den ich dabei gesteuert habe. Im Journal auf der Seite steht, was davon übernommen, nachgearbeitet oder verworfen wurde.
