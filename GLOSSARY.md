# Portal Insper em EDS

Site institucional do Insper, portado do portal AEM SPA (React) para Edge Delivery
Services com autoria pela Universal Editor.

## Porte

**Referência**:
As medidas do componente original (em PROD ou no React original renderizado) que um bloco
portado precisa reproduzir.
_Avoid_: baseline, mock

**Achado**:
Um defeito do portal original encontrado durante o porte, registrado à parte e não
corrigido no bloco, a não ser por decisão explícita.
_Avoid_: bug do bloco

**Placeholder**:
Um texto fixo de um bloco, igual em todas as instâncias, que só muda por idioma.
_Avoid_: label, string fixa, campo de texto

## Página de curso

**Etapas do processo seletivo**:
A sequência fixa de quatro passos para ingressar num curso de educação executiva, igual em
todos os cursos.
_Avoid_: steps, wizard

**Programa do curso**:
A lista dos módulos de um curso, cada um com um título e o que se aprende nele.
_Avoid_: grade, ementa

**Tópico**:
Um item das etapas do processo seletivo ou do programa do curso.
_Avoid_: passo, módulo (quando se fala do item do bloco)
