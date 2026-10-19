import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCatalog } from '@/lib/catalog';
import { CountdownApp } from '@/components/CountdownApp';
import { JsonLd, filmLd, finaleLd } from '@/components/JsonLd';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { films, finale } = await getCatalog();
  return [...films.map(f => ({ slug: f.slug })), { slug: finale.slug }];
}

async function find(slug: string) {
  const catalog = await getCatalog();
  const film = catalog.films.find(f => f.slug === slug);
  if (film) return { catalog, n: film.n, title: film.title, text: film.synopsis, ld: filmLd(film) };
  if (catalog.finale.slug === slug) return { catalog, n: catalog.finale.n, title: catalog.finale.title, text: catalog.finale.synopsis, ld: finaleLd(catalog.finale) };
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hit = await find((await params).slug);
  if (!hit) return {};
  const description = `${hit.text} Veja onde assistir no Brasil e acompanhe a contagem regressiva para Vingadores: Doutor Destino.`;
  return {
    title: hit.title,
    description,
    alternates: { canonical: `/filme/${(await params).slug}` },
    openGraph: { title: `${hit.title} · Avengers Countdown`, description, type: 'website', locale: 'pt_BR' },
    twitter: { card: 'summary_large_image', title: `${hit.title} · Avengers Countdown`, description },
  };
}

/** the URL's own data (params) is read inside Suspense, so the shared shell never depends on one film */
async function FilmContent({ params }: Props) {
  const hit = await find((await params).slug);
  if (!hit) notFound();
  return (
    <>
      <JsonLd data={hit.ld} />
      <CountdownApp catalog={hit.catalog} initialN={hit.n} />
    </>
  );
}

export default function FilmPage({ params }: Props) {
  return (
    <Suspense fallback={<div id="loading">Arrumando a estante…</div>}>
      <FilmContent params={params} />
    </Suspense>
  );
}
