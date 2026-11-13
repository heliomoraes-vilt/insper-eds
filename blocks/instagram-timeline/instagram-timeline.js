/*
 * Bloco `instagram-timeline` — porte de components/TimelineInstagram
 * (insper-portal/components/timelineInstagram).
 *
 * Origem: TimelineInstagram.tsx (115) + .style.tsx (56) + .types.ts (17).
 *
 * No AEM os posts chegam prontos no model.json: o Sling Model chama o
 * InstagramTimelineService no servidor, com o token da Meta. No EDS não há
 * servidor de renderização, então o bloco busca os mesmos posts num servlet GET
 * do AEM. O token continua no AEM.
 *
 * Contrato xwalk (_instagram-timeline.json): uma linha, células nesta ordem:
 *   source | id
 */

import { fieldValues } from '../../scripts/block-fields.js';

const REQUIRED_POSTS = 4;
const DEFAULT_SOURCE = '/bin/insper/instagram-timeline';

/* O idioma vai como seletor, e não como query string, para a resposta
   continuar cacheável no CDN/dispatcher: <source>.<lang>.json */
export const endpoint = (source, lang) => `${source}.${lang}.json`;

const LABELS = {
  pt: {
    newTab: 'abre a publicação no Instagram em nova aba',
    video: 'vídeo',
    carousel: 'publicação com vários itens',
  },
  en: {
    newTab: 'opens the Instagram post in a new tab',
    video: 'video',
    carousel: 'post with multiple items',
  },
};

/* Ícones do original (VideoIcon, CarouselIcon), decorativos. */
const VIDEO_ICON = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true" focusable="false"><rect x="3.6" y="3.6" width="16.8" height="16.8" rx="4.4" stroke="currentColor" stroke-width="1.8"/><path d="M10.2 8.6 16 12l-5.8 3.4V8.6Z" fill="currentColor"/></svg>';
const CAROUSEL_ICON = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true" focusable="false"><rect x="8" y="3.6" width="12.4" height="12.4" rx="3.2" stroke="currentColor" stroke-width="1.8"/><path d="M16 20.4H7.2a3.6 3.6 0 0 1-3.6-3.6V8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* Porte de LanguageGetter.inferLanguageFromURL; o original cai em pt quando
   não acha nada (resolveLabels). */
export const inferLanguage = (pathname = window.location.pathname) => {
  const parts = pathname.split('/');
  return ['pt', 'en'].find((lang) => parts.includes(lang)) === 'en' ? 'en' : 'pt';
};

export const buildAccessibleName = (post, labels) => {
  let mediaHint = '';
  if (post.video) mediaHint = labels.video;
  else if (post.hasMultipleMedia) mediaHint = labels.carousel;
  return [post.altText, mediaHint, labels.newTab].filter(Boolean).join(' — ');
};

const fetchPosts = async (source, lang) => {
  try {
    const response = await fetch(endpoint(source, lang));
    if (!response.ok) return [];
    const body = await response.json();
    return Array.isArray(body?.posts) ? body.posts : [];
  } catch {
    return [];
  }
};

const buildCard = (post, labels) => {
  const card = document.createElement('a');
  card.className = 'instagram-timeline-card';
  card.href = post.permalink;
  card.target = '_blank';
  card.rel = 'noopener noreferrer';
  card.setAttribute('aria-label', buildAccessibleName(post, labels));

  const img = document.createElement('img');
  img.src = post.displayUrl;
  img.alt = post.altText;
  img.loading = 'lazy';
  card.append(img);

  let badge = null;
  if (post.video) badge = ['video', VIDEO_ICON];
  else if (post.hasMultipleMedia) badge = ['carousel', CAROUSEL_ICON];
  if (badge) {
    const [kind, icon] = badge;
    const span = document.createElement('span');
    span.className = 'instagram-timeline-badge';
    span.setAttribute('aria-hidden', 'true');
    span.dataset.badge = kind;
    span.innerHTML = icon;
    card.append(span);
  }
  return card;
};

export default async function decorate(block) {
  const config = fieldValues(block, ['source', 'id']);
  if (config.id) block.id = config.id;
  block.textContent = '';
  // Mantém o seletor que a suíte Playwright do portal já usa.
  block.dataset.component = 'timeline-instagram';

  const lang = inferLanguage();
  const posts = await fetchPosts(config.source || DEFAULT_SOURCE, lang);

  // Igual ao original: sem exatamente 4 posts, o componente não aparece.
  if (posts.length !== REQUIRED_POSTS) {
    (block.parentElement?.classList.contains('instagram-timeline-wrapper') ? block.parentElement : block).remove();
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'instagram-timeline-grid';
  posts.forEach((post) => grid.append(buildCard(post, LABELS[lang])));
  block.append(grid);
}
