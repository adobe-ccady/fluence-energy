/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns (columns-pullquote) — Nispera APM page.
 * Base: columns. Source: https://fluenceenergy.com/nispera-energy-asset-performance-management-software/
 * Selectors (the matched element is the <blockquote>):
 *   #main > article > section:nth-of-type(3) blockquote   (light testimonial)
 *   #main > article > section:nth-of-type(10) blockquote  (dark testimonial;
 *      its section also carries a background-image + decorative quote icon)
 *
 * Source: a <blockquote class="square-overlay"> with a decorative .quote-icon
 * (an <img> and/or an inline SVG), a .quote-block-body <p> (the testimonial),
 * and a <cite class="quote-block-citation"> holding .quote-name + .quote-title.
 *
 * blocks/columns/columns.css .columns.columns-pullquote styles the LAST column
 * as the quote box: the <p> is the italic quote and <em> is the muted
 * attribution. We emit a single-cell row: quote paragraph + attribution <em>.
 * The decorative quote icon / SVG is not portable content and is dropped (the
 * dark section's background swoosh image is section chrome, likewise dropped).
 */
export default function parse(element, { document }) {
  const quote = element.querySelector('.quote-block-body p, blockquote p, p');
  const cite = element.querySelector('.quote-block-citation, cite');

  const cell = [];

  if (quote && quote.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = quote.textContent.trim();
    cell.push(p);
  }

  if (cite) {
    const name = cite.querySelector('.quote-name');
    const title = cite.querySelector('.quote-title');
    const parts = [];
    if (name && name.textContent.trim()) parts.push(name.textContent.trim());
    if (title && title.textContent.trim()) parts.push(title.textContent.trim());
    const attribution = parts.length ? parts.join(', ') : cite.textContent.trim();
    if (attribution) {
      const p = document.createElement('p');
      const em = document.createElement('em');
      em.textContent = attribution;
      p.appendChild(em);
      cell.push(p);
    }
  }

  if (!cell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Columns (columns-pullquote)',
    cells: [[cell]],
  });
  element.replaceWith(block);
}
