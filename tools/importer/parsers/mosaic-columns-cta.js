/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns (columns-cta) — Mosaic page.
 * Base: columns. Source: https://fluenceenergy.com/mosaic-intelligent-bidding-software/
 * Invoked ONCE per section (import-mosaic.js passes the <section>, e.g.
 * #main article > section:nth-of-type(7) — the "Mosaic automates…" feature
 * section).
 *
 * Source: the section contains TWO .l-columns--3 grids (a desktop grid and a
 * hidden mobile-duplicate grid), so up to 6 .l-column-item nodes appear but only
 * 3 are UNIQUE icon columns (FORECASTING WITH MACHINE LEARNING / OPTIMIZATION /
 * AUTOMATION). Each icon column has a circular icon (img), an uppercase <h4>
 * title, and a descriptive <p>. A "Download the Brochure" CTA (an <a> wrapping
 * an <img>) lives in the second grid.
 *
 * We collect every icon column found ANYWHERE in the section and DEDUPLICATE by
 * normalized cell text so the mobile duplicate never doubles the icons → exactly
 * 3 icon+title+paragraph cells. The preceding-section heading ("Mosaic
 * automates…", in section 6) and the brochure CTA are emitted as default content
 * outside the block, each exactly once.
 */
const normalize = (text) => (text || '').trim().replace(/\s+/g, ' ').toLowerCase();

export default function parse(element, { document }) {
  // Normalize to the enclosing section so we see both .l-columns--3 grids and
  // can reach the preceding heading, regardless of which node was matched.
  const section = element.closest('section') || element;

  // Icon columns = .l-column-item cells that carry a title heading.
  const items = [...section.querySelectorAll('.l-column-item')]
    .filter((item) => item.querySelector('h4, h3'));

  const cells = [];
  const seen = new Set();
  items.forEach((item) => {
    const wrap = item.querySelector('.page-content') || item;
    const cell = [];

    // Icon — the image inside the table/heading at the top of the column.
    const icon = wrap.querySelector('img');
    if (icon) {
      const p = document.createElement('p');
      p.appendChild(icon.cloneNode(true));
      cell.push(p);
    }

    // Uppercase title — the last non-empty h4/h3 (the first h4 may only wrap the icon).
    const titles = [...wrap.querySelectorAll('h4, h3')]
      .filter((h) => h.textContent.trim());
    let titleText = '';
    if (titles.length) {
      titleText = titles[titles.length - 1].textContent.trim();
      const h3 = document.createElement('h3');
      h3.textContent = titleText;
      cell.push(h3);
    }

    // Description paragraph(s).
    let descText = '';
    [...wrap.querySelectorAll(':scope > p')].forEach((p) => {
      if (p.textContent.trim()) {
        descText += ` ${p.textContent.trim()}`;
        const np = document.createElement('p');
        np.textContent = p.textContent.trim();
        cell.push(np);
      }
    });

    // Deduplicate by normalized text (title + description) to drop the hidden
    // mobile-duplicate grid's copies.
    const key = normalize(`${titleText}${descText}`);
    if (!key || seen.has(key)) return;
    seen.add(key);
    cells.push(cell);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Columns (columns-cta)',
    cells: [cells],
  });

  const fragment = document.createDocumentFragment();

  // Preserve the section heading (in the preceding section) as default content
  // above the block — exactly once.
  const prevSection = section.previousElementSibling;
  const heading = prevSection && prevSection.querySelector
    ? prevSection.querySelector('h2')
    : null;
  if (heading && heading.textContent.trim()) {
    const h2 = document.createElement('h2');
    h2.textContent = heading.textContent.trim();
    fragment.appendChild(h2);
  }

  // "Download the Brochure" CTA — an image link in the second grid. Emit it as
  // default content above the block, exactly once, so it is not duplicated by
  // the mobile grid and the icon cells stay clean icon+title+paragraph.
  const ctaLink = section.querySelector('a[href*="brochure"], .hs-cta-wrapper a[href]');
  if (ctaLink) {
    const a = document.createElement('a');
    a.href = ctaLink.getAttribute('href');
    const target = ctaLink.getAttribute('target');
    if (target) a.setAttribute('target', target);
    const ctaImg = ctaLink.querySelector('img');
    if (ctaImg) {
      a.appendChild(ctaImg.cloneNode(true));
    } else {
      a.textContent = ctaLink.textContent.trim() || 'Download the Brochure';
    }
    const p = document.createElement('p');
    p.appendChild(a);
    fragment.appendChild(p);
  }

  fragment.appendChild(block);

  element.replaceWith(fragment);
}
