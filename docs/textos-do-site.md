# Textos do Avengers Countdown

Todo o texto que aparece no site, em português do Brasil, reunido para revisão.

## Como usar este arquivo

- Ajuste **só o texto depois dos dois-pontos** (ou o conteúdo dos blocos de sinopse). Não mude as chaves entre crases, como `` `proximo.label` ``: é por elas que o texto volta para o lugar certo no site.
- Mantenha os trechos entre chaves exatamente como estão, por exemplo `{n}`, `{titulo}`, `{dias}`. O site troca cada um por um valor real (número do filme, título, quantidade de dias etc.).
- Onde houver singular e plural, mantenha os dois.
- Textos de tela têm pouco espaço, principalmente no celular. Prefira frases curtas, e avise se algum ficar bem maior que o original.
- Nomes de filmes e séries seguem o título oficial no Brasil. Os títulos em inglês não são exibidos como texto principal e não precisam de revisão.
- Se quiser remover ou criar um texto, escreva um comentário ao lado da linha para eu saber.

Tom atual do site: informal, direto, em português do Brasil, falando com "você".

## 1. Cabeçalho e contagem regressiva

- `marca`: Avengers Countdown
- `botao.ordenar`: Ordenar
- `botao.lista`: Lista
- `botao.conta.logado`: Conta
- `botao.conta.visitante`: Entrar
- `botao.conta.visitante.dica`: Opcional: entre para levar seu progresso a qualquer aparelho
- `botao.conta.visitante.leitor`: Entrar (opcional) para sincronizar o progresso
- `titulo.leitor`: Avengers Countdown: maratona até {titulo_final}
- `contagem.unidade.dia`: dia
- `contagem.unidade.dias`: dias
- `contagem.hoje`: Hoje
- `contagem.hoje.unidade`: estreia em
- `contagem.ate`: até **{titulo_final}** / estreia no Brasil · {data}
- `contagem.estreou.hoje`: **{titulo_final}** / estreou hoje no Brasil
- `contagem.em.cartaz`: **{titulo_final}** / nos cinemas do Brasil
- `contagem.em.cartaz.unidade`: dia em cartaz / dias em cartaz
- `contagem.em.cartaz.estreia.hoje`: estreia nos cinemas
- `contagem.desde`: desde {data}
- `contagem.ingresso`: Comprar ingresso
- `contagem.leitor.antes`: Faltam {dias}, {horas} e {minutos} para a estreia de {titulo_final}, em {data}.
- `contagem.leitor.hoje`: {titulo_final} estreia hoje nos cinemas do Brasil.
- `contagem.leitor.depois`: {titulo_final} está nos cinemas do Brasil há {dias}.

Em "contagem.ate" e "contagem.estreou.hoje", a barra `/` marca uma quebra de linha.

## 2. Card "Próximo" / "Comece por aqui"

Aparece sobre a estante. No celular, o "Comece por aqui" da primeira visita fica escondido.

- `proximo.label.primeira`: Comece por aqui · Nº {n}
- `proximo.label`: Próximo · Nº {n}
- `proximo.dica.primeira`: A ordem é a da história, não a de lançamento.
- `proximo.marcar`: Marcar como visto
- `proximo.marcado`: Visto!
- `proximo.abrir`: Abrir o gibi
- `proximo.completo.label`: Maratona completa: {total} de {total}
- `proximo.completo.titulo.antes`: Você está pronto para o Doutor Destino.
- `proximo.completo.titulo.depois`: Hora de ver no cinema.
- `proximo.completo.botao`: Ver a última edição
- `amigo.card.label`: Estante do seu amigo
- `amigo.card.titulo`: {vistos} de {total} filmes vistos
- `amigo.card.voltar`: Voltar para a minha

## 3. Estatísticas e progresso (rodapé)

