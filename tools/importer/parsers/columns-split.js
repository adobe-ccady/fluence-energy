/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns (columns-split).
 * Base: columns. Source: https://fluenceenergy.com/
 * Selectors:
 *   #main > article.homepage > section.home-split-block-right (image right)
 *   #main > article.homepage > section.home-split-block-left  (image left)
 *
 * Columns convention: multiple columns; row 2+ have the same column count.
 * Here: a single 2-column row [imageCell, contentCell].
 * The base columns.js classifies a single-image column as .columns-img-col and
 * the other as .columns-text-col, so the image must be alone in its cell and
 * the content (icon + heading + paragraph(s) + CTA) together in the other.
 * Image side is honored by cell order: image-left → [image, content];
 * image-right → [content, image]. The importer/section transformer applies the
 * .columns-split-left modifier class for the mirrored (image-left) instance.
 */
export default function parse(element, { document }) {
  const photo = element.querySelector('.photo-block img, .photo-block picture');

  // Image cell: just the image (wrapped in a <p> so columns.js img-in-p
  // detection classifies it as the image column).
  const imageCell = [];
  if (photo) {
    const p = document.createElement('p');
    p.appendChild(photo.cloneNode(true));
    imageCell.push(p);
  }

  // Content cell: decorative icon, heading, paragraph(s), CTA.
  const wrap = element.querySelector('.content-block .split-wrap')
    || element.querySelector('.content-block') || element;
  const contentCell = [];

  // Decorative icon = the first image inside the content column.
  const icon = wrap.querySelector(':scope > img, img');
  if (icon) {
    const p = document.createElement('p');
    p.appendChild(icon.cloneNode(true));
    contentCell.push(p);
  }

  // Heading.
  const heading = wrap.querySelector('h2, h3');
  if (heading && heading.textContent.trim()) {
    const h2 = document.createElement('h2');
    h2.textContent = heading.textContent.trim();
    contentCell.push(h2);
  }

  // Body paragraph(s) — preserve inline links (e.g. "data centers"). Exclude
  // the CTA-only paragraph (the one whose sole content is the grad-button).
  const paras = [...wrap.querySelectorAll(':scope > p')];
  paras.forEach((para) => {
    const soleLink = para.querySelector('a.grad-button');
    const isCtaOnly = soleLink && para.textContent.trim() === soleLink.textContent.trim();
    if (isCtaOnly) return;
    if (para.textContent.trim()) contentCell.push(para.cloneNode(true));
  });

  // CTA — "Learn More" (a.grad-button). Preserve href + target.
  const cta = wrap.querySelector('a.grad-button, a[class*="button"]');
  if (cta) {
    const a = document.createElement('a');
    a.href = cta.getAttribute('href');
    const target = cta.getAttribute('target');
    if (target) a.setAttribute('target', target);
    const span = cta.querySelector('span');
    a.textContent = (span ? span.textContent : cta.textContent).trim();
    const p = document.createElement('p');
    p.appendChild(a);
    contentCell.push(p);
  }

  if (!contentCell.length && !imageCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Image side: .home-split-block-left → image on the LEFT.
  const imageLeft = element.classList.contains('home-split-block-left');
  const row = imageLeft ? [imageCell, contentCell] : [contentCell, imageCell];

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Columns (columns-split)',
    cells: [row],
  });
  element.replaceWith(block);
}
