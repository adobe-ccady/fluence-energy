/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns (columns-promo) — Services page.
 * Base: columns. Source: https://fluenceenergy.com/energy-storage-services/
 * Selectors:
 *   #main > article > section:nth-of-type(4) .l-columns--3  (Service Plans, 3-up)
 *   #main > article > section:nth-of-type(8) .l-columns--4  (Delivery Services, 4-up)
 *
 * Section 4 tiles: each .l-column-item has an icon (an <img> inside an <h5><a>),
 * a title <h3><a href="#section-N"> and a descriptive <p>. The <a> hrefs are
 * in-page anchors (#section-6/#section-5/#section-4) that must be preserved.
 * Section 8 tiles: text-only — a title <h3> and a descriptive <p>, no icon/link.
 *
 * columns.js lays out one row of N equal cells. We emit one row, one cell per
 * tile: icon (if any) as <p><img>, then the title <h3> (linked when the source
 * title is a link), then the paragraph(s). Tiles are collected across every
 * grid in the section and DEDUPLICATED by normalized title+description text, so
 * a hidden mobile-duplicate grid never doubles the columns.
 *
 * The section heading/intro ABOVE the grid (sec 4: H3 "Service Plans" + H4;
 * sec 8: H2 "Delivery Services") lives OUTSIDE this grid element and is
 * preserved as default content automatically — we only replace the grid.
 */
const normalize = (text) => (text || '').trim().replace(/\s+/g, ' ').toLowerCase();

export default function parse(element, { document }) {
  const section = element.closest('section') || element;

  // Collect promo tiles from every grid in the section (handles a hidden
  // mobile-duplicate grid), then dedupe by text.
  const items = [...section.querySelectorAll('.l-columns--3 .l-column-item, .l-columns--4 .l-column-item')];
  const source = items.length ? items : [...element.children];

  const cells = [];
  const seen = new Set();

  source.forEach((item) => {
    const wrap = item.querySelector('.page-content') || item;
    const cell = [];

    // Icon (optional) — an image, typically inside an <h5><a>.
    const icon = wrap.querySelector('img');
    if (icon) {
      const p = document.createElement('p');
      p.appendChild(icon.cloneNode(true));
      cell.push(p);
    }

    // Title — an <h3> that may wrap an in-page anchor link (#section-N).
    const title = wrap.querySelector('h3, h4');
    let titleText = '';
    if (title && title.textContent.trim()) {
      titleText = title.textContent.trim();
      const h3 = document.createElement('h3');
      const titleLink = title.querySelector('a[href]');
      if (titleLink) {
        const a = document.createElement('a');
        a.href = titleLink.getAttribute('href');
        const target = titleLink.getAttribute('target');
        if (target) a.setAttribute('target', target);
        a.textContent = titleText;
        h3.appendChild(a);
      } else {
        h3.textContent = titleText;
      }
      cell.push(h3);
    }

    // Description paragraph(s).
    let descText = '';
    [...wrap.querySelectorAll(':scope > p')].forEach((p) => {
      if (p.textContent.trim() || p.querySelector('a')) {
        descText += ` ${p.textContent.trim()}`;
        cell.push(p.cloneNode(true));
      }
    });

    // Dedupe by normalized title + description (drops mobile-duplicate grid).
    const key = normalize(`${titleText}${descText}`);
    if (!key || seen.has(key) || !cell.length) return;
    seen.add(key);
    cells.push(cell);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Columns (columns-promo)',
    cells: [cells],
  });
  element.replaceWith(block);
}
