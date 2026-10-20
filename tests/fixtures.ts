import type { Catalog, Film } from '../src/lib/types';

const film = (n: number, over: Partial<Film> = {}): Film => ({
  id: n, n, slug: `filme-${n}`, title: `Filme ${n}`, en: `Movie ${n}`, year: 2008 + n, runtime: 120 + n, phase: n <= 3 ? 1 : 4,
  director: 'Diretora Teste', synopsis: `Sinopse do filme ${n}.`, comic: `Gibi #${n}`, cover: `/covers/${String(n).padStart(2, '0')}.webp`,
  offers: n === 1 ? [{ kind: 'flatrate', providerKey: 'dp', name: 'Disney+', logo: null, price: null }, { kind: 'rent', providerKey: 'ap', name: 'Apple TV', logo: null, price: 'R$ 12,90' }] : [],
  ...over,
});

export const PREMIERE = Date.UTC(2026, 11, 17, 3, 0, 0);

export const catalog: Catalog = {
  films: [film(1), film(2), film(3, { title: 'Thor', en: 'Thor' })],
  finale: { id: 99, n: 4, slug: 'avengers-doomsday', title: 'Vingadores: Doutor Destino', en: 'Avengers: Doomsday', synopsis: 'A estreia.', comic: 'Fantastic Four #5', cover: '/covers/39.webp', premiereAt: PREMIERE, ticketsUrl: null },
  extras: [{ id: 50, key: 101, kind: 'series', slug: 'wandavision', title: 'WandaVision', en: 'WandaVision', year: 2021, runtime: null, director: null, synopsis: 'Série.', note: '1 temporada', offers: [] }],
  tmdb: true,
  offersCheckedAt: null,
};
