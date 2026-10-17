# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) deployed on Vercel, connected to GitHub repo `avaaraujo/avengers-contdown`. Data and auth on Supabase project "Projetos Pessoais" (`yranqpacxvijxbbpkzlp`, sa-east-1). That project already hosts unrelated personal-finance tables, so every table for this product carries its own prefix (`avengers_`) and must never touch the others.

## Users

Fans preparing for the premiere of Avengers: Doomsday (BR title: *Vingadores: Doutor Destino*). Primary user is the owner, a Brazilian Marvel fan rewatching the MCU before the premiere; other people can create their own accounts and track their own marathon. Interface language: Brazilian Portuguese.

## Product Purpose

A personal marathon tracker with a countdown to the Brazilian premiere. The user rewatches the MCU in in-universe chronological order, checks off each film as they finish it, and always knows how far they are and whether the pace is enough to finish before the premiere.

Success: the user opens the site, sees immediately how long until the premiere and which film is next, checks it off in one tap, and the numbers update.

## Positioning

Not a generic watchlist: everything is framed against a fixed deadline (the premiere). The math of the deadline — hours watched, hours left, films per day needed — is the core of the product.

## Operating Context

Used repeatedly over the ~2 months before the premiere, typically right before or after watching a film (evening, at home, often on the phone or next to the TV). Countdown target: **17/12/2026** (Brazil, per Ingresso.com listing). The date must be editable in data in case the release changes.

## Capabilities and Constraints

- Countdown to the premiere (days, hours, minutes, seconds).
- Main list: all MCU films in in-universe chronological order, each represented by the cover of the original comic that inspired it, with key info (title PT/EN, release year, runtime, short synopsis, director, phase/saga).
- Film detail: where to watch it in Brazil (subscription, rent, buy), kept up to date.
- Check / uncheck films per user; progress persisted in Supabase.
- Progress bar for the marathon.
- Big numbers: hours watched, hours remaining, films remaining, films per day needed to finish before the premiere (and similar pace stats).
- Extras: a curated, short list of recommended essential Disney+ series and essential Fox X-Men films. Not exhaustive; secondary to the main list.
- Multi-user: anyone can sign up (Supabase Auth) and has their own progress. RLS required on every table.

## Brand Commitments

Product name: **Avengers Countdown**. Marvel posters and titles are referenced as fan use; no claims of affiliation with Marvel/Disney.

## Evidence on Hand

- `prototype/data.js`: the 38 films in chronological order with real runtimes, directors and Brazilian streaming offers (JustWatch, queried 2026-10-17), plus the source comic issue for each film.
- `prototype/covers/`: 39 original comic covers (Marvel Database / Fandom), one per film plus *Fantastic Four #5* (Doctor Doom) for the premiere. Marvel copyright; used as a non-commercial fan project with source credit.
- Short PT-BR synopses in the prototype were written for it; production uses TMDB pt-BR text.
- Film metadata and streaming must come from real sources (TMDB, whose provider data is from JustWatch), never invented.

## Product Principles

1. The deadline is the frame: every number relates to the premiere.
2. Next film first: the most common action (check off what I just watched, see what's next) is always one tap away.
3. Real data only: posters, runtimes, and dates are sourced, never fabricated.
4. Personal and celebratory: progress should feel like a reward, not a chore.
