import type { Catalog, Extra, Film, Offer, OfferKind } from './types';
import { countdownParts, dotDate, extraPath, filmPath, hm, longDate, parseProgressCode, saga } from './format';
import { INFO_PAGES, infoPath, type InfoPage } from './pages';
import { absUrl, site } from './site';

/** The Markdown twin of every page, served when a request asks for `Accept: text/markdown`. Pure: data in, text out. */
export type MdResult = { status: 200 | 404; body: string };

const link = (label: string, path: string) => `[${label}](${absUrl(path)})`;
const plural = (v: number, one: string, many: string) => `${v} ${v === 1 ? one : many}`;
const KIND: Record<OfferKind, string> = { flatrate: 'Assinatura', free: 'Grátis', ads: 'Grátis com anúncios', rent: 'Aluguel', buy: 'Compra' };

function offersMd(offers: Offer[], tmdb: boolean): string[] {
  if (!offers.length) return [tmdb ? 'Não está em nenhum streaming no Brasil agora.' : 'Streaming ainda sem dados para este título.'];
  const kinds = [...new Set(offers.map(o => o.kind))];
  return kinds.map(k => `- ${KIND[k]}: ${offers.filter(o => o.kind === k).map(o => (o.price ? `${o.name} (${o.price})` : o.name)).join(', ')}`);
}

/** where the premiere stands today, in words that never read "0 dias" */
export function countdownLine(finale: Catalog['finale'], now: number): string {
  if (now >= finale.premiereAt) {
    const since = Math.floor((now - finale.premiereAt) / 864e5);
    return since === 0
      ? `Hoje: ${finale.title} estreia nos cinemas do Brasil (${dotDate(finale.premiereAt)}).`
      : `${finale.title} está nos cinemas do Brasil há ${plural(since, 'dia', 'dias')}, desde ${dotDate(finale.premiereAt)}.`;
  }
  const c = countdownParts(finale.premiereAt, now);
  // leading zero units are left out: "Faltam 1 hora e 5 minutos", never "Faltam 0 dias, 1 hora"
  const units = [plural(c.d, 'dia', 'dias'), plural(c.h, 'hora', 'horas'), plural(c.m, 'minuto', 'minutos')];
  const lead = [c.d, c.h, c.m].findIndex(v => v > 0);
  const left = lead < 0 ? 'menos de 1 minuto' : units.slice(lead).join(', ').replace(/, ([^,]+)$/, ' e $1');
  return `${lead < 0 ? 'Falta' : 'Faltam'} ${left} para a estreia de ${finale.title} no Brasil, em ${longDate(finale.premiereAt)}.`;
}

const filmLine = (f: Film) => `${f.n}. ${link(f.title, filmPath(f.slug))} (${f.year}, ${hm(f.runtime)})`;
const extraLine = (x: Extra) => `- ${link(x.title, extraPath(x.slug))} (${x.year}${x.runtime ? `, ${hm(x.runtime)}` : x.note ? `, ${x.note}` : ''})`;

const footer = () => [
  '## Mais',
  `- ${link('Sobre', infoPath('about'))} · ${link('Contato', infoPath('contact'))} · ${link('Privacidade', infoPath('privacy'))}`,
  `- ${link('llms.txt (guia para agentes)', '/llms.txt')}`,
  `- ${link('Mapa do site (sitemap.xml)', '/sitemap.xml')}`,
  `- Código aberto: ${site.repo}`,
];

function homeMd(c: Catalog, now: number): string {
  const { films, finale, extras } = c;
  return [
    `# ${site.name}: maratona do MCU até ${finale.title}`,
    '',
    `${site.tagline} Cada um dos ${films.length} filmes aparece como a capa do gibi original que o inspirou, numa estante 3D. Projeto de fã, sem afiliação com a Marvel ou a Disney.`,
    '',
    `**${countdownLine(finale, now)}**`,
    '',
    '## Como funciona',
    '- A fila segue a ordem cronológica da história, não a de lançamento. O Nº 1 é ' + films[0].title + '.',
    '- Marque cada filme como visto; o site mostra o próximo da fila, as horas assistidas e o ritmo necessário por dia.',
    '- Sem conta, o progresso fica no navegador. Entrar por link mágico por e-mail (opcional) leva o progresso a outros aparelhos.',
    '- Cada filme tem uma página com ficha técnica, sinopse, o gibi de origem e onde assistir no Brasil.',
    '',
    `## A maratona em ordem cronológica (${films.length} filmes)`,
    ...films.map(filmLine),
    `${films.length + 1}. ${link(finale.title, filmPath(finale.slug))} (estreia ${dotDate(finale.premiereAt)})`,
    '',
    ...(extras.length ? ['## Extras fora da contagem', ...extras.map(extraLine), ''] : []),
    ...footer(),
  ].join('\n');
}

