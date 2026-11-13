/*
 * Bloco `accordion` — porte de components/Accordion (insper-portal/components/accordion).
 *
 * Origem: Accordion.tsx (106) + .style.tsx (94) + .types.ts (13), mais Heading,
 * titleColor, os ícones plus/minus de Icon.tsx e a whitelist do sanitize-html.
 *
 * Contrato xwalk (_accordion.json):
 *   1ª linha  -> campos do bloco: title | alternativeTitleColor | id
 *   demais    -> um item "Accordion — item" por linha: title | body (richtext)
 *
 * Comportamento do original mantido: começa tudo fechado e só um item fica aberto
 * por vez. Aqui isso sai do <details name="..."> nativo (abrir um fecha os outros
 * do mesmo nome), sem estado em JS.
 */

import { moveInstrumentation } from '../../scripts/scripts.js';
import { fieldCells } from '../../scripts/block-fields.js';

const FIELDS = ['title', 'alternativeTitleColor', 'id'];

/* Ícones plus e minus de components/Icon/Icon.tsx (fill gray2 #6C7880). */
const PLUS = '<svg class="accordion-icon-plus" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false"><path fill="#6C7880" d="M12 5.99971C12 6.25356 11.7923 6.46125 11.5385 6.46125H6.46154V11.5382C6.46154 11.7933 6.25512 12 6 12C5.74488 12 5.53846 11.792 5.53846 11.5382V6.46125H0.461538C0.206423 6.46125 0 6.255 0 6C0 5.74587 0.206538 5.53817 0.461538 5.53817H5.53846V0.46125C5.53846 0.206135 5.74488 0 6 0C6.25512 0 6.46154 0.20625 6.46154 0.46125V5.53817H11.5385C11.7923 5.53817 12 5.74587 12 5.99971Z"/></svg>';
const MINUS = '<svg class="accordion-icon-minus" width="12" height="1" viewBox="0 0 12 1" fill="none" aria-hidden="true" focusable="false"><path fill="#6C7880" d="M12 0.461538C12 0.715385 11.7923 0.923077 11.5385 0.923077H0.461538C0.206423 0.923077 0 0.716827 0 0.461827C0 0.207693 0.206538 0 0.461538 0H11.5385C11.7923 0 12 0.207692 12 0.461538Z"/></svg>';

let instances = 0;

const el = (tag, className) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
};

const text = (cell) => (cell ? cell.textContent.trim() : '');

/** Converte uma linha de item em <li><details>. */
function itemFromRow(row, groupName, contentClass) {
  const [titleCell, bodyCell] = [...row.children];
  const title = text(titleCell);
  if (!title) return null;

  const li = el('li', 'accordion-item');
  moveInstrumentation(row, li);

  const details = el('details');
  details.name = groupName;

  const summary = el('summary', 'accordion-button');
  summary.innerHTML = `<span class="accordion-icon">${PLUS}${MINUS}</span>`;
  const label = el('span', 'accordion-label');
  if (titleCell) moveInstrumentation(titleCell, label);
  label.textContent = title;
  summary.append(label);

  const content = el('div', `accordion-content ${contentClass}`);
  if (bodyCell) {
    moveInstrumentation(bodyCell, content);
    while (bodyCell.firstChild) content.append(bodyCell.firstChild);
  }

  details.append(summary, content);
  li.append(details);
  return li;
}

export default function decorate(block) {
  const [, ...itemRows] = [...block.children];
  const cells = fieldCells(block, FIELDS);
  const title = text(cells.title);
  const alternativeTitleColor = text(cells.alternativeTitleColor) === 'true';
  const id = text(cells.id);

  instances += 1;
  const groupName = `accordion-${instances}`;
  if (id) block.id = id;

  const fragment = document.createDocumentFragment();

  if (title) {
    const heading = el('h2', 'accordion-title');
    if (cells.title) moveInstrumentation(cells.title, heading);
    heading.textContent = title;
    if (alternativeTitleColor) heading.classList.add('accordion-title-red');
    fragment.append(heading);
  }

  // O original troca a classe do conteúdo conforme o bloco tenha título ou não:
  // com título, "richtext"; sem, "wrapper__content", que ganha rolagem horizontal.
  const contentClass = title ? 'accordion-content-rich' : 'accordion-content-plain';
  const list = el('ul', 'accordion-list');
  itemRows.forEach((row) => {
    const item = itemFromRow(row, groupName, contentClass);
    if (item) list.append(item);
  });
  fragment.append(list);

  block.replaceChildren(fragment);
}
