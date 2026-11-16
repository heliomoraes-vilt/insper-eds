/*
 * Leitura dos campos de um bloco autorado no Universal Editor.
 *
 * Na autoria por documento, a configuração vinha em linhas `chave | valor` e era lida com
 * readBlockConfig(). Aqui não: o AEM renderiza cada campo do model como UMA LINHA com UMA
 * célula, na ordem em que o campo aparece no model, e a linha existe mesmo com o campo vazio
 * (medido no author de dev em 13/11/2026). Os itens filhos, quando há, vêm depois dessas
 * linhas: uma linha por item. Os nomes passados têm de seguir exatamente a ordem dos campos
 * no `_<bloco>.json`.
 */

/**
 * Mapeia as N primeiras linhas do bloco (uma por campo) para nomes de campo.
 * @param {Element} block elemento do bloco
 * @param {string[]} names nomes dos campos, na ordem do model
 * @returns {Object<string, Element|undefined>} campo para a célula da linha correspondente
 */
export function fieldCells(block, names) {
  const rows = [...block.children];
  const out = {};
  names.forEach((name, i) => {
    out[name] = (rows[i] && rows[i].firstElementChild) || undefined;
  });
  return out;
}

/**
 * Os mesmos campos já convertidos em texto simples, para configuração.
 * @param {Element} block elemento do bloco
 * @param {string[]} names nomes dos campos, na ordem do model
 * @returns {Object<string, string>} campo para o texto da célula, sem espaços nas pontas
 */
export function fieldValues(block, names) {
  const cells = fieldCells(block, names);
  const out = {};
  names.forEach((name) => {
    const cell = cells[name];
    const link = cell && cell.querySelector('a[href]');
    out[name] = link ? link.getAttribute('href') : ((cell && cell.textContent.trim()) || '');
  });
  return out;
}

/**
 * Campos e itens de um bloco que ganhou model depois de já ter instâncias autoradas.
 *
 * Cada instância guarda no nó o model de quando foi inserida: as inseridas antes do model
 * chegam sem as linhas de campo, só com os itens. Conta como campo cada linha inicial com
 * uma célula só, até `names.length`; um item tem uma célula por campo do item (pelo menos
 * duas), então a primeira linha com mais de uma célula já é item. Por isso só serve para
 * blocos cujo item tenha dois campos ou mais.
 * @param {Element} block elemento do bloco
 * @param {string[]} names nomes dos campos do bloco, na ordem do model
 * @returns {{cells: Object<string, Element|undefined>, items: Element[]}} as células dos
 *   campos presentes (ausente = undefined) e as linhas de item
 */
export function splitFieldRows(block, names) {
  const rows = [...block.children];
  let count = 0;
  while (count < names.length && rows[count] && rows[count].children.length === 1) count += 1;
  const cells = {};
  names.forEach((name, i) => {
    cells[name] = i < count ? rows[i].firstElementChild : undefined;
  });
  return { cells, items: rows.slice(count) };
}

/**
 * As linhas de itens filhos, que vêm depois das linhas de campo.
 * @param {Element} block elemento do bloco
 * @param {string[]} names nomes dos campos do bloco, na ordem do model
 * @returns {Element[]} uma linha por item, cada uma com uma célula por campo do item
 */
export function itemRows(block, names) {
  return [...block.children].slice(names.length);
}
