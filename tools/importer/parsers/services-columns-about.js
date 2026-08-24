/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns (columns-about) — Services page.
 * Base: columns. Source: https://fluenceenergy.com/energy-storage-services/
 * Selector: #main > article > section:nth-of-type(N) .l-columns--2
 *   (N = 3 Smart Service, 5 Complete, 6 Shared, 7 Guided, 9 Fluence Academy)
 *
 * Each grid has two .l-column-item children: one TEXT column (heading(s) +
 * paragraphs, some paragraphs carry inline "Learn More" / "Smartstack" CTA
 * links) and one IMAGE column (a .page-content > p > img photo, occasionally an
 * empty <p> placeholder with no real image).
 *
 * blocks/columns/columns.js auto-classifies a single-image cell (a lone
 * <p><img></p>, col.children.length === 1) as .columns-img-col and the other as
 * .columns-text-col — so we do NOT decide roles here, we only preserve the
 * SOURCE COLUMN ORDER (image-left vs image-right alternation: sec 3/5/7/9 have
 * the image on the right, sec 6 on the left). One row, two cells.
 *
 * The section heading cluster that sits ABOVE the grid (e.g. sec 3's H2
 * "Fluence Service Solutions" + H3 "Smart Service Plans" + H4 "For Smartstack")
 * lives OUTSIDE this grid element, so it survives automatically as default
 * content — we only replace the grid, never re-emit those headings. Headings
 * that live INSIDE a text column (sec 5/6/7's H2) stay inside that cell.
 */
export default function parse(element, { document }) {
  const columns = [...element.children].filter((c) => c.classList.contains('l-column-item'));
  const src = columns.length ? columns : [...element.children];

  const buildCell = (col) => {
    const wrap = col.querySelector('.page-content') || col;
    const img = wrap.querySelector('img');
    // Image column → a single <p><img></p> so columns.js flags it as img-col.
    if (img) {
      const p = document.createElement('p');
      p.appendChild(img.cloneNode(true));
      return [p];
    }
    // Text column → preserve block-level content (headings, paragraphs with
    // their inline links, lists) in source order; drop empty placeholders.
    const parts = [];
    [...wrap.children].forEach((child) => {
      const tag = child.tagName.toLowerCase();
      if (/^h[1-6]$/.test(tag)) {
        if (child.textContent.trim()) parts.push(child.cloneNode(true));
      } else if (tag === 'p') {
        if (child.textContent.trim() || child.querySelector('a, img')) {
          parts.push(child.cloneNode(true));
        }
      } else if (tag === 'ul' || tag === 'ol') {
        if (child.querySelector('li')) parts.push(child.cloneNode(true));
      }
    });
    return parts;
  };

  const row = src.map((col) => buildCell(col));

  // Guard: nothing meaningful extracted → unwrap in place.
  if (!row.some((cell) => cell.length)) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Columns (columns-about)',
    cells: [row],
  });
  element.replaceWith(block);
}
