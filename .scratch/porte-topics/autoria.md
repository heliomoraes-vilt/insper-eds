# Autoria do `topics` (Fase 2)

Fase 1 (visual) entregue no PR #3 e no `fix/topics-markup-author`: bloco sem campos,
etapas fixas quando vazio, programa com `title | description`. A Fase 2 leva os campos do
`_cq_dialog` do original para o model, sem mudar o que a Fase 1 renderiza.

## Classificação dos campos do diálogo

Regra: campo dentro do multifield `./topics` (composite) é do **item**; o resto é do
**bloco**. Os `heading` e o `well` do diálogo são só layout e não viram campo.

| Diálogo | Campo | Onde | Componente UE | Padrão | Efeito |
|---|---|---|---|---|---|
| Título | `title` | bloco | text | vazio | `h2` acima da lista |
| Cor alternativa do título | `alternativeTitleColor` | bloco | boolean | false | `h2` vermelho `#E50505` |
| Estilo | `style` | bloco | select (Completo/Minimalista) | `full` | minimal: dot 24px, sem texto, em linha |
| Orientação no desktop | `desktopOrientation` | bloco | select (Vertical/Horizontal) | **`vertical`** | só Completo; > 5 tópicos fica vertical |
| Índice automático | `automaticIndex` | bloco | boolean | false | numera 01..N e ignora o índice do tópico |
| Tópicos → Título | `title` | item | text | | já existia |
| Tópicos → Descrição | `description` | item | richtext | | já existia |
| Tópicos → Índice | `index` | item | text, `maxLength` 3 | | número com zero à esquerda; sem índice, dot de 16px |
| Tópicos → Link | `link` | item | aem-content | | só o dot vira `<a>`; nunca se Desabilitado |
| Tópicos → Abrir em nova aba | `linkNewTab` | item | boolean | false | `target=_blank`, `rel=noopener noreferrer` |
| Tópicos → Aparência do marcador | `dotAppearance` | item | select (Padrão/Concluído/Desabilitado) | `default` | Concluído: check em `#00C756`; Desabilitado: `#EAEAEA` / `#6C7880` |

## Decisões

- **Ordem das células do item:** os campos novos vêm depois de `title | description`. As
  células são posicionais, e os tópicos já autorados continuam lidos certo.
- **Instâncias anteriores ao model do bloco** não têm as 5 linhas de campo (o nó guarda o
  model da inserção). `splitFieldRows` (`scripts/block-fields.js`) conta como campo só as
  linhas iniciais de uma célula. Elas renderizam como na Fase 1; para ter os campos do bloco
  no painel, é preciso reinserir o bloco.
- **Orientação padrão `vertical`**, e não `horizontal` como no diálogo: com tópicos
  autorados, PROD só usa vertical (programa do curso). Sem valor, o bloco faz o mesmo.
- **Etapas (bloco sem tópicos):** continuam fixas, numeradas e em linha no desktop. Título,
  cor do título e estilo valem para elas; orientação e índice automático, não (a descrição
  dos campos diz isso).
- **Show-hide do diálogo** (orientação só no Completo): a UE não tem esse recurso medido; a
  regra fica na descrição do campo, e o bloco ignora a orientação no Minimalista.
- **`xwalk/max-cells`:** a regra recomenda até 4 células, para autoria por documento. Aqui
  a autoria é só pela UE, e uma célula por campo é o contrato medido; o `.eslintrc.js` libera
  5 para `topics` e 6 para `topics-item`. Agrupar campos (`classes_*`, grupos) fica para
  quando esse markup for medido no author.
- **Título do bloco:** GT Ultra Fine no portal; aqui, a fonte de título do site, como o
  `accordion`. Cor padrão pelo token de texto, como o `accordion`.
- **Nome do link sem título nem índice:** placeholder `topics-link-label`, fallback "Tópico".

## Verificação

- Preview local: fixtures 4 a 9 de `test/eds-port.html`, testes "autoria: campos do bloco e
  do tópico" em `test/e2e/topics.spec.js`.
- Depois do merge, no dev (UE): inserir um Tópicos novo (painel com os 5 campos; vazio =
  etapas), mudar cada campo e conferir a página; abrir um tópico (6 campos); conferir que as
  instâncias antigas renderizam igual. O markup real das linhas de campo de um bloco com
  model **e** itens ainda não foi medido: copiar o `outerHTML` para `test/eds-port.html`.
