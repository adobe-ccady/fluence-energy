/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards (cards-feature) — Mosaic page.
 * Base: cards. Source: https://fluenceenergy.com/mosaic-intelligent-bidding-software/
 * Selector: #main article > section:nth-of-type(9) .l-columns--3
 *   (the "Power Tools for Your Trading Desk" section)
 *
 * Source: two .l-columns--3 grids, six .l-column-item cells total. Each cell is
 * text-only: an uppercase <h4> title + a descriptive <p> (some titles/paragraphs
 * are wrapped in nested ._1Z_nJ divs). No images.
 *
 * blocks/cards/cards.js (non-product) reads each row's cells into a <li>; a cell
 * with a single image becomes .cards-card-image, otherwise .cards-card-body
 * (heading + paragraph). cards-feature is text-only, so we emit one 1-column row
 * per card holding the heading + paragraph.
 *
 * The section heading <h2> ("Power Tools…") and <h3> subhead live in the
 * PRECEDING section and are preserved as default content before the block,
 * each emitted exactly once.
 *
 * Invoked ONCE per section (import-mosaic.js passes the <section>). Both grids
 * are UNIQUE features here (two rows of three), but we still deduplicate by
 * normalized cell text as a guard against any hidden mobile-duplicate grid so
 * cards are never doubled.
 */
const normalize = (text) => (text || '').trim().replace(/\s+/g, ' ').toLowerCase();

export default function parse(element, { document }) {
  const section = element.closest('section') || element;
  const items = [...section.querySelectorAll('.l-column-item')]
    .filter((item) => item.querySelector('h4, h3, p'));

  const cells = [];
  const seen = new Set();
  items.forEach((item) => {
    const wrap = item.querySelector('.page-content') || item;
    const row = document.createElement('div');

    let titleText = '';
    const heading = wrap.querySelector('h3, h4, h5');
    if (heading && heading.textContent.trim()) {
      titleText = heading.textContent.trim();
      const h3 = document.createElement('h3');
      h3.textContent = titleText;
      row.appendChild(h3);
    }

    let descText = '';
    const desc = wrap.querySelector('p');
    if (desc && desc.textContent.trim()) {
      descText = desc.textContent.trim();
      const p = document.createElement('p');
      p.textContent = descText;
      row.appendChild(p);
    }

    if (!row.childElementCount) return;

    // Deduplicate by normalized text so a hidden mobile-duplicate grid can't
    // double the cards.
    const key = normalize(`${titleText} ${descText}`);
    if (seen.has(key)) return;
    seen.add(key);
    // The `card` item model is [image, text]. cards-feature is text-only, so
    // emit an empty image cell first, then the heading+body text cell, so each
    // model field aligns to its own cell for JCR conversion.
    const imageCell = document.createElement('div');
    cells.push([imageCell, row]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Cards',
    variants: ['cards-feature'],
    cells,
  });

  // This parser collects cards across ALL grids in the section. The import
  // registry may also match the section's OTHER .l-columns--3 grid(s) and invoke
  // the parser again. Remove the sibling grids now so those later matches are
  // detached (skipped by the import script's parentNode guard) — prevents a
  // stray duplicate 3-card block.
  section.querySelectorAll('.l-columns--3').forEach((grid) => {
    if (grid !== element && grid.parentNode) grid.remove();
  });

  // Preserve the section heading + subhead (preceding section) as default content.
  const fragment = document.createDocumentFragment();
  const prevSection = section.previousElementSibling;
  if (prevSection && prevSection.querySelector) {
    const h2 = prevSection.querySelector('h2');
    if (h2 && h2.textContent.trim()) {
      const nh2 = document.createElement('h2');
      nh2.textContent = h2.textContent.trim();
      fragment.appendChild(nh2);
    }
    const h3 = prevSection.querySelector('h3');
    if (h3 && h3.textContent.trim()) {
      const nh3 = document.createElement('h3');
      nh3.textContent = h3.textContent.trim();
      fragment.appendChild(nh3);
    }
  }
  fragment.appendChild(block);
  element.replaceWith(fragment);
}
