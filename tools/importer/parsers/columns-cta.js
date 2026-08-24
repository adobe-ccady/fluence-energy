/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns (columns-cta).
 * Base: columns. Source: https://fluenceenergy.com/
 * Selector: #main > article.homepage > section.cols-full-bkg--contact
 *
 * Columns convention: multiple columns; row 2+ share the same column count.
 * Here: a single row with two text-only CTA cells (no images). Each cell:
 * <h2> heading + <p> paragraph + a CTA link.
 *   - Left:  "Let's Get Started" → Contact Us (https://fluenceenergy.com/contact/)
 *   - Right: "Get the Latest News" → Subscribe (#blog-signup-box)
 * The leading decorative SVG icons are not portable content and are dropped.
 */
export default function parse(element, { document }) {
  const columns = [...element.querySelectorAll(':scope > .cols-full-bkg-item')];
  const row = [];

  columns.forEach((column) => {
    const wrap = column.querySelector('.cols-full-bkg-wrap') || column;
    const cell = [];

    const heading = wrap.querySelector('h2, h3');
    if (heading && heading.textContent.trim()) {
      const h2 = document.createElement('h2');
      h2.textContent = heading.textContent.trim();
      cell.push(h2);
    }

    const para = wrap.querySelector('p');
    if (para && para.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = para.textContent.trim();
      cell.push(p);
    }

    const cta = wrap.querySelector('a.grad-button, a[href]');
    if (cta) {
      const a = document.createElement('a');
      a.href = cta.getAttribute('href');
      const target = cta.getAttribute('target');
      if (target) a.setAttribute('target', target);
      const span = cta.querySelector('span');
      a.textContent = (span ? span.textContent : cta.textContent).trim();
      const p = document.createElement('p');
      p.appendChild(a);
      cell.push(p);
    }

    row.push(cell);
  });

  if (!row.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Columns',
    variants: ['columns-cta'],
    cells: [row],
  });
  element.replaceWith(block);
}
