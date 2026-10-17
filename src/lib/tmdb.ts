import 'server-only';
import { cacheLife } from 'next/cache';
import type { Offer, OfferKind } from './types';

const API = 'https://api.themoviedb.org/3';
const LOGO = 'https://image.tmdb.org/t/p/w92';
const KINDS: OfferKind[] = ['flatrate', 'free', 'ads', 'rent', 'buy'];

export type TmdbQuery = { id: number; type: 'movie' | 'tv'; titleEn: string; year: number; tmdbId: number | null };
export type TmdbInfo = { tmdbId: number; title: string | null; overview: string | null; runtime: number | null; offers: Offer[] | null };

type Raw = {
  id: number; title?: string; name?: string; original_title?: string; original_name?: string; overview?: string; runtime?: number;
  'watch/providers'?: { results?: Record<string, Record<string, unknown>> };
};

/** TMDB accepts a v4 "read access token" (a long JWT) as a Bearer header, or a v3 key as a query parameter. */
async function call<T>(path: string, params: Record<string, string>): Promise<T> {
  const key = process.env.TMDB_API_KEY!;
  const bearer = key.length > 40;
  const url = new URL(API + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  if (!bearer) url.searchParams.set('api_key', key);
  const res = await fetch(url, { headers: bearer ? { Authorization: `Bearer ${key}` } : undefined, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`TMDB ${res.status} ${path}`);
  return res.json() as Promise<T>;
}

async function findId(q: TmdbQuery): Promise<number | null> {
  if (q.tmdbId) return q.tmdbId;
  const yearParam = q.type === 'movie' ? 'year' : 'first_air_date_year';
  const found = await call<{ results: Raw[] }>(`/search/${q.type}`, { query: q.titleEn, [yearParam]: String(q.year), language: 'en-US' });
  const norm = (x?: string) => (x ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const exact = found.results.find(r => [r.title, r.name, r.original_title, r.original_name].some(t => norm(t) === norm(q.titleEn)));
  return (exact ?? found.results[0])?.id ?? null;
}

function toOffers(raw: Raw, prices: Map<string, string>): Offer[] | null {
  const br = raw['watch/providers']?.results?.BR as (Record<string, { provider_id: number; provider_name: string; logo_path: string | null }[]> | undefined);
  if (!br) return null;
  const out: Offer[] = [];
  for (const kind of KINDS) {
    for (const p of br[kind] ?? []) {
      out.push({
        kind, providerKey: `tmdb-${p.provider_id}`, name: p.provider_name,
        logo: p.logo_path ? LOGO + p.logo_path : null,
        price: kind === 'rent' || kind === 'buy' ? prices.get(`${kind}:${p.provider_name.toLowerCase()}`) ?? null : null,
      });
    }
  }
  return out;
}

/**
 * Titles and synopses in pt-BR plus the Brazilian streaming list, straight from TMDB (whose provider data is JustWatch's).
 * Cached for a day, so streaming is refreshed daily. Without TMDB_API_KEY it returns nothing and the database values stand.
 * `prices` carries over the rent/buy prices we already have, which TMDB does not provide.
 */
export async function getTmdbInfo(queries: TmdbQuery[], prices: [string, string][]): Promise<[number, TmdbInfo][]> {
  'use cache';
  cacheLife('days');
  if (!process.env.TMDB_API_KEY) return [];

  const priceMap = new Map(prices);
  const result: [number, TmdbInfo][] = [];
  let failed = 0;
  const queue = [...queries];
  const worker = async () => {
    for (let q = queue.shift(); q; q = queue.shift()) {
      try {
        const tmdbId = await findId(q);
        if (!tmdbId) { failed++; continue; }
        const raw = await call<Raw>(`/${q.type}/${tmdbId}`, { language: 'pt-BR', append_to_response: 'watch/providers' });
        result.push([q.id, {
          tmdbId,
          title: raw.title ?? raw.name ?? null,
          overview: raw.overview || null,
          runtime: q.type === 'movie' && raw.runtime ? raw.runtime : null,
          offers: toOffers(raw, priceMap),
        }]);
      } catch { failed++; }
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  if (failed) cacheLife('minutes'); // a partial result should not stick for a day
  return result;
}
