import type { Metadata } from 'next';
import Link from 'next/link';
import { INFO_PAGES, infoPath, type InfoPage } from '@/lib/pages';
import { JsonLd } from './JsonLd';
import { absUrl, site } from '@/lib/site';

/** metadata for one institutional page */
export function infoMetadata(p: InfoPage): Metadata {
  const title = p.title;
  return {
    title,
    description: p.description,
    alternates: { canonical: infoPath(p.slug) },
    openGraph: { title: `${title} · ${site.name}`, description: p.description, type: 'website', locale: 'pt_BR' },
    twitter: { card: 'summary_large_image', title: `${title} · ${site.name}`, description: p.description },
  };
}

const LD_TYPE = { about: 'AboutPage', contact: 'ContactPage', privacy: 'WebPage' } as const;

/** About, Contact and Privacy: plain reading pages in the wall's colors, outside the shelf */
export function InfoPageView({ page }: { page: InfoPage }) {
  return (
    <main className="info">
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': LD_TYPE[page.slug], name: page.title, description: page.description,
        url: absUrl(infoPath(page.slug)), inLanguage: 'pt-BR', isPartOf: { '@type': 'WebSite', name: site.name, url: absUrl('/') },
      }} />
      <Link className="info-back" href="/">← Voltar para a estante</Link>
      <h1>{page.title}</h1>
      <p className="info-lead">{page.description}</p>
      {page.sections.map(s => (
        <section key={s.heading}>
          <h2>{s.heading}</h2>
          {s.paragraphs.map(t => <p key={t}>{linkify(t)}</p>)}
        </section>
      ))}
      <nav className="info-nav" aria-label="Páginas do projeto">
        {INFO_PAGES.map(p => (p.slug === page.slug
          ? <span key={p.slug} aria-current="page">{p.title.replace('Sobre o Avengers Countdown', 'Sobre')}</span>
          : <Link key={p.slug} href={infoPath(p.slug)}>{p.title.replace('Sobre o Avengers Countdown', 'Sobre')}</Link>))}
      </nav>
    </main>
  );
}

/** URLs and the e-mail in a paragraph become links; a closing period or comma stays outside */
function linkify(text: string): React.ReactNode[] {
  return text.split(/(https?:\/\/\S+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g).map((part, i) => {
    const url = /^https?:\/\//.test(part);
    if (!url && !part.includes('@')) return part;
    const tail = /[.,;:)]+$/.exec(part)?.[0] ?? '';
    const core = part.slice(0, part.length - tail.length);
    return <span key={i}><a href={url ? core : `mailto:${core}`} rel={url ? 'noopener' : undefined}>{core}</a>{tail}</span>;
  });
}
