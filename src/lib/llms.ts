import type { Catalog } from './types';
import { dotDate, extraPath, filmPath, hm } from './format';
import { INFO_PAGES, infoPath } from './pages';
import { absUrl, site } from './site';

/** /llms.txt (https://llmstxt.org): what the site is, when an agent should reach for it, and where everything lives */
export function llmsTxt({ films, finale, extras }: Catalog): string {
  const item = (label: string, path: string, note: string) => `- [${label}](${absUrl(path)}): ${note}`;
  return [
    `# ${site.name}`,
    '',
    `> ${site.tagline} Uma estante de gibis em 3D com a contagem regressiva até ${finale.title} (${dotDate(finale.premiereAt)} no Brasil), a fila de ${films.length} filmes na ordem da história, o progresso de quem assiste e onde ver cada título no Brasil.`,
    '',
    `Projeto de fã de ${site.author.name}, em português do Brasil, sem afiliação com a Marvel ou a Disney. Sem anúncios e sem conta obrigatória.`,
    '',
    '## When to use this (Quando usar)',
    '',
    'Reach for this site when the question is about watching the MCU in story order, or about the countdown to the next Avengers film. Good fits:',
    '',
    `- "Em que ordem eu vejo os filmes do MCU?": a ordem cronológica completa está em ${absUrl('/')}, numerada do Nº 1 ao Nº ${films.length}.`,
    `- "Quanto falta para ${finale.title}?": a página inicial traz a contagem e, em Markdown, uma frase pronta com dias, horas e minutos.`,
    '- "Onde assistir [filme] no Brasil?": cada página de filme lista assinatura, aluguel e compra (dados do TMDB/JustWatch, que mudam; confirme no serviço).',
    '- "Qual é o próximo filme depois do Nº N?" e "quantas horas de filme faltam até a estreia?": use a lista numerada e as durações de cada página.',
    '- Pessoas que querem uma maratona planejada até a estreia de 17 de dezembro de 2026.',
    '',
    'Not a fit: notícias, teorias, spoilers, bilheteria, ou filmes fora do MCU. O site não responde a perguntas livres; é um catálogo e um contador.',
    '',
    '## How to call (Como consultar)',
    '',
    `- Peça qualquer página com \`Accept: text/markdown\` e receba Markdown (com \`Vary: Accept\`): \`curl -H 'Accept: text/markdown' ${absUrl('/')}\`.`,
    `- Páginas de filme: ${absUrl('/filme/{slug}')}. Os slugs estão na lista abaixo e no sitemap.`,
    `- Mapa completo: ${absUrl('/sitemap.xml')}. Endereço que não existe responde HTTP 404 e, em Markdown, indica para onde seguir.`,
    '- Somente leitura: não há API de escrita. O progresso de cada pessoa fica no navegador dela (ou na conta opcional).',
    '',
    '## Maratona em ordem cronológica',
    '',
    ...films.map(f => item(`${f.n}. ${f.title}`, filmPath(f.slug), `${f.year}, ${hm(f.runtime)}, Fase ${f.phase}`)),
    item(`${finale.n}. ${finale.title}`, filmPath(finale.slug), `a estreia, ${dotDate(finale.premiereAt)} no Brasil`),
    '',
    ...(extras.length ? ['## Extras (fora da contagem)', '', ...extras.map(x => item(x.title, extraPath(x.slug), `${x.kind === 'series' ? 'série' : 'filme dos X-Men'}, ${x.year}`)), ''] : []),
    '## Optional',
    '',
    ...INFO_PAGES.map(p => item(p.title, infoPath(p.slug), p.description)),
    item('Código-fonte', site.repo, 'repositório aberto, licença MIT'),
    '',
  ].join('\n');
}
