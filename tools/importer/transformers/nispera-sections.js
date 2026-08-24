/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Fluence Energy — Nispera APM page sections.
 *
 * Inserts EDS section breaks (<hr>) between the Nispera page's 14 content
 * sections and Section Metadata blocks for the sections that carry an
 * authorable style.
 *
 * Uses payload.template.sections (from tools/importer/page-templates.json, the
 * "nispera" template). That template has 14 sections, so section breaks are
 * required.
 *
 * Section-metadata policy: emit Section Metadata (style) ONLY where
 * section.style is truthy. For the Nispera page exactly THREE sections are dark:
 *   - case-study-lekela   (#main > article > section:nth-of-type(5))  → dark
 *   - quote-spannaus      (#main > article > section:nth-of-type(10)) → dark
 *   - case-study-aediles  (#main > article > section:nth-of-type(12)) → dark
 * The hero and all other sections have style null → no metadata.
 * Net result: 13 section breaks (14 - 1), 3 Section Metadata blocks.
 *
 * Selectors come from each section's DOM-verified `section.selector` (array
 * form) in the template — never guessed.
 *
 * Implements the reference two-hook + marker pattern: breaks are inserted in
 * beforeTransform (while every section element still exists, before block
 * parsers replace them, walking in reverse), and metadata is anchored in
 * afterTransform to the surviving marker <hr> or the original element.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

// `section.selector` in page-templates.json is an array of candidate selectors.
// Return the first usable one as a string.
function firstSelector(selector) {
  if (Array.isArray(selector)) return selector.find((s) => typeof s === 'string' && s.length);
  return selector;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  if (sections.length < 2) return;

  if (hookName === 'beforeTransform') {
    // Insert section breaks now, before any block parser replaces a section
    // element. Walk in reverse so unprocessed sections stay in place.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const style = section.style;

      // First section needs neither a leading break nor a marker (no style).
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
      const style = section.style;
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
