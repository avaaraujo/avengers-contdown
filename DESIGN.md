---
name: Avengers Countdown
description: "A collector's wall of bagged comics, one per MCU film, counting down to Vingadores: Doutor Destino."
colors:
  wall: "#121318"
  wall-raised: "#1b1c23"
  paper: "#f2eadb"
  muted: "#b3ab9d"
  line: "rgba(242, 234, 219, .16)"
  red: "#e2231a"
  red-deep: "#b3141c"
  yellow: "#f2c200"
  newsprint: "#efe3c8"
  panel-paper: "#fbf4e4"
  ink: "#111111"
  comic-yellow: "#f7c600"
  comic-blue: "#1d5fb4"
  error: "#ff8a80"
  white: "#ffffff"
  black: "#000000"
  yellow-hover: "#ffd83a"
  ink-soft: "#444444"
  muted-paper: "#5d574f"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(88px, 13vw, 168px)"
    fontWeight: 900
    lineHeight: 0.78
    letterSpacing: "-0.04em"
    fontVariation: "\"wdth\" 62"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(26px, 3.4vw, 46px)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontVariation: "\"wdth\" 66"
  clock:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(26px, 3.2vw, 40px)"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "\"tnum\" 1"
    fontVariation: "\"wdth\" 62"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 800
    lineHeight: 1.15
    fontVariation: "\"wdth\" 80"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.4
  meta:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
  micro:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.25
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.12em"
    fontVariation: "\"wdth\" 112"
  lettering:
    fontFamily: "Bangers, Archivo, sans-serif"
    fontSize: "clamp(44px, 5.4vw, 92px)"
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: "0.02em"
  comic-body:
    fontFamily: "Shantell Sans, Archivo, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.45
rounded:
  none: "0px"
  hairline: "2px"
  tag: "3px"
  button: "4px"
  card: "6px"
  sheet: "8px"
  sticker: "10px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "18px"
  xl: "28px"
  gutter: "clamp(16px, 3vw, 40px)"
components:
  button-ink:
    backgroundColor: "{colors.wall}"
    textColor: "{colors.paper}"
    rounded: "{rounded.button}"
    padding: "8px 12px"
  button-ink-hover:
    backgroundColor: "#000000"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.wall}"
    rounded: "{rounded.button}"
    padding: "8px 12px"
  button-yellow:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.wall}"
    rounded: "{rounded.button}"
    padding: "11px 14px"
  button-yellow-hover:
    backgroundColor: "#ffd21a"
  button-light:
    backgroundColor: "rgba(242, 234, 219, .1)"
    textColor: "{colors.paper}"
    rounded: "{rounded.button}"
    padding: "8px 12px"
  chip:
    backgroundColor: "rgba(242, 234, 219, .04)"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  tab-on:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.wall}"
    rounded: "{rounded.pill}"
    padding: "5px 12px"
  next-card:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.wall}"
    rounded: "{rounded.card}"
    padding: "12px 14px 12px 12px"
  next-card-done:
    backgroundColor: "{colors.paper}"
  input:
    backgroundColor: "{colors.wall}"
    textColor: "{colors.paper}"
    rounded: "{rounded.button}"
    padding: "10px 12px"
  toast:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.wall}"
    rounded: "{rounded.card}"
    padding: "10px 12px 10px 16px"
  comic-panel:
    backgroundColor: "{colors.panel-paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
  caption-box:
    backgroundColor: "{colors.comic-yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.comic-body}"
    rounded: "{rounded.none}"
    padding: "16px 20px"
  sticker:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.sticker}"
    padding: "4px 12px 4px 4px"
  issue-nav:
    backgroundColor: "{colors.comic-yellow}"
    textColor: "{colors.comic-blue}"
    rounded: "{rounded.none}"
    padding: "10px 18px"
    height: "64px"
---

# Design System: Avengers Countdown

## Overview

**Creative North Star: "The Collector's Wall"**

