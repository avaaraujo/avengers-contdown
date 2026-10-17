import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { cacheLife, cacheTag } from 'next/cache';
import type { Catalog, Film, Offer, OfferKind } from './types';

type TitleRow = {
  id: number;
  slug: string;
  kind: 'main' | 'finale' | 'series' | 'xmen';
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
 * The public catalog (films, the premiere, streaming offers). It holds no user data,
 * so it is cached on the server and prerendered into the static shell.
 */
export async function getCatalog(): Promise<Catalog> {
  'use cache';
  cacheLife('hours');
  cacheTag('catalog');

  // anonymous client: no cookies, read-only through RLS
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const [titles, offers, config] = await Promise.all([
    db.from('avengers_titles').select('id, slug, kind, chrono_order, title_pt, title_en, release_year, runtime_min, phase, director, synopsis_pt, comic_label, comic_cover').in('kind', ['main', 'finale']).order('chrono_order'),
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
  const f = rows.find(r => r.kind === 'finale');
  if (!f) throw new Error('avengers_titles has no finale row');
  const premiere = (config.data as { value: { at: string } }).value;

  return {
    films,
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
    },
    offersCheckedAt: checkedAt,
  };
}
