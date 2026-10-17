import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCatalog } from '@/lib/catalog';
import { CountdownApp } from '@/components/CountdownApp';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { films, finale } = await getCatalog();
  return [...films.map(f => ({ slug: f.slug })), { slug: finale.slug }];
}

async function find(slug: string) {
  const catalog = await getCatalog();
  const film = catalog.films.find(f => f.slug === slug);
  if (film) return { catalog, n: film.n, title: film.title, text: film.synopsis };
  if (catalog.finale.slug === slug) return { catalog, n: catalog.finale.n, title: catalog.finale.title, text: catalog.finale.synopsis };
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hit = await find((await params).slug);
  if (!hit) return {};
  const description = `${hit.text} Onde assistir no Brasil e a contagem para Vingadores: Doutor Destino.`;
  return {
    title: hit.title,
    description,
    alternates: { canonical: `/filme/${(await params).slug}` },
    openGraph: { title: `${hit.title} · Avengers Countdown`, description, type: 'website', locale: 'pt_BR' },
    twitter: { card: 'summary_large_image', title: `${hit.title} · Avengers Countdown`, description },
  };
}

export default async function FilmPage({ params }: Props) {
  const hit = await find((await params).slug);
  if (!hit) notFound();
  return <CountdownApp catalog={hit.catalog} initialN={hit.n} />;
}
