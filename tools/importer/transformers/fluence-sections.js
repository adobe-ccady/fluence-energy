/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Fluence Energy sections.
 * Inserts EDS section breaks (<hr>) between the homepage's 9 content sections
 * and Section Metadata blocks for any section that carries an authorable style.
 *
 * Uses payload.template.sections (from tools/importer/page-templates.json). The
 * homepage template has 9 sections, so section breaks are required.
 *
 * Section-metadata policy (per migration-work/authoring-analysis.json):
 *   - hero          → SKIP (full-bleed background video is the block's own design)
 *   - announcements → SKIP (the accent-blue background is intrinsic to the
 *                     resource-block's own design, NOT a reusable section style)
 *   - all other sections have style null (white) → no metadata
 * Net result: 8 section breaks, 0 Section Metadata blocks on this page.
 *
 * Selectors come from the template's DOM-verified `section.selector` values
 * (verified in migration-work/cleaned.html) — never guessed.
 *
 * Implements the reference two-hook + marker pattern: breaks are inserted in
 * beforeTransform (while every section element still exists, before block
 * parsers replace them), and metadata is anchored in afterTransform.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

// Section ids whose section-metadata is intentionally skipped because the
// background/treatment is intrinsic to the block's own design, not a reusable
// section container style (see authoring-analysis.json sectionMetadataDecision).
const SKIP_METADATA_IDS = new Set(['hero', 'announcements']);

// `section.selector` in page-templates.json is an array of candidate selectors.
// Return the first usable one as a string.
function firstSelector(selector) {
  if (Array.isArray(selector)) return selector.find((s) => typeof s === 'string' && s.length);
  return selector;
}

// Whether this section should emit a Section Metadata block.
function metadataStyleFor(section) {
  if (!section.style) return null;
  if (SKIP_METADATA_IDS.has(section.id)) return null;
  return section.style;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  if (sections.length < 2) return;

  if (hookName === 'beforeTransform') {
    // Insert section breaks now, before any block parser replaces a section
    // element. Walk in reverse so unprocessed sections stay in place.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const style = metadataStyleFor(section);

      // First section needs neither a leading break nor (here) a marker unless
      // it carries authorable metadata (none do on this page).
      if (i === 0 && !style) continue;

      const sel = firstSelector(section.selector);
      if (!sel) continue;
      const sectionEl = element.querySelector(sel);
      if (!sectionEl) continue; // selector didn't match — skip, never guess

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
      const style = metadataStyleFor(section);
      if (!style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const sel = firstSelector(section.selector);
      const anchor = marker || (sel ? element.querySelector(sel) : null);
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
