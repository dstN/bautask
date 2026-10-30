// Everything the page says about Dustin. Facts come from the master CV and the project overview in Dustin's
// bewerbung-tailoring skill; nothing here may be stronger than they are (PRODUCT.md, Capabilities and Constraints).

export const person = {
	name: 'Dustin Tramm',
	nameFormular: 'Tramm, Dustin Aaron',
	email: 'dustin.tramm@yinside.de',
	github: { label: 'github.com/dstN', url: 'https://github.com/dstN' },
	portfolio: { label: 'dstn.github.io', url: 'https://dstn.github.io/' },
	repo: { label: 'github.com/dstN/bautask', url: 'https://github.com/dstN/bautask' },
	stelle: 'Fullstack-Entwicklung',
	stunden: '25, auf Wunsch 30',
	ort: 'remote',
	eintritt: 'kurzfristig, nach Absprache',
} as const;

export const empfaenger = 'BauTask DEV GmbH, Norderstr. 46, 20097 Hamburg';

export const betreff = 'Re: Abrechnung der Arbeitszeit';

export interface Projekt {
	name: string;
	url?: string;
	status: 'LIVE' | 'IM BAU' | 'NICHT ÖFFENTLICH';
	was: string;
	/** what of it answers a line of the ad */
	bezug: string;
}

export const projekte: readonly Projekt[] = [
	{
		name: 'GourMerge',
		url: 'https://gourmerge.de/',
		status: 'LIVE',
		was: 'Git für Rezepte: Branches, Commits, Forks und diffbare Änderungsanfragen.',
		bezug: 'Nuxt 4, MySQL über Drizzle, 28 Tabellen, 17 versionierte Migrationen, 69 API-Endpunkte, 304 Unit-Tests, 88 Playwright-Specs.',
	},
	{
		name: 'bewerby',
		url: 'https://bewerby.de/',
		status: 'LIVE',
		was: 'Bewerbungs-Tracker ohne Backend, offline als PWA.',
		bezug: 'Lokale Persistenz in IndexedDB und OPFS, Daten als CRDT-Dokument (Yjs). Ein Knopf löscht alles, was auf dem Gerät liegt.',
	},
	{
		name: 'LawNetz',
		url: 'https://lawnetz.de/',
		status: 'LIVE',
		was: '6.130 Gesetze und Verordnungen des Bundes, lesbar auf dem Handy.',
		bezug: 'Delta-Sync per bedingtem HEAD-Request, nur Geändertes wird geladen. Geprüft gegen WCAG 2.2 AAA in beiden Farbschemata.',
	},
	{
		name: 'Tower67',
		url: 'https://tower67.rntm.de/',
		status: 'IM BAU',
		was: 'Fluglotsenspiel im Browser, steuerbar per Klick oder Sprache.',
		bezug: 'Die Spracherkennung läuft als WASM im Browser, und kein Request geht an einen anderen Server. Eine eigene ESLint-Regel und ein Test sorgen dafür, dass die Schichten der Architektur getrennt bleiben.',
	},
	{
		name: 'threadsDeleter',
		url: 'https://threadsdelete.vercel.app/',
		status: 'LIVE',
		was: 'Löscht Beiträge über die offizielle Threads-API.',
		bezug: 'Hexagonal geschnitten, eine Fachlogik für CLI und Web. Backoff mit Jitter, Tagesobergrenze, Idempotenz.',
	},
	{
		name: 'spotifyscandals',
		status: 'NICHT ÖFFENTLICH',
		was: 'Findet Kontroversen zu den Künstlern einer Playlist.',
		bezug: 'LLM-Pipeline: Gemini mit Websuche und Batch-API, Quellen per Scraping gegengeprüft. FastAPI, SQLAlchemy 2.0.',
	},
];

export interface Station {
	von: string;
	bis: string;
	was: string;
	wo: string;
	details?: string;
}

