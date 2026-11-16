// Bloco `topics`: medidas de PROD (16/11/2026, página
// /pt/cursos/educacao-executiva/financas/gestao-financeira-empresarial)
// registradas em .scratch/porte-topics/referencia.md.
import { test, expect } from '@playwright/test';

const PAGE = '/test/eds-port.html';
const ETAPAS = [
  'Preencha o formulário de inscrição',
  'Análise do seu perfil',
  'Aprovação',
  'Matrícula Digital',
];

const RED = 'rgb(229, 5, 5)';
const WHITE = 'rgb(255, 255, 255)';
const GRAY = 'rgb(128, 128, 128)';

// PROD usa #1a1a1a; o bloco segue o token de texto do site (Q8 da entrevista), que no tema
// claro é #0a0a0a.
const siteTextColor = (page) => page.evaluate(() => getComputedStyle(document.body).color);

const etapas = (page) => page.locator('.topics').nth(0);
const programa = (page) => page.locator('.topics').nth(1);
const PROGRAMA = [
  'Gestão financeira, desempenho empresarial e criação de valor',
  'Decisões de capital de giro',
  'Decisões de investimento de capital',
  'Decisões de custo e estrutura de capital',
  'Criação de valor e planejamento financeiro',
];

const style = (locator, props) => locator.evaluate((node, names) => {
  const computed = getComputedStyle(node);
  return Object.fromEntries(names.map((name) => [name, computed.getPropertyValue(name)]));
}, props);

/** Caixa de `locator` relativa à caixa de `origin`, como na referência. */
const boxIn = async (locator, origin) => {
  const [a, o] = await Promise.all([locator.boundingBox(), origin.boundingBox()]);
  return {
    x: a.x - o.x, y: a.y - o.y, width: a.width, height: a.height,
  };
};

const near = (actual, expected) => {
  Object.entries(expected).forEach(([key, value]) => {
    expect(actual[key], key).toBeCloseTo(value, 0);
  });
};

test.beforeEach(async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('.topics').last()).toHaveAttribute('data-block-status', 'loaded');
});

test('inserido vazio, mostra as etapas do processo seletivo numeradas de 01 a 04', async ({ page }) => {
  const items = etapas(page).locator('ol > li');
  await expect(items).toHaveCount(4);
  await expect(items.locator('h3')).toHaveText(ETAPAS);
  await expect(items.locator('.topics-dot')).toHaveText(['01', '02', '03', '04']);
});

test.describe('etapas a 1440px', () => {
  test('ficam em linha, com os itens dividindo a largura em partes iguais e vão de 16px', async ({ page }) => {
    const list = etapas(page).locator('ol');
    const items = list.locator('> li');
    expect((await style(list, ['flex-direction']))['flex-direction']).toBe('row');
    expect(await style(items.first(), ['flex-direction', 'row-gap'])).toEqual({ 'flex-direction': 'column', 'row-gap': '16px' });
    const first = await boxIn(items.nth(0), list);
    for (let i = 1; i < 4; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      near(await boxIn(items.nth(i), list), { x: first.width * i, y: 0, width: first.width });
    }
  });

  test('o dot tem 44px, vermelho com número branco em 600 13px, numa coluna de 51px', async ({ page }) => {
    const item = etapas(page).locator('ol > li').first();
    near(await boxIn(item.locator('.topics-dot-column'), item), { x: 0, y: 0, height: 51 });
    const dot = item.locator('.topics-dot');
    near(await boxIn(dot, item), {
      x: 0, y: 3.5, width: 44, height: 44,
    });
    expect(await style(dot, ['background-color', 'color', 'font-weight', 'font-size', 'line-height', 'letter-spacing', 'border-radius']))
      .toEqual({
        'background-color': RED, color: WHITE, 'font-weight': '600', 'font-size': '13px', 'line-height': '13px', 'letter-spacing': '0.65px', 'border-radius': '50%',
      });
  });

  test('o conector é uma linha cinza de 1px do dot até o fim do item; o último não tem', async ({ page }) => {
    const items = etapas(page).locator('ol > li');
    const item = items.first();
    const { width } = await item.boundingBox();
    const connector = item.locator('.topics-connector');
    near(await boxIn(connector, item), {
      x: 44, y: 25, width: width - 44, height: 1,
    });
    expect((await style(connector, ['background-color']))['background-color']).toBe(GRAY);
    await expect(items.last().locator('.topics-connector')).toBeHidden();
  });

  test('o título fica 16px abaixo da coluna do dot, em 700 16/20px, com padding 16 24 0 0', async ({ page }) => {
    const item = etapas(page).locator('ol > li').first();
    const text = item.locator('.topics-text');
    near(await boxIn(text, item), { x: 0, y: 67 });
    expect((await style(text, ['padding']))).toEqual({ padding: '16px 24px 0px 0px' });
    const title = item.locator('h3');
    near(await boxIn(title, item), { x: 0, y: 83 });
    expect(await style(title, ['font-weight', 'font-size', 'line-height', 'letter-spacing', 'margin']))
      .toEqual({
        'font-weight': '700', 'font-size': '16px', 'line-height': '20px', 'letter-spacing': '-0.1px', margin: '0px',
      });
    expect((await style(title, ['color'])).color).toBe(await siteTextColor(page));
  });
});

