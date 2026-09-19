# CLAUDE.md

Orientações para o Claude Code (claude.ai/code) ao trabalhar neste repositório.

## O que é este repositório

O site estático de **Dr. Ronaldo Lopes** — psiquiatra geral e da infância e
adolescência, em Goiânia (GO). Conteúdo em pt-BR. Uma **única página** (`index.html`)
com navegação por âncoras, mais a árvore `assets/`.

O site é uma landing page: seis seções (Especialidades, Formação, Atuação,
Experiência, Depoimentos, Contato) e um único caminho de conversão, o WhatsApp
`+55 62 98113-4061`. **Não existe blog, artigo, formulário nem `<input>`** em lugar
nenhum. Os nove botões de contato levam todos ao mesmo número.

Começou como uma captura Simply Static de uma instalação WordPress 7.1 / Divi 5.12.1
e foi migrado em **2026-09-09**. Não há WordPress, PHP, etapa de build, gerenciador de
pacotes nem testes. **Editar significa editar HTML/CSS/JS à mão.**

Todos os caminhos são relativos, então o site funciona na raiz de um domínio *e* sob
um subcaminho (`user.github.io/repo/`). `.nojekyll` está commitado.

## Domínio e virada de DNS

O site vai para **`drronaldolopes.com.br`**, registrado para RLS PSIQUIATRIA GERAL E
DA INFANCIA E ADOLESCENCIA, ativo até 2028-07-21. `CNAME`, `sitemap.xml`,
`robots.txt` e o `<link rel="canonical">` já carregam esse domínio; todos saem do
`build.py`, da constante `CANONICO`.

**Em 2026-09-09 o domínio ainda apontava para o WordPress em produção**, no A
`157.230.185.95` (DigitalOcean), servindo HTTPS com o mesmo título, o mesmo contêiner
`GTM-PZ346GTV` e o mesmo `wa.me/+55...` quebrado da captura — ou seja, a migração
partiu do que estava mesmo no ar. `www.drronaldolopes.com.br` não tinha registro
nenhum.

Para virar, os registros do ápice precisam sair daquele IP e ir para os quatro
endereços do GitHub Pages:

```
185.199.108.153   185.199.109.153   185.199.110.153   185.199.111.153
```

e `www` vira um CNAME para `<usuario>.github.io`. Só depois disso habilite o
*Enforce HTTPS* nas configurações do Pages — o certificado só é emitido com o DNS já
apontado. Enquanto o DNS não virar, o que responde no domínio continua sendo o
WordPress antigo.

## Estado da migração — CONCLUÍDA

|  | antes | depois |
|---|---|---|
| Arquivos | 3340 | **44** (versionados) |
| Tamanho | 148 MB | **1,6 MB** |
| Páginas HTML | 4 | **1** |
| `index.html` | 92 KB | **45 KB** |
| Caminhos | absolutos na raiz | **relativos** |
| Diretórios | `wp-content/`, `wp-includes/` | **`assets/`** |
| CSS | 2 arquivos + 3 blocos embutidos (43 KB inline) | **3 arquivos, nada inline** |
| Fontes de ícone | 24 arquivos, 5 formatos | **3 arquivos, 252 KB** |

Aceitação verificada em deploy na raiz **e** em subcaminho: **44 referências locais,
0 ausentes, 0 absolutas na raiz**. Sonda headless a 320, 360, 390, 768, 1024, 1280,
1440 e 1920 px: **zero erros de JS**, sem transbordo horizontal
(`scrollWidth == clientWidth` em toda largura), sem imagem quebrada, GTM confirmado
carregando e populando o `dataLayer`.

O A/B de screenshot contra a captura original cobre a **página inteira** e hoje
acusa **duas faixas de diferença por largura, de 15 a 19 linhas cada** — exatamente
os dois textos corrigidos na errata, e nada mais. O controle (original × original)
fica em 0,000%, então qualquer terceira faixa que apareça é regressão de verdade.

**Cuidado com a altura de `SIZES` em `shots.py`.** Até 2026-09-19 ela era 3000 px,
mas a home tem **6660 px a 1440 e 9066 px a 500** — ou seja, o A/B vinha comparando
só o topo, e mais da metade da página nunca foi conferida. Isso só apareceu quando a
correção do CRM, que fica a 6096 px, não surgiu no diff. Se o conteúdo crescer, meça
de novo e suba os valores.

Os únicos hosts externos que a página contata são `www.googletagmanager.com`,
`fonts.googleapis.com` e `fonts.gstatic.com`. Os links de saída vão para `wa.me`,
`www.instagram.com` e `www.google.com`.

