/*
 * Bloco `topics`: porte de components/Topics (insper-portal/components/topics).
 *
 * Origem: Topics.tsx (157) + .style.tsx (267) + .types.ts (37) e o _cq_dialog. Spec e
 * referência em .scratch/porte-topics/ (visual) e .scratch/porte-topics-autoria/ (campos).
 *
 * Contrato xwalk (_topics.json):
 *   5 primeiras linhas -> um campo do bloco por linha: title, alternativeTitleColor, style,
 *                         desktopOrientation, automaticIndex
 *   demais             -> um tópico por linha, uma célula por campo: title |
 *                         description (richtext) | index | link | linkNewTab | dotAppearance
 * Instâncias inseridas antes do model do bloco chegam sem as linhas de campo e com só
 * title | description: valem os padrões abaixo, e o bloco renderiza como antes.
 *
 *   - sem tópicos -> etapas do processo seletivo: 4 tópicos fixos, numerados 01-04, em linha
 *     no desktop; o título, a cor do título e o estilo do bloco valem para elas;
 *   - com tópicos -> os tópicos autorados, com todos os campos. Sem valor, a orientação é
 *     vertical e o índice não é automático: é o programa do curso de PROD.
 */

import { moveInstrumentation } from '../../scripts/scripts.js';
import { fetchPlaceholders, placeholder } from '../../scripts/placeholders.js';
import { splitFieldRows } from '../../scripts/block-fields.js';

const FIELDS = ['title', 'alternativeTitleColor', 'style', 'desktopOrientation', 'automaticIndex'];

/* Textos de PROD, fallback dos placeholders topics-etapa-1 a topics-etapa-4. */
const ETAPAS = [
  'Preencha o formulário de inscrição',
  'Análise do seu perfil',
  'Aprovação',
  'Matrícula Digital',
];

/* Regras do Topics.tsx. */
const MAX_INDEX_LENGTH = 3;
/* Minimal fica em linha; com mais itens que isto, só em contêiner de 375px ou mais. */
const MINIMAL_MOBILE_MAX_ITEMS = 6;
/* Completo horizontal com mais itens que isto vira coluna, para não apertar a linha. */
const FULL_HORIZONTAL_MAX_ITEMS = 5;

/* Ícone check de components/Icon/Icon.tsx (dot "Concluído"). */
const CHECK = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false"><path d="M13 4.5 6.5 11 3 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

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

const text = (cell) => (cell ? cell.textContent.trim() : '');

/* aem-content chega como link no author e no publish; texto puro no markup escrito à mão. */
const href = (cell) => {
  const link = cell && cell.querySelector('a[href]');
  return link ? link.getAttribute('href') : text(cell);
};

/**
 * Move a instrumentação da célula para `to`, inclusive a que o wrapTextNodes do aem.js já
 * passou da célula para o <p> que ele cria em volta do texto.
 * @param {Element} cell célula autorada
 * @param {Element} to elemento que a substitui
 */
function moveCellInstrumentation(cell, to) {
  moveInstrumentation(cell, to);
  cell.querySelectorAll('[data-aue-prop], [data-richtext-prop]')
    .forEach((node) => moveInstrumentation(node, to));
}

/**
 * Uma linha é tópico quando tem as células dos campos do item, mesmo vazias. O author entrega
 * o bloco sem model e vazio com uma linha de uma célula vazia, que não é tópico.
 * @param {Element} row
 */
const isTopicRow = (row) => row.children.length > 1 || row.textContent.trim() !== '';

/**
 * resolveFlow do original: quando a lista vira linha.
 * @returns {'stack'|'row'|'row-above-375'|'desktop-row'}
 */
function resolveFlow(style, desktopOrientation, count) {
  if (style === 'minimal') return count > MINIMAL_MOBILE_MAX_ITEMS ? 'row-above-375' : 'row';
  if (desktopOrientation !== 'horizontal') return 'stack';
  return count > FULL_HORIZONTAL_MAX_ITEMS ? 'stack' : 'desktop-row';
}

/** resolveDisplayIndex do original, já com o zero à esquerda dos números. */
function displayIndex(manualIndex, position, automaticIndex) {
  const value = automaticIndex ? String(position) : manualIndex.slice(0, MAX_INDEX_LENGTH);
  return /^\d+$/.test(value) ? value.padStart(2, '0') : value;
}

/**
 * Lê um tópico autorado. As células que faltarem (instâncias antigas) ficam vazias.
 * @param {Element} row linha do tópico
 */
