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
 * As linhas de itens filhos, que vêm depois das linhas de campo.
 * @param {Element} block elemento do bloco
 * @param {string[]} names nomes dos campos do bloco, na ordem do model
 * @returns {Element[]} uma linha por item, cada uma com uma célula por campo do item
 */
export function itemRows(block, names) {
  return [...block.children].slice(names.length);
}
