/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards (cards-product) — Mosaic page.
 * Base: cards. Source: https://fluenceenergy.com/mosaic-intelligent-bidding-software/
 * Selector: #main article > section.color-option-4 .l-columns--3
 *   (the "Energy markets are changing rapidly." dark section)
 *
 * Source: three .l-column-item tiles, each with an <h3> market name
 * (California ISO / Australia NEM / ERCOT), a one-line <p> description, and a
 * per-card "Learn More" CTA link (<a class="button">). NO images on this page.
 *
 * blocks/cards/cards.js cards-product branch: a cell with a single image →
 * .cards-card-image; otherwise .cards-card-body. In the body it promotes the
 * first non-link <p> to .cards-card-title and the last <p>'s link to
 * .cards-grad-cta. Because these product tiles have NO image, we emit a single
 * body cell per card. To satisfy the "first <p> = title" rule we render the
 * market name as a <p> (title) rather than an <h3>.
 *
 * The section heading <h2> ("Energy markets are changing rapidly.") is default
 * content (page-templates.json) and is preserved OUTSIDE the block, above it.
 */
export default function parse(element, { document }) {
  const items = [...element.querySelectorAll('.l-column-item')];
  const cells = [];

  items.forEach((item) => {
    const wrap = item.querySelector('.page-content') || item;
    const body = document.createElement('div');

    // Title — market name (render as first <p> so cards.js tags it as title).
    const title = wrap.querySelector('h1, h2, h3, h4, h5, h6');
    if (title && title.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = title.textContent.trim();
      body.appendChild(p);
    }

    // Description — first paragraph that is not the CTA.
    const paras = [...wrap.querySelectorAll(':scope > p')];
    paras.forEach((para) => {
      const link = para.querySelector('a');
      const isCtaOnly = link && para.textContent.trim() === link.textContent.trim();
      if (isCtaOnly) return;
      if (para.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = para.textContent.trim();
        body.appendChild(p);
      }
    });

    // CTA — "Learn More". Preserve href + target.
    const cta = wrap.querySelector('a.button, a.grad-button, a[href]');
    if (cta) {
      const a = document.createElement('a');
      a.href = cta.getAttribute('href');
      const target = cta.getAttribute('target');
      if (target) a.setAttribute('target', target);
      const span = cta.querySelector('span');
      a.textContent = (span ? span.textContent : cta.textContent).trim();
      const p = document.createElement('p');
      p.appendChild(a);
      body.appendChild(p);
    }

    if (body.childElementCount) cells.push([body]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Cards (cards-product)',
    cells,
  });

  // The section heading ("Energy markets are changing rapidly.") is a sibling
  // within the same section and is preserved automatically in the DOM — we only
  // replace the inner grid element, so do NOT re-emit the heading (that caused
  // a duplicate). Just swap the grid for the block in place.
  element.replaceWith(block);
}
