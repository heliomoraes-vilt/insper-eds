/*
 * Bloco `share` — porte de components/ShareComponent (shareComponent no AEM).
 *
 * Origem: ShareComponent.tsx (90) + .style.tsx (51) + .types.ts (7), mais o
 * que ele puxa de fora: 6 ícones de Icon.tsx, MicroComponents/Tooltip (Tippy)
 * e os 4 botões do react-share.
 *
 * Contrato xwalk (_share.json): uma linha, uma célula por campo, nesta ordem:
 *   text | tooltip | id
 */

import { fieldValues } from '../../scripts/block-fields.js';

/* Ícones copiados de components/Icon/Icon.tsx (cases newShare, newMagneticlink,
   linkedinShare, twitterShare, facebookShare, whatsappShare). */
const ICONS = {
  share: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" width="21" height="20" viewBox="0 0 21 20" aria-hidden="true"><path fill="currentColor" d="m19.067 8.309-6.25-6.25a.625.625 0 0 0-1.067.441v3.153c-2.027.173-4.265 1.165-6.106 2.727-2.217 1.881-3.598 4.305-3.888 6.826a.938.938 0 0 0 1.616.748c.86-.915 3.917-3.808 8.378-4.062V15a.624.624 0 0 0 1.067.442l6.25-6.25a.625.625 0 0 0 0-.883ZM13 13.492V11.25a.625.625 0 0 0-.625-.625c-2.194 0-4.33.573-6.35 1.703A15.327 15.327 0 0 0 3.166 14.4c.453-1.862 1.595-3.633 3.285-5.067 1.814-1.538 4.028-2.458 5.923-2.458A.625.625 0 0 0 13 6.25V4.01l4.741 4.74L13 13.492Z"/></svg>',
  copy: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" width="32" height="32" viewBox="0 0 33 32" aria-hidden="true"><rect width="32" height="32" x=".5" fill="#E50505" rx="16"/><path fill="#fff" d="M17.245 20.56a.625.625 0 0 1 0 .883l-.776.781a4.378 4.378 0 1 1-6.19-6.193l1.885-1.884a4.375 4.375 0 0 1 6-.178.625.625 0 0 1-.14 1.032.626.626 0 0 1-.69-.095 3.125 3.125 0 0 0-4.286.128l-1.884 1.882a3.126 3.126 0 1 0 4.42 4.42l.777-.776a.624.624 0 0 1 .884 0ZM22.72 9.777a4.381 4.381 0 0 0-6.189 0l-.776.778a.625.625 0 0 0 .884.883l.777-.776a3.125 3.125 0 1 1 4.42 4.42l-1.884 1.886a3.125 3.125 0 0 1-4.286.125.625.625 0 0 0-1.04.506c.01.166.085.321.21.431a4.375 4.375 0 0 0 6-.176l1.884-1.885a4.381 4.381 0 0 0 0-6.19v-.002Z"/></svg>',
  linkedin: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" width="32" height="32" viewBox="0 0 33 32" aria-hidden="true"><rect width="32" height="32" x=".5" fill="#0A66C2" rx="16"/><path fill="#fff" d="M12.081 24H8.764V13.318h3.317V24Zm-1.66-12.14c-1.06 0-1.921-.878-1.921-1.939a1.921 1.921 0 1 1 3.842 0c0 1.06-.86 1.94-1.921 1.94ZM24.497 24h-3.31v-5.2c0-1.24-.025-2.829-1.725-2.829-1.725 0-1.99 1.347-1.99 2.74V24H14.16V13.318h3.182v1.457h.046c.443-.84 1.525-1.725 3.139-1.725 3.357 0 3.974 2.21 3.974 5.082V24h-.003Z"/></svg>',
  twitter: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" width="32" height="32" viewBox="0 0 33 32" aria-hidden="true"><rect width="32" height="32" x=".5" fill="#000" rx="16"/><path fill="#fff" d="M21.1 8.763h2.454l-5.36 6.131 6.306 8.343h-4.937l-3.867-5.06-4.425 5.06H8.816l5.733-6.558L8.5 8.763h5.063l3.495 4.625 4.043-4.625Zm-.86 13.004h1.36l-8.776-11.611h-1.459l8.875 11.611Z"/></svg>',
  facebook: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" width="32" height="32" viewBox="0 0 33 32" aria-hidden="true"><rect width="32" height="32" x=".5" fill="#1877F2" rx="16"/><path fill="#fff" d="m20.223 17 .445-2.896h-2.779v-1.879c0-.792.388-1.564 1.633-1.564h1.263V8.196S19.639 8 18.543 8c-2.289 0-3.784 1.387-3.784 3.898v2.206h-2.544V17h2.544v7h3.13v-7h2.334Z"/></svg>',
  whatsapp: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" width="32" height="32" viewBox="0 0 33 32" aria-hidden="true"><rect width="32" height="32" x=".5" fill="#25D366" rx="16"/><path fill="#fff" d="M22.104 10.325A7.87 7.87 0 0 0 16.496 8a7.937 7.937 0 0 0-6.871 11.893L8.5 24l4.204-1.104a7.904 7.904 0 0 0 3.789.965h.003c4.368 0 8.004-3.557 8.004-7.929 0-2.118-.9-4.107-2.396-5.607Zm-5.608 12.2a6.578 6.578 0 0 1-3.357-.918l-.239-.143-2.493.654.664-2.432-.157-.25a6.568 6.568 0 0 1-1.007-3.507c0-3.633 2.957-6.59 6.593-6.59 1.76 0 3.414.686 4.657 1.932 1.243 1.247 2.007 2.9 2.004 4.661 0 3.636-3.032 6.593-6.665 6.593Zm3.615-4.936c-.197-.1-1.172-.578-1.354-.643-.182-.067-.314-.1-.446.1s-.511.643-.629.779c-.114.132-.232.15-.428.05-1.165-.582-1.929-1.04-2.697-2.357-.203-.35.204-.325.582-1.082.065-.132.032-.247-.018-.347-.05-.1-.446-1.075-.61-1.471-.161-.386-.325-.332-.447-.34-.114-.007-.246-.007-.378-.007a.734.734 0 0 0-.529.247c-.182.2-.693.678-.693 1.653s.711 1.918.807 2.05c.1.133 1.397 2.133 3.386 2.993 1.257.543 1.75.59 2.379.497.382-.057 1.171-.479 1.335-.943.165-.464.165-.86.115-.943-.047-.09-.179-.14-.375-.236Z"/></svg>',
};