- `stats.assistidas`: assistidas
- `stats.faltam`: faltam
- `stats.filmes.um`: filme pela frente
- `stats.filmes.varios`: filmes pela frente
- `ritmo.1.cada`: 1 a cada {n} / dias · {horas} por dia (curto: dias, por filme)
- `ritmo.filmes.dia`: {n} / filmes por dia · {horas} (curto: filmes por dia)
- `ritmo.pronto`: Pronto / para a estreia
- `ritmo.em.cartaz`: Em cartaz / a maratona segue, sem pressa (curto: sem pressa)
- `ritmo.em.cartaz.pronto`: Em cartaz / e você estava pronto
- `progresso.rotulo`: Progresso da maratona
- `progresso.contagem`: {vistos} de {total}
- `progresso.compartilhar`: Compartilhar
- `salvo.conta`: Progresso salvo na sua conta.
- `salvo.navegador`: Seu progresso fica salvo neste navegador. [Entre] para levar para qualquer aparelho.
- `carregando`: Arrumando a estante…

Em "ritmo", o texto antes da barra `/` é o número grande e o depois é a legenda pequena.

## 4. Painel Ordenar

- `ordenar.titulo`: Ordenar
- `ordenar.grupo`: Ordem dos filmes
- `ordenar.historia.nome`: Ordem da história
- `ordenar.historia.selo`: Recomendada
- `ordenar.historia.frase`: Do Nº 1 ao Nº 38, na ordem em que os eventos acontecem.
- `ordenar.historia.motivo`: A história vira uma linha contínua, sem saltos no tempo, e é a ordem que o Countdown usa para contar os dias até o Doutor Destino. É o caminho recomendado para quem está começando.
- `ordenar.lancamento.nome`: Lançamento e fases
- `ordenar.lancamento.frase`: Na ordem em que os filmes chegaram aos cinemas, agrupados por fase.
- `ordenar.lancamento.motivo`: Você descobre o universo como o público descobriu, com as surpresas e as conexões aparecendo na ordem em que foram lançadas. Ótimo para rever com calma ou acompanhar a evolução do estilo.
- `ordenar.rotulo.motivo`: Por que ver assim

## 5. Painel Lista

- `lista.titulo`: Ordem cronológica
- `lista.fechar`: Fechar painel
- `lista.resumo`: {vistos} de {total} · {horas} vistas
- `lista.abas.rotulo`: Seções da lista
- `lista.aba.maratona`: Maratona
- `lista.aba.series`: Séries
- `lista.aba.xmen`: X-Men
- `lista.grupo.historia`: Nº {de} a {ate}
- `lista.grupo.fase`: Fase {n} · {saga}
- `lista.saga.infinito`: Saga do Infinito
- `lista.saga.multiverso`: Saga do Multiverso
- `lista.estreia.titulo`: A estreia
- `lista.estreia.data`: estreia {data}
- `lista.proximo.selo`: Próximo
- `lista.extras.nota`: Extras ficam fora da conta do countdown: são para quem quer ir além da fila principal.
- `lista.extras.sem.streaming`: Não está em nenhum streaming no Brasil agora.
- `lista.extras.streaming.sem.dados`: Streaming ainda sem dados para este título.
- `lista.zerar`: Zerar progresso
- `lista.credito`: Capas: Marvel Database. Streaming: JustWatch via TMDB. Este produto usa a API do TMDB, mas não é endossado nem certificado por ele.
- `lista.credito.sem.tmdb`: Capas: Marvel Database. Streaming: JustWatch.
- `lista.marcar.leitor`: Marcar como visto: {titulo}
- `lista.desmarcar.leitor`: Desmarcar: {titulo}

## 6. Painel Conta

- `conta.titulo.logado`: Sua conta
- `conta.titulo.visitante`: Entrar (opcional)
- `conta.logado.texto`: Seu progresso está salvo em **{email}** e aparece em qualquer aparelho em que você entrar.
- `conta.sair`: Sair
- `conta.visitante.texto`: Receba um link por e-mail, sem senha. O que você já marcou neste navegador vai junto para a conta.
- `conta.email.rotulo`: E-mail
- `conta.email.exemplo`: voce@exemplo.com
- `conta.enviar`: Enviar link de acesso
- `conta.enviando`: Enviando…
- `conta.enviado.texto`: Enviamos um link para **{email}**. Abra o e-mail neste mesmo navegador para entrar.
- `conta.outro.email`: Usar outro e-mail

