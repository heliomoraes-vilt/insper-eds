# Referência: topics (porte de `Topics`, `insper-portal/components/topics`)

**Fonte:** PROD, `https://www.insper.edu.br/pt/cursos/educacao-executiva/financas/gestao-financeira-empresarial`,
medido no Chrome em 16/11/2026: documento principal a 1920px e iframes de mesma origem a
1440×900 e 375×812.
**Variantes cobertas:** as duas que existem em PROD: **programa** (vertical, sem índice,
título + descrição em `<ul>`) e **etapas do processo seletivo** (horizontal, índice
automático, 4 itens só com título). Minimal, título do bloco, índice manual, links e os
estados `completed` / `disabled` não aparecem em nenhuma instância de PROD.

## Original lido

- Arquivos e linhas: `components/Topics/` (461: `Topics.tsx` 157, `Topics.style.tsx` 267,
  `Topics.types.ts` 37). Dependências que carregam comportamento: `Icon.tsx` (`case "check"`,
  SVG 16×16, path `M13 4.5 6.5 11 3 7.5`, traço 2, `currentColor`), `utils/styled/titleColor.ts`
  (preto `#1D1D1B`, alternativa vermelho `#E50505`), `_variables.styled.ts` (`devices.desktop` =
  `min-width: 1200px`), `sanitize-html` (allowlist `p strong b em i u ul ol li`, sem atributos).
  Outro consumidor: `Wizard/` (usado pelo `GenioFlow`) monta um `Topics` minimal, horizontal,
  com índice automático e `dotState` calculado pelo passo (anteriores `completed`, atual
  `default`, seguintes `disabled`), `max-width: 310px`.
- Diálogo → props (`TopicsModel`, `TopicItemModel`):

  | Campo do diálogo | Prop | Efeito |
  |---|---|---|
  | Título | `title` | `<h2>` acima da lista e `aria-label` do `<nav>` |
  | Cor alternativa do título | `alternativeTitleColor` | `#1D1D1B` → `#E50505` |
  | Estilo (Completo / Minimalista) | `style` (`full` padrão) | minimal: dot 24px, sem texto, sempre em linha |
  | Orientação no desktop | `desktopOrientation` (`horizontal` padrão) | só em `full`; > 5 itens força vertical |
  | Índice automático | `automaticIndex` | numera 1..N com zero à esquerda (`01`) |
  | Tópicos (multifield) → Índice | `topics[].index` | máx. 3 caracteres; numérico ganha zero à esquerda |
  | → Título | `topics[].title` | `<h3>` |
  | → Descrição (RTE: negrito, itálico, sublinhado, lista) | `topics[].description` | HTML sanitizado |
  | → Link, Abrir em nova aba | `topics[].link`, `linkNewTab` | só o dot vira `<a>` (nunca se `disabled`) |
  | → Aparência do marcador | `topics[].dotAppearance` → `dotState` | `default` / `completed` (check verde) / `disabled` (cinza) |

- Origem dos dados: **só autoria**. O Sling Model só normaliza `style`, `desktopOrientation` e
  `dotState`; não há service, Content Fragment nem chamada no browser.

## Instâncias em PROD (`find-in-prod.js`, 16/11/2026)

Varridas 892 páginas (700 a partir dos links da home + os sitemaps `cursos` e `quem-somos`;
docentes, notícias e eventos ficaram de fora). **20 instâncias em 10 páginas**, todas de
educação executiva, duas por página, dentro de abas do `anchornavigation`. Nenhuma página com
`genio`.

| Prop | Valores em PROD | Muda entre instâncias? |
|---|---|---|
| `title` | sempre vazio | não |
| `alternativeTitleColor` | sempre `false` | não |
| `style` | sempre `full` | não |
| `desktopOrientation` | `vertical` (10) / `horizontal` (10) | **sim** |
| `automaticIndex` | `false` nas verticais, `true` nas horizontais | sim, mas sempre junto com a orientação |
| `topics[].index` | sempre vazio | não |
| `topics[].dotState` | sempre `default` | não |
| `topics[].link` / `linkNewTab` | sempre vazio | não |
| `topics[].title` | programa: muda por curso (2 a 9 itens); etapas: **idêntico nas 10** | programa sim, etapas não |
| `topics[].description` | programa: `<ul><li>` (às vezes `<em>`), às vezes vazia; etapas: sempre vazia | programa sim |