/* Padrões do diálogo AEM (shareComponent/_cq_dialog) e do Sling Model. */
const DEFAULT_TEXT = 'Confira mais em:';
const DEFAULT_TOOLTIP = 'Link copiado com sucesso.';

/* URLs montadas exatamente como o react-share 4.4.1 monta
   (lib/*ShareButton.js + utils/objectToGetParams.js). */
const toQuery = (params) => {
  const pairs = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  return pairs.length ? `?${pairs.join('&')}` : '';
};

const isMobileOrTablet = () => /(android|iphone|ipad|mobile)/i.test(navigator.userAgent);

export const NETWORKS = [
  {
    key: 'linkedin',
    label: 'LinkedIn',
    width: 750,
    height: 600,
    link: (url, text) => `https://linkedin.com/shareArticle${toQuery({
      url, mini: 'true', title: text, summary: '#Insper',
    })}`,
  },
  {
    key: 'twitter',
    label: 'X (Twitter)',
    width: 550,
    height: 400,
    link: (url, text) => `https://twitter.com/share${toQuery({ url, text, hashtags: 'Insper' })}`,
  },
  {
    key: 'facebook',
    label: 'Facebook',
    width: 550,
    height: 400,
    link: (url, text) => `https://www.facebook.com/sharer/sharer.php${toQuery({
      u: url, quote: text, hashtag: '#Insper',
    })}`,
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    width: 550,
    height: 400,
    link: (url, text) => `https://${isMobileOrTablet() ? 'api' : 'web'}.whatsapp.com/send${toQuery({
      text: `${text} #Insper ${url}`,
    })}`,
  },
];

/* Popup centrado na janela, com as mesmas features do windowOpen do react-share. */
const openShareWindow = (link, width, height) => {
  const left = window.outerWidth / 2 + (window.screenX || window.screenLeft || 0) - width / 2;
  const top = window.outerHeight / 2 + (window.screenY || window.screenTop || 0) - height / 2;
  const features = {
    height,
    width,
    left,
    top,
    location: 'no',
    toolbar: 'no',
    status: 'no',
    directories: 'no',
    menubar: 'no',
    scrollbars: 'yes',
    resizable: 'no',
    centerscreen: 'yes',
    chrome: 'yes',
  };
  window.open(link, '', Object.entries(features).map(([k, v]) => `${k}=${v}`).join(', '));
};

/*
 * Substitui o Tooltip (Tippy) por um balão próprio. Mesmo contrato de uso:
 * trigger "click" (abre e fecha no clique), fecha no clique fora e no Esc,
 * placement top-start, tema escuro.
 */
const attachTooltip = (wrapper, button, message) => {
  const bubble = document.createElement('span');
  bubble.className = 'share-tooltip';
  bubble.setAttribute('role', 'status');
  bubble.hidden = true;
  wrapper.append(bubble);

  const hide = () => {
    bubble.hidden = true;
    bubble.textContent = '';
  };
  const show = () => {
    // Texto só entra no DOM ao abrir, para o leitor de tela anunciar o role=status.
    bubble.textContent = message;
    bubble.hidden = false;
  };

  button.addEventListener('click', () => (bubble.hidden ? show() : hide()));
  document.addEventListener('click', (event) => {
    if (!wrapper.contains(event.target)) hide();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hide();
  });
};

export default function decorate(block) {
  const config = fieldValues(block, ['text', 'tooltip', 'id']);
  const text = config.text || DEFAULT_TEXT;
  const tooltip = config.tooltip || DEFAULT_TOOLTIP;

  if (config.id) block.id = config.id;
  block.textContent = '';

  const list = document.createElement('div');
  list.className = 'share-list';

  const first = document.createElement('div');
  first.className = 'share-icon';
  first.innerHTML = ICONS.share;
  list.append(first);

  // Copiar link
  const copyItem = document.createElement('div');
  copyItem.className = 'share-item share-copy';
  const copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.setAttribute('aria-label', 'Copiar link');
  copyButton.innerHTML = ICONS.copy;
  copyButton.addEventListener('click', () => {
    // A URL é lida no clique, não na montagem: pega âncoras e query atuais.
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
  });
  copyItem.append(copyButton);
  attachTooltip(copyItem, copyButton, tooltip);
  list.append(copyItem);

  NETWORKS.forEach((network) => {
    const item = document.createElement('div');
    item.className = `share-item share-${network.key}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Compartilhar no ${network.label}`);
    button.innerHTML = ICONS[network.key];
    button.addEventListener('click', (event) => {
      event.preventDefault();
      openShareWindow(network.link(window.location.href, text), network.width, network.height);
    });
    item.append(button);
    list.append(item);
  });

  block.append(list);
}