## 7. Avisos e mensagens de erro

- `aviso.marcado`: {titulo}: visto.
- `aviso.desmarcado`: {titulo}: desmarcado.
- `aviso.desfazer`: Desfazer
- `aviso.zerado`: Progresso zerado.
- `aviso.amigo.bloqueio`: Esta é a estante do seu amigo. Volte para a sua para marcar filmes.
- `aviso.link.copiado`: Link copiado. É só colar onde quiser.
- `compartilhar.texto`: Já vi {vistos} de {total} filmes da maratona do MCU antes de {titulo_final}.
- `erro.carregar`: Não deu para carregar seu progresso. Recarregue a página.
- `erro.salvar`: Não deu para salvar. Confira sua conexão e tente de novo.
- `erro.zerar`: Não deu para zerar agora. Tente de novo.
- `erro.desfazer`: Não deu para desfazer. Recarregue a página.
- `erro.login.muitos`: Muitos pedidos seguidos. Espere alguns minutos e tente de novo.
- `erro.login.geral`: Não deu para enviar o link. Confira o e-mail e tente de novo.

## 8. Boas-vindas (link de um amigo)

- `amigo.boasvindas.chamada`: Um amigo te mandou a estante dele
- `amigo.boasvindas.titulo`: Um amigo já viu {vistos} de {total} filmes antes de {titulo_final}.
- `amigo.boasvindas.texto`: A fila segue a ordem cronológica da história, não a de lançamento. Por isso o Nº 1 é {titulo_do_filme_1}.
- `amigo.boasvindas.comecar`: Começar a minha maratona
- `amigo.boasvindas.ver`: Ver a estante do meu amigo
- `amigo.boasvindas.nota`: Sem conta: seu progresso fica salvo neste navegador.

## 9. Página de cada filme (o "gibi")

### Topo e navegação

- `gibi.voltar.longo`: Voltar para a estante
- `gibi.voltar.curto`: Voltar
- `gibi.selo.hoje`: Hoje!
- `gibi.selo.estreou`: Estreou!
- `gibi.selo.dias`: {n} dia! / {n} dias!
- `gibi.edicao.anterior`: Edição anterior:
- `gibi.edicao.proxima`: Próxima edição:
- `gibi.edicao.ultima`: Última edição:
- `gibi.edicoes.rotulo`: Edições
- `gibi.capa.leitor`: Capa de {gibi}

### Filme comum

- `filme.fase`: Fase {n}
- `filme.ficha.titulo`: Ficha técnica
- `filme.ficha.ano`: Ano
- `filme.ficha.duracao`: Duração
- `filme.ficha.fase`: Fase
- `filme.ficha.direcao`: Direção
- `filme.ficha.gibi`: Gibi na estante
- `filme.onde.titulo`: Onde assistir no Brasil
- `filme.onde.vazio`: Este filme não está em nenhum streaming no Brasil agora.
- `filme.onde.fonte`: Dados de streaming: JustWatch, {data}.
- `streaming.assinatura`: Assinatura
- `streaming.gratis`: Grátis
- `streaming.anuncios`: Com anúncios
- `streaming.aluguel`: Aluguel
- `streaming.compra`: Compra
- `filme.marcar`: Marcar como visto!
- `filme.visto`: Visto!
- `filme.desfazer`: Desfazer
- `filme.desmarcar`: Desmarcar
- `filme.balao`: Nº {n} de {total} / na ordem cronológica
- `filme.amigo.nota`: Você está vendo a estante do seu amigo. [Ele já viu este filme. / Ele ainda não viu este filme.]
- `filme.amigo.voltar`: Voltar para a minha

### Última edição (a estreia)

