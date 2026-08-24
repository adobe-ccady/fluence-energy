/* eslint-disable */
/* global WebImporter */

/**
 * Parser for announcements (new standalone block).
 * Base: announcements. Source: https://fluenceenergy.com/
 * Selector: #main > article.homepage > section.resource-block
 *
 * Structure (per blocks/announcements/announcements.js):
 *   Row 1 = featured lead: eyebrow <h4> + heading <h3> + paragraph <p> + CTA
 *           ("Read the Press Release", a.button).
 *   Rows 2..n = categorized items: each = category <h4> + linked title <h3>,
 *           with the whole item made clickable via its link.
 * Each row is a single cell holding the grouped content.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 1: featured lead (left region).
  const left = element.querySelector('.resource-block-left');
  if (left) {
    const cell = [];

    const eyebrow = left.querySelector('h4');
    if (eyebrow && eyebrow.textContent.trim()) {
      const h4 = document.createElement('h4');
      h4.textContent = eyebrow.textContent.trim();
      cell.push(h4);
    }

    const heading = left.querySelector('h3, h2');
    if (heading && heading.textContent.trim()) {
      const h3 = document.createElement('h3');
      h3.textContent = heading.textContent.trim();
      cell.push(h3);
    }

    const para = left.querySelector('p');
    if (para && para.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = para.textContent.trim();
      cell.push(p);
    }

    const cta = left.querySelector('a.button, a[href]');
    if (cta) {
      const a = document.createElement('a');
      a.className = 'button';
      a.href = cta.getAttribute('href');
      const target = cta.getAttribute('target');
      if (target) a.setAttribute('target', target);
      a.textContent = cta.textContent.trim();
      const p = document.createElement('p');
      p.appendChild(a);
      cell.push(p);
    }

    if (cell.length) cells.push([cell]);
  }

  // Rows 2..n: categorized resource items (right region).
  const items = [...element.querySelectorAll('.resource-block-right .post-item')];
  items.forEach((item) => {
    const link = item.querySelector('a[href]');
    const href = link ? link.getAttribute('href') : null;
    const target = link ? link.getAttribute('target') : null;
    const cell = [];

    const category = item.querySelector('h4');
    if (category && category.textContent.trim()) {
      const h4 = document.createElement('h4');
      h4.textContent = category.textContent.trim();
      cell.push(h4);
    }

    const title = item.querySelector('h3, h2');
    if (title && title.textContent.trim()) {
      const h3 = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        if (target) a.setAttribute('target', target);
        a.textContent = title.textContent.trim();
        h3.appendChild(a);
      } else {
        h3.textContent = title.textContent.trim();
      }
      cell.push(h3);
    }

    if (cell.length) cells.push([cell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'announcements',
    cells,
  });
  element.replaceWith(block);
}
