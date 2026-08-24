/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards (cards-office) — Contact page, office directory sections.
 * Base: cards. Source: https://fluenceenergy.com/contact/
 * Selectors (per region, in page-templates instances[]):
 *   #main > article > section:nth-of-type(3) .l-columns  → Americas
 *   #main > article > section:nth-of-type(4) .l-columns  → EMEA
 *   #main > article > section:nth-of-type(5) .l-columns  → Asia Pacific
 *   (also .l-grid as a fallback)
 *
 * Source: each regional section holds office tiles laid out across MULTIPLE
 * .l-columns grids (e.g. two 3-up or 4-up rows). Each tile is a .l-column-item
 * wrapping a .page-content with:
 *   - an <h3> city heading (e.g. "HQ – Arlington, VA, USA")
 *   - one or more address <p>s using <br> for line breaks; some tiles add a
 *     second <p> (phone number / company registration line).
 * No images and no CTAs on these tiles.
 *
 * blocks/cards/cards.js cards-office branch reads each row's single body cell as
 * heading + address text (no tag-pill, no CTA, no card-wide link). So we emit
 * ONE 1-column row per office whose cell holds [ h3 city, address <p>(s) ] with
 * the <br> line breaks preserved (we clone the paragraph nodes).
 *
 * The section <h2> (region name) is a sibling within the SAME section and is
 * preserved automatically — we only replace the grid(s), so we do NOT re-emit
 * the heading.
 *
 * Because offices span more than one grid per section, we collect tiles from the
 * whole section (dedup by normalized text so any hidden mobile duplicate grid
 * does not double them), replace this (first) grid with the single block, and
 * remove the sibling grids. In the real import, sibling grids are then skipped
 * by the `!element.parentNode` guard in findBlocksOnPage.
 */
export default function parse(element, { document }) {
  const section = element.closest('section') || element.parentElement;
  const grids = [...section.querySelectorAll('.l-columns, .l-grid')]
    .filter((g) => !g.parentElement.closest('.l-columns, .l-grid'));

  const norm = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const cells = [];
  const seen = new Set();

  grids.forEach((grid) => {
    [...grid.querySelectorAll('.l-column-item')]
      .filter((tile) => !tile.parentElement.closest('.l-column-item'))
      .forEach((tile) => {
        const content = tile.querySelector('.page-content') || tile;
        const heading = content.querySelector('h1, h2, h3, h4, h5, h6');
        const paras = [...content.querySelectorAll(':scope > p')]
          .filter((p) => p.textContent.trim());

        // Skip empty padding tiles (no heading and no address text).
        if ((!heading || !heading.textContent.trim()) && !paras.length) return;

        const key = norm(tile.textContent);
        if (!key || seen.has(key)) return;
        seen.add(key);

        const cell = document.createElement('div');
        if (heading && heading.textContent.trim()) {
          const h3 = document.createElement('h3');
          h3.textContent = heading.textContent.trim();
          cell.appendChild(h3);
        }
        // Clone address paragraphs to preserve their <br> line breaks.
        paras.forEach((p) => cell.appendChild(p.cloneNode(true)));

        // `card` item model is [image, text]; emit an empty image cell first so
        // each field aligns to its own cell for JCR conversion (text-only).
        if (cell.childNodes.length) cells.push([document.createElement('div'), cell]);
      });
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Cards (cards-office)',
    cells,
  });

  element.replaceWith(block);
  grids.forEach((g) => {
    if (g !== element && g.parentNode) g.remove();
  });
}
