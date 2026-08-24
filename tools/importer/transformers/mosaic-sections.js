/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Fluence Energy — Mosaic page sections.
 * Inserts EDS section breaks (<hr>) between the Mosaic page's 11 content
 * sections and Section Metadata blocks for sections that carry an authorable
 * style.
 *
 * This is a NEW, page-namespaced transformer — it does NOT replace
 * fluence-sections.js, which the homepage import still depends on.
 *
 * Uses payload.template.sections (from tools/importer/page-templates.json,
 * "mosaic" template). The mosaic template has 11 sections, so section breaks
 * are required (expected: 10 <hr>, one before each non-first section).
 *
 * Section-metadata policy (per migration-work/mosaic/authoring-analysis.json):
 *   - hero (id "hero")                → SKIP (full-bleed gradient background is
 *                                       intrinsic to the block's own design)
 *   - market-ticker, what-if, stats, automates, power-tools, test-drive,
 *     in-the-press                    → light (color-option-1) default → no metadata
 *   - testimonial (id "testimonial")  → style=dark  (dark full-bleed bg testimonial)
 *   - technology-agnostic             → style=dark  (dark tech-dots split)
 *   - markets (id "markets")          → style=dark  (color-option-4 dark tiles)
 * Net result: 10 section breaks, 3 Section Metadata (style=dark) blocks.
 *
 * The three dark styles come straight from each section's `style` property in
 * the template — the hero is null there (correctly SKIPs metadata), so no extra
 * skip-list is needed. Selectors come from the template's DOM-verified
 * `section.selector` values (verified in migration-work/mosaic/cleaned.html).
 *
 * Implements the reference two-hook + marker pattern: breaks are inserted in
 * beforeTransform (while every section element still exists, before block
 * parsers replace them), and metadata is anchored in afterTransform.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

// `section.selector` in page-templates.json is an array of candidate selectors.
// Return the first candidate that actually matches an element on this page.
function findSectionEl(element, selector) {
  const candidates = Array.isArray(selector) ? selector : [selector];
  for (let i = 0; i < candidates.length; i += 1) {
    const sel = candidates[i];
    if (typeof sel === 'string' && sel.length) {
      const el = element.querySelector(sel);
      if (el) return el;
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  if (sections.length < 2) return;

  if (hookName === 'beforeTransform') {
    // Insert section breaks now, before any block parser replaces a section
    // element. Walk in reverse so unprocessed sections stay in place.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const style = section.style || null;

      // First section needs neither a leading break nor a marker (hero style is
      // null on this page, so no metadata is anchored to it either).
      if (i === 0 && !style) continue;

      const sectionEl = findSectionEl(element, section.selector);
      if (!sectionEl) continue; // no candidate selector matched — skip, never guess

      const hr = document.createElement('hr');
      // Tag the break as a stable anchor only when this section needs metadata.
      if (style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Block parsers have now run and may have replaced section elements. Anchor
    // each styled section's Section Metadata block to whichever anchor survived:
    // the marker <hr> inserted above, or the original element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const style = section.style || null;
      if (!style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || findSectionEl(element, section.selector);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never keeps a leading break
      }
    }
  }
}
