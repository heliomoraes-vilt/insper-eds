# Spec: porte do `topics` (#8)

Status: open

Porte do componente `insper-portal/components/topics` (React `Topics`) para o bloco EDS
`topics`. Medidas, instâncias de PROD e comportamento do original estão no `referencia.md`
ao lado desta spec, que é a fonte de verdade das asserções.

## Problem Statement

As páginas de curso de educação executiva usam o componente Tópicos de duas formas: as
**etapas do processo seletivo** (quatro tópicos numerados, idênticos em todos os cursos) e o
**programa do curso** (a lista de módulos, cada um com título e o que se aprende nele). No
EDS não existe bloco equivalente: o autor não consegue montar nenhuma das duas, e as páginas
de curso não podem ser levadas para o insper-eds.

O componente original expõe um diálogo com onze campos, mas nenhuma das 20 instâncias de PROD
usa título, cor alternativa, estilo minimalista, índice manual, link ou estados do marcador.
Portar o diálogo como está levaria ruído ao painel da Universal Editor sem ganho para o
conteúdo real.

## Solution

Um bloco **Tópicos** que chega pronto. Inserido sem preencher nada, ele mostra as etapas do
processo seletivo exatamente como em PROD. Quando o autor adiciona tópicos, o bloco passa a
mostrar o programa do curso com esses tópicos. O bloco não tem campos próprios: cada tópico
tem só um título e uma descrição. O visual (dots, conectores, vãos, tipografia, quebras por
largura e posição contra o grid do portal) reproduz a referência medida em PROD.

## User Stories

