// Bloco `share`: medidas de PROD registradas em
// new-portal/.docs-internos/eds-port-poc/blocks/share/PORTE.md (notícia, 13/11/2026).
import { test, expect } from '@playwright/test';

const PAGE = '/test/eds-port.html';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.openedWindows = [];
    window.open = (url, name, features) => {
      window.openedWindows.push({ url, features });
      return null;
    };
  });
  await page.goto(PAGE);
  await expect(page.locator('.share').first()).toHaveAttribute('data-block-status', 'loaded');
});

const share = (page) => page.locator('.share').first();

test('os 6 itens ficam nas mesmas posições e tamanhos de PROD', async ({ page }) => {
  const boxes = await share(page).locator('.share-list > *').evaluateAll((items) => {
    const list = items[0].parentElement.getBoundingClientRect();
    return items.map((item) => {
      const box = item.getBoundingClientRect();
      return {
        x: Math.round(box.left - list.left),
        width: Math.round(box.width),
        height: Math.round(box.height),
      };
    });
  });
  expect(boxes.map((box) => box.x)).toEqual([0, 29, 67, 107, 147, 187]);
  expect(boxes.map((box) => [box.width, box.height])).toEqual([
    [21, 32], [30, 32], [32, 32], [32, 32], [32, 32], [32, 32],
  ]);
});

test('cada rede abre a URL do react-share com o texto autorado', async ({ page }) => {
  const block = share(page);
  const labels = ['LinkedIn', 'X (Twitter)', 'Facebook', 'WhatsApp'];
  // eslint-disable-next-line no-restricted-syntax
  for (const label of labels) {
    // eslint-disable-next-line no-await-in-loop
    await block.getByRole('button', { name: `Compartilhar no ${label}` }).click();
  }
  const opened = await page.evaluate(() => window.openedWindows);
  const href = page.url();
  const query = (params) => new URLSearchParams(params).toString().replace(/\+/g, '%20');
  expect(opened.map((entry) => entry.url)).toEqual([
    `https://linkedin.com/shareArticle?${query({
      url: href, mini: 'true', title: 'Confira mais em:', summary: '#Insper',
    })}`,
    `https://twitter.com/share?${query({ url: href, text: 'Confira mais em:', hashtags: 'Insper' })}`,
    `https://www.facebook.com/sharer/sharer.php?${query({ u: href, quote: 'Confira mais em:', hashtag: '#Insper' })}`,
    `https://web.whatsapp.com/send?${query({ text: `Confira mais em: #Insper ${href}` })}`,
  ]);
  expect(opened[0].features).toContain('width=750, ');
  expect(opened[0].features).toContain('height=600');
  expect(opened[1].features).toContain('width=550, ');
  expect(opened[1].features).toContain('height=400');
});

test('a tooltip abre no clique e fecha no clique fora e no Esc', async ({ page }) => {
  const block = share(page);
  const copy = block.getByRole('button', { name: 'Copiar link' });
  const tooltip = block.getByRole('status');

  await copy.click();
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText('Link copiado com sucesso.');

  await page.mouse.click(5, 5);
  await expect(tooltip).toBeHidden();

  await copy.click();
  await expect(tooltip).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(tooltip).toBeHidden();

  await copy.click();
  await copy.click();
  await expect(tooltip).toBeHidden();
});

test('sem tooltip autorada, o balão usa o texto padrão do diálogo', async ({ page }) => {
  const block = page.locator('.share').nth(1);
  await block.getByRole('button', { name: 'Copiar link' }).click();
  await expect(block.getByRole('status')).toHaveText('Link copiado com sucesso.');
  await expect(block).not.toHaveAttribute('id');
});

// O id saiu junto com o model (d77da11): nenhuma instância de PROD muda o padrão.
test('o bloco não recebe id, nem nas instâncias antigas', async ({ page }) => {
  await expect(share(page)).not.toHaveAttribute('id');
  await expect(page.locator('.share').nth(1)).not.toHaveAttribute('id');
});
