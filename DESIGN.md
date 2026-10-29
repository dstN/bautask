---
name: Abrechnung der Arbeitszeit
description: Dustin Tramm's application to BauTask, printed as a time statement on continuous tractor-feed stationery.
colors:
  papier: "#fbfbf7"
  umgebung: "#c9cec6"
  umgebung-tief: "#a9b0a6"
  vordruck: "#1b5640"
  vordruck-tief: "#12402f"
  vordruck-linie: "#9dbcab"
  vordruck-flaeche: "#e9f1e5"
  gruenband: "#e6f0e2"
  farbband: "#171716"
  rot: "#9a1a12"
  perforation: "#a3aba0"
  papier-nacht: "#141a24"
  umgebung-nacht: "#0b0d11"
  umgebung-tief-nacht: "#040506"
  vordruck-nacht: "#8fd1ad"
  vordruck-tief-nacht: "#b8e6cc"
  vordruck-linie-nacht: "#3e5c4e"
  vordruck-flaeche-nacht: "#1d2a27"
  gruenband-nacht: "#1a2622"
  farbband-nacht: "#ecebe4"
  rot-nacht: "#ff9c8f"
  perforation-nacht: "#3b434e"
typography:
  display:
    fontFamily: "'Fira Sans Condensed', 'Fira Sans', system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 1.25rem + 3.2vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "'Fira Sans Condensed', 'Fira Sans', system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 1.2rem + 1vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.1
  title:
    fontFamily: "'Fira Sans', system-ui, sans-serif"
    fontSize: "clamp(1.375rem, 1.05rem + 0.9vw, 1.75rem)"
    fontWeight: 500
    lineHeight: 1.28
  body:
    fontFamily: "'Fira Sans', system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Fira Sans Condensed', 'Fira Sans', system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.05em"
  print:
    fontFamily: "'Doto', ui-monospace, 'Cascadia Mono', monospace"
    fontSize: "1.0625rem"
    fontWeight: 900
    lineHeight: "1.5rem"
    letterSpacing: "0"
    fontFeature: "liga 0"
rounded:
  none: "0"
  knopf: "2px"
spacing:
  rand: "clamp(1rem, 2.6vw, 2.25rem)"
  loch: "clamp(0.4375rem, 1vw, 0.75rem)"
  pad: "clamp(1rem, 4.2vw, 3.75rem)"
  druckzeile: "1.5rem"
  linie: "1.875rem"
components:
  button-primary:
    backgroundColor: "{colors.vordruck}"
    textColor: "{colors.papier}"
    rounded: "{rounded.knopf}"
    padding: "0.875rem 1.25rem"
  button-primary-hover:
    backgroundColor: "{colors.vordruck-tief}"
    textColor: "{colors.papier}"
  button-text:
    textColor: "{colors.vordruck}"
    typography: "{typography.label}"
    padding: "0.25rem 0"
  input-print:
    textColor: "{colors.farbband}"
    typography: "{typography.print}"
    rounded: "{rounded.none}"
    padding: "0.125rem 0.25rem"
  input-print-hover:
    backgroundColor: "{colors.vordruck-flaeche}"
  tick-box:
    backgroundColor: "{colors.papier}"
    textColor: "{colors.farbband}"
    size: "1.5rem"
  form-field:
    backgroundColor: "{colors.papier}"
    padding: "0.375rem 0.75rem 0.5rem"
  column-header:
    backgroundColor: "{colors.vordruck-flaeche}"
    textColor: "{colors.vordruck}"
    padding: "0.375rem 0.5rem"
  journal-band:
    backgroundColor: "{colors.gruenband}"
    textColor: "{colors.farbband}"
    typography: "{typography.print}"
---

# Design System: Abrechnung der Arbeitszeit

## Overview

**Creative North Star: "Abrechnung im Endlosdruck"**

The whole surface is one continuous sheet of tabulating paper lying on a grey-green desk. A form manufacturer printed the pre-print in form green: field names, ruled boxes, column heads, section rules, tick boxes, the tear-off reply slip. A dot-matrix printer then struck the data onto it in ribbon black. Red on the same ribbon appears only where something is reversed or a rule fires. Every element belongs to one of those three inks, and the question "who put this on the paper, the form or the printer?" decides its face, size and colour.

Density is that of a payslip: compact boxes with hairline shared rules, figures in fixed-character columns, totals bottom right. Rank never comes from type size on the printed layer; it comes from capitals, double strike and red. The sheet is broken into sheets by fanfold perforation, not by cards or panels. It has two shifts. The day shift is paper under office light; the night shift is the carbon sheet behind it, blue-black with the strikes showing light. The device chooses by default, and a row of tick boxes at the top of the sheet (Automatisch, Tagschicht, Nachtschicht) pins one for the page view without storing anything.

Motion is the print head: printed text reveals left to right in hard steps, once on load and again when a line is reprinted, and not at all under reduced motion.

