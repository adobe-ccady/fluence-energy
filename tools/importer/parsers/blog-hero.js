/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero (hero-blog) — Blog article title banner.
 * Base: hero. Source: https://blog.fluenceenergy.com/building-the-power-blueprint-for-tomorrows-ai-factories
 * Selector: header.banner.banner--single-post
 *
 * This is the DEFAULT (non-carousel) hero used as a full-bleed brand-gradient
 * title banner for blog articles — NO photo, NO video, NO CTA. The `hero-blog`
 * variant CSS (blocks/hero/hero.css) hides any picture/img and paints the
 * brand gradient instead, then styles the content as: h4 date eyebrow + h1
 * headline + h4 author byline (see `.hero.hero-blog > div > h4:first-child`,
 * `.hero.hero-blog h1`, `.hero.hero-blog > div > h4:last-child`).
 *
 * blocks/hero/hero.js non-carousel branch reads the block's direct child rows
 * as row 0 = image (background media) and row 1 = content. The container model
 * (blocks/hero/_hero.json) is [classes, image, imageAlt→collapsed, text,
 * video]; each container field maps to its own leading ROW in JCR conversion.
 * So we emit the required leading image row (EMPTY here — no photo) followed by
 * the content row carrying the eyebrow date, headline, and byline, which lands
 * in the `text` field. The video field is carousel-only and omitted.
 *
 * Variant is passed via `variants` (NOT embedded in `name`) so it is not
 * humanized — this yields class "hero hero-blog" the runtime/CSS expect, not a
 * capitalized "hero Blog".
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 0: image field — empty. The hero-blog banner has no photo (the gradient
  // is painted in CSS), but the container's image field row must still exist so
  // the content lands in the `text` field row that follows.
  cells.push([document.createElement('div')]);

  // Row 1: content (text field) — date eyebrow (h4) + headline (h1) + author
  // byline (h4), rebuilt as clean elements so the CSS positional selectors
  // (first h4, h1, last h4) match and the HubSpot wrapper spans are dropped.
  const contentCell = [];

  const dateEyebrow = element.querySelector('.banner-pre-title, .banner-title h4:first-child');
  if (dateEyebrow && dateEyebrow.textContent.trim()) {
    const h4 = document.createElement('h4');
    h4.textContent = dateEyebrow.textContent.trim();
    contentCell.push(h4);
  }

  const headline = element.querySelector('.banner-title h1, h1');
  if (headline && headline.textContent.trim()) {
    const h1 = document.createElement('h1');
    h1.textContent = headline.textContent.trim();
    contentCell.push(h1);
  }

  const byline = element.querySelector('.banner-post-title, .banner-title h4:last-child');
  if (byline && byline.textContent.trim() && byline !== dateEyebrow) {
    const h4 = document.createElement('h4');
    h4.textContent = byline.textContent.trim();
    contentCell.push(h4);
  }

  if (!contentCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Hero',
    variants: ['hero-blog'],
    cells,
  });
  element.replaceWith(block);
}
