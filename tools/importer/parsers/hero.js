/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero (hero-carousel).
 * Base: hero. Source: https://fluenceenergy.com/
 * Selector: #main > article.homepage > section.hero.background-video
 *
 * This is a genuinely custom variant of hero (a video-background carousel).
 * The project's own blocks/hero/hero.js `decorateCarousel` is the authoritative
 * contract: it treats each direct child row of the 1-column block as follows —
 *   - Row 1 (optional): media-only row (no heading) → background layer. Here we
 *     emit the poster <img> plus a link to the background video src.
 *   - Rows 2..n: one row per real slide — optional eyebrow <h4>, <h1> heading,
 *     optional sub <p>, and one CTA <a class="button">.
 * The block stays 1-column per the EDS hero convention; the repeating slide
 * rows are the carousel extension. .cloned owl duplicate slides are stripped by
 * the cleanup transformer, so only real .hero-box slides appear here.
 */
export default function parse(element, { document }) {
  const cells = [];
  // Build 1-column table: optional bg-media row, then one row per real slide.

  // Container (base `hero`) fields are [image, imageAlt→collapsed, text, video].
  // The JCR converter maps each container field to its OWN leading ROW (like the
  // default hero's image row + content row), then treats the remaining rows as
  // repeating `hero-slide` items. So emit three single-cell container rows in
  // field order — image, text (empty; slide text lives on the slides), video —
  // followed by one row per slide. The runtime decorateCarousel reads the poster
  // <img> and the video link from these leading background-media rows.
  const video = element.querySelector('video.hero-video-bkg, video');
  if (video) {
    // The base `hero` container model is [image, text, video] (classes excluded,
    // imageAlt collapses into image). The JCR converter maps each container
    // field to its own leading ROW, then treats remaining rows as `hero-slide`
    // items. Emit three container rows in field order — image, text (empty; the
    // slide text lives on the slides), video — then one row per slide. The
    // runtime decorateCarousel reads the poster <img> and video link from these
    // leading background-media rows.
    const imageCell = document.createElement('div');
    const poster = video.getAttribute('poster');
    if (poster) {
      const img = document.createElement('img');
      img.src = poster;
      img.setAttribute('alt', '');
      imageCell.appendChild(img);
    }
    cells.push([imageCell]);

    // text field row — empty for the carousel container.
    cells.push([document.createElement('div')]);

    // video field row — link to the background video source.
    const videoCell = document.createElement('div');
    const src = video.getAttribute('src') || video.querySelector('source')?.getAttribute('src');
    if (src) {
      const a = document.createElement('a');
      a.href = src;
      a.textContent = src;
      videoCell.appendChild(a);
    }
    cells.push([videoCell]);
  }

  // Remaining rows: one per real slide. Owl carousel injects .cloned duplicate
  // slides on the live page (stripped by the cleanup transformer at import
  // time); exclude them so each real slide appears exactly once.
  let slides = [...element.querySelectorAll('.hero-carousel .hero-box')];
  if (!slides.length) slides = [...element.querySelectorAll('.hero-box')];
  slides = slides.filter((s) => !s.closest('.cloned'));
  slides.forEach((slide) => {
    const slideCell = [];

    // Optional eyebrow (e.g. "OUR MISSION").
    const eyebrow = slide.querySelector('h4');
    if (eyebrow && eyebrow.textContent.trim()) {
      const h4 = document.createElement('h4');
      h4.textContent = eyebrow.textContent.trim();
      slideCell.push(h4);
    }

    // Heading.
    const heading = slide.querySelector('h1, h2, h3');
    if (heading && heading.textContent.trim()) {
      const h1 = document.createElement('h1');
      h1.textContent = heading.textContent.trim();
      slideCell.push(h1);
    }

    // Optional sub paragraph.
    const sub = slide.querySelector('p');
    if (sub && sub.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = sub.textContent.trim();
      slideCell.push(p);
    }

    // CTA — preserve class="button", href and target.
    const cta = slide.querySelector('a');
    if (cta) {
      const a = document.createElement('a');
      a.className = 'button';
      a.href = cta.getAttribute('href');
      const target = cta.getAttribute('target');
      if (target) a.setAttribute('target', target);
      a.textContent = cta.textContent.trim();
      const p = document.createElement('p');
      p.appendChild(a);
      slideCell.push(p);
    }

    if (slideCell.length) cells.push([slideCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Hero (hero-carousel)',
    cells,
  });
  element.replaceWith(block);
}
