/*
 * Tabela de placeholders do site: textos fixos dos blocos que só mudam por idioma
 * ("Copiar link", "Você está em" etc.). Ver docs/porte-aem-eds.md, seção Placeholders.
 *
 * Uma tabela por idioma, no formato usual do EDS:
 *   /<lang>/placeholders.json
 *   -> { "data": [ { "Key": "share-copy-link", "Text": "Copiar link" } ] }
 * O idioma vem de document.documentElement.lang, que o scripts.js preenche pelo /pt/ ou
 * /en/ do caminho. Cada bloco guarda o texto original do portal como fallback, então
 * renderiza certo mesmo sem a tabela (404, erro de rede, JSON inválido).
 */

const cache = {};

/**
 * Busca a tabela do idioma uma vez por página (promessa compartilhada entre os blocos).
 * @param {string} [lang] idioma; padrão: o lang do documento
 * @param {string} [base] prefixo do caminho da tabela (útil para testes)
 * @returns {Promise<Object<string, string>>} chave -> texto; vazio se a tabela falhar
 */
export function fetchPlaceholders(lang = document.documentElement.lang || 'pt', base = '') {
  const url = `${base}/${lang}/placeholders.json`;
  if (!cache[url]) {
    cache[url] = fetch(url)
      .then((response) => (response.ok ? response.json() : {}))
      .then((json) => Object.fromEntries((json.data || [])
        .filter((row) => row.Key && row.Text)
        .map((row) => [row.Key, row.Text])))
      .catch(() => ({}));
  }
  return cache[url];
}

/**
 * Texto de uma chave, com o texto original do portal como fallback.
 * @param {Object<string, string>} table resultado de fetchPlaceholders
 * @param {string} key chave `<bloco>-<uso>`
 * @param {string} fallback texto original do componente
 * @returns {string}
 */
export const placeholder = (table, key, fallback) => (table && table[key]) || fallback;
