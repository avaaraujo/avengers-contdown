import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCatalog } from '@/lib/catalog';
import { CountdownApp } from '@/components/CountdownApp';
import { JsonLd, extraLd } from '@/components/JsonLd';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { extras } = await getCatalog();
  return extras.map(x => ({ slug: x.slug }));
}

async function find(slug: string) {
  const catalog = await getCatalog();
  const extra = catalog.extras.find(x => x.slug === slug);
  return extra ? { catalog, extra } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hit = await find(slug);
  if (!hit) return {};
  const { extra } = hit;
  const kind = extra.kind === 'series' ? 'Série extra' : 'Filme extra dos X-Men';
  const description = `${kind} da maratona do MCU. ${extra.synopsis} Veja onde assistir no Brasil.`;
  return {
    title: extra.title,
    description,
    alternates: { canonical: `/extra/${slug}` },
    openGraph: { title: `${extra.title} · Avengers Countdown`, description, type: 'website', locale: 'pt_BR' },
    twitter: { card: 'summary_large_image', title: `${extra.title} · Avengers Countdown`, description },
  };
}

/** An extra (Disney+ series or X-Men film): the shelf with the list open on it. */
async function ExtraContent({ params }: Props) {
  const hit = await find((await params).slug);
  if (!hit) notFound();
  return (
    <>
      <JsonLd data={extraLd(hit.extra)} />
      <CountdownApp catalog={hit.catalog} initialExtra={hit.extra.id} />
    </>
  );
}

export default function ExtraPage({ params }: Props) {
  return (
    <Suspense fallback={<div id="loading">Arrumando a estante…</div>}>
      <ExtraContent params={params} />
    </Suspense>
  );
}