**Key Characteristics:**
- Three inks: form green pre-print, ribbon black print, ribbon red for reversals and violations.
- One printed type size (17px Doto 900) for every figure, list and message the printer produces.
- Tractor holes and micro-perforation as background layers of the paper itself; fanfold perforation between sheets.
- Hairline grids built from 1px gaps over a green ground, never from boxed cards.
- A single solid button per reply slip; everything else is a printed link or an underlined pre-print text button.

## Colors

A form-stationery palette: one muted green pre-print, near-black ribbon, one deep ribbon red, on warm off-white paper over a cool grey-green desk.

### Primary
- **Form Green** (vordruck): the pre-print. Headings, field names, column heads, section rules (2px), box outlines, tick boxes, the reply slip's dashed border, the primary button, links in body copy, focus rings, selection.
- **Deep Form Green** (vordruck-tief): hover state of the primary button, body links and text buttons only.

### Secondary
- **Ribbon Red** (rot): reversals and rules that fire. The struck-through naive figure, VERSTOSS findings, invalid input underline and text, the DST-fold picker, failed tests, cancelled journal entries, the caret in printed inputs. Never decoration, never emphasis for its own sake.

### Neutral
- **Ribbon Black** (farbband): everything the printer prints, plus body text. Printed links stay ribbon black.
- **Paper White** (papier): the sheet, field cells, tick-box fill, button text.
- **Desk Grey-Green** (umgebung): the surround behind the sheet, painted into the tractor holes, theme colour.
- **Desk Shadow** (umgebung-tief): inner shading of the tractor holes.
- **Pre-print Hairline** (vordruck-linie): shared rules between field boxes, row rules, letter lines, derivation divider.
- **Pre-print Tint** (vordruck-flaeche): column-header bands, input hover and focus fill, tick-box hover.
- **Green Bar** (gruenband): odd journal bands on listing paper.
- **Perforation Grey** (perforation): micro-perforation beside the tractor holes and the fanfold line.

### Night shift
Every token is one `light-dark()` pair in `src/styles/seite.css`; `color-scheme` on `:root` (`light dark`, pinned by `data-ansicht="hell|dunkel"`) picks the half. The roles stay identical: pre-print green lightens to `#8fd1ad`, ribbon black becomes ribbon white `#ecebe4`, red lightens to `#ff9c8f`, paper is carbon `#141a24` on a desk `#0b0d11`. `tests/unit/kontrast.test.ts` checks every ink pair at 7:1 in both shifts, and the E2E suite runs axe in both.

### Named Rules
**The Three Inks Rule.** Every mark is pre-print green, ribbon black or ribbon red. A fourth hue does not exist on this paper.

**The Red Fires Rule.** Red appears only when a rule fires or an entry is reversed. If nothing is wrong, the screen has no red.

**The Printer's Links Rule.** Links inside printed text are ribbon black with an underline; green links belong to pre-printed or typed prose.

## Typography

**Display Font:** Fira Sans Condensed 700 (with Fira Sans, system-ui)
**Body Font:** Fira Sans 400/700 (with system-ui)
**Label/Mono Font:** Fira Sans Condensed 500 for pre-print labels; Doto 900 (with ui-monospace, Cascadia Mono) for everything printed.

**Character:** A condensed humanist sans as the form manufacturer's typesetting, set against a coarse dot-matrix face as the printer. Fira Sans regular carries the typed letter and explanatory prose. All faces are self-hosted.

### Hierarchy
- **Display** (700, clamp 2.5rem to 3.75rem, 0.98): the form title, once per page, balanced.
- **Headline** (700, clamp 1.5rem to 2rem, 1.1): section names, always sitting under a 2px green rule; 1.25rem to 1.5rem in the appendix.
- **Title** (Fira Sans 500, clamp 1.375rem to 1.75rem, 1.28): the lead under the form title, max 42ch.
- **Body** (Fira Sans 400, 1.0625rem, 1.6): prose, max 52 to 68ch; 0.9375rem for notes and footer.
- **Label** (500, 0.8125rem, 0.05em, uppercase): field names, column heads, the "Hier abtrennen" cut line, text buttons.
- **Print** (Doto 900, 1.0625rem, 1.5rem line, ligatures off): all data, findings, derivations, lists, journal entries, input values.

### Named Rules
**The One Druckgrad Rule.** The printer has one size (--druckgrad) and one line height. Printed hierarchy comes from capitals, double strike (text-shadow 0.05em of currentColor) and red, never from a larger size.

**The Who Printed It Rule.** If the form manufacturer would have printed it, it is Fira Sans Condensed in green. If the printer would, it is Doto in black. Typed correspondence is Fira Sans.

## Layout

One centred sheet, max 82rem, on the desk surround. Horizontal padding is the tractor margin (--rand) plus the content inset (--pad); the holes repeat every 1.5rem down both margins with a dashed perforation line beside each. Sheets (statement, correspondence, evidence, journal, close) are separated by fanfold rules that run across the full width including the margins.