Etapas, idênticas nas 10 páginas: `Preencha o formulário de inscrição`, `Análise do seu
perfil`, `Aprovação`, `Matrícula Digital`.

Páginas (públicas, títulos de curso): `estrutura-organizacional-aplicada-a-gestao-de-pessoas`,
`introducao-ao-mercado-financeiro`, `financas-para-rh-indicadores-e-decisoes`,
`gestao-do-patrimonio-pessoal-fundamentos`, `gestao-da-tesouraria-e-do-fluxo-de-caixa-de-empresas`,
`estruturacao-de-negocios-financeiros-estrategia-regulacao-e-viabilidade`,
`gestao-financeira-empresarial`, `ciclo-politico-pos-eleicoes-congresso-governabilidade-e-agenda-nacional`,
`custos-e-formacao-de-precos-da-analise-a-decisao`, `recuperacao-judicial-de-empresas`.

## Medidas

Posições relativas à caixa do `<nav>` do bloco (x, y, largura, altura em px).

### Posição da caixa do bloco contra o grid

| Viewport | Área útil | x do bloco | Largura do bloco | Contêiner |
|---|---|---|---|---|
| 1920 | 1905 (barra de 15px) | 292,5 = (1905 − 1512)/2 + 96 | 850 | grid 1320 = 1512 − 2×96 |
| 1440 | 1425 | 96 | 763 | grid 1233 = 1425 − 2×96 |
| 375 | 360 (barra de 15px no iframe) | 24 | 312 | 360 − 2×24 |

O x do bloco é o início do grid do portal (1512px, recuo 24/48/96px). No desktop o bloco ocupa
a coluna de conteúdo da página de curso: grid − **470px** (cartão "Próximas turmas" fixo à
direita + vão), nas duas larguras. A 375 ocupa a largura toda do grid. A coluna de 470px é do
layout da página de curso, não do `topics`, que é `width: 100%` do seu contêiner.

### Comum às duas variantes

| Elemento | Propriedade | Valor | Viewport |
|---|---|---|---|
| `nav` | `container-type` | `inline-size` | todas |
| `ol` | `list-style` / margem / padding | `none` / 0 / 0 | todas |
| `li` | `gap` | 16px | todas |
| dot | fundo / cor | `rgb(229, 5, 5)` / `rgb(255, 255, 255)` | todas |
| dot | `border-radius` | 50% | todas |
| dot | fonte | DM Sans 600 13px/13px, `letter-spacing` 0.65px | todas |
| conector | fundo | `rgb(128, 128, 128)` | todas |
| conector do último item | `display` | `none` | todas |
| `h3` do item | fonte | Inter 700 16px/20px, `letter-spacing` −0.1px, `rgb(26, 26, 26)`, margem 0 | todas |
| coluna de texto | `gap` | 8px | todas |

### Programa (vertical, 5 itens com título e descrição)

| Elemento | Propriedade | Valor | Viewport |
|---|---|---|---|
| `ol` | `flex-direction` | `column` | 1440 e 375 |
| `li` | `flex-direction` / `align-items` | `row` / `flex-start` | 1440 e 375 |
| `li` | alturas | 123, 144, 123, 144, 123 | 1440 (e 1920) |
| `li` | alturas | 310, 228, 227, 269, 227 | 375 |
| coluna do dot | caixa | 0, 0, 44, altura do `li` | 1440 e 375 |
| dot (sem índice: pequeno) | caixa | 14, 0, 16, 16 | 1440 e 375 |
| dot | texto | vazio | todas |
| conector | caixa | 21.5, 16, 1, (altura do `li` − 16) | 1440 e 375 |
| coluna de texto | x / padding | 60 / `0 24px 24px 0` | 1440 e 375 |
| coluna de texto | largura | 703 | 1440 |
| coluna de texto | largura | 252 | 375 |
| `h3` | caixa | 60, 0, 679, 20 | 1440 |
| `h3` | caixa | 60, 0, 228, 60 (3 linhas) | 375 |
| descrição (`div`) | fonte | Inter 400 13px/21px, `rgb(26, 26, 26)` | todas |
| descrição | caixa | 60, 28, 679, 71 | 1440 |
| descrição | y | 68 | 375 |
| `ul` da descrição | margem / padding | `0 0 8px` / `0 0 0 20px` | todas |
| `ul` | `list-style` | `outside none circle`; marcador `rgb(26, 26, 26)` | todas |
| `li` da descrição | x / margem | 80 / 0 | 1440 e 375 |

