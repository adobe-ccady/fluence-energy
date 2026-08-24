/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards (cards-feature) — Nispera APM page.
 * Base: cards. Source: https://fluenceenergy.com/nispera-energy-asset-performance-management-software/
 * Selector: #main > article > section:nth-of-type(2) .l-columns--4
 *   (the "One APM for all of your clean energy assets" section)
 *
 * Source: a .l-columns--4 grid of four .l-column-item tiles — each is an icon
 * <img> (inside a <p>) + an <h4> title (Energy Storage / Wind / Solar / Hydro).
 * The Energy Storage tile also carries a "Predictive maintenance for storage"
 * link (inside <strong> in a small <p>).
 *
 * blocks/cards/cards.js (non-product) reads each row's cells into a <li>; a cell
 * whose only content is an image becomes .cards-card-image, otherwise
 * .cards-card-body. cards-feature CSS HIDES the image cell (text-only tiles), so
 * we emit ONE 1-column row per tile holding the heading (+ optional CTA link).
 * The decorative icon image is dropped since cards-feature hides images anyway.
 *
 * The section header cluster (H2 "One APM…" + H3 subhead + intro paragraph)
 * lives OUTSIDE the .l-columns--4 grid, so it survives automatically as default
 * content — we only replace the grid and never re-emit those headings.
 *
 * Tiles are deduplicated by normalized text as a guard against a hidden
 * mobile-duplicate grid so cards are never doubled.
 */
const normalize = (text) => (text || '').trim().replace(/\s+/g, ' ').toLowerCase();

export default function parse(element, { document }) {
  const section = element.closest('section') || element;
  const items = [...section.querySelectorAll('.l-column-item')]
    .filter((item) => item.querySelector('h3, h4, h5'));

  const cells = [];
  const seen = new Set();

  items.forEach((item) => {
    const wrap = item.querySelector('.page-content') || item;
    const body = document.createElement('div');

    let titleText = '';
    const heading = wrap.querySelector('h3, h4, h5');
    if (heading && heading.textContent.trim()) {
      titleText = heading.textContent.trim();
      const h3 = document.createElement('h3');
      h3.textContent = titleText;
      body.appendChild(h3);
    }

    // Optional CTA / descriptive link (e.g. "Predictive maintenance for storage").
    let linkText = '';
    const link = wrap.querySelector('a[href]');
    if (link && link.textContent.trim()) {
      linkText = link.textContent.trim();
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      const target = link.getAttribute('target');
      if (target) a.setAttribute('target', target);
      a.textContent = linkText;
      p.appendChild(a);
      body.appendChild(p);
    }

    if (!body.childElementCount) return;

    const key = normalize(`${titleText} ${linkText}`);
    if (seen.has(key)) return;
    seen.add(key);
    // `card` item model is [image, text]; emit an empty image cell first so
    // each field aligns to its own cell for JCR conversion (text-only feature).
    cells.push([document.createElement('div'), body]);
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

  // Section heading/subhead/intro are siblings in the SAME section and are
  // preserved automatically — only the grid is replaced. Do NOT re-emit them.
  element.replaceWith(block);
}
