/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards (cards-icon) — Sustainability (ESG) page.
 * Base: cards. Source: https://fluenceenergy.com/sustainability/
 * Selector (union, matches BOTH grids in the section):
 *   #main > article > section:nth-of-type(6) .l-columns--3,
 *   #main > article > section:nth-of-type(6) .l-columns--4
 *
 * Section 6 is the "Alignment with the UN Sustainable Development Goals" band.
 * The SDG tiles are split across TWO sibling grids — a .l-columns--4 (4 tiles)
 * and a .l-columns--3 (3 tiles) — for 7 tiles total. Each tile is a
 * .l-column-item whose .page-content holds an SDG icon image (inside a <p>, or
 * inside an <h4> for the first tile) plus an <h4> label.
 *
 * Because the union selector matches BOTH grids, this parser is invoked once per
 * grid. To avoid emitting the block twice, the FIRST invocation collects every
 * tile across BOTH grids in the section (deduped by normalized label), emits a
 * single "Cards (cards-icon)" block in place of this grid, and removes the
 * sibling grid. A later invocation on the already-consumed sibling is a no-op.
 *
 * blocks/cards/cards.js (cards-icon branch) reads each row: the lone-image cell →
 * .cards-card-image (small centered icon), the other → .cards-card-body (label
 * heading). No tag-pill, no card-wide link wrapper for cards-icon. We emit one
 * row per tile: cell 1 = the icon image, cell 2 = the H4 label.
 *
 * The section <h2> + intro paragraph sit ABOVE the grids (outside the matched
 * element) and are preserved automatically as default content — never re-emitted.
 */

const normalizeWs = (t) => (t || '').replace(/\s+/g, ' ').trim();

export default function parse(element, { document }) {
  // The union selector matches both grids, so this parser is invoked twice. If
  // the sibling grid was already removed by the first invocation, or its section
  // is already marked done, this is a no-op.
  if (typeof element.isConnected === 'boolean' && !element.isConnected) return;

  const section = element.closest('section');

  // If this grid was already consumed by a prior invocation, drop it silently.
  if (section && section.getAttribute('data-cards-icon-done') === 'true') {
    element.remove();
    return;
  }

  // Collect all icon grids in the section, in document order.
  const grids = section
    ? [...section.querySelectorAll('.l-columns--4, .l-columns--3')]
    : [element];

  const cells = [];
  const seen = new Set();

  grids.forEach((grid) => {
    const items = [...grid.children].filter((c) => c.classList.contains('l-column-item'));
    const tiles = items.length ? items : [...grid.children];
    tiles.forEach((tile) => {
      const wrap = tile.querySelector('.page-content') || tile;
      const img = wrap.querySelector('img');
      // Label = the H4 that is NOT the image wrapper (source: <h4>Label</h4>).
      let label = '';
      [...wrap.querySelectorAll('h1, h2, h3, h4, h5, h6')].forEach((h) => {
        const t = normalizeWs(h.textContent);
        if (t && !label) label = t;
      });
      if (!img && !label) return;

      const key = label.toLowerCase();
      if (key && seen.has(key)) return;
      if (key) seen.add(key);

      const iconCell = document.createElement('div');
      if (img) {
        const p = document.createElement('p');
        p.appendChild(img.cloneNode(true));
        iconCell.appendChild(p);
      }

      const labelCell = document.createElement('div');
      if (label) {
        const h = document.createElement('h4');
        h.textContent = label;
        labelCell.appendChild(h);
      }

      cells.push([iconCell, labelCell]);
    });
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Mark the section done and remove the OTHER grids so the block is emitted once.
  if (section) {
    section.setAttribute('data-cards-icon-done', 'true');
    grids.forEach((grid) => {
      if (grid !== element) grid.remove();
    });
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Cards (cards-icon)',
    cells,
  });
  element.replaceWith(block);
}
