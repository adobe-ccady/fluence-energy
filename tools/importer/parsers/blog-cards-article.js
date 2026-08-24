/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards (cards-article) — Blog article "Related Posts" and
 * "Most Popular" post grids.
 * Base: cards. Source: https://blog.fluenceenergy.com/building-the-power-blueprint-for-tomorrows-ai-factories
 * Selectors (both map to this same parser — identical card shape):
 *   section.fullwidth-column.section:has(.recommended-posts)
 *   section.fullwidth-column.section:has(.popular-posts)
 *
 * Source: a .l-grid of .l-grid-item cards. Each card is a .card-thumb whose
 * <a href> wraps a .card-thumb-image <img> thumbnail and a .card-thumb-body
 * containing .card-thumb-meta (category <h4> + date <h4>) and
 * .card-thumb-content (linked title <h3>). The whole card links to the article.
 *
 * The `card` item model (blocks/cards/_cards.json) is [image, imageAlt→
 * collapsed, text]; blocks/cards/cards.js classifies an image-only cell as
 * .cards-card-image and the other as .cards-card-body, then wraps the card in
 * its body link for full-surface clickability. So we emit one row per card:
 *   cell 1 = the thumbnail as a REAL <img> element (never a text URL/link — a
 *            text URL would be misrendered by the UE external-reference path),
 *   cell 2 = the text body: category + date + linked title <h3>.
 *
 * The section heading <h2> ("Related Posts" / "Most Popular") lives INSIDE the
 * section element we replace, so it must be captured and re-emitted as default
 * content ABOVE the block — otherwise element.replaceWith(block) destroys it.
 */
export default function parse(element, { document }) {
  const cards = [...element.querySelectorAll('.card-thumb')];
  const cells = [];

  // Capture the section heading (h2) before we replace the section element.
  const headingEl = element.querySelector('header h2, h2');
  const headingText = headingEl && headingEl.textContent.trim() ? headingEl.textContent.trim() : '';

  cards.forEach((card) => {
    const link = card.querySelector('a[href]');
    const href = link ? link.getAttribute('href') : null;

    // Cell 1: thumbnail — a real <img> element (NOT a text URL/link).
    const col1 = document.createElement('div');
    const img = card.querySelector('.card-thumb-image img, img');
    if (img) {
      col1.appendChild(img.cloneNode(true));
    }

    // Cell 2: text body — category (h4) + date (h4) + linked title (h3).
    const col2 = document.createElement('div');

    const metaEls = card.querySelectorAll('.card-thumb-meta h4, .card-thumb-meta h3');
    metaEls.forEach((meta) => {
      if (meta.textContent.trim()) {
        const h4 = document.createElement('h4');
        h4.textContent = meta.textContent.trim();
        col2.appendChild(h4);
      }
    });

    const title = card.querySelector('.card-thumb-content h3, .card-thumb-content h2, h3');
    if (title && title.textContent.trim()) {
      const h3 = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        const target = link.getAttribute('target');
        if (target) a.setAttribute('target', target);
        a.textContent = title.textContent.trim();
        h3.appendChild(a);
      } else {
        h3.textContent = title.textContent.trim();
      }
      col2.appendChild(h3);
    }

    if (col1.childNodes.length || col2.childElementCount) {
      cells.push([col1, col2]);
    }
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

  // Preserve the section heading (h2) as default content above the block.
  const fragment = document.createDocumentFragment();
  if (headingText) {
    const h2 = document.createElement('h2');
    h2.textContent = headingText;
    fragment.appendChild(h2);
  }
  fragment.appendChild(block);
  element.replaceWith(fragment);
}