test.describe('etapas a 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('ficam em coluna, com o dot de 44px à esquerda e o conector vertical até o próximo', async ({ page }) => {
    const list = etapas(page).locator('ol');
    const items = list.locator('> li');
    expect((await style(list, ['flex-direction']))['flex-direction']).toBe('column');
    const item = items.first();
    expect((await style(item, ['flex-direction']))['flex-direction']).toBe('row');
    near(await boxIn(item.locator('.topics-dot-column'), item), { x: 0, y: 0, width: 44 });
    near(await boxIn(item.locator('.topics-dot'), item), {
      x: 0, y: 0, width: 44, height: 44,
    });
    const { height } = await item.boundingBox();
    const connector = await boxIn(item.locator('.topics-connector'), item);
    near(connector, { x: 21.5, y: 44, width: 1 });
    expect(connector.height).toBeGreaterThanOrEqual(24);
    expect(connector.y + connector.height).toBeCloseTo(height, 0);
    await expect(items.last().locator('.topics-connector')).toBeHidden();
  });

  test('o texto começa em x=60, com padding 0 24 24 0', async ({ page }) => {
    const item = etapas(page).locator('ol > li').first();
    const text = item.locator('.topics-text');
    near(await boxIn(text, item), { x: 60, y: 0 });
    expect(await style(text, ['padding'])).toEqual({ padding: '0px 24px 24px 0px' });
    near(await boxIn(item.locator('h3'), item), { x: 60, y: 0 });
  });
});

test.describe('programa do curso', () => {
  test('com tópicos, mostra o programa em coluna, sem número nos dots', async ({ page }) => {
    const list = programa(page).locator('ol');
    const items = list.locator('> li');
    await expect(items).toHaveCount(5);
    await expect(items.locator('h3')).toHaveText(PROGRAMA);
    await expect(items.locator('.topics-dot')).toHaveText(['', '', '', '', '']);
    expect((await style(list, ['flex-direction']))['flex-direction']).toBe('column');
    expect((await style(items.first(), ['flex-direction']))['flex-direction']).toBe('row');
  });

  test('o dot pequeno tem 16px, centrado na coluna de 44px, e o conector desce até o próximo', async ({ page }) => {
    const items = programa(page).locator('ol > li');
    const item = items.first();
    near(await boxIn(item.locator('.topics-dot-column'), item), { x: 0, y: 0, width: 44 });
    near(await boxIn(item.locator('.topics-dot'), item), {
      x: 14, y: 0, width: 16, height: 16,
    });
    const { height } = await item.boundingBox();
    near(await boxIn(item.locator('.topics-connector'), item), {
      x: 21.5, y: 16, width: 1, height: height - 16,
    });
    await expect(items.last().locator('.topics-connector')).toBeHidden();
  });

  test('o título fica em x=60 e a descrição 8px abaixo, em 400 13/21px', async ({ page }) => {
    const item = programa(page).locator('ol > li').first();
    const text = item.locator('.topics-text');
    near(await boxIn(text, item), { x: 60, y: 0 });
    expect(await style(text, ['padding', 'row-gap'])).toEqual({ padding: '0px 24px 24px 0px', 'row-gap': '8px' });
    near(await boxIn(item.locator('h3'), item), { x: 60, y: 0, height: 20 });
    const description = item.locator('.topics-description');
    near(await boxIn(description, item), { x: 60, y: 28 });
    expect(await style(description, ['font-weight', 'font-size', 'line-height']))
      .toEqual({ 'font-weight': '400', 'font-size': '13px', 'line-height': '21px' });
    expect((await style(description, ['color'])).color).toBe(await siteTextColor(page));
  });

  test('a lista da descrição tem marcador circle, recuo de 20px e margem inferior de 8px', async ({ page }) => {
    const item = programa(page).locator('ol > li').first();
    const list = item.locator('.topics-description ul');
    expect(await style(list, ['list-style-type', 'list-style-position', 'padding-left', 'margin-top', 'margin-bottom']))
      .toEqual({
        'list-style-type': 'circle', 'list-style-position': 'outside', 'padding-left': '20px', 'margin-top': '0px', 'margin-bottom': '8px',
      });
    const bullet = list.locator('li').first();
    near(await boxIn(bullet, item), { x: 80 });
    expect(await style(bullet, ['margin-top', 'margin-bottom', 'font-size', 'line-height']))
      .toEqual({
        'margin-top': '0px', 'margin-bottom': '0px', 'font-size': '13px', 'line-height': '21px',
      });
  });
});

