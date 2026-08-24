/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards (cards-article) — Services page.
 * Base: cards. Source: https://fluenceenergy.com/energy-storage-services/
 * Selector: #main > article > section:nth-of-type(11) .l-grid (the
 *   "Want to learn more?" blog-article grid).
 *
 * Source: a grid of .card-post items. Each card is an <a href> (to
 * blog.fluenceenergy.com) wrapping a .card-post__header (thumbnail <img>; on the
 * live site a CSS background-image) and a .card-post__body <h4> headline.
 *
 * blocks/cards/cards.js (non-product) reads each row: a single-image cell →
 * .cards-card-image; the other → .cards-card-body, then wraps the card in the
 * body link for full-surface clickability. We emit one row per card:
 * cell 1 = the thumbnail image, cell 2 = the headline linked to the article.
 *
 * The section <h2> "Want to learn more?" is a sibling within the SAME section
 * and is preserved automatically — we only replace the inner grid, so we do NOT
 * re-emit the heading (that would duplicate it).
 */
export default function parse(element, { document }) {
  const cards = [...element.querySelectorAll('.card-post')];
  const cells = [];

  cards.forEach((card) => {
    const link = card.querySelector('a[href]');
    const href = link ? link.getAttribute('href') : null;

    // Cell 1: thumbnail image. Real <img> in the sanitized DOM; on the live page
    // it can be a CSS background-image on .card-post__header — handle both by
    // extracting the bg URL into a real <img> when no <img> is present.
    const col1 = document.createElement('div');
    const img = card.querySelector('.card-post__header img, img');
    if (img) {
      col1.appendChild(img.cloneNode(true));
    } else {
      const header = card.querySelector('.card-post__header') || card;
      const style = header.getAttribute('style') || '';
      const m = style.match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
      if (m && m[1]) {
        const bg = document.createElement('img');
        bg.src = m[1];
        bg.setAttribute('alt', '');
        col1.appendChild(bg);
      }
    }

    // Cell 2: headline, linked to the article.
    const col2 = document.createElement('div');
    const headline = card.querySelector('.card-post__body h4, .card-post__body h3, h4, h3');
    if (headline && headline.textContent.trim()) {
      const h3 = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        const target = link.getAttribute('target');
        if (target) a.setAttribute('target', target);
        a.textContent = headline.textContent.trim();
        h3.appendChild(a);
      } else {
        h3.textContent = headline.textContent.trim();
      }
      col2.appendChild(h3);
    }

    cells.push([col1, col2]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Cards',
    variants: ['cards-article'],
    cells,
  });
  element.replaceWith(block);
}