- `estreia.fase`: A estreia
- `estreia.sinopse.sufixo.antes`: Até lá, termine a maratona.
- `estreia.sinopse.sufixo.depois`: Já está em cartaz nos cinemas.
- `estreia.ficha.estreia`: Estreia
- `estreia.ficha.maratona`: Maratona
- `estreia.ficha.maratona.valor`: {vistos} de {total} filmes vistos
- `estreia.contagem.hoje`: Hoje
- `estreia.contagem.cartaz`: Em cartaz
- `estreia.contagem.dias`: {n} dia / {n} dias
- `estreia.contagem.legenda.antes`: {h}h {m}min até a estreia
- `estreia.contagem.legenda.hoje`: estreia nos cinemas
- `estreia.contagem.legenda.depois`: estreou há {n} dia / dias
- `estreia.ingresso`: Comprar ingresso
- `estreia.minha.titulo`: Sua maratona
- `estreia.minha.completa.antes`: Maratona completa: {vistos} de {total}. Você está pronto para a estreia.
- `estreia.minha.completa.depois`: Maratona completa: {vistos} de {total}. Hora de ver no cinema.
- `estreia.minha.parcial`: Você viu {vistos} de {total} filmes antes da estreia.
- `estreia.minha.ir`: Ir para o Nº {n}: {titulo}

## 10. Descrição do site e dos compartilhamentos

Aparece no Google, na aba do navegador e na prévia de links (WhatsApp, redes sociais).

- `site.titulo`: Avengers Countdown
- `site.descricao`: Maratone o MCU em ordem cronológica até a estreia de Vingadores: Doutor Destino. Projeto de fã, sem afiliação com Marvel ou Disney.
- `app.descricao`: Maratone o MCU em ordem cronológica até a estreia de Vingadores: Doutor Destino.
- `app.nome.curto`: Countdown
- `pagina.filme.descricao`: {sinopse} Onde assistir no Brasil e a contagem para Vingadores: Doutor Destino.
- `pagina.extra.descricao`: {tipo} da maratona do MCU. {sinopse} Onde assistir no Brasil.
- `pagina.extra.tipo.serie`: Série extra
- `pagina.extra.tipo.xmen`: Filme extra dos X-Men
- `pagina.progresso.titulo`: Um amigo viu {vistos} de {total} filmes do MCU
- `pagina.progresso.descricao`: A maratona do MCU em ordem cronológica até {titulo_final}. Comece a sua e veja quanto falta.
- `imagem.compartilhar.alt`: Avengers Countdown: uma estante de gibis em 3D para maratonar o MCU até a estreia de Vingadores: Doutor Destino
- `imagem.filme.alt`: Capa do gibi e título do filme no Avengers Countdown
- `imagem.filme.legenda`: Nº {n} de {total} · {ano}
- `imagem.estreia.legenda`: Estreia · {data}
- `imagem.progresso.alt`: A estante de gibis de quem compartilhou: os filmes vistos em cores, os que faltam em preto e branco

## 11. Filmes da maratona (38)

Cada filme tem o **título** e a **sinopse**. O título é o nome oficial no Brasil. O gibi na estante (a capa que aparece na prateleira) é só o nome da edição dos quadrinhos, e não precisa de revisão.

### Nº 1 · `captain-america-the-first-avenger`

- Título: Capitão América: O Primeiro Vingador
- Sinopse: Em 1942, o franzino Steve Rogers vira o supersoldado Capitão América e enfrenta o Caveira Vermelha e a HIDRA na Segunda Guerra.
- (referência, não editar) 2011 · fase 1 · gibi: Captain America Comics #1 (1941)

### Nº 2 · `captain-marvel`

- Título: Capitã Marvel
- Sinopse: Nos anos 90, a piloto Carol Danvers descobre seu passado em meio à guerra entre Kree e Skrulls e vira a heroína mais poderosa do universo.
- (referência, não editar) 2019 · fase 3 · gibi: Captain Marvel #1 (2012)

### Nº 3 · `iron-man`

