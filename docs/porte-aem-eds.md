# Porte AEM → EDS: convenções de bloco e de teste

Blocos portados do portal Insper (AEM SPA, React) para este repo xwalk. Este documento
é lido pelo `/implement`, pelo `tdd` e pelo `code-review`. Base:
`aem-boilerplate-xwalk`, com autoria pela Universal Editor; ver também o `AGENTS.md`.

> Origem: semente da skill `insper-aem-to-eds`, copiada na Fase 0 (16/11/2026). Este
> arquivo do repo é a fonte de verdade: ajustes nas convenções são feitos aqui.

## Testes

- Rodar: `npm test` (Playwright). O `playwright.config.js` sobe `node test/serve.mjs . 3920`
  e reaproveita um servidor que já esteja na porta. Exemplos vivos: `test/e2e/share.spec.js`,
  `instagram-timeline.spec.js`, `accordion.spec.js`.
- **Grade do portal ainda não portada.** A seção do repo é a do boilerplate (máx. 1200px,
  padding 24/32px); a do portal é 96/48/24px com máx. 1512px (Passo 0 do plano). Medida
  que depende da largura da seção a 1440px fica em `test.fixme` com o motivo, até a grade
  entrar; o que é do bloco (vãos, proporções, tamanhos fixos) é asserção normal.

- **Seam padrão: o bloco renderizado.** O teste abre `test/eds-port.html` (markup
  que o AEM gera + fixtures em `test/fixtures/`), espera o bloco ficar
  `data-block-status="loaded"` e verifica pelo DOM e pelos estilos computados. Não
  testar funções internas do `decorate`.
- **Regras puras** (montagem de URL, datas, preços) ficam num módulo do bloco e são
  testadas com `node:test` no mesmo diretório de `test/`.
- **Valores esperados vêm da referência**, `.scratch/porte-<bloco>/referencia.md`
  (medida em PROD ou no React original), nunca do próprio CSS do bloco. Asserção
  que recalcula o valor do jeito que o código calcula é tautológica.
- Viewports: 1440×900 e 375×812, com `colorScheme: 'light'`. O tema escuro do site
  tem um caso próprio, que só verifica que nada some (contraste/visibilidade).
- Rede: fixtures servidas localmente; casos de falha com `page.route` (status 500,
  `route.abort()`, corpo não-JSON).
- Arquivo: `test/e2e/<bloco>.spec.js`, com nomes de teste que descrevem
  comportamento ("abrir o 2º item fecha o 1º").

## Como o AEM entrega um bloco com model

Medido no author de dev em 13/11/2026 (`share` e `world-map` na `index`):

```html
<div class="<template.name em kebab-case>">   <!-- NÃO é o id do model -->
  <div><div><p>valor campo 1</p></div></div>  <!-- UMA LINHA POR CAMPO do bloco, -->
  <div><div><p>valor campo 2</p></div></div>  <!-- cada uma com uma célula,       -->
  <div><div></div></div>                      <!-- na ordem do model; vazio = linha vazia -->
  <div>                                       <!-- itens filhos: uma linha por item, -->
    <div>título do item</div>                 <!-- uma célula por campo do item       -->
    <div><p>richtext…</p></div>
  </div>
</div>
```

- **O nome do bloco vem do `template.name`**, convertido em kebab-case, e não do
  `id`. `"name": "Compartilhar"` gera `class="compartilhar"`, e o `aem.js` pede
  `/blocks/compartilhar/compartilhar.js`, que dá 404. O `template.name` precisa gerar
  exatamente o nome da pasta do bloco (`"Share"` → `share`,
  `"Instagram Timeline"` → `instagram-timeline`). O nome em português para o autor
  vai no `title` da definição.
- **Campos do bloco: uma linha cada**, com uma célula, sempre presente mesmo vazia.
  Esse é o formato medido; "uma linha com uma célula por campo" é o formato errado
  (o `block-fields.js` do repo assumia esse e precisa de correção na Fase 0).
- Itens filhos depois dos campos: a forma "uma linha por item, uma célula por campo"
  vem do boilerplate e do `hero`. **Confirmar no dev** no primeiro bloco com itens e
  campos ao mesmo tempo.
- **Itens sem campos de bloco** (medido no `topics`, 16/11/2026): cada item é uma linha
  com `data-aue-model="<item>"` e **uma célula por campo, mesmo vazias**; célula vazia
  vem sem `data-aue-prop`.
- **Bloco sem model e sem itens** chega com **uma linha de uma célula vazia**, sem
  instrumentação (`<div class="topics"><div><div></div></div></div>`). Ela não é item:
  filtrar antes de contar linhas.
- **Instrumentação das células:** o `wrapTextNodes` do `aem.js` (dentro do
  `decorateBlock`, antes do `decorate`) embrulha o texto solto da célula num `<p>` e
  **passa os `data-aue-*` da célula para esse `<p>`**. Ao trocar a célula por outro
  elemento, mover a instrumentação da célula **e** dos descendentes com
  `data-aue-prop`; senão a edição no canvas se perde.
- Ao escrever o markup de `test/eds-port.html`, copiar o HTML real que o author gera
  (abrir a página limpa no Chrome e copiar o `outerHTML` do bloco antes do
  `decorate`, ou o `.plain.html`), em vez de escrevê-lo à mão. O preview local só
  vale o que o markup dele vale.

