export type OfferKind = 'flatrate' | 'free' | 'ads' | 'rent' | 'buy';

export type Offer = {
  kind: OfferKind;
  providerKey: string;
  name: string;
  logo: string | null;
  price: string | null;
};

export type Film = {
  id: number;
  /** position in the chronological marathon, 1-based */
  n: number;
  slug: string;
  title: string;
  en: string;
  year: number;
  runtime: number;
  phase: number;
  director: string | null;
  synopsis: string;
  comic: string;
  cover: string;
  offers: Offer[];
};

/**
 * A side-quest outside the countdown math: a Disney+ series or an X-Men film.
 * `key` is its slot in the viewer's watched set (100+ series, 200+ X-Men), clear of the film numbers.
 */
export type Extra = {
  id: number;
  key: number;
  kind: 'series' | 'xmen';
  slug: string;
  title: string;
  en: string;
  year: number;
  /** minutes; null for series, which show `note` (seasons and episodes) instead */
  runtime: number | null;
  director: string | null;
  synopsis: string;
  note: string | null;
  offers: Offer[];
};

export type Finale = {
  id: number;
  n: number;
  slug: string;
  title: string;
  en: string;
  synopsis: string;
  comic: string;
  cover: string;
  /** epoch ms of the Brazilian premiere */
  premiereAt: number;
};

export type Catalog = {
  films: Film[];
  finale: Finale;
  extras: Extra[];
  /** true when streaming and PT-BR texts came from TMDB (key configured) */
  tmdb: boolean;
  offersCheckedAt: string | null;
};
