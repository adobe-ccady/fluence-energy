/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns (columns-split) — Sustainability (ESG) page.
 * Base: columns. Source: https://fluenceenergy.com/sustainability/
 *
 * ONE parser drives every image/text split on this page. Two source markups are
 * handed to it; it detects which and normalizes both to a 2-cell
 * "Columns (columns-split)" row. blocks/columns/columns.js auto-classifies a
 * lone-image cell (a single <p><img></p>) as .columns-img-col and the other as
 * .columns-text-col, and columns.css derives image-left vs image-right purely
 * from cell order — so we ONLY preserve source column order, never a modifier.
 *
 *   (A) .split-content-section  — section 2 (story intro). The matched element
 *       is the whole <section class="split-content-section split-right">. Direct
 *       children: .split-image (photo half) and .split-content (text half:
 *       H2 + 2 paragraphs + "READ THE REPORT" grad-button CTA). split-right =
 *       image on the right → cells ordered [text, image]; split-left → image
 *       first. The CTA is a HubSpot <a class="grad-button"><span>label</span></a>;
 *       we rebuild it as a clean <p><a href>label</a> (last child of the text
 *       cell) so columns.css styles it as the gradient pill.
 *
 *   (B) .l-columns--2  — sections 5, 8, 11, 14 (Responsible Sourcing,
 *       Environment, Social, Governance). Two .l-column-item children: one IMAGE
 *       column (lone .page-content > p > img) and one TEXT column (H2 + paragraph
 *       + an <h4> "view letters and policies" anchor + "LEARN MORE" grad-button;
 *       section 14's text column also embeds an inline photo). Source column
 *       order is preserved so the image-left/-right alternation is retained.
 *
 * LINKS/CTAs: every anchor is preserved with its href + target. The "view
 * letters and policies" link lives inside an <h4> and is kept in place; the
 * gradient-button CTA is normalized to a plain <p><a>. Inline body photos in a
 * text column are kept as <p><img>. Section headings that live INSIDE a text
 * column stay in that cell; nothing outside the matched element is re-emitted.
 */

const normalizeWs = (t) => (t || '').replace(/\s+/g, ' ').trim();

// Rebuild a link-bearing paragraph as a clean <p><a href>label</a>, stripping
// HubSpot wrapper <span>s. Returns null when the paragraph has no link.
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

// Collect cleaned block-level content from a wrapper, flattening presentation
// <div>s (.page-content, .split-content-wrap, .entry-content). Preserves source
// order; drops empty/whitespace-only paragraphs; keeps headings, body copy,
// lists, inline photos, and links (with href/target).
function collectContent(wrap, document) {
  const out = [];
  const walk = (node) => {
    [...node.children].forEach((child) => {
      const tag = child.tagName.toLowerCase();
      if (/^h[1-6]$/.test(tag)) {
        // Heading that wraps an image only (e.g. an icon) → keep as <p><img>.
        const innerImg = child.querySelector('img');
        if (innerImg && !normalizeWs(child.textContent)) {
          const p = document.createElement('p');
          p.appendChild(innerImg.cloneNode(true));
          out.push(p);
          return;
        }
        // Heading that contains a link (e.g. "view letters and policies") →
        // rebuild as a clean heading holding a clean anchor.
        const link = child.querySelector('a[href]');
        if (link) {
          const h = document.createElement(tag);
          const na = document.createElement('a');
          na.href = link.getAttribute('href');
          const target = link.getAttribute('target');
          if (target) na.setAttribute('target', target);
          na.textContent = normalizeWs(link.textContent) || normalizeWs(child.textContent);
          h.appendChild(na);
          out.push(h);
          return;
        }
        const t = normalizeWs(child.textContent);
        if (t) {
          const h = document.createElement(tag);
          h.textContent = t;
          out.push(h);
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
          const p = document.createElement('p');
          p.textContent = normalizeWs(child.textContent);
          out.push(p);
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

// (A) .split-content-section — media half + content half, ordered by side.
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

// (B) .l-columns--2 — two .l-column-item columns, source order preserved.
function parseLColumns(element, document) {
  const items = [...element.children].filter((c) => c.classList.contains('l-column-item'));
  const src = items.length ? items : [...element.children];
  return src.map((col) => collectContent(col.querySelector('.page-content') || col, document));
}

export default function parse(element, { document }) {
  let cells;
  if (element.classList.contains('split-content-section')
    || element.querySelector(':scope > .split-image, :scope > .split-content')) {
    cells = parseSplitContent(element, document);
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
