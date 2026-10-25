# CLAUDE.md

Orientações para o Claude Code (claude.ai/code) ao trabalhar neste repositório.

## O que é este repositório

O site estático de **Dr. Ronaldo Lopes** — psiquiatra geral e da infância e
adolescência, em Goiânia (GO), CRM-GO 15751, RQE 20033 e 20034. Conteúdo em pt-BR.
Uma **única página** (`index.html`) com navegação por âncoras, mais a árvore
`assets/`.

O site é uma landing page: hero, sete seções (Como funciona a consulta online,
Especialidades, Formação, Atuação, Experiência, Depoimentos, Contato) e rodapé, com
um único destino de conversão, o WhatsApp `+55 62 98113-4061`, por **dois caminhos:
consulta online e consulta presencial em Goiânia**. **Não existe blog, artigo,
formulário nem `<input>`** em lugar nenhum.

**O `index.html` e o `assets/` são saída de `tools/build.py`** e são regravados por
inteiro a cada execução. Toda mudança de texto, marcação ou estilo entra nas fontes
em `tools/src/` (ou no `build.py`), e o site é regenerado rodando o build. Edição
feita à mão no `index.html` some no próximo build. Não há WordPress, PHP, gerenciador
de pacotes nem etapa de build no servidor.

Todos os caminhos são relativos, então o site funciona na raiz de um domínio *e* sob
um subcaminho (`user.github.io/repo/`). `.nojekyll` está commitado.

**Publicar é fazer push em `main`**: o GitHub Pages serve a raiz do branch em um ou
dois minutos.

## Histórico

| data | o que aconteceu |
|---|---|
| 2026-09-09 | Migração da captura Simply Static do WordPress 7.1 / Divi 5.12.1 para GitHub Pages |
| 2026-09-19/20 | Errata de digitação no texto e nos depoimentos |
| 2026-10-25 | Agendamento separado em online × presencial; faixa de formato; seção `#consulta-online` |
| 2026-10-25 | Virada de DNS concluída; o WordPress antigo foi desativado |
| 2026-10-25 | **Redesign**: o Divi saiu; HTML semântico, CSS e JS próprios |

## Domínio e DNS — virada CONCLUÍDA

O site está no ar em **`drronaldolopes.com.br`**, servido pelo GitHub Pages. O
domínio está registrado para RLS PSIQUIATRIA GERAL E DA INFANCIA E ADOLESCENCIA,
ativo até 2028-07-21. `CNAME`, `sitemap.xml`, `robots.txt` e o
`<link rel="canonical">` carregam esse domínio; todos saem do `build.py`, da
constante `CANONICO`.

**O WordPress antigo foi desativado.** Ele rodava no A `157.230.185.95`
(DigitalOcean); a migração partiu do que estava mesmo no ar ali em 2026-09-09.
Nenhum registro aponta mais para aquele IP.

Estado conferido em 2026-10-25:

- o ápice tem os quatro A do GitHub Pages:
  ```
  185.199.108.153   185.199.109.153   185.199.110.153   185.199.111.153
  ```
- `www` é CNAME para `tiberiodamaso.github.io` e redireciona (301) para o ápice;
- **HTTPS forçado**: `http://` responde 301 para `https://`.

## Estrutura

```
index.html          a página inteira (gerada)
assets/css/site.css a folha única do site (gerada a partir de tools/src/site.css)
assets/js/site.js   7 linhas: fecha o menu do celular após escolher uma seção
assets/img/         logo horizontal, logo vertical branco, 3 favicons,
                    2 fotos (consultorio-1, consultorio-2) em 3 tamanhos cada
CNAME               drronaldolopes.com.br, para o GitHub Pages
robots.txt          libera tudo, aponta o sitemap
sitemap.xml         uma URL: a home
.nojekyll           impede o Jekyll de comer o que começa com _
NOTICE.txt          licenças de terceiros (hoje, só o ícone do WhatsApp, CC0)
```

A página não carrega biblioteca nenhuma nem fonte web: o texto usa a fonte do
sistema. Os únicos hosts externos que ela contata são os do Google Tag Manager e das
tags que o contêiner dispara. Os links de saída vão para `wa.me`,
`www.instagram.com` e `www.google.com`.

### Desenho

