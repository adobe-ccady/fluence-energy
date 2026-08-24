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

  // The `announcement-item` model is [eyebrow, heading, text, link, linkText];
  // linkText collapses into link. Emit one cell per field (eyebrow | heading |
  // text | link) so each aligns to a column for JCR conversion. The runtime
  // treats the first row as the featured lead and the rest as list items.

  // Row 1: featured lead (left region).
  const left = element.querySelector('.resource-block-left');
  if (left) {
    const eyebrow = left.querySelector('h4');
    const eyebrowCell = document.createElement('div');
    if (eyebrow && eyebrow.textContent.trim()) {
      const h4 = document.createElement('h4');
      h4.textContent = eyebrow.textContent.trim();
      eyebrowCell.appendChild(h4);
    }

    const heading = left.querySelector('h3, h2');
    const headingCell = document.createElement('div');
    if (heading && heading.textContent.trim()) {
      const h3 = document.createElement('h3');
      h3.textContent = heading.textContent.trim();
      headingCell.appendChild(h3);
    }

    const para = left.querySelector('p');
    const textCell = document.createElement('div');
    if (para && para.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = para.textContent.trim();
      textCell.appendChild(p);
    }

    const cta = left.querySelector('a.button, a[href]');
    const linkCell = document.createElement('div');
    if (cta) {
      const a = document.createElement('a');
      a.href = cta.getAttribute('href');
      const target = cta.getAttribute('target');
      if (target) a.setAttribute('target', target);
      a.textContent = cta.textContent.trim();
      const p = document.createElement('p');
      p.appendChild(a);
      linkCell.appendChild(p);
    }

    cells.push([eyebrowCell, headingCell, textCell, linkCell]);
  }

  // Rows 2..n: categorized resource items (right region). One cell per field:
  // eyebrow | heading | text (empty) | link. The heading text also becomes the
  // link label so the item title is clickable (linkText collapses into link).
  const items = [...element.querySelectorAll('.resource-block-right .post-item')];
  items.forEach((item) => {
    const link = item.querySelector('a[href]');
    const href = link ? link.getAttribute('href') : null;
    const target = link ? link.getAttribute('target') : null;

    const category = item.querySelector('h4');
    const eyebrowCell = document.createElement('div');
    if (category && category.textContent.trim()) {
      const h4 = document.createElement('h4');
      h4.textContent = category.textContent.trim();
      eyebrowCell.appendChild(h4);
    }

    const title = item.querySelector('h3, h2');
    const titleText = title && title.textContent.trim() ? title.textContent.trim() : '';

    // For a resource item the title IS the link. Model it as the collapsing
    // link pair (link href + linkText label) — the same structure the featured
    // CTA uses, which round-trips cleanly through md->JCR. The `heading` and
    // `text` cells stay EMPTY so the title is not duplicated (a linked <h3> in
    // the text-type `heading` field would capture the href instead of the
    // title). The runtime styles this link as the item title.
    const headingCell = document.createElement('div');
    const textCell = document.createElement('div');

    const linkCell = document.createElement('div');
    if (href && titleText) {
      const a = document.createElement('a');
      a.href = href;
      if (target) a.setAttribute('target', target);
      a.textContent = titleText;
      linkCell.appendChild(a);
    } else if (titleText) {
      // No href — fall back to a plain heading so the title still shows.
      const h3 = document.createElement('h3');
      h3.textContent = titleText;
      headingCell.appendChild(h3);
    }

    if (titleText || eyebrowCell.childNodes.length) {
      cells.push([eyebrowCell, headingCell, textCell, linkCell]);
    }
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