Printed tables use character-width columns (ch of the print face) on shared grid templates so headers and lines align; gaps are 1.5ch. Field boxes sit in a 4-column grid collapsing to 2 below 64rem and 1 below 22rem. Head and totals use a content-plus-sidebar grid (slip 16 to 18.5rem, totals 18 to 25rem at bottom right) that stacks below 64rem. Long printed lists run in two columns on wide paper.

Below 56rem the column header disappears, each timesheet line restacks into labelled rows, and the first screen puts the timesheet before the reply slip and fields. Reading pages (privacy, 404) narrow the sheet to 70ch with 1rem flow.

## Elevation & Depth

Flat paper. The only lift is the sheet itself above the desk; everything on it is ink, separated by rules and tints, not shadows. The fanfold carries a faint crease gradient (9% green-black fading down). Double strike is a text treatment, not depth.

### Shadow Vocabulary
- **Sheet on desk** (`box-shadow: 0 1px 2px rgb(20 32 24 / 0.14), 0 18px 40px -12px rgb(20 32 24 / 0.28)`): the continuous sheet only.

### Named Rules
**The Ink Not Lift Rule.** Nothing on the paper casts a shadow. Separation is a rule, a hairline grid or a tint band.

## Shapes

Square paper geometry. Corners are 0 everywhere except the primary button (2px, a punched stamp edge). Borders come in a fixed set: 2px solid green for section rules and the main total; 1.5px solid green for tick boxes and column-header underlines; 1.5px dashed green for the tear-off slip; 1.5px dashed perforation grey for fanfolds; 1.5px dotted green under printed inputs; 1px hairlines in pre-print hairline green for grids and rows. Circles appear only as tractor holes.

## Components

### Buttons
- **Shape:** near-square (2px).
- **Primary:** solid form green, paper text, Fira Sans Condensed 700 at 1.25rem, padding 0.875rem 1.25rem, full slip width. Exactly one per reply slip.
- **Hover / Focus:** hover deepens to Deep Form Green in 160ms (cubic-bezier(0.16, 1, 0.3, 1)); active nudges 1px down; focus ring switches to ribbon black so it reads against the green.
- **Text button:** uppercase pre-print label in green with a 1px underline, thickening to 2px on hover; disabled turns ribbon black without underline.

### Inputs / Fields
- **Printed input:** transparent, no box, 1.5px dotted green underline, Doto value in ribbon black, red caret. Hover and focus fill with pre-print tint; focus adds the 3px green ring.
- **Error:** underline becomes 2px solid red and the value turns red; the message prints in red below the line.
- **Fold picker:** a red-outlined select that appears only on the ambiguous hour of the DST change.

### Tick Boxes
- 1.5rem square, 1.5px green outline on paper; the printer strikes an X in ribbon black when checked. 44px minimum target; hover tints the box; focus rings the box, not the label.

### Form Field Grid
- Labelled cells (green label above printed value) on paper, separated by 1px gaps over a hairline-green ground. Wide cells span two columns.

### Timesheet Line
- A row of printed inputs followed by one button containing all printed figures; any figure opens the numbered derivation below. A reversed naive figure prints struck through in red beside the corrected one, which is double-struck. Findings print as label, paragraph, text columns; violations in red with the label double-struck.

### Reply Slip
- A dashed green box with "Hier abtrennen" set into its top edge on paper ground, holding the recipient line, the one primary button and printed contact links.

### Journal on Green Bar
- Entries on full-width bands alternating green bar and paper, running into the content inset. Cancelled entries print in red with a leading minus.

### Letter
- Fira Sans on ruled lines 1.875rem apart inside a hairline box; paragraphs are separated by one blank ruled line.

### Motion: Print Head
- Printed elements reveal with `clip-path: inset(0 100% 0 0)` to `inset(0)` over 380ms in 19 hard steps, staggered 70ms across fields and later across a line's figures and findings. Only under `prefers-reduced-motion: no-preference`; reprinting an edited line replays it with no delay.

## Do's and Don'ts

### Do:
- **Do** decide every element's ink by asking whether the form or the printer put it there.
- **Do** keep all printed text at --druckgrad (1.0625rem) with a 1.5rem line; rank with capitals, double strike or red.
- **Do** separate content with 2px green section rules, hairline grids and fanfold perforations.
- **Do** align printed columns in ch of the print face on a shared grid template.
- **Do** keep the print-head reveal stepped, once per print, and off under reduced motion.

### Don't:
- **Don't** use red for anything but reversals, violations and errors.
- **Don't** enlarge printed text to make a figure important.
- **Don't** add rounded cards or drop shadows on content; it is paper.
- **Don't** give the night shift its own hues or roles; it is the same three inks on carbon.
- **Don't** add a second solid button to a slip or a solid button outside a slip.
- **Don't** introduce a fourth hue or gradients beyond the paper's own layers (tractor holes, perforation, fanfold crease, letter ruling).
