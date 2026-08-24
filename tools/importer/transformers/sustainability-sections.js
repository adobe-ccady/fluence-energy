/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Fluence Energy — Sustainability page sections.
 *
 * Inserts EDS section breaks (hr) between the Sustainability page's 19 content
 * sections and Section Metadata blocks for any section that carries an
 * authorable style.
 *
 * Uses payload.template.sections (from tools/importer/page-templates.json). The
 * sustainability template has 19 sections, so section breaks are required
 * (expected: 18 breaks = sections.length - 1).
 *
 * Section-metadata policy (styles derived from page-templates.json; emitted
 * ONLY where section.style is truthy):
 *   - vision-band  (nth-of-type 4)  -> "dark"
 *   - questions    (nth-of-type 16) -> "center"
 *   - report-docs  (nth-of-type 17) -> "center"
 *   - all 16 other sections have style null -> no metadata
 * Net result: 18 section breaks, 3 Section Metadata blocks (1 dark + 2 center).
 *
 * Selectors come from the template's DOM-verified `section.selector` values
 * (verified in migration-work/sustainability/cleaned.html) — never guessed.
 * `section.selector` is an array form, handled via firstSelector().
 *
 * Implements the reference two-hook + marker pattern: breaks are inserted in
 * beforeTransform (while every section element still exists, before block
 * parsers replace them), and metadata is anchored in afterTransform. Both hooks
 * iterate the sections in reverse so unprocessed sections stay in place.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

// `section.selector` in page-templates.json is an array of candidate selectors.
// Return the first usable one as a string.
function firstSelector(selector) {
  if (Array.isArray(selector)) return selector.find((s) => typeof s === 'string' && s.length);
  return selector;
}

// Whether this section should emit a Section Metadata block. Only sections with
// a truthy style qualify (dark / center on this page).
function metadataStyleFor(section) {
  return section.style || null;
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
      // it carries authorable metadata (it does not on this page).
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
    // the marker hr inserted above, or the original element.
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
