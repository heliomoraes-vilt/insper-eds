// scripts/placeholders.js: tabela de textos fixos por idioma, com fallback no bloco.
import { test, expect } from '@playwright/test';

const PAGE = '/test/eds-port.html';
const BASE = '/test/fixtures';
const MODULE = '/scripts/placeholders.js';

const lookup = (page, lang) => page.evaluate(async ([language, base, module]) => {
  const { fetchPlaceholders, placeholder } = await import(module);
  const table = await fetchPlaceholders(language, base);
  return {
    greeting: placeholder(table, 'fixture-greeting', 'Olá do bloco'),
    empty: placeholder(table, 'fixture-empty', 'texto do bloco'),
    missing: placeholder(table, 'fixture-missing', 'texto do bloco'),
  };
}, [lang, BASE, MODULE]);

test.beforeEach(async ({ page }) => {
  await page.goto(PAGE);
});

test('o texto vem da tabela do idioma', async ({ page }) => {
  expect(await lookup(page, 'pt')).toEqual({
    greeting: 'Olá da tabela', empty: 'texto do bloco', missing: 'texto do bloco',
  });
  expect((await lookup(page, 'en')).greeting).toBe('Hello from the table');
});

test('sem tabela (404), o bloco usa o texto original', async ({ page }) => {
  await page.route('**/pt/placeholders.json', (route) => route.fulfill({ status: 404, body: '' }));
  expect((await lookup(page, 'pt')).greeting).toBe('Olá do bloco');
});

test('com erro de rede ou corpo inválido, o bloco usa o texto original', async ({ page }) => {
  await page.route('**/pt/placeholders.json', (route) => route.abort());
  await page.route('**/en/placeholders.json', (route) => route.fulfill({ status: 200, body: '<html>' }));
  expect((await lookup(page, 'pt')).greeting).toBe('Olá do bloco');
  expect((await lookup(page, 'en')).greeting).toBe('Olá do bloco');
});

test('a tabela é buscada uma vez por página', async ({ page }) => {
  let calls = 0;
  page.on('request', (request) => {
    if (request.url().endsWith('/pt/placeholders.json')) calls += 1;
  });
  await page.evaluate(async ([base, module]) => {
    const { fetchPlaceholders } = await import(module);
    await Promise.all([fetchPlaceholders('pt', base), fetchPlaceholders('pt', base)]);
    await fetchPlaceholders('pt', base);
  }, [BASE, MODULE]);
  expect(calls).toBe(1);
});
