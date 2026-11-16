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
import { itemRows } from '../../scripts/block-fields.js';

/* O bloco não tem campos: todas as linhas são tópicos. */
const FIELDS = [];

/* Textos de PROD, fallback dos placeholders topics-step-1 a topics-step-4. */
const ETAPAS = [
  'Preencha o formulário de inscrição',
  'Análise do seu perfil',
  'Aprovação',
  'Matrícula Digital',
];

/* Allowlist do sanitize-html do original (DESCRIPTION_SANITIZE_OPTIONS). */
const ALLOWED_TAGS = new Set(['P', 'STRONG', 'B', 'EM', 'I', 'U', 'UL', 'OL', 'LI']);
/* nonTextTags do sanitize-html: removidas junto com o texto. */
const DROPPED_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'OPTION', 'NOSCRIPT']);

/**
 * Deixa só as tags da allowlist, sem atributos; as demais são desembrulhadas (o texto fica),
 * menos script, style, textarea, option e noscript, que somem inteiras. É o comportamento
 * do sanitize-html com as opções do original.
 * @param {Element} root elemento cujos descendentes são limpos (ele mesmo fica intacto)
 */
function sanitize(root) {
  [...root.children].forEach((child) => {
    if (DROPPED_TAGS.has(child.tagName)) {
      child.remove();
      return;
    }
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
 * Monta o <li> de um tópico: de uma linha autorada (programa) ou de um título fixo (etapas).
 * @param {object} source
 * @param {Element} [source.row] linha autorada: title | description (richtext)
 * @param {string} [source.title] título fixo, quando não há linha
 * @param {number} [source.index] número do dot (só nas etapas)
 * @returns {HTMLLIElement}
 */
function topicItem({ row, title: fixedTitle, index }) {
  const [titleCell, descriptionCell] = row ? [...row.children] : [];
  const title = titleCell ? titleCell.textContent.trim() : fixedTitle;

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
  const rows = itemRows(block, FIELDS);
  const list = el('ol', 'topics-list');

  if (rows.length) {
    rows.forEach((row) => list.append(topicItem({ row })));
    block.classList.add('topics-programa');
  } else {
    const table = await fetchPlaceholders();
    ETAPAS.forEach((fallback, i) => list.append(topicItem({
      index: i + 1, title: placeholder(table, `topics-step-${i + 1}`, fallback),
    })));
    block.classList.add('topics-etapas');
  }

  block.replaceChildren(list);
}
