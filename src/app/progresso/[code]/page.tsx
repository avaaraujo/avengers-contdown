import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCatalog } from '@/lib/catalog';
import { parseProgressCode } from '@/lib/format';
import { CountdownApp } from '@/components/CountdownApp';

type Props = { params: Promise<{ code: string }> };

// any watched set is a valid link; these are rendered on first visit and cached
export async function generateStaticParams() {
  return [{ code: '0' }];
}

async function find(code: string) {
  const catalog = await getCatalog();
  const seen = parseProgressCode(code, catalog.films.length);
  return seen ? { catalog, seen } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hit = await find((await params).code);
  if (!hit) return {};
  const { films, finale } = hit.catalog;
  const title = `Um amigo assistiu a ${hit.seen.size} de ${films.length} filmes do MCU`;
  const description = `Uma maratona do MCU em ordem cronológica até ${finale.title}. Comece a sua e acompanhe o que falta.`;
  return {
    title,
    description,
    alternates: { canonical: '/' },
    robots: { index: false, follow: true },
    openGraph: { title: `${title} · Avengers Countdown`, description, type: 'website', locale: 'pt_BR' },
    twitter: { card: 'summary_large_image', title: `${title} · Avengers Countdown`, description },
  };
}

/** A shared progress link: the card shows the sender's shelf; the page is the visitor's own marathon. */
async function ProgressContent({ params }: Props) {
  const hit = await find((await params).code);
  if (!hit) notFound();
  return <CountdownApp catalog={hit.catalog} sharedSeen={[...hit.seen]} />;
}

export default function ProgressPage({ params }: Props) {
  return (
    <Suspense fallback={<div id="loading">Arrumando a estante…</div>}>
      <ProgressContent params={params} />
    </Suspense>
  );
}
