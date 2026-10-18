export const hm = (min: number) => {
  const h = Math.floor(min / 60), m = Math.round(min % 60);
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
};
export const dec = (x: number, d = 1) => x.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
export const pad = (n: number) => String(n).padStart(2, '0');

export function countdownParts(target: number, now: number) {
  let ms = Math.max(0, target - now);
  const d = Math.floor(ms / 864e5); ms -= d * 864e5;
  const h = Math.floor(ms / 36e5); ms -= h * 36e5;
  const m = Math.floor(ms / 6e4);
  const s = Math.floor((ms - m * 6e4) / 1e3);
  return { d, h, m, s };
}

export const saga = (phase: number) => (phase <= 3 ? 'Saga do Infinito' : 'Saga do Multiverso');

/** the small copy of a comic cover (384px wide), for phones and thumbnails */
export const thumb = (cover: string) => cover.replace('/covers/', '/covers/sm/');

/** where a film's detail lives; the premiere has its own page too */
export const filmPath = (slug: string) => `/filme/${slug}`;

/** the premiere is a Brazilian date: format it in Brasília time wherever the code runs */
const BR = { timeZone: 'America/Sao_Paulo' } as const;
/** 17.12.2026 */
export const dotDate = (ms: number) =>
  new Date(ms).toLocaleDateString('pt-BR', { ...BR, day: '2-digit', month: '2-digit', year: 'numeric' }).replaceAll('/', '.');
/** 17 de dezembro de 2026 */
export const longDate = (ms: number) => new Date(ms).toLocaleDateString('pt-BR', { ...BR, day: 'numeric', month: 'long', year: 'numeric' });

/** an extra (series or X-Men film) has its own page too */
export const extraPath = (slug: string) => `/extra/${slug}`;

/** the watched films as a short base-36 bitmask, for share links: bit n-1 is film Nº n */
export function progressCode(seen: Iterable<number>, films: number) {
  let v = 0;
  for (const n of seen) if (Number.isInteger(n) && n >= 1 && n <= films) v += 2 ** (n - 1);
  return v.toString(36);
}
export function parseProgressCode(code: string, films: number): Set<number> | null {
  if (!/^[0-9a-z]{1,11}$/.test(code)) return null;
  const v = parseInt(code, 36);
  if (!Number.isSafeInteger(v) || v >= 2 ** films) return null;
  const seen = new Set<number>();
  for (let n = 1; n <= films; n++) if (Math.floor(v / 2 ** (n - 1)) % 2) seen.add(n);
  return seen;
}
