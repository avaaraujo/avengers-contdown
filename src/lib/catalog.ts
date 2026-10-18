import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { cacheLife, cacheTag } from 'next/cache';
import type { Catalog, Extra, Film, Offer, OfferKind } from './types';
import { getTmdbInfo, type TmdbInfo, type TmdbQuery } from './tmdb';

type TitleRow = {
  id: number;
  slug: string;
  kind: 'main' | 'finale' | 'series' | 'xmen';
  tmdb_id: number | null;
  note: string | null;
  chrono_order: number;
  title_pt: string;
  title_en: string;
  release_year: number | null;
  runtime_min: number | null;
  phase: number | null;
  director: string | null;
  synopsis_pt: string | null;
  comic_label: string | null;
  comic_cover: string | null;
};
type OfferRow = {
  title_id: number;
  kind: OfferKind;
  provider_key: string;
  provider_name: string;
  logo_url: string | null;
  price: string | null;
  fetched_at: string;
};

/**
 * The public catalog (films, extras, the premiere, streaming offers). It holds no user data,
 * so it is cached on the server and prerendered into the static shell. The database is the base;
 * TMDB (when TMDB_API_KEY is set) overlays pt-BR texts and fresh streaming, refreshed daily.
 */
export async function getCatalog(): Promise<Catalog> {
  const base = await getBaseCatalog();
  const queries: TmdbQuery[] = [...base.films, ...base.extras].map(t => ({
    id: t.id, type: 'kind' in t && t.kind === 'series' ? 'tv' : 'movie', titleEn: t.en, year: t.year, tmdbId: base.tmdbIds[t.id] ?? null,
  }));
  const prices: [string, string][] = [];
  for (const t of [...base.films, ...base.extras]) for (const o of t.offers) if (o.price) prices.push([`${o.kind}:${o.name.toLowerCase()}`, o.price]);
  const info = new Map<number, TmdbInfo>(await getTmdbInfo(queries, prices));
  if (!info.size) return { ...base, tmdb: false };

  const offersOf = (id: number, fallback: Offer[]) => info.get(id)?.offers ?? fallback;
  return {
    ...base,
    tmdb: true,
    films: base.films.map(f => {
      const i = info.get(f.id);
      return i ? { ...f, title: i.title ?? f.title, synopsis: i.overview ?? f.synopsis, runtime: i.runtime ?? f.runtime, offers: offersOf(f.id, f.offers) } : f;
    }),
    extras: base.extras.map(x => {
      const i = info.get(x.id);
      return i ? { ...x, title: i.title ?? x.title, synopsis: i.overview ?? x.synopsis, runtime: x.kind === 'xmen' ? i.runtime ?? x.runtime : null, offers: offersOf(x.id, x.offers) } : x;
    }),
  };
}

type BaseCatalog = Omit<Catalog, 'tmdb'> & { tmdbIds: Record<number, number> };

async function getBaseCatalog(): Promise<BaseCatalog> {
  'use cache';
  cacheLife('hours');
  cacheTag('catalog');

  // anonymous client: no cookies, read-only through RLS
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const [titles, offers, config] = await Promise.all([
    db.from('avengers_titles').select('id, slug, kind, chrono_order, title_pt, title_en, release_year, runtime_min, phase, director, synopsis_pt, comic_label, comic_cover, tmdb_id, note').in('kind', ['main', 'finale', 'series', 'xmen']).order('chrono_order'),
    db.from('avengers_offers').select('title_id, kind, provider_key, provider_name, logo_url, price, fetched_at'),
    db.from('avengers_config').select('value').eq('key', 'premiere').single(),
  ]);
  if (titles.error) throw titles.error;
  if (offers.error) throw offers.error;
  if (config.error) throw config.error;

  const offersByTitle = new Map<number, Offer[]>();
  let checkedAt: string | null = null;
  for (const o of offers.data as OfferRow[]) {
    const list = offersByTitle.get(o.title_id) ?? [];
    list.push({ kind: o.kind, providerKey: o.provider_key, name: o.provider_name, logo: o.logo_url, price: o.price });
    offersByTitle.set(o.title_id, list);
    if (!checkedAt || o.fetched_at > checkedAt) checkedAt = o.fetched_at;
  }

  const rows = titles.data as TitleRow[];
  const films: Film[] = rows.filter(r => r.kind === 'main').map(r => ({
    id: r.id,
    n: r.chrono_order,
    slug: r.slug,
    title: r.title_pt,
    en: r.title_en,
    year: r.release_year ?? 0,
    runtime: r.runtime_min ?? 0,
    phase: r.phase ?? 0,
    director: r.director,
    synopsis: r.synopsis_pt ?? '',
    comic: r.comic_label ?? '',
    cover: r.comic_cover ?? '',
    offers: offersByTitle.get(r.id) ?? [],
  }));
  const extras: Extra[] = rows.filter(r => r.kind === 'series' || r.kind === 'xmen').map(r => ({
    id: r.id,
    key: (r.kind === 'series' ? 100 : 200) + r.chrono_order,
    kind: r.kind as 'series' | 'xmen',
    slug: r.slug,
    title: r.title_pt,
    en: r.title_en,
    year: r.release_year ?? 0,
    runtime: r.runtime_min,
    director: r.director,
    synopsis: r.synopsis_pt ?? '',
    note: r.note,
    offers: offersByTitle.get(r.id) ?? [],
  }));
  const tmdbIds: Record<number, number> = {};
  for (const r of rows) if (r.tmdb_id) tmdbIds[r.id] = r.tmdb_id;
  const f = rows.find(r => r.kind === 'finale');
  if (!f) throw new Error('avengers_titles has no finale row');
  const premiere = (config.data as { value: { at: string; tickets_url?: string } }).value;

  return {
    films,
    extras,
    tmdbIds,
    finale: {
      id: f.id,
      n: f.chrono_order,
      slug: f.slug,
      title: f.title_pt,
      en: f.title_en,
      synopsis: f.synopsis_pt ?? '',
      comic: f.comic_label ?? '',
      cover: f.comic_cover ?? '',
      premiereAt: new Date(premiere.at).getTime(),
      ticketsUrl: premiere.tickets_url?.startsWith('https://') ? premiere.tickets_url : null,
    },
    offersCheckedAt: checkedAt,
  };
}
