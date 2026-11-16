// Bloco `instagram-timeline`: medidas do React original renderizado, registradas em
// new-portal/.docs-internos/eds-port-poc/blocks/instagram-timeline/PORTE.md (13/11/2026).
// A fixture test/fixtures/instagram-timeline.<lang>.json faz o papel do servlet do AEM.
import { test, expect } from '@playwright/test';

const PAGE = '/test/eds-port.html';
const FEED = '**/test/fixtures/instagram-timeline.*.json';

const cardBoxes = (page) => page.locator('.instagram-timeline-card').evaluateAll((cards) => {
  const grid = cards[0].parentElement.getBoundingClientRect();
  return cards.map((card) => {
    const box = card.getBoundingClientRect();
    return {
      x: Math.round(box.left - grid.left),
      y: Math.round(box.top - grid.top),
      width: Math.round(box.width * 10) / 10,
      height: Math.round(box.height * 10) / 10,
    };
  });
});

test('a 1440px, os 4 cards ficam lado a lado, iguais, com 24px de vão e proporção 278:373', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('.instagram-timeline-card')).toHaveCount(4);
  const boxes = await cardBoxes(page);
  const { width } = boxes[0];
  boxes.forEach((box, i) => {
    expect(box.y).toBe(0);
    expect(box.width).toBe(width);
    expect(box.x).toBeCloseTo(i * (width + 24), 0);
    expect(box.height).toBeCloseTo((width * 373) / 278, 0);
  });
});

// A referência (294×394,5, x = 0/318/636/954) foi medida com a grade do portal: 96px de
// margem a 1440px, conteúdo de 1248px. A seção do insper-eds ainda é a do boilerplate
// (máx. 1200px, padding 32px), e os cards saem com 282px. A grade é item do Passo 0.
test.fixme('a 1440px, os 4 cards têm 294×394,5 como no portal (depende da grade do Passo 0)', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('.instagram-timeline-card')).toHaveCount(4);
  const boxes = await cardBoxes(page);
  expect(boxes.map((box) => box.x)).toEqual([0, 318, 636, 954]);
  boxes.forEach((box) => {
    expect(box.width).toBe(294);
    expect(box.height).toBe(394.5);
  });
});

test('a 375px, os 4 cards ficam empilhados com 327px de largura', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(PAGE);
  await expect(page.locator('.instagram-timeline-card')).toHaveCount(4);
  const boxes = await cardBoxes(page);
  expect(boxes.map((box) => box.y)).toEqual([0, 463, 925, 1388]);
  boxes.forEach((box) => {
    expect(box.x).toBe(0);
    expect(box.width).toBe(327);
  });
  const left = await page.locator('.instagram-timeline-grid').evaluate((grid) => grid.getBoundingClientRect().left);
  expect(Math.round(left)).toBe(24);
});

test('vídeo e carrossel ganham selo de 24px; foto não ganha', async ({ page }) => {
  await page.goto(PAGE);
  const cards = page.locator('.instagram-timeline-card');
  await expect(cards).toHaveCount(4);
  await expect(cards.nth(0).locator('.instagram-timeline-badge')).toHaveCount(0);
  await expect(cards.nth(1).locator('.instagram-timeline-badge')).toHaveAttribute('data-badge', 'video');
  await expect(cards.nth(2).locator('.instagram-timeline-badge')).toHaveAttribute('data-badge', 'carousel');
  await expect(cards.nth(3).locator('.instagram-timeline-badge')).toHaveCount(0);
  const badge = await cards.nth(1).locator('.instagram-timeline-badge').boundingBox();
  expect([badge.width, badge.height]).toEqual([24, 24]);
});

test('em pt, cada card abre o post em nova aba com o nome acessível do original', async ({ page }) => {
  await page.goto(PAGE);
  const cards = page.locator('.instagram-timeline-card');
  await expect(cards).toHaveCount(4);
  const names = await cards.evaluateAll((all) => all.map((card) => card.getAttribute('aria-label')));
  expect(names).toEqual([
    'Alunos no gramado do campus — abre a publicação no Instagram em nova aba',
    'Vídeo no Instagram — vídeo — abre a publicação no Instagram em nova aba',
    'Publicação no Instagram com vários itens — publicação com vários itens — abre a publicação no Instagram em nova aba',
    'Aula magna no auditório — abre a publicação no Instagram em nova aba',
  ]);
  await expect(cards.first()).toHaveAttribute('target', '_blank');
  await expect(cards.first()).toHaveAttribute('rel', 'noopener noreferrer');
});

test('em en, o bloco busca o feed em inglês e traduz o nome acessível', async ({ page }) => {
  await page.goto(`/en${PAGE}`);
  const cards = page.locator('.instagram-timeline-card');
  await expect(cards).toHaveCount(4);
  const names = await cards.evaluateAll((all) => all.map((card) => card.getAttribute('aria-label')));
  expect(names).toEqual([
    'Students on the campus lawn — opens the Instagram post in a new tab',
    'Instagram video — video — opens the Instagram post in a new tab',
    'Instagram post with multiple items — post with multiple items — opens the Instagram post in a new tab',
    'Lecture at the auditorium — opens the Instagram post in a new tab',
  ]);
});

test.describe('o bloco some quando não há exatamente 4 posts', () => {
  const expectRemoved = async (page) => {
    await page.goto(PAGE);
    await expect(page.locator('.accordion').first()).toHaveAttribute('data-block-status', 'loaded');
    await expect(page.locator('.instagram-timeline')).toHaveCount(0);
  };

  test('com 3 posts', async ({ page }) => {
    await page.route(FEED, async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      await route.fulfill({ response, json: { posts: body.posts.slice(0, 3) } });
    });
    await expectRemoved(page);
  });

  test('com HTTP 500', async ({ page }) => {
    await page.route(FEED, (route) => route.fulfill({ status: 500, body: 'erro' }));
    await expectRemoved(page);
  });

  test('com erro de rede', async ({ page }) => {
    await page.route(FEED, (route) => route.abort());
    await expectRemoved(page);
  });

  test('com corpo que não é JSON', async ({ page }) => {
    await page.route(FEED, (route) => route.fulfill({ status: 200, body: '<html></html>' }));
    await expectRemoved(page);
  });
});
