/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero (base variant) — Services page.
 * Base: hero. Source: https://fluenceenergy.com/energy-storage-services/
 * Selector: #main header.banner
 *
 * This is the BASE hero (full-bleed overlay), identical in shape to the Mosaic
 * page hero. blocks/hero/hero.js non-carousel branch is the contract: it reads
 * the block's direct child rows as
 *   - row 0 = image row   → background media (a <picture>/<img>)
 *   - row 1 = content row → eyebrow + heading cell
 * So we emit a 1-column, 2-row table: [ bgImage ] then [ eyebrow p + h1 ].
 * The source header carries a real banner <img> as a direct child, plus a
 * .banner-title with a p.h4 eyebrow ("Operational and Delivery Services") and
 * the <h1> ("Maximizing system performance…"). hero.js promotes the first <p>
 * (eyebrow) to .tag-pill.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 0: background media. The banner photo may be a direct-child <img> OR an
  // inline `style="background-image:url(...)"` on the <header> (Fluence WP heroes
  // use the latter). Handle both so the hero renders its full-bleed background.
  const bgImg = element.querySelector(':scope > img') || element.querySelector('img');
  if (bgImg) {
    cells.push([bgImg.cloneNode(true)]);
  } else {
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
  const eyebrow = element.querySelector('.banner-title p.h4, .banner-title p, p.h4');
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