- Título: Homem de Ferro
- Sinopse: Sequestrado no Afeganistão, o bilionário Tony Stark constrói uma armadura para escapar e decide usar sua tecnologia para proteger o mundo.
- (referência, não editar) 2008 · fase 1 · gibi: Tales of Suspense #39 (1963)

### Nº 4 · `iron-man-2`

- Título: Homem de Ferro 2
- Sinopse: Com o mundo sabendo quem ele é, Tony enfrenta o governo, o rival Justin Hammer e o vingativo Ivan Vanko, enquanto o próprio reator o envenena.
- (referência, não editar) 2010 · fase 1 · gibi: Iron Man #128 (1979)

### Nº 5 · `the-incredible-hulk`

- Título: O Incrível Hulk
- Sinopse: Fugindo do exército, Bruce Banner procura a cura para o monstro dentro de si, até que o soldado Emil Blonsky vira o Abominável.
- (referência, não editar) 2008 · fase 1 · gibi: The Incredible Hulk #1 (1962)

### Nº 6 · `thor`

- Título: Thor
- Sinopse: Expulso de Asgard por arrogância, o deus do trovão cai na Terra sem poderes e precisa provar que é digno do martelo Mjölnir.
- (referência, não editar) 2011 · fase 1 · gibi: Journey into Mystery #83 (1962)

### Nº 7 · `the-avengers`

- Título: Os Vingadores
- Sinopse: Nick Fury reúne Homem de Ferro, Capitão América, Thor, Hulk, Viúva Negra e Gavião Arqueiro para deter Loki e uma invasão alienígena em Nova York.
- (referência, não editar) 2012 · fase 1 · gibi: The Avengers #1 (1963)

### Nº 8 · `thor-the-dark-world`

- Título: Thor: O Mundo Sombrio
- Sinopse: Thor enfrenta Malekith e os Elfos Negros, que querem usar a força do Éter para mergulhar os Nove Reinos na escuridão.
- (referência, não editar) 2013 · fase 2 · gibi: Thor #344 (1984)

### Nº 9 · `iron-man-3`

- Título: Homem de Ferro 3
- Sinopse: Abalado depois de Nova York, Tony Stark perde tudo para o terrorista Mandarim e precisa se reinventar sem a armadura.
- (referência, não editar) 2013 · fase 2 · gibi: Iron Man #1: Extremis (2005)

### Nº 10 · `captain-america-the-winter-soldier`

- Título: Capitão América 2: O Soldado Invernal
- Sinopse: Steve Rogers descobre uma conspiração dentro da S.H.I.E.L.D. e enfrenta um assassino misterioso do seu passado: o Soldado Invernal.
- (referência, não editar) 2014 · fase 2 · gibi: Captain America #1 (2005)

### Nº 11 · `guardians-of-the-galaxy`

- Título: Guardiões da Galáxia
- Sinopse: O ladrão Peter Quill rouba uma orbe cobiçada e acaba formando uma equipe improvável com Gamora, Drax, Rocket e Groot.
- (referência, não editar) 2014 · fase 2 · gibi: Guardians of the Galaxy #1 (2008)

### Nº 12 · `guardians-of-the-galaxy-vol-2`

- Título: Guardiões da Galáxia Vol. 2
- Sinopse: Os Guardiões conhecem Ego, o pai de Peter Quill, e descobrem que família nem sempre é quem tem o mesmo sangue.
- (referência, não editar) 2017 · fase 3 · gibi: Thor #132 (1966)

### Nº 13 · `avengers-age-of-ultron`

- Título: Vingadores: Era de Ultron
- Sinopse: Tony Stark cria uma inteligência artificial para proteger a Terra, mas Ultron conclui que a paz exige o fim da humanidade.
- (referência, não editar) 2015 · fase 2 · gibi: The Avengers #55 (1968)

### Nº 14 · `ant-man`

- Título: Homem-Formiga
- Sinopse: O ex-presidiário Scott Lang veste o traje do Dr. Hank Pym, que encolhe e dá força, para impedir que a tecnologia caia em mãos erradas.
- (referência, não editar) 2015 · fase 2 · gibi: Marvel Premiere #47 (1979)

