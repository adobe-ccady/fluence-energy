/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Fluence Energy — Contact page sections.
 * Inserts EDS section breaks (<hr>) between the Contact page's 7 content
 * sections. Uses payload.template.sections (from tools/importer/page-templates.json,
 * "contact" template).
 *
 * Section-metadata policy: ALL 7 contact sections have style null (light/white),
 * so NO Section Metadata blocks are emitted — only the section-break <hr>s.
 * Net result: 6 section breaks (sections.length - 1), 0 Section Metadata blocks.
 *
 * Selectors come from the template's DOM-verified `section.selector` values
 * (verified in migration-work/contact/cleaned.html: hero = #main > header.banner,
 * article has exactly 6 <section> children → nth-of-type(1..6)) — never guessed.
 *
 * Implements the reference two-hook + marker pattern: breaks are inserted in
 * beforeTransform (while every section element still exists, before block
 * parsers replace them), and metadata (none here) is anchored in afterTransform.
 * Handles the array-form `section.selector`.
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
      const style = section.style || null;

      // First section needs neither a leading break nor a marker unless it
      // carries authorable metadata (none do on this page).
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
    // the marker <hr> inserted above, or the original element. No contact
    // section has a style, so this loop is a no-op on this page but kept for
    // correctness against the reference pattern.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const style = section.style || null;
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