**O original intocado está arquivado fora do repositório** em
`../drronaldo-simply-static-original-20260909.tar.gz` (3340 arquivos).
Restaure de lá, não do git — a migração é anterior ao primeiro commit.

`MIGRAR-WORDPRESS-PARA-GITHUB-PAGES.txt` (pt-BR, passos 0–10) é o procedimento
genérico; a cópia canônica vive fora de qualquer repositório, em `../`. Projetos
irmãos em `../` (`mundoquali`, `camargos`, `santanamoveis`, `ycon`, `2rsseguros`,
`jcontabilidade`, `kharina`, `sapeca`, `business`) são outras execuções do mesmo
procedimento.

### `tools/` — a migração é reproduzível

Os scripts de build foram **mantidos**, em `tools/` (gitignored, então nunca são
publicados):

| arquivo | o que faz |
|---|---|
| `build.py` | a migração inteira: poda → renomeia → reescreve caminhos → tira resíduo → conserta defeitos |
| `refgraph.py` | grafo transitivo de referências a partir das páginas de entrada |
| `verify.py` | resolve toda referência local; falha em qualquer absoluta na raiz ou ausente |
| `probe.py` | headless: GTM disparando, erros de JS, transbordo, imagens quebradas, em 8 larguras |
| `shots.py` | screenshot original × migrado, com **controle** original × original |

Para refazer tudo a partir do original arquivado:

```bash
mkdir -p /tmp/ronaldo && tar -xzf ../drronaldo-simply-static-original-20260909.tar.gz -C /tmp/ronaldo
SRC=/tmp/ronaldo/simply-static-ronaldo DEST=. python3 tools/build.py
python3 tools/verify.py .
```

`build.py` é **idempotente e destrutivo com `assets/`**: apaga a árvore inteira e a
reescreve a partir da captura, para que um arquivo de um build anterior nunca
sobreviva a uma mudança no mapa `ASSETS`. `index.html` é regravado por completo. Toda
transformação é protegida por `assert` com contagem esperada — se a captura mudar e
um padrão deixar de casar, o build para em vez de publicar um site meio migrado.

Para conferir depois de mexer:

```bash
python3 -m http.server 8777 --bind 127.0.0.1 &
python3 -m http.server 8888 --bind 127.0.0.1 -d /tmp/ronaldo/simply-static-ronaldo &
BASE=http://127.0.0.1:8777 python3 tools/probe.py .
python3 tools/shots.py /tmp/shots
```

`probe.py` prefere o `chrome-headless-shell` do cache do Playwright, se existir: o
Chrome comum em headless **não desce abaixo de 500 px de largura**, então sem ele a
faixa de celular não é testada de verdade — os números de 320 e 360 px saem como 500.

## Estrutura

```
index.html          a página inteira
assets/css/         tema.css (base do tema)  base.css (módulos)  layout.css (a página)
assets/js/          jquery + 15 scripts do tema, carregados na ordem original
assets/fonts/       etmodules.woff, fa-solid-900.woff2, fa-brands-400.woff2
assets/img/         logos SVG, favicons, 2 fotos em 3 tamanhos, aspas, preloader
CNAME               drronaldolopes.com.br, para o GitHub Pages
robots.txt          libera tudo, aponta o sitemap
sitemap.xml         uma URL: a home
.nojekyll           impede o Jekyll de comer o que começa com _
NOTICE.txt          atribuição de licença de terceiros (GPL v2, MIT, OFL)
```

A ordem das três folhas no `<head>` **importa** e reproduz a cascata do original:
`tema.css` → `base.css` → (scripts, ícones) → `layout.css`. Não reordene.

## O que foi retirado, e por quê

- **Três páginas órfãs.** `em-breve/` era a tela antiga de "em breve";
  `project/` e `author/tiberio/` eram listagens que exibiam só "No Results Found".
  Nenhuma recebia link de lugar nenhum.
- **FontAwesome regular.** A página usa quatro glifos: `f232` (WhatsApp, na face
  *brands*) e `f19d`, `f501`, `f0f0` (na face *solid*). A face *regular* não tem
  nenhum deles. **As três faces declaram a mesma `font-family: FontAwesome`** e se
  distinguem só pelo peso, com *brands* declarada por último em `font-weight: 400` —
  quem mexer nessa parte precisa manter essa ordem, ou o ícone do WhatsApp vira um
  quadrado vazio. Foi exatamente o que aconteceu num build intermediário.
- **Formatos de fonte legados** (`eot`, `ttf`, `svg`). Sobrou `woff2` para o
  FontAwesome e `woff` para o ETmodules, que não tem `woff2` na captura.
