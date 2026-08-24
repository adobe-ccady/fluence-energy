/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Fluence services section breaks + section metadata.
 *
 * Derives everything from payload.template.sections. Inserts an <hr> before
 * every non-first section (beforeTransform, while all section elements still
 * exist) and anchors a Section Metadata block for each styled section
 * (afterTransform, after parsers may have replaced section elements).
 *
 * For the services template exactly one section is styled:
 *   remote-monitoring -> style "accent" (brand-blue full-bleed band).
 * All other sections have style null and get no metadata. The hero section is
 * first, so it gets neither a leading break nor metadata.
 *
 * section.selector may be an array of candidate selectors; the first that
 * matches on the page is used.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

function resolveSelectorList(selector) {
  if (Array.isArray(selector)) return selector;
  if (typeof selector === 'string') return [selector];
  return [];
}

function findSectionEl(root, selector) {
  const selectors = resolveSelectorList(selector);
  for (let i = 0; i < selectors.length; i += 1) {
    const el = root.querySelector(selectors[i]);
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    // Insert breaks now, before parsers can replace any section element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      // First section never needs a leading break; if it is also unstyled we
      // can skip it entirely (no marker required).
      if (i === 0 && !section.style) continue;

      const sectionEl = findSectionEl(element, section.selector);
      if (!sectionEl) continue; // selector didn't match on this page — skip, never guess

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Anchor each styled section's Section Metadata block to whichever element
    // still exists: the marker <hr>, or (first section, no marker) the section.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || findSectionEl(element, section.selector);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