### Etapas (horizontal, índice automático, 4 itens só com título)

| Elemento | Propriedade | Valor | Viewport |
|---|---|---|---|
| `ol` | `flex-direction` | `row` | 1440 e 1920 |
| `ol` | `flex-direction` | `column` | 375 |
| `li` | `flex-direction` / `align-items` | `column` / `stretch` (`flex: 1 1 0`) | 1440 |
| `li` | caixas | 0 / 190.8 / 381.5 / 572.3, largura 190.8; alturas 143, 103, 103, 103 | 1440 |
| `li` | largura | 212.5; alturas 123, 103, 103, 103 | 1920 |
| `li` | `flex-direction` | `row` | 375 |
| `li` | alturas | 68, 68, 68, 44 | 375 |
| coluna do dot | caixa / direção | 0, 0, 190.8, 51 / `row` (44 + 7 para o foco) | 1440 |
| coluna do dot | caixa / direção | 0, 0, 44, 68 / `column` | 375 |
| dot (com índice: largo) | caixa | 0, 3.5, 44, 44 | 1440 |
| dot | caixa | 0, 0, 44, 44 | 375 |
| dot | textos | `01`, `02`, `03`, `04` | todas |
| conector | caixa | 44, 25, 146.8, 1 (horizontal) | 1440 |
| conector | caixa | 44, 25, 168.5, 1 | 1920 |
| conector | caixa | 21.5, 44, 1, 24 (vertical, `min-height` 24) | 375 |
| coluna de texto | caixa / padding | 0, 67, 190.8, 76 / `16px 24px 0 0` | 1440 |
| coluna de texto | caixa / padding | 60, 0, 252, 64 / `0 24px 24px 0` | 375 |
| `h3` | caixa | 0, 83, 166.8, 60 ("Preencha o formulário de inscrição" em 3 linhas) | 1440 |
| `h3` | caixa | 0, 83, 188.5, 40 (2 linhas) | 1920 |
| `h3` | caixa | 60, 0, 228, 40 | 375 |

Na página, as etapas vêm depois de dois textos autorados na mesma aba ("Processo Seletivo",
"Conheça as etapas para ingressar no curso:") e antes de um parágrafo; nada disso é do bloco.

### Valores do código que PROD não exercita

Do `Topics.style.tsx`, sem instância para medir: dot minimal 24px (Inter 700 10px), dot
`completed` `#00C756` com check branco 16px, dot `disabled` fundo `#EAEAEA` e texto `#6C7880`,
título do bloco GT Ultra Fine 700 32px/28px com margem `24px 0`, link do dot com foco
`outline: 2px solid #E50505; outline-offset: 2px`, `min-width` 160px do item em linha (full).

## Comportamento

- Fluxo (`resolveFlow`): minimal → linha sempre (com > 6 itens, só com contêiner ≥ 375px);
  full + horizontal com ≤ 5 itens → coluna no mobile, linha a partir de 1200px; full + horizontal
  com > 5 itens → coluna sempre; full + vertical → coluna sempre. As media queries usam a
  largura da janela (`min-width: 1200px`); só o `rowAbove375` usa container query.
- Índice: automático → `1..N` com zero à esquerda; manual → até 3 caracteres, zero à esquerda
  só se for numérico; sem índice e sem `completed` → dot pequeno de 16px sem texto.
- Sem itens e sem título → o componente não renderiza nada.
- Descrição: tags fora da allowlist são desembrulhadas (o texto fica), atributos removidos.
- Interação: nenhuma em PROD (nenhuma instância tem link).
- A11y medida: `<nav aria-label="Tópicos">` (sem título) → `<ol>` → `<li>` → `<h3>`; o dot é
  texto (`01`) sem `aria-hidden`; duas landmarks `navigation` "Tópicos" na página medida.
  Leitor de tela não testado.
- Falhas: não há dados remotos.

## Limites da referência

- Fontes: PROD usa Inter (400/600/700) e DM Sans 600, carregadas; o insper-eds tem Roboto e
  Roboto Condensed. Larguras de texto (e quebras de linha, logo as alturas dos itens) vão
  diferir; comparar caixas fixas e estilos computados.
- A 375 o iframe tinha barra de rolagem de 15px (área útil 360). No Playwright a 375 a
  largura útil depende da barra do Chromium; asserções de largura devem usar a área útil.
- A largura do bloco no desktop vem do layout da página de curso (`anchornavigation` + cartão
  fixo), que ainda não existe no EDS.
