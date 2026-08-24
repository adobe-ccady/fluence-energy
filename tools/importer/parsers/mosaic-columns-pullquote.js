/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns (columns-pullquote) — Mosaic page.
 * Base: columns. Source: https://fluenceenergy.com/mosaic-intelligent-bidding-software/
 * Selector: #main article section.quote-block blockquote.square-overlay
 *
 * Source: a <blockquote class="square-overlay"> with a decorative quote-icon
 * svg, a .quote-block-body <p> (the testimonial), and a <cite> holding the
 * attribution (.quote-name + .quote-title).
 *
 * blocks/columns/columns.css .columns.columns-pullquote styles the LAST column
 * (`> div > div:last-child`) as the dark quote box: <p> is the italic quote and
 * <em> is the muted attribution. We emit a single-cell row containing the quote
 * paragraph followed by the attribution wrapped in <em>. The decorative svg icon
 * is not portable content and is dropped.
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
    name: 'Columns',
    variants: ['columns-pullquote'],
    cells: [[cell]],
  });
  element.replaceWith(block);
}
