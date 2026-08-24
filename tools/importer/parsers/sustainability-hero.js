/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the Sustainability hero (base `hero` block).
 * Source: `#main > header.banner` — the background image is an inline
 * `style="background-image:url(...)"` (no <img> element), plus a `.banner-title`
 * (p.h4 eyebrow + h1 with <br> line breaks) and a `.banner-sub-title` h3 support
 * line. Emits a 1-column, 2-row Hero table: [ bg image ] then [ eyebrow + h1 + sub ].
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 0: background image extracted from the inline background-image style.
  const style = element.getAttribute('style') || '';
  const m = style.match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
  if (m && m[1]) {
    const img = document.createElement('img');
    img.src = m[1];
    img.setAttribute('alt', '');
    cells.push([img]);
  } else {
    cells.push(['']);
  }

  // Row 1: content cell — eyebrow (p.h4) + h1 (preserve <br>) + optional sub (h3).
  const contentCell = [];
  const eyebrow = element.querySelector('.banner-title p, p.h4, .banner-title .h4');
  if (eyebrow && eyebrow.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = eyebrow.textContent.trim();
    contentCell.push(p);
  }
  const heading = element.querySelector('.banner-title h1, h1');
  if (heading) {
    const h1 = document.createElement('h1');
    h1.innerHTML = heading.innerHTML; // keep <br> line breaks
    contentCell.push(h1);
  }
  const sub = element.querySelector('.banner-sub-title h3, .banner-sub-title');
  if (sub && sub.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = sub.textContent.trim();
    contentCell.push(p);
  }
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'Hero', cells });
  element.replaceWith(block);
}
