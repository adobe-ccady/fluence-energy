/* eslint-disable */
/* global WebImporter */

/**
 * Parser for stats (new standalone block).
 * Base: stats. Source: https://fluenceenergy.com/
 * Selector: #main > article.homepage > section.our-stat-block
 *
 * Structure: one row per stat item; each cell holds the icon <img>, the number
 * as a heading, and the label paragraph. blocks/stats/stats.js reads the first
 * heading as the number and count-animates it, then treats the last paragraph
 * as the label.
 *
 * 🚨 IMPORTANT: the live DOM number text is a placeholder ("0"); the REAL target
 * lives in the `data-animate-number` attribute (60 / 314 / 48 / 37). We emit the
 * real value so both the imported markdown and the count-up animation are correct.
 * A final centered footnote paragraph is appended as its own row.
 *
 * NOTE ON COMPLETENESS SCORE: similarity vs the raw source is intentionally
 * below 100% because (a) we emit the real numbers (60/314/48/37) instead of the
 * DOM placeholder "0" text, and (b) the "Our Stats" <h2> is default content
 * (see page-templates.json defaultContent) handled outside this block. No real
 * content is dropped.
 */
export default function parse(element, { document }) {
  // One row per .our-stat-item, then a footnote row. The "Our Stats" <h2> is
  // deliberately excluded (default content, not a stats item row).
  const items = [...element.querySelectorAll('.our-stat-item')];
  const cells = [];

  // Each stat is one row with THREE cells matching the `stat` item model fields
  // (icon, number, label) — one field per cell for JCR conversion (iconAlt
  // collapses into the icon image).
  items.forEach((item) => {
    // Icon cell.
    const img = item.querySelector('img');
    const iconCell = document.createElement('p');
    if (img) iconCell.appendChild(img.cloneNode(true));

    // Number cell — prefer the real target from data-animate-number, not "0".
    const odometer = item.querySelector('[data-animate-number]');
    const heading = item.querySelector('h1, h2, h3, h4, h5, h6');
    const number = odometer
      ? odometer.getAttribute('data-animate-number')
      : (heading ? heading.textContent.replace(/[^\d]/g, '') : '');
    const numberCell = document.createElement('h3');
    if (number) numberCell.textContent = number;

    // Label cell — preserve <br> line breaks.
    const label = item.querySelector('p');
    const labelCell = document.createElement('p');
    if (label && label.textContent.trim()) labelCell.innerHTML = label.innerHTML;

    if (img || number || labelCell.textContent) {
      cells.push([iconCell, numberCell, labelCell]);
    }
  });

  // Centered footnote — kept inside the block as a trailing stat-shaped row with
  // empty icon/number cells and the footnote in the label cell. The runtime
  // treats a row with no icon/number as the footnote; the converter maps it to a
  // `stat` item (empty icon/number, label = footnote text).
  const footnote = element.querySelector('.number-animation-block-footer p');
  if (footnote && footnote.textContent.trim()) {
    const footnoteCell = document.createElement('p');
    footnoteCell.textContent = footnote.textContent.trim();
    cells.push([document.createElement('p'), document.createElement('p'), footnoteCell]);
  }

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'stats',
    cells,
  });

  // Preserve the section heading ("Our Stats") as default content ABOVE the
  // block so it survives the import (page-templates.json marks it defaultContent).
  const fragment = document.createDocumentFragment();
  const sectionHeading = element.querySelector('h1, h2');
  if (sectionHeading) fragment.appendChild(sectionHeading.cloneNode(true));
  fragment.appendChild(block);
  element.replaceWith(fragment);
}