- Paleta clara; o destaque é o azul-petróleo da marca (`--marca: #244553`).
- **O verde só aparece nos botões de WhatsApp e na bolha flutuante**: `#117a43`
  (contraste 5,4:1 com o branco, passa AA). O verde de marca do WhatsApp,
  `#25D366`, tem 2:1 com texto branco e reprova.
- Botões: uma linha só (`white-space: nowrap`), altura de 44 px, ícone à esquerda.
  Conferido até 320 px de largura.
- Cabeçalho fixo (`position: sticky`) com logo, links de âncora e botão "Agendar".
  No celular, os links vão para um `<details>` (o menu funciona sem JS). As âncoras
  descontam o cabeçalho com `scroll-margin-top: calc(var(--topo) + 12px)`, e a
  rolagem suave respeita `prefers-reduced-motion`.
- **O desenho do logo horizontal ocupa só de y=15 a y=83 da caixa de 100 do SVG.**
  Para ele aparecer grande sem mexer no arquivo, a imagem cresce e uma margem
  negativa devolve o vazio de cima e de baixo (`.topo__logo img` no CSS). Se trocar o
  logo, refaça essa conta.

## `tools/` — o build e as conferências

Tudo em `tools/` é **gitignored**: nunca é publicado e **não está no git**. As fontes
do site vivem aqui, então um clone novo do repositório não consegue regenerar a
página. Faça backup desta pasta.

| arquivo | o que faz |
|---|---|
| `src/pagina.html` | o template da página, com campos `{{...}}` que o build preenche |
| `src/site.css` | a folha de estilo |
| `src/site.js` | o JS do menu |
| `build.py` | copia as imagens da captura, extrai dela o que precisa ficar igual, preenche o template e confere tudo |
| `verify.py` | resolve toda referência local; falha em qualquer absoluta na raiz ou ausente |
| `probe.py` | headless: GTM carregando, erros de JS, transbordo, imagens quebradas, em 8 larguras |
| `compara.py` | compara dois `index.html` e falha se a medição puder ter mudado (ver abaixo) |
| `conversoes.js` | clica em cada botão de WhatsApp com o GTM real e registra o que as tags enviariam |
| `capturas.js` | Playwright: página inteira antes × depois em 375, 768 e 1280 px |
| `shots.py`, `refgraph.py` | da migração; o A/B do `shots.py` contra a captura do Divi não serve mais |

**O que o `build.py` tira da captura do WordPress** (e só isso):

- as imagens;
- **o par de snippets do GTM, byte a byte**;
- **o texto dos 5 depoimentos**, depois da `ERRATA` (sai só o `<span>` vazio que
  embrulhava o parágrafo; os `<br>` do depoimento da Josilene ficam);
- os links do Instagram e do mapa.

Todo o resto é do template.

**O build falha** em qualquer uma destas situações:
- o número de links `wa.me` for diferente de 6;
- algum deles estiver sem `data-formato`, `data-origem` ou o texto "Vim pelo site do
  Dr. Ronaldo";
- `wa.me` aparecer fora desses links;
- algum `href="#…"` apontar para um id inexistente, ou sumir algum dos ids
  `agendar`, `consulta-online`, `agendar-contato` e `contato`;
- sobrar `_blank` sem `noopener`, `et_pb` ou `wp-content`;
- houver mais de 2 `<script>` (o GTM e o `site.js`).

Para regenerar a partir do original arquivado:

```bash
mkdir -p /tmp/ronaldo && tar -xzf ../drronaldo-simply-static-original-20260909.tar.gz -C /tmp/ronaldo
SRC=/tmp/ronaldo/simply-static-ronaldo DEST=. python3 tools/build.py
python3 tools/verify.py .
```

`build.py` é **idempotente e destrutivo com `assets/`**: apaga a árvore inteira e a
reescreve, para que um arquivo de um build anterior nunca sobreviva.

**Antes de publicar qualquer mudança**, guarde o `index.html` anterior e rode:

```bash
cp index.html /tmp/index_antes.html          # antes de mexer
# ... edita tools/src, roda o build ...
python3 tools/compara.py /tmp/index_antes.html index.html
python3 -m http.server 8777 --bind 127.0.0.1 &
BASE=http://127.0.0.1:8777 python3 tools/probe.py .
```

O `compara.py` falha em qualquer uma destas situações:
- o GTM (head e noscript) não estar idêntico e na mesma posição relativa;
- mudar algo nos links `wa.me`: quantidade, href exato, `data-formato`, `data-origem`,
  `target` ou `rel`;
