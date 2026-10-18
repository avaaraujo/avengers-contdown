import type { Extra, Film, Finale } from '@/lib/types';
import { extraPath, filmPath } from '@/lib/format';
import { siteUrl } from '@/lib/site';

const abs = (path: string) => new URL(path, siteUrl).href;
const people = (names: string | null) => names?.split(/,\s*| e /).filter(Boolean).map(name => ({ '@type': 'Person', name }));
const duration = (min: number) => `PT${Math.floor(min / 60)}H${min % 60}M`;

export function filmLd(f: Film) {
  return {
    '@context': 'https://schema.org', '@type': 'Movie', name: f.title, alternateName: f.en, url: abs(filmPath(f.slug)),
    image: abs(f.cover), description: f.synopsis, datePublished: String(f.year), duration: duration(f.runtime), director: people(f.director),
  };
}
export function finaleLd(f: Finale) {
  return {
    '@context': 'https://schema.org', '@type': 'Movie', name: f.title, alternateName: f.en, url: abs(filmPath(f.slug)),
    image: abs(f.cover), description: f.synopsis,
    datePublished: new Date(f.premiereAt).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }),
  };
}
export function extraLd(x: Extra) {
  const common = { '@context': 'https://schema.org', name: x.title, alternateName: x.en, url: abs(extraPath(x.slug)), description: x.synopsis };
  return x.kind === 'series'
    ? { ...common, '@type': 'TVSeries', startDate: String(x.year), creator: people(x.director) }
    : { ...common, '@type': 'Movie', datePublished: String(x.year), duration: x.runtime ? duration(x.runtime) : undefined, director: people(x.director) };
}

/** structured data for search engines; `<` is escaped so a title can never close the script tag */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
