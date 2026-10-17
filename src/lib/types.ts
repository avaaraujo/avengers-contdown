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
  offersCheckedAt: string | null;
};
