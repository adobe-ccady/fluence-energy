/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards (cards-product).
 * Base: cards. Source: https://fluenceenergy.com/
 * Selector: #main > article.homepage > section.our-system-block
 *
 * Cards convention (images present): 2 columns, one row per card — image/icon
 * in the first cell, text content (title + optional description + CTA) in the
 * second. Base cards.js classifies a single-image cell as .cards-card-image and
 * the other as .cards-card-body (product name + "Learn More" CTA), then wraps
 * the whole card in the body link for full-surface clickability.
 * The section heading/intro paragraph are default content (handled outside the
 * block), so only the product cards are emitted here.
 */
export default function parse(element, { document }) {
  const items = [...element.querySelectorAll('.our-system-item')];
  const cells = [];

  items.forEach((item) => {
    // Cell 1: image.
    const imageCell = [];
    const img = item.querySelector('.item-header img, img');
    if (img) {
      const p = document.createElement('p');
      p.appendChild(img.cloneNode(true));
      imageCell.push(p);
    }

    // Cell 2: body — product name + CTA.
    const bodyCell = [];
    const name = item.querySelector('.item-body p, p');
    if (name && name.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = name.textContent.trim();
      bodyCell.push(p);
    }

    const cta = item.querySelector('a.grad-button, a[href]');
    if (cta) {
      const a = document.createElement('a');
      a.href = cta.getAttribute('href');
      const target = cta.getAttribute('target');
      if (target) a.setAttribute('target', target);
      const span = cta.querySelector('span');
      a.textContent = (span ? span.textContent : cta.textContent).trim();
      const p = document.createElement('p');
      p.appendChild(a);
      bodyCell.push(p);
    }

    cells.push([imageCell, bodyCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Cards',
    variants: ['cards-product'],
    cells,
  });

  // Preserve the section heading ("Our Energy Storage Products") and its intro
  // paragraph as default content ABOVE the block so they survive the import
  // (page-templates.json marks the heading as defaultContent). The header lives
  // in .section-header (h2 + intro p) outside the card grid.
  const fragment = document.createDocumentFragment();
  const header = element.querySelector('.section-header');
  if (header) {
    const heading = header.querySelector('h1, h2');
    if (heading) {
      const h2 = document.createElement('h2');
      h2.textContent = heading.textContent.trim();
      fragment.appendChild(h2);
    }
    const intro = header.querySelector('p');
    if (intro && intro.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = intro.textContent.trim();
      fragment.appendChild(p);
    }
  }
  fragment.appendChild(block);
  element.replaceWith(fragment);
}