- um link interno ganhar `wa.me`;
- sumir um id usado como âncora ou um `href="#"` apontar para o vazio;
- aparecer gtag, pixel ou script externo novo;
- perder um metadado do `<head>`;
- mudar uma letra de depoimento.

`conversoes.js` e `capturas.js` precisam do pacote `playwright-core`, que não fica
instalado (`npm i playwright-core` numa pasta temporária e
`NODE_PATH=<pasta>/node_modules node tools/conversoes.js`). Os dois usam o Chromium
do cache do Playwright. Eles esperam o site anterior servido na porta 8779 e o novo
na 8777. O `conversoes.js` mapeia `drronaldolopes.com.br` para `127.0.0.1`, para que
acionadores filtrados por domínio também disparem. **Ele aborta todo hit de GA4, Ads
e DoubleClick antes de sair**: não gera conversão falsa na conta.

`probe.py` prefere o `chrome-headless-shell` do cache do Playwright: o Chrome comum em
headless **não desce abaixo de 500 px de largura**.

**O original intocado está arquivado fora do repositório** em
`../drronaldo-simply-static-original-20260909.tar.gz` (3340 arquivos). É de lá que o
build lê. Restaure de lá, não do git: a migração é anterior ao primeiro commit.

## Agendamento: online × presencial

Muitos contatos chegavam de outras cidades achando que a consulta seria presencial
na cidade deles. A página deixa o formato claro antes do clique e faz a pessoa
escolher.

**Só 6 links levam `wa.me`**, em três blocos de dois botões (lado a lado no desktop,
empilhados e em largura total no celular). Saem de `bloco()` no `build.py`:

| `data-origem` | onde | âncora |
|---|---|---|
| `hero` | primeira dobra | — |
| `consulta-online` | fim da seção "Como funciona a consulta online" | `#agendar` |
| `contato` | fim da seção Contato | `#agendar-contato` |

- **"Agendar consulta online"**, `data-formato="online"`, com a nota "Todo o Brasil ·
  a partir de 12 anos" logo abaixo.
- **"Agendar presencial em Goiânia"**, `data-formato="presencial"`, com a nota
  "Crianças e adolescentes".
- Todos com `target="_blank" rel="noopener"` e uma mensagem própria, gerada com
  `urllib.parse.quote(msg, safe='')`. As duas mensagens contêm **"Vim pelo site do
  Dr. Ronaldo"**: é o que identifica no WhatsApp que o contato veio do site.
  **O href não pode mudar um byte**; o `compara.py` confere.
- Abaixo de cada par: "Respondemos de segunda a sexta, das 9h às 17h."

**O resto não abre o WhatsApp**, e nenhum desses links contém `wa.me`, de propósito,
para não disparar a conversão:
- o botão "Agendar" do cabeçalho, os "Agendar consulta" do fim de cada seção e a
  **bolha verde flutuante** (canto inferior direito) rolam até `#agendar`;
- o telefone do contato rola até `#agendar-contato`.

**A seção `#consulta-online`** fica logo após o hero. **O anúncio da campanha online
aponta para `drronaldolopes.com.br/#consulta-online`: não renomeie esse id.**