The site is a dark room with a wall of red lacquered ledges, and every MCU film is an original comic standing on it. Issues you haven't watched yet wait in their clear plastic bags, drained to grey. Watching one takes it out of the bag, brings back its color and stamps it **VISTO!**. The next issue sits pulled forward with a yellow label, and the last spot on the wall holds the premiere edition in a graded slab. The wall is the frame for everything: the countdown, the numbers and the progress bar are printed over its top and bottom edges like gallery signage, and they never compete with the covers.

Pulling an issue off the wall opens it into a full comic-book page: newsprint, ink-outlined panels, Bangers lettering, starburst sound effects, and a halftone red action panel where you hit **MARCAR!**. The shelf is quiet and nocturnal; the page is loud and printed. The comic language stays on the page: milestones on the wall (finishing the marathon, premiere day, the weeks in theaters) are handled with plain, correctly worded text and hierarchy, never lettering or bursts, so the wall's chrome stays restrained and the covers carry the color.

Real covers are the imagery. Color on the wall is earned: a cover only gets its color back when the film is watched, and the brand red and yellow are kept for the deadline, the next film, and progress.

**Key Characteristics:**
- Dark, warm-black wall with off-white "paper" text; the comic covers are the only full-color element at rest.
- One variable sans (Archivo) runs the wall, carrying hierarchy through scale and width axis alone; the countdown is a single monumental condensed numeral.
- The comic page switches to a full print vocabulary: newsprint dots, 4px ink outlines, flat yellow/red/blue, hard offset shadows, rotated lettering.
- Watched vs not watched is shown with material (bag, desaturation, stamp), not with badges or checkmarks.
- On phones a lighter mode is required: fewer, smaller textures, and the same hierarchy at reduced sizes.

## Colors

Two palettes share one red: a nocturnal shelf palette (wall, paper, red, yellow) and a printed comic palette (newsprint, ink, comic yellow, comic blue).

### Primary
- **Lacquer Red** (`red`): The brand mark ("COUNTDOWN" in the wordmark), the progress-bar fill, the checked state in the list, the VISTO! stamp, and the comic page's red lettering and halftone action panel. The one color both worlds share.
- **Phase lacquers:** each ledge segment under a comic takes its film's MCU phase color (Fase 1 red `#b3141c`, 2 blue `#1f5fae`, 3 purple `#6a2fa0`, 4 teal `#0d7c78`, 5 orange `#c25a10`, 6 magenta `#b0246b`) and the ledge label names the phase ("FASE 3"). The premiere takes Fase 6. Yellow stays reserved for the next film.
- **Deep Lacquer** (`red-deep`): The shelf ledges themselves (as a clearcoated 3D material) and the page scrollbar. A surface red, never used for text.

### Secondary
- **Next-Issue Yellow** (`yellow`): Exclusively for "what's next" and "pace": the Próximo card, the next issue's ledge label, the pace stat, the tickets link, the focus ring, text selection, and the sign-in submit button.

### Tertiary
- **Comic Blue** (`comic-blue`): Comic page only. Data values in the ficha técnica, the second masthead line, the issue numbers in prev/next navigation, the "seen" state of the POW burst, and the comic page's focus ring.
- **Comic Yellow** (`comic-yellow`): Comic page only. Caption boxes, starburst fills, prev/next issue panels, the tickets button.

