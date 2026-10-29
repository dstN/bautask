# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro, static output. Deployed as plain files to the Netcup webspace under `bautask.yinside.de` (subdomain already exists in Plesk, wildcard TLS certificate). No Passenger, no server code. Vitest for the domain core, Playwright + @axe-core/playwright for E2E and accessibility, GitHub Actions for lint, typecheck, test and deploy (ssh + sshpass, pinned host key, environment secrets).

## Users

The hiring team of BauTask DEV GmbH, Hamburg, reading applications for the developer role in `README.md` (listed on bautask.de/karriere as "Senior Fullstack Developer", Hamburg / Remote). They develop AI-assisted as standard practice, say they receive "vierzigmal dasselbe Dokument", and explicitly ask for something else: "Schick uns, was du für richtig hältst." They arrive through a link in an email to the careers address and may open the public repository behind it.

Managing directors per Impressum: Chris-Luca Martin, Anton Lehmann. Who actually reads applications is not known.

## Product Purpose

An application by Dustin Tramm that proves instead of claims. It does two things the ad asks for in its own words:

1. Builds a small, real piece of BauTask's domain — time calculation that has to be right, because "wenn eine Arbeitszeit falsch berechnet wird, steht das am Monatsende auf einer echten Lohnabrechnung" — with its rules, tests and edge cases visible.
2. Shows, honestly, how the page was built with agents: what was taken over, sharpened, or thrown away.

Success: BauTask wants to talk to Dustin.

## Positioning

The ad describes Dustin's actual working model: architecture, product definition, precise task framing and critical acceptance by him, implementation by coding agents. Other applicants can claim "KI-native Arbeitsweise"; this one ships a working, tested slice of BauTask's own problem space together with the trail of decisions that produced it.

## Operating Context

- Read on a desktop browser from an email link, possibly on a phone.
- The ad stresses offline sync and "Uploads über zwei Balken Empfang"; the page itself must work offline once loaded.
- Domain facts available for the demo: German Arbeitszeitgesetz (§3 daily maximum, §4 breaks, §5 rest period, §2 night work), daylight saving transitions (2026-03-29 and 2026-10-25 in Germany), BauTask's own feature vocabulary (Stundenzettel, Zeiterfassung, Plantafel, Baustellenverwaltung, DATEV-Übertragung).

## Capabilities and Constraints

- Language German. The team is addressed as "ihr" throughout; the privacy page addresses the individual visitor as "du".
- Copy reads like a person wrote it: no negative parallelisms ("nicht X, sondern Y"), no punchy one-line verdicts, no colon-label intros, no padding triads, no promotional tone (Dustin's request, 29 October 2026, after the Wikipedia lists of signs of AI writing).
- Fully static, no request leaves the origin: no CDNs, no analytics, fonts self-hosted via `@dstn/fli`.
- The time engine is a demonstration, not payroll software and not legal advice; every rule it applies cites its paragraph, and anything it does not model is stated.
- Factual rules from Dustin's `bewerbung-tailoring` skill bind all copy: nothing invented; U. Günther work is "mitentwickelt"; never "Claude Code eingeführt"; Product Owner Newsletter is product responsibility, not team leadership; no client names; no meetings or on-site offers; nothing about the termination; availability "kurzfristig, nach Absprache"; remote only; part time, preferably 25, possibly 30 hours a week.
- Gaps to name openly, once, without apology: no Ruby/Rails and no React Native/Expo in production; hands-on depth is front end, backend and mobile experience come from agent-orchestrated own projects.
- Contact on the page: email, GitHub, portfolio. No street address or phone number on a public page.

## Brand Commitments

- Do not copy bautask.de. It may inform alignment (product vocabulary, du-tone on the careers side), not the look.
- Dustin's voice: plain, precise, no hype words ("kommunikationsstark", "belastbar", "neue Herausforderungen" are exactly what the ad mocks).

## Evidence on Hand

- Own projects, live: GourMerge (gourmerge.de), lawnetz.de, bewerby (bewerby.de), tower67 (tower67.rntm.de), EuroDraft (ed.rntm.de), footyguess (footyguess.yinside.de), vsgraph (vsgraph.de), twitterArchiver, threadsDeleter, @dstn/fli and @dstn/remcss on npm. Facts per project in the `bewerbung-tailoring` project overview.
- Employment facts from the master CV in that skill (conlabz 11.2020–11.2026 Front-End-Entwickler, PO Newsletter since 07.2024; U. Günther; art-box media; IHK Mediengestalter).
- This repository and its git history; it will be made public.
- Absent and not to be fabricated: photo, video, testimonials, customer quotes, metrics about BauTask.

## Product Principles

- Prove, don't claim: every assertion about skill sits next to something that runs.
- Correctness is the feature: edge cases are the content, not a footnote.
- Honest division of labour: what Dustin decided and what agents typed is never blurred.
- Respect the reader's time: one page, scannable, the offer and the contact always within reach.

## Accessibility & Inclusion

WCAG 2.2 AAA where practicable, AA as the floor, verified by axe in CI in every theme the page ships.