export const werdegang: readonly Station[] = [
	{
		von: '11.2020',
		bis: '11.2026',
		was: 'Front-End-Entwickler, seit 07.2024 zusätzlich Product Owner Newsletter',
		wo: 'conlabz GmbH, Koblenz, remote',
		details: 'Anforderungen, Roadmap und Priorisierung für den Newsletter-Bereich. Barrierefreiheit nach WCAG 2.1 und 2.2 bis AAA, CI/CD mit axe-core und Smoke-Tests, Dokumentation, die Coding-Agents Kontext und Grenzen gibt.',
	},
	{
		von: '06.2021',
		bis: '11.2026',
		was: 'MJML-Newsletter-Boilerplate, Entwicklung und Betreuung',
		wo: 'conlabz GmbH',
		details: 'Vier Hauptversionen, 34 Releases. Gulp durch schlanke Node.js-Skripte ersetzt, Abhängigkeiten von 505 auf 278 Pakete.',
	},
	{
		von: '02.2017',
		bis: '01.2018',
		was: 'Front End Developer',
		wo: 'U. Günther GmbH, Hamburg',
		details: 'Mitentwicklung der Weboberfläche des eigenen Cloud-Systems mediaPort, vor allem neuer Features.',
	},
	{ von: '10.2015', bis: '01.2017', was: 'Front End Developer', wo: 'freiberuflich sowie bei Sven Vörtmann Internet und IT Service, Norderstedt' },
	{ von: '08.2011', bis: '07.2014', was: 'Ausbildung zum Mediengestalter Digital und Print, IHK', wo: 'art-box media, Müllheim' },
];

/** Ü taken over · N sharpened · S cancelled (thrown away). Every entry happened while this page was built. */
export type Buchung = 'Ü' | 'N' | 'S';

export interface Eintrag {
	buchung: Buchung;
	von: 'Dustin' | 'Agent';
	text: string;
}

export const journal: readonly Eintrag[] = [
	{ buchung: 'Ü', von: 'Dustin', text: 'Gibt den Auftrag: eine Bewerbung auf die Anzeige, die aus dem Rahmen fällt. bautask.de darf sich der Agent ansehen, nachbauen soll er die Seite aber nicht.' },
	{ buchung: 'S', von: 'Dustin', text: 'Lehnt den Vorschlag ab, Vite und TypeScript ohne Framework zu nehmen. Es wird Astro, statisch auf seinem Webspace bei netcup.' },
	{ buchung: 'Ü', von: 'Dustin', text: 'Nimmt den Vorschlag an, ein Stück eurer Fachlogik nachzubauen und dazu dieses Journal zu führen. Einen Lebenslauf als PDF braucht er nicht.' },
	{ buchung: 'S', von: 'Agent', text: 'Verwirft die Idee, die Bewerbung als Pull Request oder im Terminal-Look zu bauen, bevor Dustin sie zu sehen bekommt. So sehen schon viele Entwickler-Bewerbungen aus.' },
	{ buchung: 'Ü', von: 'Dustin', text: 'Der Agent sammelt sieben mögliche Gestaltungen aus Baustelle und Lohnbüro, ein Zufallswurf schlägt eine davon vor. Dustin bekommt sie mit drei Alternativen vorgelegt und nimmt die Abrechnung auf Endlospapier.' },
	{ buchung: 'N', von: 'Agent', text: 'Merkt beim Pausenabzug, dass 30 Minuten bei 6:20 ohne Pause zu viel sind. Dann blieben 5:50, und dafür wäre gar keine Pause vorgeschrieben. Jetzt wird nur bis 6:00 abgezogen, und die Zeile weist darauf hin, dass das eine Festlegung ist und nicht im Gesetz steht.' },
	{ buchung: 'S', von: 'Agent', text: 'Probiert die Nadeldruckschrift im normalen Schnitt aus. Die Punkte stehen zu weit auseinander und die Schrift wirkt blass, also wird es der fette Schnitt.' },
	{ buchung: 'N', von: 'Agent', text: 'Ein zweiter Agent prüft die fertige Seite, ohne die Vorgeschichte zu kennen. Er findet unter anderem einen Widerspruch zwischen Brief und Journal und eine Summe, die bei einer fehlerhaften Zeile trotzdem 0,00 Stunden druckte. Beides ist korrigiert.' },
	{ buchung: 'N', von: 'Dustin', text: 'Prüft die Seite selbst. Die Linien über den Überschriften sitzen ihm zu dicht, im Journal sieht man nicht, wo ein Eintrag endet, und beim Beispiel „Gerundet“ quetscht sich der Hinweis neben die Summe. Den letzten Fehler hatte der Review-Agent übersehen, die Ursache war eine überzählige Spalte im CSS-Grid.' },
	{ buchung: 'N', von: 'Dustin', text: 'Wünscht sich eine dunkle Ansicht mit Umschalter. Daraus wird die Nachtschicht: dasselbe Blatt als Kohlepapier, die drei Farben behalten ihre Rollen und erreichen auch dort 7:1.' },
	{ buchung: 'N', von: 'Dustin', text: 'Sieht, dass das gedruckte X in den Ankreuzfeldern nicht mittig sitzt. Nachgemessen: Die Nadeldruckschrift zeichnet ihr X ein Zwanzigstel ihrer Breite zu weit links. Um genau diesen Betrag wird es jetzt verschoben.' },
	{ buchung: 'N', von: 'Dustin', text: 'Will Lighthouse in der CI, mit 100 in allen vier Kategorien auf dem Handy und am Desktop. Die Startseite liegt mobil zuerst bei 99, weil der Browser den ganzen langen Bogen rechnet, bevor er etwas zeigt. Jetzt kommen die unteren Blätter erst dran, wenn man in ihre Nähe scrollt.' },
	{ buchung: 'Ü', von: 'Dustin', text: 'Stellt das Repository öffentlich, hinterlegt die Zugangsdaten für den Webspace und legt die Adresse bautask.yinside.de fest. In Plesk prüft er die Protokollrotation und schaltet die Webstatistik ab, damit die Datenschutzerklärung stimmt.' },
	{ buchung: 'N', von: 'Dustin', text: 'Lässt alle rechtlichen Aussagen der Seite von vier Agenten unabhängig voneinander prüfen. Daraufhin werden unter anderem der Satz zum Referrer in der Datenschutzerklärung und die Ausnahmen vom Sonntagsverbot korrigiert. Die Höchstarbeitszeit wird jetzt an der erfassten Zeit geprüft, bisher erst nach dem angenommenen Pausenabzug.' },
	{ buchung: 'N', von: 'Dustin', text: 'Sieht, dass sich der Hinweis bei „Gerundet“ auf dem Handy immer noch neben die Summe quetscht. Diesmal öffnete eine Regel, die nur für die Zeilen gedacht war, auch unter der Summe eine zusätzliche Spalte. Ein Test prüft jetzt auf Handybreite, dass der Hinweis darunter steht.' },
];

