# Porta o topics do portal institucional (#8)

## Summary

Bloco **Tópicos** sem campos próprios. Inserido vazio, mostra as **etapas do processo
seletivo**; com tópicos, mostra o **programa do curso**. Spec e referência medida em PROD em
`.scratch/porte-topics/`.

```text
decorate(topics)
  linhas = itemRows(block)              # sem campos: toda linha é um tópico
  se não há linhas                      # etapas do processo seletivo
    textos = placeholders topics-etapa-1..4, fallback = textos de PROD
    4 tópicos numerados 01–04, em linha a partir de 1200px
  senão                                 # programa do curso
    cada linha (title | description) → tópico sem número, dot de 16px, sempre em coluna
    description → allowlist do original (p strong b em i u ul ol li, sem atributos)
  <ol class="topics-list"> > <li> > dot + conector | <h3> + descrição    # sem <nav>
```

```diff
 blocks/
+└── topics/          # topics.js, topics.css, _topics.json (só o model do item "Tópico")
 models/_section.json # + "topics" no filtro da seção
 test/
 ├── e2e/
+│   └── topics.spec.js    # 20 casos, 1440 e 375px, valores de referencia.md
 ├── eds-port.html         # + etapas (vazio), programa (5 tópicos), allowlist/tópico vazio
 └── fixtures/pt/placeholders.json   # + topics-etapa-1..4
```

Esta branch saiu da `chore/fluxo-porte` (Fase 0: Playwright, `test/serve.mjs`,
`docs/porte-aem-eds.md`, accordion), que ainda não está na `main`; os commits dela vêm junto.

## Evidence

Preview da branch: `https://feat-porte-topics--insper-eds--heliomoraes-vilt.aem.page/<página>`.
**Pendente:** a página de teste (`test/eds-port.html`) está no `.hlxignore`, e o author de dev
só mostra o bloco no seletor depois do merge. Precisamos de uma página de conteúdo com um
`topics` vazio e um com tópicos para este link.

- **Before (PROD, `/pt/cursos/educacao-executiva/financas/gestao-financeira-empresarial`):**
  `topics-prod-etapas-1920.png`, `topics-prod-programa-1920.png`, `topics-prod-etapas-375.png`,
  `topics-prod-programa-375.png`
  **After (EDS, preview local):** `topics-eds-etapas-1920.png`, `topics-eds-programa-1920.png`,
  `topics-eds-etapas-375.png`, `topics-eds-programa-375.png`
  (anexar de `new-portal/.docs-internos/eds-port-poc/screenshots/`)

| Medida | PROD | EDS |
|---|---|---|
| x do bloco a 1920 / 1440 / 375 | 292,5 / 96 / 24 | 292,5 / 96 / 24 |
| dot das etapas | 44px, `rgb(229, 5, 5)`, `01`–`04` branco 600 13px | igual |
| coluna do dot (linha) / dot | 51px / y=3,5 | igual |
| conector | 1px `rgb(128, 128, 128)`, último oculto | igual |
| texto das etapas (linha) | y=67, padding `16px 24px 0 0`, h3 y=83 | igual |
| etapas a 375 | coluna, conector vertical em x=21,5 com mín. 24px, texto em x=60 | igual |
| dot do programa | 16px em (14, 0) na coluna de 44px | igual |
| descrição | 400 13/21px, `ul` circle, recuo 20px, margem inferior 8px | igual |
| título do tópico | 700 16/20px, −0,1px | igual |
| largura do bloco a 1440 | 763 (coluna da página de curso) | 1248 (grid inteiro), desvio aceito |
| fonte | Inter / DM Sans | Roboto (fonte do site), desvio aceito |
| cor do texto | `#1a1a1a` | token do site (`#0a0a0a` no claro), desvio aceito |

```text
npx playwright test   → 45 passed, 1 skipped (o skip já existia)
npm run lint          → ok
```

## Merge Danger

**Door:** two-way

Bloco novo, sem instâncias no author; reverter tira o bloco do seletor da seção.

**Blast Radius:** baixo

- Conflito no `component-models.json` com a `main` (a `main` tirou o model do `share`): resolver
  rodando `npm run build:json` depois do merge.
- O grid do portal (`main > .section > .topics-wrapper`) é cópia provisória do `share`; o #9
  leva o grid para a seção.
- A tabela de placeholders ainda não existe: as etapas usam os textos de PROD até ela ter as
  chaves `topics-etapa-1` a `topics-etapa-4`.
- Depois do merge: conferir no author de dev (arquivos do bloco com 200, inserir vazio = etapas,
  adicionar/remover/reordenar tópicos, markup real contra a fixture escrita à mão).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
