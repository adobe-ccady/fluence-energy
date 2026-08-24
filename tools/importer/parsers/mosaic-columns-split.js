/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns (columns-split) — Mosaic page.
 * Base: columns. Source: https://fluenceenergy.com/mosaic-intelligent-bidding-software/
 * Selectors (2 instances, both a .columns-two-thirds inside the section):
 *   (a) section:nth-of-type(1) .columns-two-thirds--right
 *       → content column (.col-two-third: h2 above + paragraphs + "Request a
 *         Demo" CTA) and an image column (.col-one-third: laptop screenshot).
 *   (b) section:nth-of-type(5) .columns-two-thirds--left
 *       → content column (.col-two-third: paragraphs + "Request a Demo" CTA)
 *         and a TEXT column (.col-one-third: large emphasis <h2>). No image.
 *
 * Columns convention: multiple columns; the single row has 2 cells. Base
 * columns.js classifies a single-image cell as .columns-img-col and the other
 * as .columns-text-col. Cell order honors the source layout:
 *   --right → [content, other]  (one-third on the right)
 *   --left  → [other, content]  (one-third on the left)
 * The section <h2> that sits ABOVE the columns is preserved as default content
 * OUTSIDE the block (like the stats parser), emitted before the block.
 */
export default function parse(element, { document }) {
  const grid = element.querySelector('.columns-two-thirds') || element;
  const contentCol = grid.querySelector('.col-two-third') || grid.children[0];
  const otherCol = grid.querySelector('.col-one-third') || grid.children[1];

  // Content cell: paragraphs (preserve inline links + the CTA paragraph).
  const contentWrap = contentCol
    ? (contentCol.querySelector('.page-content') || contentCol)
    : null;
  const contentCell = [];
  if (contentWrap) {
    [...contentWrap.querySelectorAll(':scope > p')].forEach((p) => {
      if (p.textContent.trim() || p.querySelector('img, a')) {
        contentCell.push(p.cloneNode(true));
      }
    });
  }

  // Other cell: an image (image column) OR an emphasis heading (text column).
  const otherWrap = otherCol
    ? (otherCol.querySelector('.page-content') || otherCol)
    : null;
  const otherCell = [];
  if (otherWrap) {
    const img = otherWrap.querySelector('img');
    if (img) {
      const p = document.createElement('p');
      p.appendChild(img.cloneNode(true));
      otherCell.push(p);
    } else {
      const heading = otherWrap.querySelector('h1, h2, h3');
      if (heading && heading.textContent.trim()) {
        const h2 = document.createElement('h2');
        h2.textContent = heading.textContent.trim();
        otherCell.push(h2);
      } else {
        [...otherWrap.querySelectorAll(':scope > p')].forEach((p) => {
          if (p.textContent.trim()) otherCell.push(p.cloneNode(true));
        });
      }
    }
  }

  if (!contentCell.length && !otherCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Layout: one-third on the left (--left) → other cell first; else content first.
  const isLeft = grid.classList.contains('columns-two-thirds--left')
    || !!element.querySelector('.columns-two-thirds--left');
  const row = isLeft ? [otherCell, contentCell] : [contentCell, otherCell];

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Columns (columns-split)',
    cells: [row],
  });

  // The section header <h2> (above the columns, outside .columns-two-thirds) is
  // a sibling that survives automatically in the DOM — we only replace the inner
  // .columns-two-thirds grid. Do NOT re-emit it (that caused a duplicate H2).
  // Just swap the grid for the block in place.
  element.replaceWith(block);
}
