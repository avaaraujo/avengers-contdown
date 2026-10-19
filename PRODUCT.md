# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router) with React 19 and three.js, deployed on Vercel at **mcu.avaaraujo.com**, connected to GitHub repo `avaaraujo/avengers-contdown`. Data and auth on Supabase project "Projetos Pessoais" (`yranqpacxvijxbbpkzlp`, sa-east-1). That project already hosts unrelated personal-finance tables, so every table for this product carries its own prefix (`avengers_`) and must never touch the others. Optional TMDB layer (`TMDB_API_KEY`) overlays pt-BR titles, synopses and Brazilian streaming; without it the database values stand.

## Users

Fans preparing for the premiere of Avengers: Doomsday (BR title: *Vingadores: Doutor Destino*). Primary user is the owner, a Brazilian Marvel fan rewatching the MCU before the premiere. Secondary: the owner's friends, who receive share links and may track their own marathon. It is a personal project; growth and public acquisition are not goals. Interface language: Brazilian Portuguese.

## Product Purpose

A personal marathon tracker with a countdown to the Brazilian premiere. The user rewatches the MCU in in-universe chronological order, checks off each film as they finish it, and always knows how far they are and whether the pace is enough to finish before the premiere.

Success: the user opens the site, sees immediately how long until the premiere and which film is next, checks it off in one tap, and the numbers update.

## Positioning

Not a generic watchlist: everything is framed against a fixed deadline (the premiere). The math of the deadline — hours watched, hours left, films per day needed — is the core of the product. Each film is represented by the original comic that inspired it, and the marathon lives as a collector's comic shelf.

## Operating Context

Used repeatedly over the ~2 months before the premiere, typically right before or after watching a film (evening, at home, often on the phone or next to the TV). Countdown target: **17/12/2026** (Brazil, per Ingresso.com listing). The date lives in `avengers_config` so it can change without a deploy.

After the premiere the product does not retarget a new deadline: it switches to an "Em cartaz" state and the finished shelf stays up as a keepsake of the marathon.

## Capabilities and Constraints

- Countdown to the premiere (days, hours, minutes, seconds); "Em cartaz" state once it has passed.
- Main list: the 38 MCU films in in-universe chronological order (Disney+ timeline), each represented by the cover of the original comic that inspired it, with key info (title PT/EN, release year, runtime, synopsis, director, phase/saga). The list ends with the premiere edition (*Fantastic Four #5*).
- A page per film with its own URL (`/filme/<slug>`), share image and metadata: details, synopsis, source comic, and where to watch in Brazil (subscription, rent, buy), kept up to date.
- Check / uncheck films, with Undo after marking from the HUD or resetting.
- Progress bar and big numbers: hours watched, hours remaining, films remaining, films and hours per day needed, and similar pace stats.
- Extras: a curated, short list of essential Disney+ series and essential Fox X-Men films, each with its own page (`/extra/<slug>`). Checkable, but never counted in the countdown math; secondary to the main list.
- Accounts are optional: guests keep progress in `localStorage`; signing in with an email magic link (Supabase Auth) moves it to the account and syncs across devices. RLS required on every table; users only see their own rows.
- Shareable progress: `/progresso/<code>` links whose share image shows the sender's shelf with watched issues in color.
- Tickets: when sales open, a `https://` URL in `avengers_config` (`premiere.tickets_url`) surfaces a tickets link without a deploy.
- Installable and offline (manifest + service worker): the shelf opens without a connection, showing the last version seen.
- SEO basics: sitemap, robots, JSON-LD (`Movie` / `TVSeries`) on film and extra pages.
- Lightweight mode on phones (smaller textures, capped resolution and frame rate when idle) is a requirement, not an optimization.

## Brand Commitments

Product name: **Avengers Countdown**. Fan project: no claims of affiliation with Marvel or Disney, and no endorsement by TMDB. Credits that must stay visible: comic covers from Marvel Database (Fandom), streaming data from JustWatch via TMDB, plus the TMDB attribution. Code is MIT; covers, names and titles belong to their owners and are used non-commercially.

## Evidence on Hand

- `supabase/seed/`: the 38 films, the premiere, extras and Brazilian streaming offers; `supabase/migrations/` holds the `avengers_*` schema with RLS.
- `prototype/data.js`: the original film data with real runtimes, directors and Brazilian streaming offers (JustWatch, queried 2026-10-17), plus the source comic issue for each film.
- `prototype/covers/` and `public/covers/`: 39 original comic covers (Marvel Database / Fandom), one per film plus *Fantastic Four #5* (Doctor Doom) for the premiere. Marvel copyright; used as a non-commercial fan project with source credit.
- `docs/images/`: current screenshots of the shelf, detail page and extras (desktop and mobile).
- Short PT-BR synopses in the prototype were written for it; production uses TMDB pt-BR text when available.
- Film metadata and streaming must come from real sources (TMDB, whose provider data is from JustWatch), never invented.

## Product Principles

1. The deadline is the frame: every number relates to the premiere.
2. Next film first: the most common action (check off what I just watched, see what's next) is always one tap away.
3. Real data only: posters, runtimes, and dates are sourced, never fabricated.
4. Personal and celebratory: progress should feel like a reward, not a chore.
5. Nothing gated: anyone can track without an account; signing in only adds sync.

## Accessibility & Inclusion

- An accessible text list mirrors the 3D shelf and is the fallback when WebGL is unavailable.
- Keyboard navigation (arrows and `Esc`), with focus trapped in an open comic and the rest of the page `inert`.
- `prefers-reduced-motion` is respected.
- Must stay usable on low-end phones (see the lightweight mode above).