### Neutral
- **Shelf Wall** (`wall`): Page background, HUD gradients, 3D scene background and fog, ink-on-yellow text color on the wall's light surfaces.
- **Raised Wall** (`wall-raised`): The slide-in list drawer and the account sheet; the one step up from the wall.
- **Paper** (`paper`): Primary text on the wall, the toast, the active tab, the "done" Próximo card.
- **Faded Paper** (`muted`): Secondary text: stat captions, metadata, notes, credits.
- **Hairline** (`line`): Every divider on the wall: stat separators, list rows, chip and tab outlines.
- **Newsprint** (`newsprint`): The comic page background, overlaid with a 5px warm dot pattern.
- **Panel Paper** (`panel-paper`): Inside of comic panels and the issue-number box.
- **Ink** (`ink`): Comic page text, every panel outline, offset shadows and lettering strokes.
- **Error Coral** (`error`): Error text on the wall (sign-in failures).
- **White** (`white`) and **Black** (`black`): White is the comic page's sticker, streaming panel and balloon fill and the check mark's stroke; black is the pressed state of ink buttons. Neither appears on the wall's chrome.
- **Yellow Hover** (`yellow-hover`): The single hover brighten for every yellow control, wall or page, so the two yellows keep their own resting values.
- **Ink Soft** (`ink-soft`) and **Muted Paper** (`muted-paper`): The comic page's secondary text (prices, sources) and the warm grey for counts on a paper pill.

### Named Rules
**The Earned Color Rule.** At rest the wall is greyscale plus paper; covers come back to color only when watched. Red and yellow on the wall's chrome are reserved for the deadline, the next film and progress. Never tint an unwatched cover or add decorative color to the HUD.

