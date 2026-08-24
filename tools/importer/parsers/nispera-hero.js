/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero (base variant) — Nispera APM page.
 * Base: hero. Source: https://fluenceenergy.com/nispera-energy-asset-performance-management-software/
 * Selector: #main > header.banner
 *
 * This is the BASE hero (full-bleed overlay), NOT the homepage hero-carousel.
 * blocks/hero/hero.js non-carousel branch is the contract: it reads the block's
 * direct child rows as
 *   - row 0 = image row  → background media (a <picture>/<img>)
 *   - row 1 = content row → heading/eyebrow cell
 * So we emit a 1-column, 2-row table: [ bgImage ] then [ eyebrow + h1 ].
 * The source header carries a real <img> (the swoosh gradient) as a direct
 * child, plus a .banner-title with a p.h4 eyebrow ("Nispera") and the <h1>.
 * hero.js promotes the first <p> (eyebrow) to .tag-pill.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 0: background media — the swoosh gradient image on the header.
  const bgImg = element.querySelector(':scope > img') || element.querySelector('img');
  if (bgImg) {
    cells.push([bgImg.cloneNode(true)]);
  } else {
    // Fluence WP heroes carry the banner as an inline background-image style.
    const style = element.getAttribute('style') || '';
    const m = style.match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    if (m && m[1]) {
      const img = document.createElement('img');
      img.src = m[1];
      img.setAttribute('alt', '');
      cells.push([img]);
    }
  }

  // Row 1: content cell — eyebrow (p.h4) + h1.
  const contentCell = [];
  const eyebrow = element.querySelector('.banner-title p, p.h4, .banner-title .h4');
  if (eyebrow && eyebrow.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = eyebrow.textContent.trim();
    contentCell.push(p);
  }
  const heading = element.querySelector('.banner-title h1, h1');
  if (heading && heading.textContent.trim()) {
    const h1 = document.createElement('h1');
    h1.textContent = heading.textContent.trim();
    contentCell.push(h1);
  }
  if (contentCell.length) cells.push([contentCell]);

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Hero',
    cells,
  });
  element.replaceWith(block);
}
