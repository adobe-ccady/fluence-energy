/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns (columns-split) — Nispera APM page.
 * Base: columns. Source: https://fluenceenergy.com/nispera-energy-asset-performance-management-software/
 *
 * ONE parser drives every two-column text/image split on the page. The Nispera
 * page uses THREE different source markups; this parser detects which one it was
 * handed and normalizes them all to a 2-cell "Columns (columns-split)" row:
 *
 *   (A) .columns-two-thirds  — section 1 intro. Asymmetric: a content column
 *       (.col-two-third: H2 + paragraphs) and a STAT-CALLOUT column
 *       (.col-one-third: icon <img> + H4 label + big <h2> value "3-10%"). The
 *       stat callout is not a pure image, so columns.js will classify it as a
 *       text column — that is fine. Cell order follows --left/--right.
 *
 *   (B) .l-columns--2  — sections 4, 6, 11. Two .l-column-item children: one
 *       TEXT column (heading + paragraphs + bullet <ul> + CTA) and one IMAGE
 *       column (a photo, sometimes wrapped in an <h3>). Source column order is
 *       preserved so columns.js auto-classifies image vs text (image-left vs
 *       image-right is retained). SPECIAL CASE (section 6 "optimize-downtime"):
 *       its two columns are text+bullets with NO CTA, and the "Download the
 *       Brochure" image CTA lives in the FOLLOWING lone-CTA divider section. We
 *       MOVE that CTA into this block's text cell and drop the now-empty sibling
 *       section so the brochure link is not lost.
 *
 *   (C) .split-content-section (the whole <section>) — sections 5, 8, 12, 14.
 *       Direct children: .split-image (media half) and .split-content (text
 *       half). .split-right = image on the right, .split-left = image on the
 *       left; we order the cells accordingly so columns.js renders the correct
 *       mirrored layout. Sections 5 & 12 are dark CUSTOMER CASE STUDY promos
 *       (eyebrow H4 + H2 + paragraph + Learn More); section 8 is the "$800K+ in
 *       savings" split (eyebrow H4 + H2 + H5 + Talk to an Expert); section 14 is
 *       "Get the most out of your O&M services" (H2 + paragraph + bullets).
 *
 * HEADINGS: any H2 that lives OUTSIDE the replaced container (e.g. section 6's
 * "Optimize asset performance…" section header) is preserved automatically —
 * we only replace the inner container, never re-emit it. Headings that live
 * INSIDE a split's text column stay inside that cell.
 *
 * CTAs: HubSpot renders CTAs as an <img> inside an <a> (alt = the label, e.g.
 * "Request a Demo", "Download the Brochure") or as a text <a> ("Learn More",
 * "Talk to an Expert"). We rebuild every CTA as a clean <p><a href>label</a>
 * (last child of the text cell) so blocks/columns/columns.css styles it as the
 * gradient pill (its selector targets .columns-text-col p:last-child a).
 */

const normalizeWs = (t) => (t || '').replace(/\s+/g, ' ').trim();

// Rebuild a paragraph that contains a link as a clean <p><a href>label</a>,
// stripping HubSpot wrapper spans/comments. Returns null when there is no link.
function buildCta(p, document) {
  const a = p.querySelector('a[href]');
  if (!a) return null;
  const href = a.getAttribute('href');
  if (!href) return null;
  const img = a.querySelector('img');
  let label = normalizeWs(a.textContent);
  if (!label && img) label = normalizeWs(img.getAttribute('alt'));
  if (!label) label = 'Learn More';
  const np = document.createElement('p');
  const na = document.createElement('a');
  na.href = href;
  const target = a.getAttribute('target');
  if (target) na.setAttribute('target', target);
  na.textContent = label;
  np.appendChild(na);
  return np;
}

