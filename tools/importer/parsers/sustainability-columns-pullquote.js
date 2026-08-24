/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns (columns-pullquote) — Sustainability (ESG) page.
 * Base: columns. Source: https://fluenceenergy.com/sustainability/
 * Selector: #main > article > section:nth-of-type(3) .l-columns--2
 *
 * Source: a two-column .l-columns--2 grid. First .l-column-item is a portrait
 * PHOTO of the CEO (a lone .page-content > p > img). Second .l-column-item is
 * the pull-quote: an <h3> that begins the quote, a <p> continuing the quote (both
 * wrapped in HubSpot/Word tracked-change <span>s), and a final <p> with the
 * attribution (<strong>Julian Nebreda</strong><br>President & CEO, Fluence).
 *
 * blocks/columns/columns.css .columns.columns-pullquote styles the FIRST column
 * (`> div > div:first-child`) normally and the LAST column
 * (`> div > div:last-child`) as the dark quote box: its <p> renders as the italic
 * quote and <em> as the muted attribution. We emit a 2-cell row:
 *   cell 1 = the CEO photo, cell 2 = the quote paragraphs + attribution <em>.
 * The Word/tracked-change span cruft is flattened to plain text; the decorative
 * markup is not portable content.
 */

const normalizeWs = (t) => (t || '').replace(/\s+/g, ' ').trim();

export default function parse(element, { document }) {
  const items = [...element.children].filter((c) => c.classList.contains('l-column-item'));
  const src = items.length ? items : [...element.children];

  const imageCell = [];
  const quoteCell = [];

  src.forEach((col) => {
    const wrap = col.querySelector('.page-content') || col;
    const kids = [...wrap.children];
    const loneImg = kids.length === 1 && kids[0].querySelector && kids[0].querySelector('img');
    const img = wrap.querySelector('img');

    if (loneImg && img) {
      const p = document.createElement('p');
      p.appendChild(img.cloneNode(true));
      imageCell.push(p);
      return;
    }

    // Text/quote column. Quote paragraphs (h3 + plain <p>) render italic; the
    // attribution paragraph (contains <strong>) becomes a muted <em> line.
    kids.forEach((child) => {
      const tag = child.tagName.toLowerCase();
      const text = normalizeWs(child.textContent);
      if (!text) return;
      const isAttribution = tag === 'p' && child.querySelector('strong');
      if (isAttribution) {
        // Flatten "<strong>Name</strong><br>Role, Company" → "Name, Role, Company".
        const parts = text.split('\n').map((s) => s.trim()).filter(Boolean);
        const attribution = parts.length > 1 ? parts.join(', ') : text;
        const p = document.createElement('p');
        const em = document.createElement('em');
        em.textContent = attribution;
        p.appendChild(em);
        quoteCell.push(p);
      } else if (/^h[1-6]$/.test(tag) || tag === 'p') {
        const p = document.createElement('p');
        p.textContent = text;
        quoteCell.push(p);
      }
    });
  });

  const row = [imageCell, quoteCell].filter((c) => c.length);
  if (!row.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Columns',
    variants: ['columns-pullquote'],
    cells: [row],
  });
  element.replaceWith(block);
}
