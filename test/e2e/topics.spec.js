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
  const items = etapas(page).locator('.topics-list > li');
  await expect(items).toHaveCount(4);
  await expect(items.locator('h3')).toHaveText(ETAPAS);
  await expect(items.locator('.topics-dot')).toHaveText(['01', '02', '03', '04']);
});

test.describe('etapas a 1440px', () => {
  test('ficam em linha, com os itens dividindo a largura em partes iguais e vão de 16px', async ({ page }) => {
    const list = etapas(page).locator('.topics-list');
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
    const item = etapas(page).locator('.topics-list > li').first();
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
    const items = etapas(page).locator('.topics-list > li');
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
    const item = etapas(page).locator('.topics-list > li').first();
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
    const list = etapas(page).locator('.topics-list');
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
    const item = etapas(page).locator('.topics-list > li').first();
    const text = item.locator('.topics-text');
    near(await boxIn(text, item), { x: 60, y: 0 });
    expect(await style(text, ['padding'])).toEqual({ padding: '0px 24px 24px 0px' });
    near(await boxIn(item.locator('h3'), item), { x: 60, y: 0 });
  });
});

test.describe('programa do curso', () => {
  test('com tópicos, mostra o programa em coluna, sem número nos dots', async ({ page }) => {
    const list = programa(page).locator('.topics-list');
    const items = list.locator('> li');
    await expect(items).toHaveCount(5);
    await expect(items.locator('h3')).toHaveText(PROGRAMA);
    await expect(items.locator('.topics-dot')).toHaveText(['', '', '', '', '']);
    expect((await style(list, ['flex-direction']))['flex-direction']).toBe('column');
    expect((await style(items.first(), ['flex-direction']))['flex-direction']).toBe('row');
  });

  test('o dot pequeno tem 16px, centrado na coluna de 44px, e o conector desce até o próximo', async ({ page }) => {
    const items = programa(page).locator('.topics-list > li');
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
    const item = programa(page).locator('.topics-list > li').first();
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
    const item = programa(page).locator('.topics-list > li').first();
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

  test('a descrição só mantém p, strong, b, em, i, u, ul, ol e li, sem atributos; o texto das outras fica, menos o de style e textarea', async ({ page }) => {
    const description = sujo(page).locator('.topics-description').first();
    expect(await description.evaluate((node) => node.innerHTML))
      .toBe('Subtítulo<p>Texto com link e <em>ênfase</em>.</p>'
        + '<ol><li><strong>forte</strong>, <b>negrito</b>, <i>itálico</i> e <u>sublinhado</u></li></ol>'
        + '<p><strong>aninhado</strong></p>');
  });

  test('um tópico vazio continua com o dot, e o último não tem conector', async ({ page }) => {
    const items = sujo(page).locator('.topics-list > li');
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
  await expect(etapas(page).locator('.topics-list > li > .topics-text > h3')).toHaveCount(4);
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

test.describe('programa a 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('mantém o dot de 16px em (14, 0), o texto em x=60 e a lista em x=80', async ({ page }) => {
    const items = programa(page).locator('.topics-list > li');
    const item = items.first();
    expect((await style(item, ['flex-direction']))['flex-direction']).toBe('row');
    near(await boxIn(item.locator('.topics-dot'), item), {
      x: 14, y: 0, width: 16, height: 16,
    });
    const { height } = await item.boundingBox();
    near(await boxIn(item.locator('.topics-connector'), item), {
      x: 21.5, y: 16, width: 1, height: height - 16,
    });
    near(await boxIn(item.locator('.topics-text'), item), { x: 60, y: 0 });
    near(await boxIn(item.locator('.topics-description li').first(), item), { x: 80 });
    await expect(items.last().locator('.topics-connector')).toBeHidden();
  });
});

test.describe('markup do author (Universal Editor)', () => {
  const instrumentado = (page) => page.locator('.topics').nth(3);

  test('o bloco vazio do author (uma linha de célula vazia) mostra as etapas', async ({ page }) => {
    await expect(etapas(page)).toHaveClass(/topics-etapas/);
    await expect(etapas(page).locator('.topics-list > li')).toHaveCount(4);
  });

  test('o título e a descrição levam a instrumentação das células para o h3 e a descrição', async ({ page }) => {
    const item = instrumentado(page).locator('.topics-list > li');
    await expect(item).toHaveCount(1);
    await expect(item).toHaveAttribute('data-aue-model', 'topics-item');
    await expect(item.locator('h3')).toHaveAttribute('data-aue-prop', 'title');
    await expect(item.locator('h3')).toHaveText('Decisões de capital de giro');
    const description = item.locator('.topics-description');
    await expect(description).toHaveAttribute('data-aue-prop', 'description');
    await expect(description).toHaveAttribute('data-aue-type', 'richtext');
    await expect(description.locator('[data-aue-prop]')).toHaveCount(0);
  });
});

// Autoria (fase 2): campos do _cq_dialog do original. Valores sem instância em PROD vêm do
// Topics.style.tsx, registrados em .scratch/porte-topics/referencia.md ("Valores do código
// que PROD não exercita"), e as regras do Topics.tsx.
test.describe('autoria: campos do bloco e do tópico', () => {
  const nth = (page, i) => page.locator('.topics').nth(i);
  const GREEN = 'rgb(0, 199, 86)';
  const direction = async (block) => (await style(block.locator('.topics-list'), ['flex-direction']))['flex-direction'];

  test('o título do bloco é um h2 em 700 32/28px, margem 24px 0, vermelho com a cor alternativa', async ({ page }) => {
    const heading = nth(page, 4).locator('> h2');
    await expect(heading).toHaveText('Como funciona');
    expect(await style(heading, ['font-weight', 'font-size', 'line-height', 'letter-spacing', 'margin', 'color']))
      .toEqual({
        'font-weight': '700', 'font-size': '32px', 'line-height': '28px', 'letter-spacing': '-0.1px', margin: '24px 0px', color: RED,
      });
    expect((await style(nth(page, 9).locator('> h2'), ['color'])).color).toBe(await siteTextColor(page));
  });

  test('índice automático numera de 01 e ignora o índice do tópico; Concluído mostra o check em verde', async ({ page }) => {
    const dots = nth(page, 4).locator('.topics-dot');
    await expect(dots.nth(0).locator('svg path')).toHaveAttribute('d', 'M13 4.5 6.5 11 3 7.5');
    await expect(dots.nth(0)).toHaveText('');
    await expect(dots.nth(1)).toHaveText('02');
    await expect(dots.nth(2)).toHaveText('03');
    expect(await style(dots.nth(0), ['background-color', 'color', 'width', 'height']))
      .toEqual({
        'background-color': GREEN, color: WHITE, width: '44px', height: '44px',
      });
    expect(await style(dots.nth(0).locator('svg'), ['width', 'height'])).toEqual({ width: '16px', height: '16px' });
  });

  test('Desabilitado fica cinza e nunca vira link', async ({ page }) => {
    const item = nth(page, 4).locator('.topics-list > li').nth(1);
    expect(await style(item.locator('.topics-dot'), ['background-color', 'color']))
      .toEqual({ 'background-color': 'rgb(234, 234, 234)', color: 'rgb(108, 120, 128)' });
    await expect(item.locator('a')).toHaveCount(0);
  });

  test('o link envolve só o dot, com o título como nome e nova aba quando marcada', async ({ page }) => {
    const items = nth(page, 4).locator('.topics-list > li');
    const first = items.nth(0).locator('a');
    await expect(first).toHaveAttribute('href', '/pt/inscricao');
    await expect(first).toHaveAttribute('aria-label', 'Inscrição');
    await expect(first).toHaveAttribute('target', '_blank');
    await expect(first).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(first.locator('.topics-dot')).toHaveCount(1);
    await expect(items.nth(0).locator('h3 a')).toHaveCount(0);
    const third = items.nth(2).locator('a');
    await expect(third).toHaveAttribute('href', '/pt/resultado');
    await expect(third).not.toHaveAttribute('target');
    await page.keyboard.press('Tab');
    await third.focus();
    expect(await style(third, ['outline-style', 'outline-width', 'outline-color', 'outline-offset']))
      .toEqual({
        'outline-style': 'solid', 'outline-width': '2px', 'outline-color': RED, 'outline-offset': '2px',
      });
  });

  test('horizontal com até 5 tópicos fica em linha a 1440px; com 6, em coluna', async ({ page }) => {
    expect(await direction(nth(page, 4))).toBe('row');
    expect(await direction(nth(page, 8))).toBe('column');
  });

  test('índice manual: até 3 caracteres, zero à esquerda só se numérico; sem índice, dot pequeno', async ({ page }) => {
    const dots = nth(page, 7).locator('.topics-dot');
    await expect(dots).toHaveText(['A', '07', '123', '', '']);
    expect(await style(dots.nth(0), ['width', 'height'])).toEqual({ width: '44px', height: '44px' });
    expect(await style(dots.nth(3), ['width', 'height'])).toEqual({ width: '16px', height: '16px' });
    expect(await direction(nth(page, 7))).toBe('column');
  });

  test('um link sem título nem índice se chama "Tópico"', async ({ page }) => {
    const link = nth(page, 7).locator('.topics-list > li').last().locator('a');
    await expect(link).toHaveAttribute('aria-label', 'Tópico');
  });

  test('Minimalista: só o dot de 24px em 700 10px, sem texto, em linha', async ({ page }) => {
    const block = nth(page, 6);
    await expect(block.locator('.topics-text')).toHaveCount(0);
    const dots = block.locator('.topics-dot');
    await expect(dots).toHaveText(['01', '02', '03']);
    expect(await style(dots.first(), ['width', 'height', 'font-weight', 'font-size']))
      .toEqual({
        width: '24px', height: '24px', 'font-weight': '700', 'font-size': '10px',
      });
    expect(await direction(block)).toBe('row');
    const item = block.locator('.topics-list > li').first();
    near(await boxIn(item.locator('.topics-dot-column'), item), { height: 24 });
    expect(await direction(nth(page, 5))).toBe('row');
  });

  test('bloco com model e sem tópicos mostra as etapas em linha, mesmo com orientação vertical', async ({ page }) => {
    const block = nth(page, 9);
    await expect(block).toHaveClass(/topics-etapas/);
    await expect(block.locator('.topics-dot')).toHaveText(['01', '02', '03', '04']);
    expect(await direction(block)).toBe('row');
  });

  test.describe('a 375px', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('Minimalista com mais de 6 tópicos vira coluna num bloco de menos de 375px; com 3, segue em linha', async ({ page }) => {
      expect(await direction(nth(page, 5))).toBe('column');
      expect(await direction(nth(page, 6))).toBe('row');
    });

    test('Completo horizontal fica em coluna', async ({ page }) => {
      expect(await direction(nth(page, 4))).toBe('column');
    });
  });
});