1. As an autor, I want to insert the Tópicos block into a section, so that the page shows the etapas do processo seletivo without any further editing.
2. As an autor, I want the empty block to show the four etapas ("Preencha o formulário de inscrição", "Análise do seu perfil", "Aprovação", "Matrícula Digital"), so that every course page shows the same official sequence.
3. As an autor, I want the etapas numbered 01 to 04 automatically, so that I never type or maintain the numbers.
4. As an autor, I want to add tópicos to the block, so that it shows the programa do curso instead of the etapas.
5. As an autor, I want each tópico to have a title field, so that I can name each module of the course.
6. As an autor, I want each tópico to have a rich-text description, so that I can list what is learned in each module with bullets, bold, italic and underline.
7. As an autor, I want to add, remove and reorder tópicos in the Universal Editor, so that the programa follows the course structure.
8. As an autor, I want a newly added empty tópico to still show its dot, so that I can see where it sits in the list and click it to edit.
9. As an autor, I want the block panel to show no block-level fields, so that I am not asked to configure options that no course page uses.
10. As an autor, I want edits to a tópico to update the page immediately in the Universal Editor, so that I see the final result while editing.
11. As an autor, I want formatting outside the allowed set (links, headings, inline styles) to be dropped from descriptions while keeping the text, so that the programa stays visually consistent across courses.
12. As an autor, I want a programa with a single tópico to show just the dot without a trailing line, so that the list never ends in a dangling connector.
13. As a visitante no desktop, I want the etapas laid out in a row with a line connecting the numbered dots, so that I read the admission process as a sequence.
14. As a visitante no celular, I want the etapas stacked vertically with a line between the dots, so that the text stays readable on a narrow screen.
15. As a visitante, I want the programa shown as a vertical list with small red dots joined by a thin grey line, so that I can scan the modules in order.
16. As a visitante, I want each module title in bold above its description, so that I can find a module quickly.
17. As a visitante, I want the module descriptions as hollow-circle bullet lists, so that the content looks the same as on the current site.
18. As a visitante, I want the last item of any sequence to have no connector line, so that the sequence visibly ends.
19. As a visitante, I want the block aligned with the rest of the page content (portal grid), so that it does not look shifted.
20. As a visitante usando tema escuro, I want the tópico text to follow the site text colour, so that it stays readable.
21. As a visitante usando leitor de tela, I want the sequence announced as an ordered list with a heading per tópico, so that I understand its structure.
22. As a visitante usando leitor de tela, I want the page not to announce extra navigation regions named "Tópicos", so that the landmark list only contains real navigation.
23. As a visitante em inglês, I want the etapas to come from the site's placeholder table, so that they can be translated without code changes.
24. As a editor de conteúdo, I want the etapas texts to live in the placeholder table, so that a wording change happens once for the whole site.
25. As a editor de conteúdo, I want the block to fall back to the PROD texts when the placeholder table is missing, so that the etapas never render empty.
26. As a desenvolvedor, I want the block's measurements asserted against the PROD reference, so that visual regressions are caught in CI.
27. As a desenvolvedor, I want the description sanitising rule as a pure, separately tested function, so that its allowlist is verified without rendering.
28. As a desenvolvedor, I want the block to follow the one-row-per-item xwalk contract, so that authored content renders the same in the author and in the preview.
29. As a desenvolvedor do `genio` (#26), I want the unported options (minimalista, completed, disabled) documented with their PROD values, so that I can add them when the Wizard is ported.

## Implementation Decisions

- **Um bloco, sem campos próprios.** O bloco não tem model de campos; a presença de tópicos
  decide o que ele mostra:
  - **sem tópicos** → etapas do processo seletivo: os quatro tópicos fixos, numerados `01`–`04`,
    só com título;
  - **com tópicos** → programa do curso: a lista vertical dos tópicos autorados, sem número.
- **Tópico (item filho):** dois campos, nesta ordem: `title` (text) e `description`
  (richtext). Cada tópico chega como uma linha com uma célula por campo.
- **Model:** definição com título "Tópicos", id `topics`, `template.name` "Topics" (gera a
  classe `topics`, igual à pasta), filtro `topics`. Item com título "Tópico", model
  `topics-item`, resourceType de item de bloco. O bloco entra no filtro `section`.
- **Textos das etapas:** placeholders `topics-step-1` a `topics-step-4`, lidos pelo módulo de
  placeholders já existente, com os textos de PROD como fallback no bloco.
- **Fluxo (layout):**
  - etapas: coluna abaixo de 1200px, linha a partir de 1200px (media query de janela, como o
    original);
  - programa: sempre coluna;
  - a regra original de "mais de 5 tópicos horizontais vira vertical" não se aplica, porque só as
    etapas (sempre 4) ficam em linha.
- **Índice:** só nas etapas, sempre automático, com zero à esquerda (`01`). Programa sem
  índice: dot pequeno de 16px, sem texto.
- **Descrição:** sanitizada com a allowlist do original (`p strong b em i u ul ol li`), todos
  os atributos removidos, tags fora da lista desembrulhadas (o texto fica). Função pura, num
  módulo próprio do bloco.
- **Tópico vazio:** continua renderizando o dot e o conector (o último tópico nunca tem
  conector).
- **Instrumentação:** os elementos do tópico mantêm a instrumentação da Universal Editor depois
  da decoração (mover com o utilitário de instrumentação ao recriar o markup).
- **Markup final:** lista ordenada (`ol` > `li`), sem o `<nav>` do original e, portanto, sem
  `aria-label`. Cada tópico com título como `h3`; o número do dot é texto.
- **Visual:** valores da referência. Dot largo 44px e pequeno 16px, vermelho `#E50505` com texto
  branco 600 13px; conector de 1px `#808080`; vão de 16px entre a coluna do dot e o texto;
  coluna do dot de 44px na coluna, ou de 51px de altura na linha; padding da coluna de texto
  `0 24px 24px 0` na coluna e `16px 24px 0 0` na linha; vão de 8px entre título e descrição;
  título 700 16px/20px; descrição 400 13px/21px; `ul` com padding de 20px, margem inferior de
  8px e marcador `circle`.
- **Grid:** o wrapper do bloco aplica o grid do portal (máx. 1512px, recuo de 24/48/96px), como
  o `share`. É uma cópia provisória: o porte do #9 (`columns` / section) leva o grid para a seção
  e remove as cópias por bloco.
- **Tema:** cor do texto por token com fallback `#1a1a1a`; vermelho, branco do número e cinza do
  conector fixos.
- **Fonte:** herda a fonte do site, como os outros blocos portados.
- **Sem legado:** não existe instância de `topics` no author de dev, então não é preciso apelido
  de nome antigo nem tolerância a campos removidos.

## Testing Decisions

- **Bom teste:** verifica só o comportamento externo (o DOM decorado e os estilos computados do
  bloco renderizado), com os valores esperados vindos da referência medida em PROD, nunca
  recalculados a partir do CSS do bloco.
- **Seam principal: o bloco renderizado no preview local** (Playwright), sobre a página de porte
  com o markup do author e as fixtures. Dois blocos na página:
  1. um `topics` vazio (etapas);
  2. o programa de 5 tópicos de "Gestão Financeira Empresarial" (títulos e conteúdo públicos do
     curso, sem dado pessoal).

  O markup é escrito à mão no contrato medido, porque o author só gera o bloco depois do merge;
  a conferência com o markup real é o passo 4 da entrega.
- **Viewports:** 1440×900 e 375×812, `colorScheme: 'light'`, mais um caso de tema escuro que só
  verifica que o texto continua visível.
- **Asserções a partir da referência:**
  - etapas: textos e números `01`–`04`; `flex-direction` em linha a 1440 e em coluna a 375; dot
    de 44px; conector horizontal de 1px a 1440 e vertical (largura 1px, altura mínima 24px) a
    375; último conector oculto; paddings da coluna de texto por largura;
  - programa: dot de 16px na posição (14, 0) dentro da coluna de 44px; conector de 1px a partir
    de y=16; coluna de texto em x=60; `ul` com marcador `circle` e padding de 20px; último
    conector oculto;
  - posição: x do bloco igual ao início do grid (96px a 1440, 24px a 375);
  - estrutura: `ol` > `li` com `h3`, sem landmark `navigation`;
  - placeholders: um caso com o texto vindo da tabela e outro com a tabela em 404 (fallback).
- Alturas de item e quebras de linha **não** são asserções (a fonte difere; ver Limites da
  referência).
- **Regras puras (`node:test`):** o sanitizador da descrição (allowlist, remoção de atributos,
  desembrulho) e o número do índice com zero à esquerda.
- **Prior art:** as specs Playwright de `share`, `instagram-timeline`, `accordion` (item filho)
  e `placeholders` (tabela e fallback).
- **Manual, no checklist do ticket:** leitor de tela (lista ordenada e títulos) e Universal
  Editor (inserir vazio = etapas, adicionar/remover/reordenar tópicos, edição ao vivo).

## Out of Scope

- **Estilo minimalista** e os **estados do marcador** `completed` (check verde `#00C756`) e
  `disabled` (`#EAEAEA` / `#6C7880`): só o Wizard do `genio` usa, e o `genio` não está em PROD.
  O #26 decide quando portar. Os valores estão na referência.
- **Título do bloco, cor alternativa do título, índice manual, link e nova aba no tópico:**
  nenhuma instância de PROD usa.
- **Etapas com outros textos ou outra quantidade** (ex.: a "etapa da entrevista" citada para
  Finanças): ticket próprio quando alguma instância de PROD precisar.
- **Largura da coluna da página de curso** (o grid menos 470px do cartão "Próximas turmas"):
  pertence ao layout da página de curso (`anchornavigation` e cartão de turmas), ainda não
  portado. Até lá o bloco usa a largura cheia do grid.
- **Grid do portal na seção:** fica para o #9.
- **Fontes do portal** (Inter, DM Sans): Passo 0 do plano.
- **Achados do portal:** registrados nos achados internos do `topics`, não no insper-eds.

## Further Notes

- **Desvios aceitos em relação ao original:**
  - largura cheia do grid em vez da coluna da página de curso;
  - `ol` sem `<nav>`, o que corrige o achado das landmarks duplicadas "Tópicos";
  - fonte do site no lugar de Inter e DM Sans;
  - textos das etapas fixos no bloco (com placeholder) em vez de autorados em cada instância.
- **Branch:** `feat/porte-topics`, criada da `main` atualizada depois do merge da
  `chore/fluxo-porte` (Fase 0: Playwright, servidor de teste, convenções do porte), da qual os
  testes dependem.
- **Glossário:** usar "etapas do processo seletivo", "programa do curso" e "tópico" no código,
  nos testes e nos tickets.
- **Placeholders:** o caminho da tabela no author ainda não está confirmado; enquanto ela não
  existir, os fallbacks garantem o visual de PROD.
- **Corte sugerido para o `/to-tickets` (tracer bullets):**
  - (01) model, contrato e etapas com o bloco vazio;
  - (02) programa com tópicos e o sanitizador;
  - (03) placeholders das etapas;
  - (04) grid, tema escuro e conferência a 375px.