function filmMd(f: Film, c: Catalog): string {
  return [
    `# ${f.title}`,
    '',
    `Nº ${f.n} de ${c.films.length} na maratona cronológica do MCU · ${f.year} · ${hm(f.runtime)} · Fase ${f.phase} (${saga(f.phase)})${f.director ? ` · Direção: ${f.director}` : ''}`,
    ...(f.en && f.en !== f.title ? ['', `Título original: ${f.en}`] : []),
    '',
    f.synopsis,
    '',
    `Gibi de origem: ${f.comic}`,
    '',
    '## Onde assistir no Brasil',
    ...offersMd(f.offers, c.tmdb),
    '',
    `${link('Voltar à maratona', '/')} · ${link('Ver esta página como HTML', filmPath(f.slug))}`,
  ].join('\n');
}

function finaleMd(c: Catalog, now: number): string {
  const f = c.finale;
  return [
    `# ${f.title}`,
    '',
    `A estreia que a maratona espera: Nº ${f.n}, depois dos ${c.films.length} filmes da fila.${f.en && f.en !== f.title ? ` Título original: ${f.en}.` : ''}`,
    '',
    `**${countdownLine(f, now)}**`,
    '',
    f.synopsis,
    '',
    `Gibi de origem: ${f.comic}`,
    ...(f.ticketsUrl ? ['', `Ingressos: ${f.ticketsUrl}`] : []),
    '',
    link('Voltar à maratona', '/'),
  ].join('\n');
}

function extraMd(x: Extra, c: Catalog): string {
  return [
    `# ${x.title}`,
    '',
    `${x.kind === 'series' ? 'Série extra' : 'Filme extra dos X-Men'} da maratona do MCU, fora da conta do countdown · ${x.year}${x.runtime ? ` · ${hm(x.runtime)}` : x.note ? ` · ${x.note}` : ''}${x.director ? ` · ${x.kind === 'series' ? 'Criação' : 'Direção'}: ${x.director}` : ''}`,
    '',
    x.synopsis,
    '',
    '## Onde assistir no Brasil',
    ...offersMd(x.offers, c.tmdb),
    '',
    link('Voltar à maratona', '/'),
  ].join('\n');
}

function progressMd(seen: Set<number>, c: Catalog): string {
  const done = c.films.filter(f => seen.has(f.n));
  return [
    `# Um amigo viu ${done.length} de ${c.films.length} filmes do MCU`,
    '',
    `A maratona em ordem cronológica até ${c.finale.title}. Este link mostra a estante de quem o enviou, em modo leitura; quem abre começa a própria maratona do zero.`,
    '',
    ...(done.length ? ['## Filmes vistos', ...done.map(filmLine), ''] : []),
    link('Começar a minha maratona', '/'),
  ].join('\n');
}

export function infoMd(p: InfoPage): string {
  return [
    `# ${p.title}`,
    '',
    p.description,
    '',
    ...p.sections.flatMap(s => [`## ${s.heading}`, '', ...s.paragraphs.flatMap(t => [t, ''])]),
    link('Voltar ao início', '/'),
  ].join('\n');
}

/** shown for any path that is not a page: the status stays 404, the body says why and where to go next */
export function notFoundMd(path: string): string {
  const shown = path.replace(/[`\r\n]/g, '').slice(0, 120);
  return [
    '# Página não encontrada (404)',
    '',
    `O caminho \`${shown}\` não existe em ${absUrl('/')}. Pode ter sido digitado errado ou a página mudou de endereço.`,
    '',
    '## Para continuar',
    `- ${link('Início: a maratona do MCU em ordem cronológica', '/')}`,
    `- ${link('llms.txt: guia do site para agentes', '/llms.txt')}`,
    `- ${link('sitemap.xml: todas as páginas', '/sitemap.xml')}`,
    `- ${link('Sobre o projeto', infoPath('about'))}`,
  ].join('\n');
}

/** the Markdown for a request path, with the status the page itself would have */
export function markdownFor(rawPath: string, c: Catalog, now: number): MdResult {
  let path = rawPath.split(/[?#]/)[0];
  try { path = decodeURIComponent(path); } catch { return { status: 404, body: notFoundMd(path) }; }
  path = '/' + path.split('/').filter(Boolean).join('/');
  if (path === '/') return { status: 200, body: homeMd(c, now) };

  const [root, slug, ...rest] = path.slice(1).split('/');
  if (!rest.length && slug) {
    if (root === 'filme') {
      if (slug === c.finale.slug) return { status: 200, body: finaleMd(c, now) };
      const film = c.films.find(f => f.slug === slug);
      if (film) return { status: 200, body: filmMd(film, c) };
    }
    if (root === 'extra') {
      const extra = c.extras.find(x => x.slug === slug);
      if (extra) return { status: 200, body: extraMd(extra, c) };
    }
    if (root === 'progresso') {
      const seen = parseProgressCode(slug, c.films.length);
      if (seen) return { status: 200, body: progressMd(seen, c) };
    }
  }
  if (!slug) {
    const page = INFO_PAGES.find(p => p.slug === root);
    if (page) return { status: 200, body: infoMd(page) };
  }
  return { status: 404, body: notFoundMd(path) };
}

