/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns (columns-about) — Sustainability (ESG) page.
 * Base: columns. Source: https://fluenceenergy.com/sustainability/
 * Selector: #main > article > section:nth-of-type(18) .l-columns--3
 *
 * Section 18 is the "Letters and Policies" directory. The matched .l-columns--3
 * grid has three .l-column-item columns, each a category: an <h4> heading
 * ("Responsible Sourcing", "Environment", "ESG Disclosure Framework Alignment")
 * followed by a <ul> of document links. Most links point at HubSpot hubfs PDFs
 * (some with #page anchors) and external sites (cdp.net, ecovadis.com); a few are
 * internal fluenceenergy.com pages. All hrefs (and target) are preserved.
 *
 * blocks/columns/columns.js renders each cell as a column (none is a lone image,
 * so all become .columns-text-col). We emit one row with three cells, each cell
 * = the category H4 + its link list, in source order.
 *
 * The section <h2> "Letters and Policies" sits ABOVE the grid (outside the
 * matched element) and is preserved automatically as default content.
 */

const normalizeWs = (t) => (t || '').replace(/\s+/g, ' ').trim();

export default function parse(element, { document }) {
  const items = [...element.children].filter((c) => c.classList.contains('l-column-item'));
  const src = items.length ? items : [...element.children];

  const buildCell = (col) => {
    const wrap = col.querySelector('.page-content') || col;
    const parts = [];
    [...wrap.children].forEach((child) => {
      const tag = child.tagName.toLowerCase();
      if (/^h[1-6]$/.test(tag)) {
        const t = normalizeWs(child.textContent);
        if (t) {
          const h = document.createElement(tag);
          h.textContent = t;
          parts.push(h);
        }
      } else if (tag === 'ul' || tag === 'ol') {
        // Rebuild the list with clean anchors (href + target preserved).
        const list = document.createElement(tag);
        [...child.querySelectorAll(':scope > li')].forEach((li) => {
          const a = li.querySelector('a[href]');
          const label = normalizeWs(li.textContent);
          if (!label) return;
          const newLi = document.createElement('li');
          if (a && a.getAttribute('href')) {
            const na = document.createElement('a');
            na.href = a.getAttribute('href');
            const target = a.getAttribute('target');
            if (target) na.setAttribute('target', target);
            na.textContent = label;
            newLi.appendChild(na);
          } else {
            newLi.textContent = label;
          }
          list.appendChild(newLi);
        });
        if (list.children.length) parts.push(list);
      } else if (tag === 'p') {
        if (normalizeWs(child.textContent) || child.querySelector('a[href]')) {
          parts.push(child.cloneNode(true));
        }
      }
    });
    return parts;
  };

  const row = src.map((col) => buildCell(col));

  if (!row.some((cell) => cell.length)) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Columns',
    variants: ['columns-about'],
    cells: [row],
  });
  element.replaceWith(block);
}
