/* eslint-disable */
/* global WebImporter */

/**
 * Parser for logos (new standalone block).
 * Base: logos. Source: https://fluenceenergy.com/
 * Selector: #main > article.homepage > section.customer-block
 *
 * Structure: one row per logo, each cell holding a single logo <img>.
 * blocks/logos/logos.js collects every <img> in the block into a grayscale
 * grid, so a one-image-per-row table is the simplest faithful shape.
 * One logo (MW-Storage) is wrapped in an <a href="https://mwstorage.ch/"> —
 * that link is preserved. The "Our Customers Include" <h2> is default content
 * (see page-templates.json) handled outside the block.
 */
export default function parse(element, { document }) {
  const items = [...element.querySelectorAll('.l-grid-item')];
  const cells = [];

  items.forEach((item) => {
    const img = item.querySelector('img');
    if (!img) return;
    const link = item.querySelector('a[href]');
    if (link) {
      // Preserve the wrapping link around the logo image.
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      const target = link.getAttribute('target');
      if (target) a.setAttribute('target', target);
      a.appendChild(img.cloneNode(true));
      cells.push([[a]]);
    } else {
      cells.push([[img.cloneNode(true)]]);
    }
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'logos',
    cells,
  });

  // Preserve the section heading ("Our Customers Include") as default content
  // ABOVE the block so it survives the import (page-templates.json defaultContent).
  const fragment = document.createDocumentFragment();
  const sectionHeading = element.querySelector('h1, h2');
  if (sectionHeading) fragment.appendChild(sectionHeading.cloneNode(true));
  fragment.appendChild(block);
  element.replaceWith(fragment);
}