- `boolean` chega como texto `"true"` / `"false"`.
- `richtext` chega como HTML (`<p>`, `<b>`, `<a>`, `<br>`, `<table>`). **O pipeline
  remove `style` inline** — formatação inline do portal não chega.
- `aem-content` (link) chega como `<a href>`; `fieldValues` já devolve o href.

## Lendo os campos

```js
import { fieldCells, fieldValues, itemRows } from '../../scripts/block-fields.js';

const FIELDS = ['text', 'tooltip', 'id'];
const { text, tooltip, id } = fieldValues(block, FIELDS); // strings
const cells = fieldCells(block, FIELDS);                  // elementos (a célula de cada linha)
itemRows(block, FIELDS).forEach((row) => { const [a, b] = [...row.children]; });
```

Os nomes precisam estar **na ordem do model**. Os N primeiros filhos do bloco são os N
campos, um por linha; `itemRows` devolve as linhas de item que vêm depois. Para tirar um
campo do DOM (como a variante do `notice`), remover a **linha** (`cell.parentElement`),
não só a célula.

## Model mínimo (só campos)

```json
{
  "definitions": [{
    "title": "Compartilhar", "id": "share",
    "plugins": { "xwalk": { "page": {
      "resourceType": "core/franklin/components/block/v1/block",
      "template": { "name": "Share", "model": "share" }
    } } }
  }],
  "models": [{ "id": "share", "fields": [
    { "component": "text", "valueType": "string", "name": "text", "label": "Texto", "value": "padrão do diálogo" },
    { "component": "boolean", "valueType": "boolean", "name": "flag", "label": "…" },
    { "component": "select", "valueType": "string", "name": "variant", "label": "Variante",
      "options": [{ "name": "Padrão", "value": "" }, { "name": "Escuro", "value": "dark" }] }
  ] }],
  "filters": []
}
```

## Model com itens filhos (lista / multifield do AEM)

O bloco ganha `"filter": "<bloco>"` no template, e há uma segunda definição com
`resourceType` `core/franklin/components/block/v1/block/item`:

```json
"definitions": [
  { "title": "Accordion", "id": "accordion", "plugins": { "xwalk": { "page": {
      "resourceType": "core/franklin/components/block/v1/block",
      "template": { "name": "Accordion", "model": "accordion", "filter": "accordion" } } } } },
  { "title": "Accordion — item", "id": "accordion-item", "plugins": { "xwalk": { "page": {
      "resourceType": "core/franklin/components/block/v1/block/item",
      "template": { "name": "Item", "model": "accordion-item" } } } } }
],
"filters": [{ "id": "accordion", "components": ["accordion-item"] }]
```

Exemplos no repo: `blocks/hero/` (campos + `hero-cta`), `blocks/accordion/`.

## Checklist do repo

- [ ] `blocks/<bloco>/_<bloco>.json` + o bloco no filtro `section` de `models/_section.json`
- [ ] `npm run build:json` (o pre-commit do husky também roda; nunca editar os 3 JSON da raiz à mão)
- [ ] máximo 4 células por linha (regra do `eslint-plugin-xwalk`)
- [ ] `moveInstrumentation(from, to)` (de `scripts/scripts.js`) ao mover/recriar elementos autorados
- [ ] CSS escopado em `.<bloco> …`; nada de `.<bloco>-wrapper` / `-container` (são de seção)
- [ ] mobile first: `@media (width >= 768px)` etc. (notação de range do stylelint)
- [ ] `npm run lint` verde. Erros comuns: `prefer-destructuring` (`const [a, b] = arr`),
      `import/extensions` (sempre `.js`), linha CRLF (o `.gitattributes` fixa LF)
- [ ] sem grid próprio do portal: a seção já dá `max-width` e padding

## Tema e tokens

O site tem tema claro/escuro (`prefers-color-scheme` + `html[data-theme]`). Cores de
**texto e fundo** usam os tokens com o valor do portal como fallback:
`color: var(--text-color, #000)`, `background-color: var(--background-color, #fff)`.
Cores de marca (vermelho `#E50505`, ativo `#C7321F`, cores das redes) ficam fixas.
Ícone preto fixo vira `fill="currentColor"`, ou some no escuro.

## Placeholders

Textos fixos de um bloco (iguais em todas as instâncias, só mudam por idioma) vêm da
tabela de placeholders, e não de um campo do model. Leitura com `scripts/placeholders.js`:

```js
import { fetchPlaceholders, placeholder } from '../../scripts/placeholders.js';

const table = await fetchPlaceholders(); // idioma do <html lang>, uma busca por página
const label = placeholder(table, 'share-copy-link', 'Copiar link'); // fallback = texto do portal
```

- Uma tabela por idioma: `/<lang>/placeholders.json`, colunas `Key` e `Text`.
  **Caminho a confirmar no author** quando a planilha for criada (em 13/11/2026 ela não
  existia). Se o author servir em outro caminho, só o `fetchPlaceholders` muda.
- Chaves `<bloco>-<uso>` em kebab-case. O texto original do portal fica no bloco como
  fallback, então o bloco renderiza certo sem a tabela.
- Testes: fixtures em `test/fixtures/<lang>/placeholders.json`; um caso com o texto da
  tabela e outro com a tabela em 404 (ver `test/e2e/placeholders.spec.js`).
