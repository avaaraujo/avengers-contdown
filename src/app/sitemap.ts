import type { MetadataRoute } from 'next';
import { getCatalog } from '@/lib/catalog';
import { extraPath, filmPath } from '@/lib/format';
import { siteUrl } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { films, finale, extras } = await getCatalog();
  const url = (path: string) => new URL(path, siteUrl).href;
  return [
    { url: url('/'), changeFrequency: 'daily', priority: 1 },
    ...films.map(f => ({ url: url(filmPath(f.slug)), changeFrequency: 'weekly' as const, priority: 0.8 })),
    { url: url(filmPath(finale.slug)), changeFrequency: 'daily', priority: 0.9 },
    ...extras.map(x => ({ url: url(extraPath(x.slug)), changeFrequency: 'weekly' as const, priority: 0.5 })),
  ];
}