test.describe('autoria', () => {
  const sujo = (page) => page.locator('.topics').nth(2);

  test('a descrição só mantém p, strong, b, em, i, u, ul, ol e li, sem atributos, e o texto fica', async ({ page }) => {
    const description = sujo(page).locator('.topics-description').first();
    expect(await description.evaluate((node) => node.innerHTML))
      .toBe('Subtítulo<p>Texto com link e <em>ênfase</em>.</p>');
  });

  test('um tópico vazio continua com o dot, e o último não tem conector', async ({ page }) => {
    const items = sujo(page).locator('ol > li');
    await expect(items).toHaveCount(2);
    await expect(items.last().locator('.topics-dot')).toBeVisible();
    await expect(items.last().locator('h3')).toHaveCount(0);
    await expect(items.last().locator('.topics-connector')).toBeHidden();
  });
});

test.describe('placeholders das etapas', () => {
  test('os textos das etapas vêm da tabela do idioma', async ({ page }) => {
    await page.route('**/pt/placeholders.json', (route) => route.fulfill({ path: 'test/fixtures/pt/placeholders.json' }));
    await page.goto(PAGE);
    await expect(etapas(page).locator('h3')).toHaveText(['Inscreva-se', 'Análise', 'Resultado', 'Matrícula']);
  });

  test('sem tabela (404), as etapas usam os textos de PROD', async ({ page }) => {
    await page.route('**/pt/placeholders.json', (route) => route.fulfill({ status: 404, body: '' }));
    await page.goto(PAGE);
    await expect(etapas(page).locator('h3')).toHaveText(ETAPAS);
  });
});

test.describe('grid do portal', () => {
  test('a 1440px o bloco começa em x=96, o início do grid', async ({ page }) => {
    expect((await etapas(page).boundingBox()).x).toBeCloseTo(96, 0);
  });

  test.describe('a 375px', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('o bloco começa em x=24', async ({ page }) => {
      expect((await etapas(page).boundingBox()).x).toBeCloseTo(24, 0);
    });
  });
});

test('é uma lista ordenada com um h3 por tópico, sem landmark de navegação', async ({ page }) => {
  await expect(etapas(page).locator('ol > li > .topics-text > h3')).toHaveCount(4);
  await expect(page.locator('.topics nav, .topics [role="navigation"]')).toHaveCount(0);
  await expect(page.locator('.topics').first()).not.toHaveAttribute('aria-label');
});

test.describe('tema escuro', () => {
  test.use({ colorScheme: 'dark' });

  test('o texto dos tópicos segue a cor do site e continua visível', async ({ page }) => {
    const title = programa(page).locator('h3').first();
    const description = programa(page).locator('.topics-description').first();
    const body = await page.evaluate(() => {
      const s = getComputedStyle(document.body);
      return { color: s.color, background: s.backgroundColor };
    });
    expect(body.color).not.toBe(body.background);
    expect((await style(title, ['color'])).color).toBe(body.color);
    expect((await style(description, ['color'])).color).toBe(body.color);
  });
});