**A faixa do topo** ("Atendimento online para todo o Brasil e brasileiros no
exterior · Presencial somente em Goiânia") fica no fluxo, acima do cabeçalho, e não
acompanha a rolagem. Quem fica fixo é o cabeçalho.

A contagem de conversões caiu de patamar a partir de 2026-10-25: há menos links
`wa.me` e um passo de escolha antes do WhatsApp. Não compare com o período anterior
como se fosse a mesma métrica.

## Google Tag Manager e conversões

O contêiner é `GTM-PZ346GTV`, com o snippet `<script>` no `<head>` (entre o
`viewport` e os favicons) e o `<noscript>` no fim do `<body>`, depois de todo o
conteúdo. **Os dois vêm da captura byte a byte; não mexa neles.** A medição é toda no
contêiner: não entra gtag, pixel nem código de conversão no HTML.

Testado com o contêiner real em 2026-10-25 (`conversoes.js`), **idêntico no site
anterior e no redesign**. Cada clique num dos 6 botões gera:

- `gtm.linkClick` no `dataLayer`, com a URL do `wa.me`;
- GA4 `G-Q9RCCNDZFT`, evento **`clique_whatsapp`**;
- **conversão do Google Ads**, conta `17636429356`, rótulo `EjhyCLaV4P0cEKyc2tlB`.

A bolha e os botões "Agendar" não disparam nada disso. O acionador é "Click URL
contém wa.me", e o GTM identifica o botão por **`data-formato` e `data-origem`**.
As classes do Divi (`et_pb_*`) saíram no redesign.

**O ícone dentro dos botões tem `pointer-events: none`.** Assim, um clique em cima do
ícone tem como alvo o `<a>`, e não o `<svg>`. Num acionador do tipo "Todos os
elementos", um clique com alvo no `<svg>` chegaria sem Click URL e a conversão se
perderia.

## Regras de conteúdo (publicidade médica, CFM)

- Sem adjetivo de superioridade ou exclusividade ("melhor", "referência", "o mais",
  "renomado", "único").
- Sem promessa ou garantia de resultado, "cura", antes/depois, sensacionalismo ou
  urgência artificial.
- Sem preço, valor ou desconto. Sem depoimento novo nem número de pacientes.
- **Nome, CRM e RQE ficam visíveis no topo (hero) e no rodapé.**
- Não invente formação, título ou serviço que não esteja no site.

### Errata de conteúdo

Erros de digitação que vieram do texto original, corrigidos em 2026-09-19 e
2026-09-20. Vivem na lista `ERRATA` do `build.py`, aplicada à captura; cada entrada
exige exatamente uma ocorrência, senão o build falha. Hoje só os depoimentos saem
da captura; as três primeiras entradas ficam para a errata seguir conferida.

| era | virou |
|---|---|
| `CRM G0 15751` | `CRM GO 15751` — GO de Goiás, estava com zero |
| `Ansiedadae` | `Ansiedade` |
| `infancia e adolescência` | `infância e adolescência` |

Depoimentos, corrigidos de acordo com o cliente. São palavras dos pacientes: aqui
só entra erro de grafia, abreviação e pontuação, e a voz de cada um fica como está.
**Não reescreva depoimento além disso.**

| era | virou |
|---|---|
| `Dr Ronaldo cuida` | `Dr. Ronaldo cuida` |
| `desde a chega no consultório` | `desde a chegada no consultório` |
| `mas tbm com a certeza` | `mas também com a certeza` |
| `Dr gostaria de expressar` | `Dr., gostaria de expressar` — vocativo |
| `hipomania , mas` | `hipomania, mas` — espaço antes da vírgula |

## Dados EXIF

Conferido em 2026-09-09: **não há metadado nenhum a remover.** Os seis JPEG têm só o
marcador JFIF (`FFE0`), sem EXIF, XMP nem IPTC. Os PNG não têm chunk de texto. Os
dois SVG têm `<title>` com o nome e a especialidade do médico, que é conteúdo de
acessibilidade da própria marca e **deve ficar**.

## Ponto frágil conhecido

O link do endereço, na seção Contato, aponta para uma URL de *photosphere* do Google
que carrega os tokens `sa=X` e `ved=` de uma sessão de busca. Responde 200 hoje, mas
tokens desse tipo não são estáveis. A troca natural é
`https://www.google.com/maps?cid=14915821240747628550` (o `cid` decimal sai do `fid`
hexadecimal `0xceffa4641bfd1806` que já está na URL atual), **mas isso não foi
confirmado**: o Google bloqueia o headless. Abra no navegador antes de trocar.

## Segurança

O site é estático e não tem `<form>`, `<input>`, cookie próprio, `localStorage` nem
estado de servidor. Desde o redesign não publica biblioteca de terceiros: o único JS
próprio é o `site.js`, que não lê entrada nenhuma. Todo link `target="_blank"` leva
`rel="noopener"`, e o build falha se faltar.

**Aceito, com consciência do que é:**

- **O Google Tag Manager pode injetar JavaScript arbitrário, por definição.** Quem
  tiver acesso ao contêiner `GTM-PZ346GTV` controla o que roda na página; esse acesso
  merece o mesmo cuidado do acesso ao repositório.
- **Não há Content-Security-Policy.** O GitHub Pages não deixa definir cabeçalho
  HTTP, e um CSP em `<meta>` que ainda permitisse o GTM daria quase nenhuma proteção
  em troca de um risco real de quebrar a medição.
- **Os dados pessoais da página são públicos de propósito**: telefone profissional,
  Instagram, endereço do consultório, CRM e RQE.