- **Os dois blocos de CSS do Gutenberg** (15 KB embutidos). Definiam só classes
  `.wp-block-*`, `.has-*` e `.is-layout-*`; **zero** casavam com o DOM da página, que
  é montada inteiramente com módulos do tema. Da regra toda sobrou `body{padding:0}`,
  preservado no mesmo ponto da cascata.
- **Resíduo de servidor**: `pingback`, `xmlrpc`, RSD/EditURI, os dois feeds RSS,
  `shortlink`, as duas `<meta name="generator">`, `speculationrules` e
  `X-UA-Compatible`.
- **Parâmetros herdados do WordPress** dentro do JS embutido: `ajaxurl`,
  `images_uri`, `builder_images_uri`, `tinymce_uri` (caminhos que não existem mais) e
  `et_frontend_nonce`, `et_ab_log_nonce` (tokens de sessão que não deviam ir ao ar).
  Foram esvaziados, não removidos: o script do tema espera as chaves.
- **Comentários** que citavam o tema, o WordPress ou plugins, incluindo nove
  anotações `sourceURL` e quatro ponteiros para arquivos `.LICENSE.txt` que a captura
  nem trouxe. Sobraram só os quatro comentários do Google Tag Manager e os
  cabeçalhos MIT do jQuery, do jQuery Migrate e do Animate.css, que **precisam ficar**.
- **O crédito do rodapé** ("Designed by Elegant Themes | Powered by WordPress").
  Estava dentro de `#main-footer`, que o CSS já escondia com `display:none` — sair
  não mudou um pixel. A atribuição GPL v2 passou para `NOTICE.txt`.

Os **nomes de classe** (`et_pb_*`, `wp-singular`, `wp-theme-Divi`) **ficaram**: o CSS
e o JS do tema selecionam por eles. Renomear quebra a página.

## O que foi consertado

- **Os nove links de WhatsApp** apontavam para `wa.me/+5562981134061`. O `+` vira
  `%2B` dentro do parâmetro `phone` no redirecionamento do `wa.me`, e o formato
  documentado é só dígitos. Agora são `wa.me/5562981134061`.
- **Os doze links do menu** eram `/#secao` — absolutos na raiz, quebrariam num deploy
  em subcaminho. Agora são `#secao`.
- **O zoom estava travado** (`maximum-scale=1.0, user-scalable=0`), o que reprova em
  acessibilidade. O viewport agora é `width=device-width, initial-scale=1`.
- **Toda imagem vinha com `alt=""`** e as duas fotos carregavam
  `title="WhatsApp Image 2026-07-22 at 14.53.22"`, que aparecia como tooltip e vazava
  a origem do arquivo. Ganharam texto alternativo e título de verdade; os arquivos
  viraram `consultorio-1*.jpeg` e `consultorio-2*.jpeg`.
- **Faltava `<meta name="description">`.** Foi acrescentada, junto de `preconnect`
  para o Google Fonts no lugar do `dns-prefetch`.
- **Faltava `rel="noopener"`** em doze dos treze links `target="_blank"`. Ver a seção
  de revisão de segurança.

### Errata de conteúdo

Erros de digitação que vieram do texto original, corrigidos em 2026-09-19. Vivem na
lista `ERRATA` do `build.py`, **não numa edição solta no `index.html`**: o build
regrava o arquivo inteiro a cada execução e desfaria qualquer conserto feito só na
saída. Cada entrada exige exatamente uma ocorrência, senão o build falha.

| era | virou |
|---|---|
| `CRM G0 15751` | `CRM GO 15751` — GO de Goiás, estava com zero |
| `Ansiedadae` | `Ansiedade` — no cartão de especialidades |

**Ainda por decidir**, encontrado na mesma revisão e deixado como está:

- `psiquiatria da infancia e adolescência pelo CHC-UFPR`, no cartão de Especialização,
  sem o acento de **infância** — a mesma palavra aparece acentuada em quatro outros
  pontos da página. É texto do próprio site, não citação.
- Três deslizes **dentro dos depoimentos**: `desde a chega no consultório` (chegada) e
  `tbm` no de Thais Kellen, e `Dr gostaria` sem ponto no de Ariadne Uhdre Juvencio.
  São palavras dos pacientes; corrigir altera uma citação. Não mexa sem combinar.

## Dados EXIF