export const mitteilung: readonly string[] = ['Hallo BauTask,', 'ihr schreibt, dass bei euch sonst vierzigmal dasselbe Dokument ankommt. Deshalb schicke ich euch etwas, das man ausprobieren kann. In eurer Anzeige steht der Satz über die falsch berechnete Arbeitszeit, die am Monatsende auf einer echten Lohnabrechnung landet. Am 25. Oktober wurde die Uhr zurückgestellt, und das ist genau so ein Fall. Also habe ich eine kleine Abrechnung gebaut, die damit richtig umgeht. Beim Pausenabzug ist dabei noch eine zweite Stelle aufgefallen, an der die naheliegende Rechnung zu viel abzieht.', 'Gebaut habe ich die Seite so, wie ihr es in der Anzeige beschreibt. Ich überlege mir Architektur und Datenmodell, teile die Arbeit in Aufgaben auf, lasse Agenten den Code schreiben und sehe mir an, was dabei herauskommt. Was nicht passt, arbeite ich nach oder werfe ich weg. Im Journal unten könnt ihr nachlesen, wie das hier gelaufen ist.', 'Seit 2020 bin ich Front-End-Entwickler bei conlabz, einer Digitalagentur in Koblenz, und seit 2024 auch Product Owner für den Newsletter-Bereich. In meinen eigenen Projekten laufen Tests auf Barrierefreiheit automatisch in der Pipeline mit, die zum Beispiel Kontraste und die Größe von Schaltflächen prüfen. Auf einer Baustelle, mit Handschuhen und Sonne auf dem Display, kommt es auf beides an.', 'Rails und React Native habe ich bisher nicht produktiv eingesetzt. Backend und Mobile kenne ich aus eigenen Projekten, die ich mit Agenten gebaut habe, im laufenden Betrieb eines Teams habe ich beides noch nicht verantwortet. Ihr schreibt, dass man sich in Tagen einarbeitet, wenn man verstanden hat, wie Software funktioniert. Da gebe ich euch recht.', 'Ich arbeite nur remote, am liebsten 25 Stunden in der Woche, 30 gehen auch. Anfangen kann ich kurzfristig, nach Absprache.'];
