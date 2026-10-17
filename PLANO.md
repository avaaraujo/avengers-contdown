# Avengers Countdown: plano

Site pessoal (e multiusuário) para maratonar o MCU em ordem cronológica antes da estreia de **Vingadores: Doutor Destino** (*Avengers: Doomsday*) em **17/12/2026**, a data listada para o Brasil no Ingresso.com.

## 0. Direção escolhida: a estante de gibis em 3D

Junção da **Estante do Colecionador** com o **Gibi Marvel**, feita em **three.js**. Protótipo funcionando em [`prototype/`](prototype/index.html) (rode `node prototype/serve.mjs` e abra http://localhost:5174).

- **A estante:** uma parede escura com prateleiras de laca vermelha. Os 38 filmes aparecem em ordem cronológica, cada um representado pela **capa do gibi original que inspirou o filme** (ex.: *Os Vingadores* → *The Avengers #1*, 1963).
- **Visto × não visto:** os gibis não vistos ficam no saco plástico de colecionador, em preto e branco e apagados. Ao marcar um filme, o gibi sai do saco, ganha cor e recebe o carimbo **VISTO!**.
- **Próximo:** o próximo filme fica puxado para fora da prateleira, meio aceso, com etiqueta amarela.
- **O fim da estante:** a edição Nº 39 é *Fantastic Four #5* (1962, primeira aparição do Doutor Destino), num case de gibi graduado (slab) com a contagem regressiva na etiqueta.
- **Detalhe:** ao clicar, o gibi sai da prateleira e vem para a frente. O painel ao lado (ou uma folha que sobe, no celular) mostra ficha, sinopse, o gibi de origem, **onde assistir no Brasil** e o botão de marcar.
- **HUD:** countdown monumental e o card "Próximo" em cima; os números e a barra de progresso embaixo. Há também uma lista em texto, que serve para acessibilidade e de alternativa sem WebGL.

## 1. O que o site faz

| Área | Conteúdo |
|---|---|
| **Countdown** | Dias, horas, minutos e segundos até 17/12/2026. A data fica salva no banco, então dá para mudar sem deploy se a estreia mudar. |
| **Próximo filme** | O primeiro filme ainda não assistido na ordem, com botão de marcar. É a ação principal do site. |
| **Lista principal** | 38 filmes do MCU em ordem cronológica da história, cada um com a capa do gibi de origem, título PT/EN, ano, duração, fase, diretor e sinopse curta. |
| **Onde assistir** | No detalhe de cada filme: plataformas no Brasil separadas em assinatura, aluguel e compra, com o ícone de cada uma. Hoje quase tudo está no Disney+; *O Incrível Hulk* não está em nenhum streaming; os filmes do Homem-Aranha estão espalhados (Netflix, HBO Max, Universal+, aluguel). |
| **Progresso** | Barra de progresso com X de 38 filmes e % das horas. |
| **Big numbers** | Horas assistidas · horas restantes · filmes faltando · **filmes por dia necessários** · **horas por dia necessárias** · previsão de término no ritmo atual (ex.: "nesse ritmo você termina em 02/12, 15 dias antes"). |
| **Extras** | Lista curta e separada de recomendações: séries essenciais do Disney+ e filmes essenciais dos X-Men da Fox. Também dá para marcar, mas não entram na conta principal. |
| **Contas** | Qualquer pessoa vê a contagem e a lista; para marcar filmes precisa entrar (Supabase Auth, link mágico por e-mail). Cada pessoa tem o próprio progresso. |

## 2. Lista principal (ordem cronológica)

Ordem da linha do tempo da Disney+. As durações vão ser conferidas no TMDB na hora de popular o banco.

| # | Filme | Ano | min |
|---|---|---|---|
| 1 | Capitão América: O Primeiro Vingador | 2011 | 124 |
| 2 | Capitã Marvel | 2019 | 123 |
| 3 | Homem de Ferro | 2008 | 126 |
| 4 | Homem de Ferro 2 | 2010 | 124 |
| 5 | O Incrível Hulk | 2008 | 112 |
| 6 | Thor | 2011 | 115 |
| 7 | Os Vingadores | 2012 | 143 |
| 8 | Thor: O Mundo Sombrio | 2013 | 112 |
| 9 | Homem de Ferro 3 | 2013 | 130 |
| 10 | Capitão América: O Soldado Invernal | 2014 | 136 |
| 11 | Guardiões da Galáxia | 2014 | 121 |
| 12 | Guardiões da Galáxia Vol. 2 | 2017 | 136 |
| 13 | Vingadores: Era de Ultron | 2015 | 141 |
| 14 | Homem-Formiga | 2015 | 117 |
| 15 | Capitão América: Guerra Civil | 2016 | 147 |
| 16 | Viúva Negra | 2021 | 134 |
| 17 | Pantera Negra | 2018 | 134 |
| 18 | Homem-Aranha: De Volta ao Lar | 2017 | 133 |
| 19 | Doutor Estranho | 2016 | 115 |
| 20 | Thor: Ragnarok | 2017 | 130 |
| 21 | Homem-Formiga e a Vespa | 2018 | 118 |
| 22 | Vingadores: Guerra Infinita | 2018 | 149 |
| 23 | Vingadores: Ultimato | 2019 | 181 |
| 24 | Shang-Chi e a Lenda dos Dez Anéis | 2021 | 132 |
| 25 | Eternos | 2021 | 156 |
| 26 | Homem-Aranha: Longe de Casa | 2019 | 129 |
| 27 | Homem-Aranha: Sem Volta para Casa | 2021 | 148 |
| 28 | Doutor Estranho no Multiverso da Loucura | 2022 | 126 |
| 29 | Thor: Amor e Trovão | 2022 | 119 |
| 30 | Pantera Negra: Wakanda para Sempre | 2022 | 161 |
| 31 | Homem-Formiga e a Vespa: Quantumania | 2023 | 125 |
| 32 | Guardiões da Galáxia Vol. 3 | 2023 | 150 |
| 33 | As Marvels | 2023 | 105 |
| 34 | Deadpool & Wolverine | 2024 | 128 |
| 35 | Capitão América: Admirável Mundo Novo | 2025 | 118 |
| 36 | Thunderbolts* | 2025 | 127 |
| 37 | Quarteto Fantástico: Primeiros Passos | 2025 | 115 |
| 38 | Homem-Aranha: Um Novo Dia | 2026 | 145 |

As durações conferidas (JustWatch) e o gibi de origem de cada filme estão em [`prototype/data.js`](prototype/data.js). Somam 4.994 min ≈ **83 horas** no total. Com 61 dias até a estreia, dá cerca de **0,6 filme por dia** (1h20 por dia) começando hoje.

**Extras propostos (curtos, não exaustivos):**
- Séries: *Loki* (T1 e T2; TVA e multiverso, centrais para Doomsday) e *WandaVision*.
- X-Men da Fox (vários personagens voltam em Doomsday): *X-Men* (2000), *X-Men 2* (2003), *X-Men: Dias de um Futuro Esquecido* (2014) e *Logan* (2017).

## 3. Arquitetura

- **Next.js (App Router, TypeScript)** na **Vercel**, ligado ao repo `avaaraujo/avengers-contdown` (deploy a cada push na `main`).
- **Supabase** "Projetos Pessoais" (`yranqpacxvijxbbpkzlp`). Esse projeto já tem tabelas de finanças, então **todas as tabelas daqui usam o prefixo `avengers_`** e nada encosta nas outras.
- `@supabase/ssr` para a sessão no servidor e no cliente.
- O countdown roda no cliente (tick por segundo), com a data vinda do servidor.
- Big numbers calculados de forma derivada (soma de durações com/sem check, dias restantes), sem nada guardado à parte.
- **3D:** `three` com `@react-three/fiber` + `@react-three/drei` num componente só de cliente (`dynamic(..., { ssr: false })`). O HUD, o painel de detalhe e a lista ficam em HTML/React por cima do canvas.
  - **Desempenho:** o protótipo faz 3,5 ms por quadro numa RTX 4080, mas com ~500 draw calls. Na versão final, as capas viram um atlas de textura e os gibis usam `InstancedMesh`, para rodar liso no celular.
  - **Sem WebGL ou com "reduzir movimento":** a lista em texto vira a interface principal.
- **Capas dos gibis:** vêm da Marvel Database (Fandom), em 720 px. Vão ser guardadas no **Supabase Storage** (bucket `avengers-covers`), sem hotlink, para não depender do Fandom.
- **Metadados em pt-BR:** títulos brasileiros, sinopses e diretores vêm do **TMDB** (`language=pt-BR`). O JustWatch devolve alguns títulos de Portugal (ex.: "O Soldado do Inverno"), por isso não serve para isso.
- **Streaming no Brasil:** o endpoint `watch/providers` do **TMDB** (região `BR`), que é alimentado pelo JustWatch e é o caminho oficial. A exibição precisa do crédito "dados: JustWatch".
  - Uma tarefa agendada (Vercel Cron, 1x por dia) atualiza a tabela `avengers_offers`, porque a disponibilidade muda (os filmes do Homem-Aranha mudam de plataforma com frequência).
  - O protótipo usou a API GraphQL não oficial do JustWatch só para pesquisa; ela não deve ir para produção.

### Modelo de dados

```
avengers_config      key text pk, value jsonb                      -- premiere_at, título, etc. (leitura pública)
avengers_titles      id, slug, kind ('main'|'series'|'xmen'|'finale'),
                     chrono_order, title_pt, title_en, release_year,
                     runtime_min, phase, saga, director, synopsis_pt,
                     tmdb_id, comic_label, comic_cover_path,
                     comic_source_url, note                          -- leitura pública, escrita só por migration/seed
avengers_offers      title_id → avengers_titles, kind ('flatrate'|'rent'|'buy'|'free'|'ads'),
                     provider_id, provider_name, logo_path, link,
                     updated_at                                      -- leitura pública, escrita só pelo cron
avengers_watches     user_id → auth.users, title_id → avengers_titles,
                     watched_at timestamptz, pk (user_id, title_id)  -- RLS: cada usuário só lê e escreve as próprias linhas
avengers_profiles    user_id pk, display_name                        -- opcional, para saudação
```

RLS ligado em todas. `avengers_titles`, `avengers_offers` e `avengers_config` têm só `select` público.

### Telas e estados

- **Home (uma página só):** a estante 3D com o HUD (countdown e próximo em cima, números e barra embaixo). O detalhe abre por cima, sem trocar de página, com URL própria (`/?filme=10`) para dar para compartilhar.
- **Visitante não logado:** vê tudo com progresso zerado; o botão de marcar abre o login.
- **Primeira vez logado:** progresso 0, "comece por Capitão América: O Primeiro Vingador".
- **Todos assistidos:** estado de comemoração ("pronto para a estreia").
- **Depois da estreia:** o countdown vira "Em cartaz".
- **Marcar/desmarcar:** atualização otimista, com desfazer.

## 4. Etapas

1. ~~Escolher o layout~~ → estante de gibis em 3D. ~~Protótipo em three.js~~ → `prototype/`.
2. ~~Setup~~ → Next.js 16 (App Router, Cache Components). A estante ficou em three.js puro (`ShelfScene.ts`), não em R3F, para reaproveitar o protótipo. As capas ficam em `public/covers/`, e não no Storage.
3. ~~Banco~~ → migration `avengers_*` + RLS e seed dos 38 filmes, da edição final e de 57 ofertas (retrato do JustWatch de 17/10). **Falta:** os extras (séries e X-Men) e trocar sinopses e títulos pelo TMDB pt-BR.
4. **Streaming:** rota do cron que busca `watch/providers` (BR) no TMDB e grava em `avengers_offers`.
5. **Estante 3D de produção:** ~~portada para o app~~ (capa que abre e vira a página de gibi). **Falta:** atlas de capas + instancing para o celular, e o detalhe com URL própria.
6. **Login e progresso real:** ~~link mágico + progresso no Supabase~~ (visitante usa `localStorage`, que é mesclado ao entrar). **Falta:** os extras e o estado pós-estreia.
7. **Mobile, desempenho e acessibilidade:** lista em texto, reduzir movimento, teclado.
8. **Deploy** na Vercel + URLs de redirecionamento no Supabase Auth.
9. **Revisão final** de design e documentação (DESIGN.md).

## 5. Decisões em aberto

- **Chave do TMDB:** precisa de uma API key gratuita (themoviedb.org → Configurações → API). Ela é necessária para os títulos e sinopses em pt-BR e, principalmente, para os **streamings no Brasil** de forma oficial.
- **Capas dos gibis:** são imagens com direitos da Marvel, usadas aqui como site de fã, sem fins comerciais e com o crédito da fonte. Se o site for divulgado publicamente, vale manter o aviso "fan project, sem afiliação com Marvel/Disney" no rodapé.
- **Gibi de cada filme:** escolhi a edição que inspirou ou estreou o personagem/arco (lista em `prototype/data.js`). Algumas são escolhas de gosto (ex.: *Ultimato* → *Infinity Gauntlet #4*; *Ragnarok* → *Planet Hulk*); dá para trocar qualquer uma.
- **Supabase Auth compartilhado:** o "Site URL" do projeto provavelmente aponta para o app de finanças. Não vou mexer nele; só **adicionar** a URL da Vercel na lista de redirecionamentos. Confirme se tudo bem.
- **Ordem cronológica:** usei a ordem da Disney+. Alguns fãs colocam *Quarteto Fantástico* (outra Terra) e *Deadpool & Wolverine* em lugares diferentes; dá para ajustar.
- **Domínio:** `avengers-countdown.vercel.app` (se estiver livre) ou um domínio próprio.
