# Avengers Countdown

Uma estante de gibis em 3D para maratonar o MCU em ordem cronológica até a estreia de **Vingadores: Doutor Destino** (17/12/2026 no Brasil).

- Cada filme é a capa do gibi original que o inspirou. Ao clicar, o gibi sai da prateleira, abre e vira a página de detalhe: ficha, sinopse, gibi de origem e **onde assistir no Brasil**.
- Countdown, próximo filme, horas vistas e restantes, ritmo necessário por dia e barra de progresso.
- Sem conta, o progresso fica no navegador. Com login por link mágico (Supabase Auth), ele vai para a conta e aparece em qualquer aparelho.

Projeto de fã, sem afiliação com Marvel ou Disney. Capas: Marvel Database. Streaming: JustWatch.

## Rodando

```bash
npm install
cp .env.example .env.local   # preencha NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

## Estrutura

| Caminho | O que é |
|---|---|
| `src/app/page.tsx` | Página única; o catálogo vem do Supabase num `'use cache'` (estático, revalida a cada hora). |
| `src/components/CountdownApp.tsx` | HUD, lista, painel de conta e a orquestração abrir/fechar do gibi. |
| `src/components/shelf/ShelfScene.ts` | A estante em three.js (gibis, saco plástico, carimbo, capa que abre, slab da estreia). |
| `src/components/ComicPage.tsx` | A tela de detalhe em formato de página de gibi. |
| `src/components/useProgress.ts` | Progresso: `localStorage` para visitantes, `avengers_watches` (RLS) para quem entrou. |
| `supabase/migrations/` | Tabelas `avengers_*` e políticas de RLS. |
| `supabase/seed/` | Os 38 filmes, a edição final e as ofertas de streaming. |
| `prototype/` | O protótipo em three.js puro que originou o app (`node prototype/serve.mjs`). |
| `PLANO.md`, `PRODUCT.md` | Plano e contexto do produto. |