### Nº 15 · `captain-america-civil-war`

- Título: Capitão América: Guerra Civil
- Sinopse: Um acordo para controlar os heróis divide os Vingadores: de um lado o Capitão América, do outro o Homem de Ferro.
- (referência, não editar) 2016 · fase 3 · gibi: Civil War #1 (2006)

### Nº 16 · `black-widow`

- Título: Viúva Negra
- Sinopse: Foragida depois da Guerra Civil, Natasha Romanoff encara o passado na Sala Vermelha e reencontra a família que deixou para trás.
- (referência, não editar) 2021 · fase 4 · gibi: Tales of Suspense #52 (1964)

### Nº 17 · `black-panther`

- Título: Pantera Negra
- Sinopse: T'Challa assume o trono de Wakanda e é desafiado por Killmonger, um rival ligado diretamente à história do reino.
- (referência, não editar) 2018 · fase 3 · gibi: Fantastic Four #52 (1966)

### Nº 18 · `spider-man-homecoming`

- Título: Homem-Aranha: De Volta ao Lar
- Sinopse: Depois da Guerra Civil, Peter Parker tenta conciliar escola e heroísmo enquanto enfrenta o Abutre, sob o olhar de Tony Stark.
- (referência, não editar) 2017 · fase 3 · gibi: Amazing Fantasy #15 (1962)

### Nº 19 · `doctor-strange`

- Título: Doutor Estranho
- Sinopse: Depois que um acidente destrói suas mãos, o cirurgião Stephen Strange busca cura no Nepal e descobre as artes místicas.
- (referência, não editar) 2016 · fase 3 · gibi: Strange Tales #110 (1963)

### Nº 20 · `thor-ragnarok`

- Título: Thor: Ragnarok
- Sinopse: Preso no planeta Sakaar sem o martelo, Thor precisa vencer o Hulk numa arena e voltar a tempo de salvar Asgard de Hela.
- (referência, não editar) 2017 · fase 3 · gibi: The Incredible Hulk #92: Planet Hulk (2006)

### Nº 21 · `ant-man-and-the-wasp`

- Título: Homem-Formiga e a Vespa
- Sinopse: Em prisão domiciliar, Scott Lang se junta a Hope e Hank Pym para resgatar Janet van Dyne do Reino Quântico.
- (referência, não editar) 2018 · fase 3 · gibi: Tales to Astonish #44 (1963)

### Nº 22 · `avengers-infinity-war`

- Título: Vingadores: Guerra Infinita
- Sinopse: Thanos chega para reunir as seis Joias do Infinito, e Vingadores e Guardiões se unem para impedir que ele apague metade da vida do universo.
- (referência, não editar) 2018 · fase 3 · gibi: The Infinity Gauntlet #1 (1991)

### Nº 23 · `avengers-endgame`

- Título: Vingadores: Ultimato
- Sinopse: Cinco anos depois do estalo de Thanos, os Vingadores que restaram arriscam tudo numa última missão para desfazer a tragédia.
- (referência, não editar) 2019 · fase 3 · gibi: The Infinity Gauntlet #4 (1991)

### Nº 24 · `shang-chi-and-the-legend-of-the-ten-rings`

- Título: Shang-Chi e a Lenda dos Dez Anéis
- Sinopse: Shang-Chi tenta fugir do passado, mas é puxado de volta para a organização dos Dez Anéis, comandada pelo próprio pai.
- (referência, não editar) 2021 · fase 4 · gibi: Special Marvel Edition #15 (1973)

### Nº 25 · `eternals`

- Título: Eternos
- Sinopse: Seres imortais escondidos na Terra há milênios se reúnem para enfrentar os Deviantes e um segredo sobre a própria missão.
- (referência, não editar) 2021 · fase 4 · gibi: The Eternals #1 (1976)

### Nº 26 · `spider-man-far-from-home`

