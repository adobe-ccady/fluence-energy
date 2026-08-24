/* eslint-disable */
/* global WebImporter */

/**
 * Parser for stats (standalone block) — Mosaic page.
 * Base: stats. Source: https://fluenceenergy.com/mosaic-intelligent-bidding-software/
 * Selector: #main article > section:nth-of-type(3)
 *
 * Source: a centered <h2> heading (default content) + a .l-columns--3 grid of
 * three .l-column-item stat cells. Each stat cell holds an icon <img> (in a
 * <p>), a big value <h2 class="large-h2"> (e.g. "up to 10%", "up to 50%",
 * "900k+"), and a label <h4>. A footnote paragraph ("*based on Fluence
 * analysis…") lives in the NEXT section (section:nth-of-type(4)).
 *
 * blocks/stats/stats.js reads each row's first heading as the number and its
 * last paragraph as the label; a trailing row with no image/heading is the
 * footnote. We emit one row per stat (icon <p> + value heading + label <p>) and
 * a final footnote row.
 *
 * 🚨 The stat values here are literal text ("up to 10%", "up to 50%", "900k+")
 * with NO data-animate-number attribute on this page — we capture the literal
 * text verbatim. The centered <h2> is default content (page-templates.json), so
 * it is preserved OUTSIDE the block, above it.
 */
export default function parse(element, { document }) {
  const items = [...element.querySelectorAll('.l-column-item')];
  const cells = [];

  // Each stat item is one row with THREE cells matching the `stat` item model
  // fields (icon, number, label). One field → one cell so the JCR converter
  // maps them positionally (iconAlt collapses into the icon image).
  items.forEach((item) => {
    const wrap = item.querySelector('.page-content') || item;

    // Icon cell.
    const img = wrap.querySelector('img');
    const iconCell = document.createElement('p');
    if (img) iconCell.appendChild(img.cloneNode(true));

    // Number cell — the literal heading text (e.g. "up to 10%"). Keep verbatim.
    const value = wrap.querySelector('h1, h2, h3, h4, h5, h6');
    const numberCell = document.createElement('h3');
    if (value && value.textContent.trim()) numberCell.textContent = value.textContent.trim();

    // Label cell — the last heading after the value (h4 in source), or a
    // trailing text paragraph that does not merely wrap the icon image.
    const headings = [...wrap.querySelectorAll('h1, h2, h3, h4, h5, h6')];
    let labelEl = null;
    if (headings.length > 1) {
      labelEl = headings[headings.length - 1];
    } else {
      labelEl = [...wrap.querySelectorAll('p')].filter((p) => !p.querySelector('img')).pop() || null;
    }
    const labelCell = document.createElement('p');
    if (labelEl && labelEl !== value && labelEl.textContent.trim()) {
      labelCell.textContent = labelEl.textContent.trim();
    }

    if (img || numberCell.textContent || labelCell.textContent) {
      cells.push([iconCell, numberCell, labelCell]);
    }
  });

  // Footnote — the paragraph in the following section. Emitted as a standalone
  // paragraph AFTER the block (not as a stat item, which would break the item
  // model). Then remove that source section to avoid a duplicate.
  const next = element.nextElementSibling;
  const footnote = next && next.querySelector ? next.querySelector('p') : null;
  let footnoteEl = null;
  if (footnote && footnote.textContent.trim()) {
    footnoteEl = document.createElement('p');
    footnoteEl.textContent = footnote.textContent.trim();
    if (next && next.parentNode) next.remove();
  }

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'stats',
    cells,
  });

  // Preserve the centered section heading as default content ABOVE the block.
  const fragment = document.createDocumentFragment();
  const heading = [...element.querySelectorAll('.section-header h2, header h2, h2')]
    .find((h) => h.textContent.trim());
  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = heading.textContent.trim();
    fragment.appendChild(h2);
  }
  fragment.appendChild(block);
  // Footnote as default content BELOW the block.
  if (footnoteEl) fragment.appendChild(footnoteEl);
  element.replaceWith(fragment);
}
