/* eslint-disable */
/* global WebImporter */

/**
 * Parser for ticker (standalone block) — Mosaic page.
 * Base: ticker. Source: https://fluenceenergy.com/mosaic-intelligent-bidding-software/
 * Selector: #main > .banner-nav-animation-wrap nav.navigation--banner
 *
 * Source: a <nav class="navigation--banner"> with a <ul> of 5 market links
 * (CAISO / ERCOT / MISO / JAPAN / NEM). blocks/ticker/ticker.js reads the <p>
 * tags inside the first cell (:scope > div > div) and renders them as scrolling
 * items. We emit one <p> per link inside a single 1-column cell, preserving each
 * href so the market links survive the import.
 */
export default function parse(element, { document }) {
  const links = [...element.querySelectorAll('ul li a, a[href]')];

  // Emit one row per market link so each maps to a repeating `ticker-item`
  // (container + item table pattern). Each row is a single cell holding the
  // link; the block's runtime JS reads the anchors from these rows.
  const rows = [];
  links.forEach((link) => {
    const text = link.textContent.trim();
    if (!text) return;
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    const target = link.getAttribute('target');
    if (target) a.setAttribute('target', target);
    a.textContent = text;
    rows.push([a]);
  });

  if (!rows.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'ticker',
    cells: rows,
  });
  element.replaceWith(block);
}
