/*
 * Bloco `topics`: porte de components/Topics (insper-portal/components/topics).
 *
 * Origem: Topics.tsx (157) + .style.tsx (267) + .types.ts (37). Spec e referência em
 * .scratch/porte-topics/.
 *
 * Contrato xwalk (_topics.json): o bloco não tem campos; cada linha é um tópico, com uma
 * célula por campo: title | description (richtext).
 *   - sem tópicos -> etapas do processo seletivo: 4 tópicos fixos, numerados 01-04;
 *   - com tópicos -> programa do curso: os tópicos autorados, sem número (dot pequeno).
 */

import { moveInstrumentation } from '../../scripts/scripts.js';
import { fetchPlaceholders, placeholder } from '../../scripts/placeholders.js';

/* Textos de PROD, fallback dos placeholders topics-step-1 a topics-step-4. */
const ETAPAS = [
  'Preencha o formulário de inscrição',
  'Análise do seu perfil',
  'Aprovação',
  'Matrícula Digital',
];

/* Allowlist do sanitize-html do original (DESCRIPTION_SANITIZE_OPTIONS). */
const ALLOWED_TAGS = new Set(['P', 'STRONG', 'B', 'EM', 'I', 'U', 'UL', 'OL', 'LI']);

/**
 * Deixa só as tags da allowlist, sem atributos; as demais são desembrulhadas (o texto fica),
 * como o allowedTags do sanitize-html.
 * @param {Element} root elemento cujos descendentes são limpos (ele mesmo fica intacto)
 */
function sanitize(root) {
  [...root.children].forEach((child) => {
    sanitize(child);
    if (ALLOWED_TAGS.has(child.tagName)) {
      [...child.attributes].forEach(({ name }) => child.removeAttribute(name));
    } else {
      child.replaceWith(...child.childNodes);
    }
  });
}

const el = (tag, className) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
};

/**
 * Monta um tópico.
 * @param {object} topic
 * @param {number} [topic.index] número do dot (só nas etapas)
 * @param {string} topic.title
 * @param {Element} [topic.titleCell] célula autorada do título (instrumentação)
 * @param {Element} [topic.descriptionCell] célula autorada da descrição
 * @param {Element} [topic.row] linha autorada do tópico (instrumentação)
 */
function topic({
  index, title, titleCell, descriptionCell, row,
}) {
  const li = el('li', 'topics-item');
  if (row) moveInstrumentation(row, li);

  const dotColumn = el('div', 'topics-dot-column');
  const dot = el('span', 'topics-dot');
  if (index) dot.textContent = String(index).padStart(2, '0');
  dotColumn.append(dot, el('span', 'topics-connector'));

  const text = el('div', 'topics-text');
  if (title) {
    const heading = el('h3', 'topics-title');
    if (titleCell) moveInstrumentation(titleCell, heading);
    heading.textContent = title;
    text.append(heading);
  }
  if (descriptionCell && descriptionCell.textContent.trim()) {
    const description = el('div', 'topics-description');
    moveInstrumentation(descriptionCell, description);
    sanitize(descriptionCell);
    description.append(...descriptionCell.childNodes);
    text.append(description);
  }

  li.append(dotColumn, text);
  return li;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const list = el('ol', 'topics-list');

  if (rows.length) {
    rows.forEach((row) => {
      const [titleCell, descriptionCell] = [...row.children];
      list.append(topic({
        title: titleCell ? titleCell.textContent.trim() : '', titleCell, descriptionCell, row,
      }));
    });
    block.classList.add('topics-programa');
  } else {
    const table = await fetchPlaceholders();
    ETAPAS.forEach((fallback, i) => list.append(topic({
      index: i + 1, title: placeholder(table, `topics-step-${i + 1}`, fallback),
    })));
    block.classList.add('topics-etapas');
  }

  block.replaceChildren(list);
}