Conferido em 2026-09-09: **não há metadado nenhum a remover.** Os seis JPEG têm só o
marcador JFIF (`FFE0`), sem EXIF, XMP nem IPTC — o WhatsApp descarta na origem e o
WordPress reprocessou. Os quatro PNG não têm nenhum chunk de texto. O GIF não tem
extensão de comentário. Os dois SVG têm `<title>` com o nome e a especialidade do
médico, que é conteúdo de acessibilidade da própria marca e **deve ficar**.

## Ponto frágil conhecido

O link do endereço, na seção Contato, aponta para uma URL de *photosphere* do Google
que carrega os tokens `sa=X` e `ved=` de uma sessão de busca. Responde 200 hoje, mas
tokens desse tipo não são estáveis. A troca natural é
`https://www.google.com/maps?cid=14915821240747628550` (o `cid` decimal sai do `fid`
hexadecimal `0xceffa4641bfd1806` que já está na URL atual), **mas isso não foi
confirmado**: o Google não entrega o conteúdo do lugar sem JavaScript e bloqueia o
headless, então ninguém verificou que esse `cid` cai na ficha certa. Abra no
navegador antes de trocar.

## Revisão de segurança — 2026-09-09

Nada grave. O site é estático, não tem `<form>`, `<input>`, cookie próprio,
`localStorage` nem qualquer estado de servidor. A superfície é o que a página carrega
de terceiros e para onde ela aponta.

**Corrigido nesta revisão.** Doze dos treze links externos usavam `target="_blank"`
sem `rel="noopener"`, o que entrega `window.opener` à página de destino e permite que
ela reescreva a aba de origem (*reverse tabnabbing*). Os navegadores atuais já aplicam
`noopener` sozinhos em `_blank`, então o risco prático era baixo, mas os antigos não.
`build.py` agora acrescenta o `rel` e **falha o build** se sobrar algum `_blank` sem
ele. Um link já vinha com `noopener noreferrer` do próprio tema.

**Conferido e limpo:**

- **Nenhum segredo.** Varredura por chaves de API, tokens, chaves privadas e strings
  de conexão não achou nada. Os `#wp-admin-bar-*` que aparecem em `tema.css` são só
  seletores CSS órfãos, inertes.
- **Nenhum token de sessão.** `et_frontend_nonce` e `et_ab_log_nonce` vieram
  preenchidos da captura e foram esvaziados na migração; nenhum hexadecimal solto
  sobrou no HTML.
- **Sem XSS.** Os dois `new Function("return this")` são o polyfill de `globalThis`
  do webpack, sem entrada externa. As três leituras de `location.hash` são
  sanitizadas antes do uso, com `replace(/[^a-zA-Z0-9-_|#]/g,"")` — o conjunto
  permitido não forma HTML, então não há injeção via seletor do jQuery. O
  `innerHTML` de `multi-view.js` recebe o JSON estático `diviElementMultiViewData`
  que está embutido na própria página.
- **Bibliotecas autênticas.** `jquery.min.js` é byte a byte igual ao 3.7.1 oficial do
  `code.jquery.com` nos 87533 bytes, com `jQuery.noConflict();` acrescentado ao final
  — comportamento padrão do WordPress, e o tema depende dele. `jquery-migrate.min.js`
  é idêntico ao 3.4.1 oficial, sem uma diferença sequer.
- **Sem arquivo indevido no commit**: nenhum `.DS_Store`, `.env`, dump, `.tar.gz` ou
  artefato de sonda; nenhum executável fora de `tools/`, que é gitignored.

**Aceito, com consciência do que é:**

- **O Google Tag Manager pode injetar JavaScript arbitrário, por definição.** Quem
  tiver acesso ao contêiner `GTM-PZ346GTV` controla o que roda na página. Isso é a
  natureza da ferramenta, não um defeito da migração, mas o acesso a esse contêiner
  merece o mesmo cuidado do acesso ao repositório.
- **Não há Content-Security-Policy.** O GitHub Pages não deixa definir cabeçalho
  HTTP, e um CSP em `<meta>` que ainda permitisse o GTM precisaria de
  `unsafe-inline` mais injeção dinâmica de script — ou seja, quase nenhuma proteção
  em troca de um risco real de quebrar a medição. Não vale.
- **Os dados pessoais da página são públicos de propósito**: telefone profissional,
  Instagram, endereço do consultório e os RQE 20033 e 20034. É a informação de
  contato de um consultório médico.


## Google Tag Manager

O contêiner é `GTM-PZ346GTV`, com o par snippet no `<head>` e `<noscript>` no início
do `<body>`. `probe.py` confere em toda largura que `window.google_tag_manager`
existe, que a chave do contêiner aparece nele e que o `dataLayer` recebeu o evento
`gtm.js`. **Não mexa nesses dois blocos sem rodar a sonda depois.**