function readTopic(row) {
  const [titleCell, descriptionCell, indexCell, linkCell, linkNewTabCell, dotCell] = [
    ...row.children,
  ];
  const dotAppearance = text(dotCell);
  return {
    row,
    titleCell,
    descriptionCell,
    title: text(titleCell),
    index: text(indexCell),
    link: href(linkCell),
    linkNewTab: text(linkNewTabCell) === 'true',
    dotState: ['completed', 'disabled'].includes(dotAppearance) ? dotAppearance : 'default',
  };
}

/**
 * O dot (e o link em volta dele, se houver), como o DotContent do original.
 * @param {object} topic tópico lido
 * @param {string} index índice exibido ('' = sem índice)
 * @param {string} linkLabel texto do aria-label quando o tópico não tem título nem índice
 */
function dotFor(topic, index, linkLabel) {
  const completed = topic.dotState === 'completed';
  const dot = el('span', 'topics-dot');
  if (!completed && !index) dot.classList.add('topics-dot-small');
  if (topic.dotState !== 'default') dot.classList.add(`topics-dot-${topic.dotState}`);
  if (completed) dot.innerHTML = CHECK;
  else dot.textContent = index;

  if (!topic.link || topic.dotState === 'disabled') return dot;
  const link = el('a', 'topics-dot-link');
  link.href = topic.link;
  link.setAttribute('aria-label', topic.title || index || linkLabel);
  if (topic.linkNewTab) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  link.append(dot);
  return link;
}

/**
 * Monta o <li> de um tópico.
 * @param {object} topic tópico lido (ou fixo, nas etapas: só title)
 * @param {string} index índice exibido
 * @param {boolean} minimal estilo minimalista: só o dot, sem texto
 * @param {string} linkLabel aria-label padrão do link do dot
 * @returns {HTMLLIElement}
 */
function topicItem(topic, index, minimal, linkLabel) {
  const li = el('li', 'topics-item');
  if (topic.row) moveInstrumentation(topic.row, li);

  const dotColumn = el('div', 'topics-dot-column');
  dotColumn.append(dotFor(topic, index, linkLabel), el('span', 'topics-connector'));
  li.append(dotColumn);
  if (minimal) return li;

  const textColumn = el('div', 'topics-text');
  if (topic.title) {
    const heading = el('h3', 'topics-title');
    if (topic.titleCell) moveCellInstrumentation(topic.titleCell, heading);
    heading.textContent = topic.title;
    textColumn.append(heading);
  }
  const { descriptionCell } = topic;
  if (descriptionCell && descriptionCell.textContent.trim()) {
    const description = el('div', 'topics-description');
    moveCellInstrumentation(descriptionCell, description);
    sanitize(descriptionCell);
    description.append(...descriptionCell.childNodes);
    textColumn.append(description);
  }
  li.append(textColumn);
  return li;
}

export default async function decorate(block) {
  const { cells, items } = splitFieldRows(block, FIELDS);
  const title = text(cells.title);
  const style = text(cells.style) === 'minimal' ? 'minimal' : 'full';
  const minimal = style === 'minimal';
  const rows = items.filter(isTopicRow);

  let topics;
  let flow;
  let indexOf;
  if (rows.length) {
    topics = rows.map(readTopic);
    flow = resolveFlow(style, text(cells.desktopOrientation), topics.length);
    const automaticIndex = text(cells.automaticIndex) === 'true';
    indexOf = (topic, i) => displayIndex(topic.index, i + 1, automaticIndex);
    block.classList.add('topics-programa');
  } else {
    const table = await fetchPlaceholders();
    topics = ETAPAS.map((fallback, i) => ({
      title: placeholder(table, `topics-etapa-${i + 1}`, fallback), dotState: 'default',
    }));
    flow = resolveFlow(style, 'horizontal', topics.length);
    indexOf = (topic, i) => displayIndex('', i + 1, true);
    block.classList.add('topics-etapas');
  }

  const indexes = topics.map(indexOf);
  const needsLinkLabel = topics.some((topic, i) => topic.link && !topic.title && !indexes[i]);
  const linkLabel = needsLinkLabel
    ? placeholder(await fetchPlaceholders(), 'topics-link-label', 'Tópico')
    : '';

  const list = el('ol', 'topics-list');
  topics.forEach((topic, i) => list.append(topicItem(topic, indexes[i], minimal, linkLabel)));

  const content = [];
  if (title) {
    const heading = el('h2', 'topics-heading');
    moveCellInstrumentation(cells.title, heading);
    heading.textContent = title;
    if (text(cells.alternativeTitleColor) === 'true') heading.classList.add('topics-heading-red');
    content.push(heading);
  }
  content.push(list);

  block.classList.add(`topics-flow-${flow}`);
  if (minimal) block.classList.add('topics-minimal');
  block.replaceChildren(...content);
}