- Título: Homem-Aranha: Longe de Casa
- Sinopse: Numa viagem escolar pela Europa, Peter Parker enfrenta ameaças elementais ao lado de Mysterio, um herói que diz vir de outra dimensão.
- (referência, não editar) 2019 · fase 3 · gibi: The Amazing Spider-Man #13 (1964)

### Nº 27 · `spider-man-no-way-home`

- Título: Homem-Aranha: Sem Volta para Casa
- Sinopse: Com a identidade revelada, Peter pede ajuda ao Doutor Estranho, mas o feitiço dá errado e abre as portas do multiverso.
- (referência, não editar) 2021 · fase 4 · gibi: The Amazing Spider-Man Annual #1 (1964)

### Nº 28 · `doctor-strange-in-the-multiverse-of-madness`

- Título: Doutor Estranho no Multiverso da Loucura
- Sinopse: Strange protege a jovem America Chavez, que viaja entre universos, e enfrenta uma ameaça inesperada: a Feiticeira Escarlate.
- (referência, não editar) 2022 · fase 4 · gibi: House of M #1 (2005)

### Nº 29 · `thor-love-and-thunder`

- Título: Thor: Amor e Trovão
- Sinopse: Thor sai da aposentadoria para enfrentar Gorr, o Carniceiro dos Deuses, e reencontra Jane Foster empunhando o Mjölnir.
- (referência, não editar) 2022 · fase 4 · gibi: Thor #1 (2014)

### Nº 30 · `black-panther-wakanda-forever`

- Título: Pantera Negra: Wakanda para Sempre
- Sinopse: Depois da morte do rei T'Challa, Wakanda precisa se defender de Namor e da nação submarina de Talokan.
- (referência, não editar) 2022 · fase 4 · gibi: Marvel Comics #1 (1939)

### Nº 31 · `ant-man-and-the-wasp-quantumania`

- Título: Homem-Formiga e a Vespa: Quantumania
- Sinopse: Scott Lang e a família são sugados para o Reino Quântico e encontram Kang, o Conquistador.
- (referência, não editar) 2023 · fase 5 · gibi: The Avengers #8 (1964)

### Nº 32 · `guardians-of-the-galaxy-vol-3`

- Título: Guardiões da Galáxia Vol. 3
- Sinopse: Para salvar Rocket, os Guardiões encaram o Alto Evolucionário, o cientista que criou e torturou o guaxinim.
- (referência, não editar) 2023 · fase 5 · gibi: Rocket Raccoon #1 (1985)

### Nº 33 · `the-marvels`

- Título: As Marvels
- Sinopse: Carol Danvers, Monica Rambeau e Kamala Khan trocam de lugar sempre que usam os poderes e precisam virar uma equipe.
- (referência, não editar) 2023 · fase 5 · gibi: Ms. Marvel #1 (2014)

### Nº 34 · `deadpool-wolverine`

- Título: Deadpool & Wolverine
- Sinopse: A TVA recruta Deadpool, que sai em busca de uma versão de Wolverine para salvar o próprio universo e acaba no Vazio.
- (referência, não editar) 2024 · fase 5 · gibi: The New Mutants #98 (1991)

### Nº 35 · `captain-america-brave-new-world`

- Título: Capitão América: Admirável Mundo Novo
- Sinopse: Sam Wilson, o novo Capitão América, vai parar no centro de um incidente internacional envolvendo o presidente Thaddeus Ross.
- (referência, não editar) 2025 · fase 5 · gibi: All-New Captain America #1 (2015)

### Nº 36 · `thunderbolts`

- Título: Thunderbolts*
- Sinopse: Yelena Belova e um grupo de anti-heróis caem numa armadilha e precisam trabalhar juntos numa missão que pode redimi-los.
- (referência, não editar) 2025 · fase 5 · gibi: Thunderbolts #1 (1997)

### Nº 37 · `the-fantastic-four-first-steps`

