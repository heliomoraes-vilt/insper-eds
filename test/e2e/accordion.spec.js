// Bloco `accordion`: medidas de PROD (página do MBM) registradas em
// new-portal/.docs-internos/eds-port-poc/blocks/accordion/PORTE.md (13/11/2026).
import { test, expect } from '@playwright/test';

const PAGE = '/test/eds-port.html';
const RED_ACTIVE = 'rgb(199, 50, 31)';

const style = (locator, props) => locator.evaluate((node, names) => {
  const computed = getComputedStyle(node);
  return Object.fromEntries(names.map((name) => [name, computed.getPropertyValue(name)]));
}, props);

test.beforeEach(async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('.accordion').nth(1)).toHaveAttribute('data-block-status', 'loaded');
});

test('o título do bloco tem 18/28px bold com margens de 30 e 20px', async ({ page }) => {
  const title = page.locator('.accordion').first().locator('.accordion-title');
  await expect(title).toHaveText('Saiba mais:');
  expect(await style(title, ['font-size', 'font-weight', 'line-height', 'margin-top', 'margin-bottom']))
    .toEqual({
      'font-size': '18px', 'font-weight': '700', 'line-height': '28px', 'margin-top': '30px', 'margin-bottom': '20px',
    });
});

test('o botão de cada item tem 48px, 18px bold e borda inferior #F2F2F2', async ({ page }) => {
  const button = page.locator('.accordion .accordion-button').first();
  const box = await button.boundingBox();
  expect(box.height).toBe(48);
  expect(await style(button, ['font-size', 'font-weight', 'border-bottom', 'column-gap'])).toEqual({
    'font-size': '18px', 'font-weight': '700', 'border-bottom': '1px solid rgb(242, 242, 242)', 'column-gap': '10px',
  });
});

test('tudo começa fechado, e abrir o 2º item fecha o 1º', async ({ page }) => {
  const block = page.locator('.accordion').nth(1);
  const items = block.locator('details');
  await expect(items).toHaveCount(2);
  await expect(items.nth(0)).not.toHaveAttribute('open');
  await expect(items.nth(1)).not.toHaveAttribute('open');

  await block.locator('summary').nth(0).click();
  await expect(items.nth(0)).toHaveAttribute('open');

  await block.locator('summary').nth(1).click();
  await expect(items.nth(1)).toHaveAttribute('open');
  await expect(items.nth(0)).not.toHaveAttribute('open');
});

test('o item aberto fica em #C7321F com o ícone de menos', async ({ page }) => {
  const summary = page.locator('.accordion').nth(1).locator('summary').first();
  await summary.click();
  expect((await style(summary, ['color'])).color).toBe(RED_ACTIVE);
  await expect(summary.locator('.accordion-icon-minus')).toBeVisible();
  await expect(summary.locator('.accordion-icon-plus')).toBeHidden();
});

test('o conteúdo aberto tem padding de 25px e texto 18/29,25px; links vermelhos tracejados', async ({ page }) => {
  const block = page.locator('.accordion').first();
  await block.locator('summary').first().click();
  const content = block.locator('.accordion-content').first();
  expect(await style(content, ['padding-top', 'padding-bottom', 'font-size', 'line-height'])).toEqual({
    'padding-top': '25px', 'padding-bottom': '25px', 'font-size': '18px', 'line-height': '29.25px',
  });
  const link = content.locator('a').first();
  expect(await style(link, ['color', 'text-decoration-style', 'text-underline-offset', 'font-weight'])).toEqual({
    color: 'rgb(229, 5, 5)', 'text-decoration-style': 'dashed', 'text-underline-offset': '2px', 'font-weight': '400',
  });
});

test('Enter abre e Espaço fecha o item com o foco nele', async ({ page }) => {
  const block = page.locator('.accordion').nth(1);
  const summary = block.locator('summary').first();
  const details = block.locator('details').first();
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(details).toHaveAttribute('open');
  await page.keyboard.press('Space');
  await expect(details).not.toHaveAttribute('open');
  await expect(summary).toBeFocused();
});

test.describe('a 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('o conteúdo sem título rola na horizontal, sem estourar a página', async ({ page }) => {
    const block = page.locator('.accordion').nth(1);
    await block.locator('summary').first().click();
    const content = block.locator('.accordion-content-plain').first();
    const sizes = await content.evaluate((node) => ({
      scroll: node.scrollWidth,
      client: node.clientWidth,
      overflowX: getComputedStyle(node).overflowX,
    }));
    expect(sizes.overflowX).toBe('auto');
    expect(sizes.scroll).toBeGreaterThan(sizes.client);
    const pageOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(pageOverflow).toBe(false);
    const box = await block.locator('summary').first().boundingBox();
    expect(box.height).toBe(48);
  });
});
