import { site } from './site';

/** An institutional page (About, Contact, Privacy). One source for the HTML page, the Markdown twin and llms.txt. */
export type InfoPage = {
  slug: 'about' | 'contact' | 'privacy';
  title: string;
  description: string;
  sections: { heading: string; paragraphs: string[] }[];
};

const contactWays = [
  `Pelo site da autora, em ${site.author.url.replace('https://', '')}, que reúne os outros projetos e os canais de contato dela.`,
  `Abrindo uma issue pública no repositório do projeto: ${site.issues}.`,
  ...(site.email ? [`Por e-mail: ${site.email}.`] : []),
];

export const INFO_PAGES: InfoPage[] = [
  {
    slug: 'about',
    title: 'Sobre o Avengers Countdown',
    description: 'O que é o Avengers Countdown, de onde vêm os dados e quem faz o projeto.',
    sections: [
      {
        heading: 'O que é',
        paragraphs: [
          'O Avengers Countdown é uma estante de gibis em 3D para maratonar o Universo Cinematográfico da Marvel (MCU) em ordem cronológica, do Nº 1 até a estreia de Vingadores: Doutor Destino, marcada para 17 de dezembro de 2026 no Brasil.',
          'Cada um dos 38 filmes aparece como a capa do gibi original que o inspirou. Quem marca um filme como visto vê o gibi sair do saco plástico e ganhar cor. O site mostra a contagem regressiva até a estreia, o próximo filme da fila, as horas já assistidas e o ritmo necessário por dia para chegar pronto ao cinema.',
        ],
      },
      {
        heading: 'Por que a ordem cronológica',
        paragraphs: [
          'A fila segue a ordem em que os eventos acontecem na história, não a ordem de lançamento dos filmes. Por isso o Nº 1 é Capitão América: O Primeiro Vingador. Quem prefere a ordem de lançamento pode trocar pela opção Ordenar, e o filme exibido como próximo continua sendo o primeiro da fila ainda não visto.',
        ],
      },
      {
        heading: 'De onde vêm os dados',
        paragraphs: [
          'O catálogo de filmes, séries e extras fica num banco de dados próprio. Quando disponíveis, títulos e sinopses em português do Brasil e a lista de onde assistir vêm do TMDB, que por sua vez usa dados do JustWatch. As capas dos gibis são do Marvel Database. Os dados de streaming mudam com frequência e podem estar desatualizados: confirme no serviço antes de assinar.',
        ],
      },
      {
        heading: 'Quem faz',
        paragraphs: [
          `O projeto é feito e mantido por ${site.author.name} (${site.author.url}). O código é aberto, com licença MIT, e está em ${site.repo}.`,
          'É um projeto de fã, sem fins lucrativos e sem afiliação com a Marvel ou a Disney. Marvel, Vingadores e os nomes e imagens relacionados são marcas e obras de seus respectivos donos.',
        ],
      },
    ],
  },
  {
    slug: 'contact',
    title: 'Contato',
    description: 'Como falar com quem faz o Avengers Countdown: correções, sugestões e pedidos de privacidade.',
    sections: [
      {
        heading: 'Como falar com a gente',
        paragraphs: [
          'O Avengers Countdown é um projeto pessoal, mantido nas horas livres por uma pessoa só. Mensagens são bem-vindas e lidas, mas não há prazo garantido de resposta. Estes são os canais:',
          ...contactWays,
        ],
      },
      {
        heading: 'Sobre o que escrever',
        paragraphs: [
          'Erros nos dados: um filme fora do lugar na ordem cronológica, uma sinopse errada, uma capa trocada ou um streaming que mudou de catálogo.',
          'Problemas no uso: algo que não abre, não salva o progresso ou não funciona com o seu leitor de tela ou o seu teclado. Conte qual aparelho e navegador você usa.',
          'Pedidos sobre os seus dados: quem criou uma conta com link mágico pode pedir a exclusão do e-mail e do progresso guardados. Os detalhes estão na página de privacidade.',
        ],
      },
      {
        heading: 'Para agentes e automações',
        paragraphs: [
          'Há um resumo do site em formato próprio para agentes em /llms.txt, e cada página responde em Markdown quando o pedido traz o cabeçalho Accept: text/markdown.',
        ],
      },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacidade',
    description: 'Que dados o Avengers Countdown guarda, onde ficam e como pedir a exclusão.',
    sections: [
      {
        heading: 'Resumo',
        paragraphs: [
          'O Avengers Countdown não tem anúncios, não vende dados e não usa ferramentas de análise ou rastreamento de terceiros. Dá para usar o site inteiro sem criar conta e sem informar nenhum dado pessoal.',
        ],
      },
      {
        heading: 'O que fica no seu navegador',
        paragraphs: [
          'Sem conta, os filmes que você marca como vistos ficam só no armazenamento local do seu navegador (a chave ac-watched). O site também lembra a ordem escolhida na estante (ac-order) e se você já viu a mensagem de boas-vindas de um link compartilhado (ac-welcomed). Nada disso sai do seu aparelho, e limpar os dados do site apaga tudo.',
          'O site instala um service worker para abrir a estante sem conexão. Ele guarda apenas arquivos do próprio site.',
        ],
      },
      {
        heading: 'Conta opcional',
        paragraphs: [
          'Se você escolher entrar, informa um e-mail e recebe um link mágico, sem senha. O login é feito pelo Supabase. Guardamos o seu e-mail e a lista de filmes que você marcou, com data, para mostrar o mesmo progresso em qualquer aparelho. Cada pessoa só consegue ler e alterar as próprias linhas. O navegador guarda uma sessão enquanto você estiver conectado. Você pode sair a qualquer momento, e o progresso feito antes do login é somado ao da conta.',
          'Para apagar o e-mail e o progresso da conta, peça pelos canais da página de contato.',
        ],
      },
      {
        heading: 'Links de progresso compartilhado',
        paragraphs: [
          'O botão Compartilhar gera um link que traz, dentro do próprio endereço, um código com os filmes que você viu. O código não contém nome, e-mail nem qualquer identificação. Quem receber o link vê a sua estante em modo leitura, e quem abrir o link não passa a ter conta nem progresso guardado por causa dele.',
        ],
      },
      {
        heading: 'Serviços de terceiros',
        paragraphs: [
          'A hospedagem é da Vercel, que registra o acesso técnico (como o endereço IP e o navegador) nos logs normais de servidor. O banco e o login são do Supabase. Os dados de streaming são buscados pelo servidor no TMDB, sem enviar nada seu. Já os logotipos dos serviços de streaming, na página de cada filme, são carregados direto do TMDB, que por isso pode ver o endereço IP de quem abre essa página. As fontes e as capas são servidas pelo próprio site.',
        ],
      },
      {
        heading: 'Mudanças',
        paragraphs: [
          'Se algo disso mudar, esta página será atualizada junto com o código, que é aberto e tem o histórico público.',
        ],
      },
    ],
  },
];

export const infoPage = (slug: string) => INFO_PAGES.find(p => p.slug === slug) ?? null;
export const infoPath = (slug: InfoPage['slug']) => `/${slug}`;

/** the plain text of a page, to check it carries enough substance */
export const infoText = (p: InfoPage) => p.sections.flatMap(s => [s.heading, ...s.paragraphs]).join(' ');