- Título: Quarteto Fantástico: Primeiros Passos
- Sinopse: Numa Terra retrofuturista dos anos 60, o Quarteto Fantástico enfrenta Galactus e sua arauta, a Surfista Prateada.
- (referência, não editar) 2025 · fase 6 · gibi: The Fantastic Four #1 (1961)

### Nº 38 · `spider-man-brand-new-day`

- Título: Homem-Aranha: Um Novo Dia
- Sinopse: Peter Parker recomeça a vida em Nova York sem que ninguém se lembre de quem ele é, e o Homem-Aranha segue de vigia na cidade.
- (referência, não editar) 2026 · fase 6 · gibi: The Amazing Spider-Man #546 (2008)

## 12. Estreia (última edição)

### Nº 39 · `avengers-doomsday`

- Título: Vingadores: Doutor Destino
- Sinopse: A última edição da estante fica lacrada até a estreia nos cinemas, em 17 de dezembro de 2026.
- (referência, não editar) gibi: Fantastic Four #5 (1962)

## 13. Extras: séries e filmes dos X-Men

Aparecem nas abas "Séries" e "X-Men" da Lista. Cada um tem **título**, **sinopse** e, nas séries, uma **observação** de tamanho (episódios/temporadas).

### `wandavision` (série)

- Título: WandaVision
- Sinopse: Wanda e Visão levam uma vida perfeita de sitcom nos subúrbios, até a realidade começar a rachar. Prepara o terreno para Doutor Estranho no Multiverso da Loucura.
- Observação: 9 episódios

### `falcon-and-the-winter-soldier` (série)

- Título: Falcão e o Soldado Invernal
- Sinopse: Sam Wilson e Bucky Barnes decidem o que fazer com o legado do Capitão América. Explica como Sam chega a Capitão América: Admirável Mundo Novo.
- Observação: 6 episódios

### `loki` (série)

- Título: Loki
- Sinopse: Preso pela Autoridade de Variância Temporal, Loki descobre a linha do tempo sagrada e o primeiro pingo do multiverso.
- Observação: 2 temporadas · 12 episódios

### `what-if` (série)

- Título: What If...?
- Sinopse: Animação que pergunta o que aconteceria se momentos-chave do MCU tivessem acabado de outro jeito. Um passeio pelas realidades alternativas.
- Observação: Animação · 3 temporadas

### `x-men-97` (série)

- Título: X-Men '97
- Sinopse: Continuação da animação clássica dos anos 90: os mutantes seguem sem Charles Xavier e enfrentam o preconceito do mundo que juraram proteger.
- Observação: Animação · 10 episódios na 1ª temporada

### `x-men` (filme X-Men)

- Título: X-Men: O Filme
- Sinopse: Mutantes são temidos pelo mundo. Charles Xavier acolhe os jovens em sua escola enquanto Magneto prepara um plano contra a humanidade.

### `x2` (filme X-Men)

- Título: X-Men 2
- Sinopse: Depois de um atentado ao presidente, um coronel declara guerra aos mutantes e X-Men e Irmandade precisam se aliar.

### `x-men-first-class` (filme X-Men)

- Título: X-Men: Primeira Classe
- Sinopse: Nos anos 60, o jovem Charles Xavier e Erik Lehnsherr formam a primeira equipe de mutantes e viram inimigos.

### `x-men-days-of-future-past` (filme X-Men)

- Título: X-Men: Dias de um Futuro Esquecido
- Sinopse: Wolverine volta ao passado para impedir um futuro em que os mutantes são caçados e quase extintos.

### `deadpool` (filme X-Men)

- Título: Deadpool
- Sinopse: Wade Wilson vira o mercenário tagarela Deadpool depois de um experimento que o deixa imortal e desfigurado.

### `logan` (filme X-Men)

- Título: Logan
- Sinopse: Num futuro sem mutantes, um Wolverine cansado cuida de um Professor X doente e protege uma menina com poderes parecidos.

### `deadpool-2` (filme X-Men)

- Título: Deadpool 2
- Sinopse: Deadpool monta a X-Force para proteger um garoto mutante do implacável Cable.

