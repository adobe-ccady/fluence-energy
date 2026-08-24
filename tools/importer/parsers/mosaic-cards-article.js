/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards (cards-article) — Mosaic page.
 * Base: cards. Source: https://fluenceenergy.com/mosaic-intelligent-bidding-software/
 * Selector: #main article > section.advanced-full-width:last-of-type .l-grid--four-col
 *   (the "In the Press" section)
 *
 * Source: a four-column grid of .card-post items. Each card is an <a> wrapping
 * a .card-post__header (thumbnail <img>) and a .card-post__body <h4> headline,
 * linking to an external news article.
 *
 * blocks/cards/cards.js (non-product) reads each row: a single-image cell →
 * .cards-card-image; the other → .cards-card-body. It then wraps the whole card
 * in the body link for full-surface clickability. We emit one row per card:
 * cell 1 = the thumbnail image, cell 2 = the headline linked to the article.
 *
 * The section heading <h2> ("In the Press") is default content and is preserved
 * OUTSIDE the block, above it.
 */
export default function parse(element, { document }) {
  const cards = [...element.querySelectorAll('.card-post')];
  const cells = [];

  cards.forEach((card) => {
    const link = card.querySelector('a[href]');
    const href = link ? link.getAttribute('href') : null;

    // Cell 1: thumbnail image. On the live page the thumbnail is a CSS
    // background-image on .card-post__header; in the sanitized DOM it is a real
    // <img>. Handle both — extract the bg URL into a real <img> when needed so
    // the asset is imported.
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
    name: 'Cards (cards-article)',
    cells,
  });

  // The section heading ("In the Press") is a sibling within the same section
  // and is preserved automatically — we only replace the inner grid, so do NOT
  // re-emit the heading (that caused a duplicate). Swap the grid in place.
  element.replaceWith(block);
}
