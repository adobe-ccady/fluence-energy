/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards (cards-inquiry) — Contact page, section 1 "Connect with Fluence".
 * Base: cards. Source: https://fluenceenergy.com/contact/
 * Selector: #main > article > section:nth-of-type(1) .l-columns
 *           (also .l-grid as a fallback in page-templates instances[])
 *
 * Source: the "Connect with Fluence" section holds a set of inquiry tiles laid
 * out across MULTIPLE .l-columns--3 grids (a 3-up row + a second row). Each tile
 * is a .l-column-item wrapping a .page-content with:
 *   - an <h3> title (e.g. "Sales Inquiries")
 *   - a <p> blurb
 *   - a <p><a class="grad-button" href=…> gradient CTA (outbound to
 *     info.fluenceenergy.com and other targets)
 * One trailing .l-column-item is empty (grid padding) and must be skipped.
 *
 * blocks/cards/cards.js cards-inquiry branch reads each row's single body cell:
 * it promotes the last-paragraph link (:scope > p:last-child > a) to a gradient
 * pill (.cards-grad-cta), keeps no tag-pill, and does NOT wrap the card in a
 * card-wide link. So we emit ONE 1-column row per tile whose cell holds
 * [ h3 title, p description, p>a CTA ].
 *
 * The section <h2> "Connect with Fluence" is a sibling within the SAME section
 * and is preserved automatically — we only replace the grid(s), so we do NOT
 * re-emit the heading (that would duplicate it).
 *
 * Because the tiles span more than one grid in the section, we collect tiles
 * from the whole section (dedup by normalized text so any hidden mobile
 * duplicate grid does not double them), replace this (first) grid with the
 * single block, and remove the sibling grids. In the real import, the second
 * grid is then skipped by the `!element.parentNode` guard in findBlocksOnPage.
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
        // Description: the first non-CTA paragraph (a <p> without a link).
        const paras = [...content.querySelectorAll(':scope > p')];
        const descP = paras.find((p) => !p.querySelector('a[href]'));
        const cta = content.querySelector('a.grad-button[href], a[href]');

        // Skip empty padding tiles (no heading and no CTA).
        if ((!heading || !heading.textContent.trim()) && !cta) return;

        const key = norm(tile.textContent);
        if (!key || seen.has(key)) return;
        seen.add(key);

        const cell = document.createElement('div');
        if (heading && heading.textContent.trim()) {
          const h3 = document.createElement('h3');
          h3.textContent = heading.textContent.trim();
          cell.appendChild(h3);
        }
        if (descP && descP.textContent.trim()) {
          const p = document.createElement('p');
          p.textContent = descP.textContent.trim();
          cell.appendChild(p);
        }
        if (cta) {
          const p = document.createElement('p');
          const a = document.createElement('a');
          a.href = cta.getAttribute('href');
          const target = cta.getAttribute('target');
          if (target) a.setAttribute('target', target);
          // Label lives in a nested <span> in the source; fall back to text.
          a.textContent = norm(cta.textContent) || cta.getAttribute('href');
          p.appendChild(a);
          cell.appendChild(p);
        }

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
    name: 'Cards (cards-inquiry)',
    cells,
  });

  // Replace this grid with the block, then remove the sibling grids so their
  // tiles are not re-emitted (real import skips them via the !parentNode guard).
  element.replaceWith(block);
  grids.forEach((g) => {
    if (g !== element && g.parentNode) g.remove();
  });
}
