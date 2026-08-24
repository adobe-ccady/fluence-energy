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

  const wrapper = document.createElement('div');
  links.forEach((link) => {
    const text = link.textContent.trim();
    if (!text) return;
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    const target = link.getAttribute('target');
    if (target) a.setAttribute('target', target);
    a.textContent = text;
    p.appendChild(a);
    wrapper.appendChild(p);
  });

  if (!wrapper.childElementCount) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'ticker',
    cells: [[wrapper]],
  });
  element.replaceWith(block);
}