// Collect cleaned block-level content from a wrapper, flattening nested
// presentation <div>s (.page-content, .split-content-wrap, .entry-content,
// ._1Z_nJ). Preserves source order; drops empty/comment-only paragraphs.
function collectContent(wrap, document) {
  const out = [];
  const walk = (node) => {
    [...node.children].forEach((child) => {
      const tag = child.tagName.toLowerCase();
      if (/^h[1-6]$/.test(tag)) {
        const t = normalizeWs(child.textContent);
        if (t) {
          const h = document.createElement(tag);
          h.textContent = t;
          out.push(h);
        } else {
          // Heading that wraps only an image (e.g. section 4's <h3><img></h3>).
          const img = child.querySelector('img');
          if (img) {
            const p = document.createElement('p');
            p.appendChild(img.cloneNode(true));
            out.push(p);
          }
        }
      } else if (tag === 'p') {
        const cta = buildCta(child, document);
        if (cta) {
          out.push(cta);
          return;
        }
        const img = child.querySelector('img');
        if (img && !normalizeWs(child.textContent)) {
          const p = document.createElement('p');
          p.appendChild(img.cloneNode(true));
          out.push(p);
        } else if (normalizeWs(child.textContent)) {
          out.push(child.cloneNode(true));
        }
      } else if (tag === 'ul' || tag === 'ol') {
        if (child.querySelector('li')) out.push(child.cloneNode(true));
      } else if (tag === 'div') {
        walk(child);
      }
    });
  };
  walk(wrap);
  return out;
}

// (A) .columns-two-thirds — content column + stat/other column.
function parseTwoThirds(element, document) {
  const twoThird = element.querySelector('.col-two-third');
  const oneThird = element.querySelector('.col-one-third');
  const contentCell = collectContent(
    (twoThird && twoThird.querySelector('.page-content')) || twoThird || element,
    document,
  );
  const otherCell = collectContent(
    (oneThird && oneThird.querySelector('.page-content')) || oneThird || document.createElement('div'),
    document,
  );
  // --left → one-third first; else content first.
  const isLeft = element.classList.contains('columns-two-thirds--left');
  return isLeft ? [otherCell, contentCell] : [contentCell, otherCell];
}

// (B) .l-columns--2 — two .l-column-item columns, source order preserved.
function parseLColumns(element, document) {
  const items = [...element.children].filter((c) => c.classList.contains('l-column-item'));
  const src = items.length ? items : [...element.children];
  const cells = src.map((col) => collectContent(
    col.querySelector('.page-content') || col,
    document,
  ));

  // Section 6 special case: this 2-col block has NO CTA and the following
  // section is a lone image-CTA divider (e.g. "Download the Brochure"). Move
  // that CTA into a text cell so it is not lost, then drop the empty sibling.
  const hasCta = element.querySelector('a[href]');
  if (!hasCta) {
    const section = element.closest('section');
    const next = section && section.nextElementSibling;
    if (next && next.tagName === 'SECTION') {
      const nextLink = next.querySelector('a[href]');
      const nextHasHeading = next.querySelector('h1, h2, h3, h4, h5, h6');
      // Only adopt when the sibling is essentially just a CTA (a divider).
      if (nextLink && !nextHasHeading) {
        const cta = buildCta(nextLink.closest('p') || nextLink.parentNode || nextLink, document);
        if (cta) {
          // Append the CTA to the LAST non-empty text cell (never an image cell).
          let targetIndex = -1;
          cells.forEach((cell, i) => {
            const isImageOnly = cell.length === 1 && cell[0].tagName === 'P' && cell[0].querySelector('img');
            if (!isImageOnly && cell.length) targetIndex = i;
          });
          if (targetIndex === -1) targetIndex = 0;
          cells[targetIndex].push(cta);
          next.remove();
        }
      }
    }
  }
  return cells;
}

// (C) .split-content-section — media half + content half, ordered by side.
function parseSplitContent(element, document) {
  const imageEl = element.querySelector(':scope > .split-image') || element.querySelector('.split-image');
  const contentEl = element.querySelector(':scope > .split-content') || element.querySelector('.split-content');

  const imageCell = [];
  const img = imageEl && imageEl.querySelector('img');
  if (img) {
    const p = document.createElement('p');
    p.appendChild(img.cloneNode(true));
    imageCell.push(p);
  }

  const textCell = contentEl ? collectContent(contentEl, document) : [];

  // .split-right → image on the right → [text, image]; .split-left → image left.
  const isLeft = element.classList.contains('split-left');
  return isLeft ? [imageCell, textCell] : [textCell, imageCell];
}

export default function parse(element, { document }) {
  let cells;
  if (element.classList.contains('split-content-section')
    || element.querySelector(':scope > .split-image, :scope > .split-content')) {
    cells = parseSplitContent(element, document);
  } else if (element.classList.contains('columns-two-thirds')
    || element.querySelector('.col-two-third, .col-one-third')) {
    cells = parseTwoThirds(element, document);
  } else {
    cells = parseLColumns(element, document);
  }

  // Drop empty cells; require at least one cell with content.
  const row = cells.filter((c) => c && c.length);
  if (!row.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Columns (columns-split)',
    cells: [row],
  });
  element.replaceWith(block);
}