**The Yellow Means Next Rule.** On the wall, `yellow` marks the single next action (the Próximo card, the next ledge label, the pace that tells you whether you'll make it). If something is yellow and it isn't about what comes next, it's wrong.

**The Two Yellows Rule.** `yellow` belongs to the wall, `comic-yellow` to the printed page. They are near-identical by design but don't swap them; the comic one is the warmer process yellow that sits on newsprint.

## Typography

**Wall Font:** Archivo (variable, with the `wdth` axis), fallback system-ui, sans-serif
**Lettering Font:** Bangers, fallback Archivo
**Comic Body Font:** Shantell Sans (normal and italic), fallback Archivo

**Character:** On the wall, one grotesque does everything by pulling its width axis: squeezed to `wdth` 62 for monumental numerals, stretched to 110–112 for tracked uppercase labels. On the page, hand-lettered Bangers for anything shouted and the handwriting-like Shantell Sans for everything spoken, the way a letterer would work.

### Hierarchy
- **Display** (Archivo 900, clamp(88px, 13vw, 168px), line-height 0.78, `wdth` 62): The days remaining. Only one per screen. 108px on phones, sized so the digits span the text block beside them.
- **Headline** (Archivo 900, clamp(26px, 3.4vw, 46px), 1, `wdth` 66): The big numbers in the bottom HUD (hours watched, hours left, films left, pace). 20px on phones.
- **Clock** (Archivo 800, clamp(26px, 3.2vw, 40px), `wdth` 62): The hh:mm:ss line beside the days, with tabular numerals.
- **Title** (Archivo 800, 17px, 1.15, `wdth` 80): The next film's title in the Próximo card.
- **Body** (Archivo 400, 15px, 1.5): Default text on the wall.
- **Caption** (Archivo 700, 14px, 1.4): Button text on the wall, the toast message, list titles, the comic page's Undo and sticker text.
- **Meta** (Archivo 400, 13px, 1.4, `muted`): Secondary lines: stat captions, "estreia no Brasil", list years and runtimes, the hover tag, the welcome note.
- **Micro** (Archivo 400, 11px, 1.25, `muted`): Only the four stat captions on phones, where four columns share one row. Nothing else on the wall goes below 12px.
- **Label** (Archivo 700–800, 11–12px, letter-spacing 0.12–0.14em, uppercase, `wdth` 110–112): The wordmark, "PRÓXIMO · Nº 10", chips, tabs, drawer headings.
- **Lettering** (Bangers 400, clamp(44px, 5.4vw, 92px), 0.92, 2–3px ink stroke painted under the fill): Film titles on the splash, the masthead, burst text, ficha values (23px, blue), prev/next issue names (28px).
- **Comic Body** (Shantell Sans 500 italic, 18px, 1.45, max 62ch): Caption-box synopsis. Labels on the page use Shantell 800 uppercase at 13–15px.

### Named Rules
**The Width-Axis Rule.** On the wall, hierarchy comes from scale and the `wdth` axis, never from a second family. Numerals squeeze (62–70), labels stretch (110–112). All counting numbers use tabular figures.

**The Letterer's Rule.** Bangers is for what a comic would shout (titles, sound effects, data values) and always carries an ink stroke drawn under the fill (`paint-order: stroke fill`). Running text is never set in Bangers.

## Layout

The wall is a fixed full-viewport 3D canvas; the HUD floats over it in two bands with a page gutter of clamp(16px, 3vw, 40px). The top band is a three-column grid (countdown left, Próximo card right, wordmark and chips across the top) that fades into the wall through a gradient; the bottom band holds a four-column stat row divided by hairlines, then the progress bar and a single line of account and reset links. The shelf grid adapts by width: 3 columns under 560px, 5 under 900px, 7 under 1300px, 8 above; the page scrolls the camera down the rows.

The comic page is a full-screen sheet: a top strip across the page, then a 1.2fr : 1fr split (splash panel left, a stack of caption, ficha, where-to-watch and action panels right), then a two-panel prev/next strip. Panels sit 12px apart on newsprint (10px on phones).

At 860px and below, everything collapses to one column: the Próximo card moves into the bottom HUD above the stats, stat values drop to 20px, the pace caption shortens ("dias, por filme"), the masthead hides, the splash becomes a 4:5 panel followed at once by the mark button, and prev/next stack.

The list drawer is 420px wide (full width on phones) and slides in from the left; without WebGL it becomes the page itself.

## Elevation & Depth

Depth on the wall is real 3D, not CSS: a warm key light with soft shadows, a cool rim light, filmic tone mapping and fog that fades back to the wall color. Comics cast shadows onto the ledges; bags are clear, glossy planes; the ledges are clearcoated lacquer. The HUD floats above it with gradients rather than boxes, and the few HUD surfaces that lift (Próximo card, hover tag, drawer, account sheet, toast) use soft, dark ambient shadows. The comic page is flat print: depth only through hard, zero-blur ink offsets.

### Shadow Vocabulary
- **Card lift** (`box-shadow: 0 10px 30px rgba(0,0,0,.35)`): The Próximo card.
- **Hover tag** (`box-shadow: 0 6px 18px rgba(0,0,0,.4)`): The floating title tag over a hovered comic.
- **Toast** (`box-shadow: 0 12px 34px rgba(0,0,0,.5)`): The Undo toast.
- **Sheet** (`box-shadow: 0 20px 50px rgba(0,0,0,.5)`): The account sheet; the drawer uses `20px 0 60px rgba(0,0,0,.45)` toward the wall.
- **Ink offset** (`box-shadow: 3px 3px 0 #111` / `4px 4px 0 #111`): Comic page stickers and the tickets button. Title lettering uses `text-shadow: 4px 4px 0 #111` (5px on the finale count).

### Named Rules
**The Material State Rule.** Watched vs not watched is shown with material and light: in the bag, desaturated (12% saturation) and dimmed (42% brightness) versus out of the bag, full color, stamped. Never reduce it to a badge or a checkmark on the wall itself; the text list is where checkmarks live.

**The Hard Shadow Rule.** On the comic page, shadows have zero blur and use ink. Soft shadows belong only to the wall.

## Shapes

The wall uses small, tight corners: 2px for thumbnails and the progress track, 4px for buttons and inputs, 6px for the Próximo card and toast, 8px for the account sheet, and full pills for chips and tabs. The round check in the list is a 22px circle. The comic page is square-cornered: panels are 4px ink boxes with 0 radius, caption labels hang off the corner, and the only curves are stickers (10px), the speech balloon (an ellipse with a skewed tail) and the jittered starbursts. Lettering and stickers are slightly rotated (−1° to −10°) so the page feels hand-pasted.

## Components

### Buttons
Quiet on the wall, loud on the page.
- **Shape:** Gently squared (4px radius), 13px Archivo 800, no border.
- **Ink** (`button-ink`): The primary action on a yellow or paper surface ("Marcar como visto", Undo). Hover goes to pure black; press nudges down 1px.
- **Ghost** (`button-ghost`): The secondary action on yellow ("Abrir o gibi"): transparent with a 1.5px inset wall-colored stroke; hover tints 8%.
- **Yellow** (`button-yellow`): Full-width submit in the account sheet; hover brightens to `yellow-hover`, disabled drops to 60%.
- **Light** (`button-light`): Secondary action on the dark sheet (sign out).
- **Text links:** Inline underlined paper text with a 3px offset ("Entre" in the footer line). Their touch area is padded to 44px without moving the layout.
- **Destructive:** "Zerar progresso" is a Light button at the foot of the list drawer, away from the everyday actions. It always has an Undo toast.
- **Comic Undo:** On the comic page, "Desfazer" (just marked) and "Desmarcar" (already seen) are paper buttons with a 3px ink outline and a hard offset, 44px tall, on the red halftone.
- **Icon button:** 44px circle on 8% paper, 18px stroked icon.

### POW Burst (signature)
The comic page's main action: a comic-yellow starburst SVG (18 points, deterministic jitter, 2.4px ink stroke) with red Bangers text clamp(36px, 3.8vw, 58px) rotated −6°, sitting on a halftone red panel, reading "MARCAR COMO VISTO!". Once seen the burst turns white, the text turns comic blue and says "VISTO!", with a "Desmarcar" link under it. Hover scales to 1.04 with −1° rotation; press scales to 0.97. The same burst shape (16 points by default) carries "Ficha técnica" and the "60 dias!" counter.

### Chips and Tabs
- **Chip:** Pill, 1px hairline outline on 4% paper, uppercase label at 12px. Hover lifts to 10% fill and a 30% outline. Used for LISTA and ENTRAR.
- **Tabs:** Same pill shape; the active tab fills with paper and flips text to wall, its count in a warm grey (#5d574f).

### Próximo Card (signature)
The one solid color block on the wall: a yellow card (6px radius) with a cover thumbnail, a tracked label "PRÓXIMO · Nº n", the title, and an ink + ghost button pair. The ink button's accessible name carries the title. After a tap it holds on "Visto!" (a deep-red button, disabled) for 700ms before the next film appears, so a second tap cannot mark two films. On a first visit the label reads "COMECE POR AQUI" with a one-line hint that the order is the story's.

The card exists twice and CSS shows one. Above 860px it sits beside the countdown. At 860px and below it moves into the bottom HUD, above the stat row, as a compact bar: a 30px cover, label and a one-line ellipsized title, and two 48px-tall buttons below, so marking the next film is a thumb tap in the lower half of the screen. When the marathon is complete it turns paper-colored and reads "Maratona completa: 38 de 38". While looking at a friend's shelf it is paper-colored too, says "Estante do seu amigo" and offers "Voltar para a minha".

### Welcome Card
Shown once to a visitor who arrives by a friend's progress link and has no progress of their own: a centered `wall-raised` sheet on a 78% wall scrim, Archivo only. A label, a headline with the real count ("Um amigo já viu 12 de 38 filmes antes de Vingadores: Doutor Destino."), one line explaining the chronological order, a yellow primary button ("Começar a minha maratona"), a light secondary one ("Ver a estante do meu amigo", which shows the friend's shelf read-only) and a note that progress stays in this browser. The HUD is inert behind it and Esc starts the visitor's own marathon.

### Stat Row
Four equal columns separated by hairlines; the value in headline type, the caption in 13px `muted`. The pace column's value is yellow. Below it the progress bar: a 12px track at 8% paper, a red fill with a 6px Ben-Day dot overlay, growing over 0.9s, with "n de 38" right-aligned.

### Inputs / Fields
- **Style:** Wall-colored field inside the raised sheet, 1px border at 28% paper, 4px radius, 16px text (prevents iOS zoom), yellow caret.
- **Focus:** A 2px yellow outline replaces the border.
- **Error:** Message in `error` coral directly above the submit.

### Navigation
- **Wall:** No navbar. The wordmark ("AVENGERS" in paper, "COUNTDOWN" in red) and two chips sit in the top HUD. The list drawer is the index: a one-line summary ("12 de 38 · 18h35 vistas"), then the marathon in groups of ten ("Nº 1 a 10", a 12px tracked label in `muted`; the story order interleaves the release phases, so phases cannot head the groups), then "A estreia" with the Nº 39 row. Each row is two buttons: the title area opens the comic, the round check beside it marks or unmarks (red when seen) and offers Undo. The next film carries a yellow "PRÓXIMO" tag. Tabs are real tabs: arrows, Home and End move between them, only the selected one is in the Tab order. On phones the list covers the screen, the HUD behind it is inert and Tab wraps inside it.
- **Comic page:** A "← VOLTAR PARA A ESTANTE" back control top-left ("← VOLTAR" on phones), the rotated two-line masthead center, the day-count burst right (the premiere's date on the premiere page, to avoid repeating its count); prev/next issues at the foot as yellow ink panels with triangle arrows, blue Bangers titles, hover brightening to `yellow-hover`. On wide screens the right column runs synopsis, the mark button, the ficha, then streaming, and the cover is as tall as the window, so the title and the button are both in the first screen. On phones the mark button follows the cover directly. The premiere page ends with a "Sua maratona" panel: the count so far, a progress bar and a button to the next unseen film.

### Comic Panel
4px ink border, `panel-paper` fill, no radius, 12px gaps. Variants: caption box (`comic-yellow`, italic Shantell, a black phase label hanging off the top-right corner), ficha (a burst cell plus a definition list with 2px ink rules), where-to-watch (white, with tilted provider stickers grouped by Assinatura / Aluguel / Compra), and action (halftone red: two offset 8px dot layers in black and yellow).

### Streaming Sticker
White pill-cornered sticker (10px radius, 3px ink border, 3px offset ink shadow) with the provider's 30px logo and name, each rotated by one of a fixed set of small angles (−2°, 1.5°, −1°, 2°) so a row looks hand-stuck. The same where-to-watch panel and stickers appear inside the extras list on the wall, a sanctioned case of the comic language leaking in.

### Toast
Paper pill-card at the bottom center above the stat row, with a short message and an ink Undo button; rises 8px into place over 0.35s.

## Do's and Don'ts

### Do:
- **Do** let the covers be the only full color on the wall at rest; HUD chrome stays wall, paper, `muted` and hairlines.
- **Do** keep `yellow` on the wall for the single next action and pace, and `red` for the brand, progress and the VISTO! stamp.
- **Do** set every counting number in Archivo with tabular figures, squeezed on the `wdth` axis (62–70).
- **Do** use 4px ink outlines, square corners and zero-blur ink shadows on anything that lives on the comic page.
- **Do** stroke Bangers lettering in ink under the fill (2–3px, `paint-order: stroke fill`).
- **Do** mark milestones on the wall (marathon finished, premiere day, in theaters) with correct, well-ranked text only: "Hoje", "dias em cartaz", "Maratona completa: 38 de 38". No lettering or bursts on the wall.
- **Do** keep the focus ring visible: 3px yellow on the wall, 3px comic blue on the page.
- **Do** respect `prefers-reduced-motion` and the lightweight phone mode in every new 3D or animated piece.

### Don't:
- **Don't** add decorative color, gradients or glows to the HUD; it fades into the wall with its own gradients only.
- **Don't** show watched state on the wall with badges, ribbons or checkmarks; use the bag, the desaturation and the stamp.
- **Don't** use soft blurred shadows or rounded panels on the comic page, or hard ink offsets on the wall.
- **Don't** set running text in Bangers, or bring in a second sans for the wall.
- **Don't** swap `yellow` and `comic-yellow` between the two surfaces.
- **Don't** replace the real comic covers with illustrations, posters or generated art.
