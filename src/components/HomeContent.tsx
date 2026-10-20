import Link from 'next/link';
import type { Catalog } from '@/lib/types';
import { dotDate, extraPath, filmPath, hm } from '@/lib/format';
import { INFO_PAGES, infoPath } from '@/lib/pages';
import { site } from '@/lib/site';

/**
 * The shelf is a canvas, so this is its text twin: what the site is and the whole marathon as plain links.
 * It is in the HTML the server sends (no script needed), reads aloud for screen readers, and stays out of sight.
 * The page's single <h1> lives in the app; headings here continue from it.
 * Its links stay out of the Tab order (they would be invisible stops); screen readers still list them.
 */
export function HomeContent({ catalog }: { catalog: Catalog }) {
  const { films, finale, extras } = catalog;
  return (
    <main className="sr-only">
      <h2>O que é o {site.name}</h2>
      <p>
        {site.tagline} É uma estante de gibis em 3D: cada um dos {films.length} filmes aparece como a capa do gibi original que o inspirou.
        O site mostra a contagem regressiva até {finale.title}, que estreia no Brasil em {dotDate(finale.premiereAt)}, o próximo filme da fila,
        as horas já assistidas e o ritmo necessário por dia para chegar pronto ao cinema.
      </p>
      <p>
        A fila segue a ordem cronológica da história, não a de lançamento, por isso o Nº 1 é {films[0].title}. Cada filme tem uma página com ficha técnica,
        sinopse, o gibi de origem e onde assistir no Brasil. Sem conta, o progresso fica salvo neste navegador; entrar por e-mail é opcional.
        Projeto de fã de {site.author.name}, sem afiliação com a Marvel ou a Disney.
      </p>
      <h2>A maratona em ordem cronológica</h2>
      <ol>
        {films.map(f => (
          <li key={f.n}><Link tabIndex={-1} href={filmPath(f.slug)}>{f.title}</Link> ({f.year}, {hm(f.runtime)})</li>
        ))}
        <li><Link tabIndex={-1} href={filmPath(finale.slug)}>{finale.title}</Link> (estreia {dotDate(finale.premiereAt)})</li>
      </ol>
      {extras.length > 0 && (
        <>
          <h2>Extras fora da contagem</h2>
          <ul>{extras.map(x => <li key={x.id}><Link tabIndex={-1} href={extraPath(x.slug)}>{x.title}</Link> ({x.year})</li>)}</ul>
        </>
      )}
      <h2>Sobre o projeto</h2>
      <ul>{INFO_PAGES.map(p => <li key={p.slug}><Link tabIndex={-1} href={infoPath(p.slug)}>{p.title}</Link></li>)}</ul>
    </main>
  );
}
