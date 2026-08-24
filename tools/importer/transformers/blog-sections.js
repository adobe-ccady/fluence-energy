/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Fluence Energy — blog article section breaks + section metadata.
 *
 * Derives everything from payload.template.sections (the "blog" template in
 * tools/importer/page-templates.json). That template has 6 sections, in order:
 *   1. article-title-banner  (header.banner.banner--single-post)          style null
 *   2. article-body          (section.section--post-content)              style null
 *   3. author-bio            (section.post-author-block)                  style null
 *   4. newsletter-subscribe  (section.fullwidth-column.section:has(.article-subscribe)) style "subscribe"
 *   5. related-posts         (section.fullwidth-column.section:has(.recommended-posts)) style null
 *   6. most-popular          (section.fullwidth-column.section:has(.popular-posts))     style null
 *
 * Section-metadata policy (from authoring-analysis.json): emit Section Metadata
 * ONLY where section.style is truthy. Per Step 3e analysis, the hero
 * (article-title-banner) and both cards sections (related-posts, most-popular)
 * SKIP section-metadata — the hero gradient is the block's own design and the
 * cards sections have no distinct section background. Only newsletter-subscribe
 * KEEPS a style ("subscribe") — a tinted container panel for the subscribe
 * callout. Net result: 5 section breaks (6 - 1) and 1 Section Metadata block.
 *
 * Selectors come from each section's DOM-verified `section.selector` (array form)
 * in the template — never guessed.
 *
 * Implements the reference two-hook + marker pattern (matching the sibling
 * *-sections.js transformers): breaks are inserted in beforeTransform (while
 * every section element still exists, before block parsers replace them, walking
 * in reverse), and metadata is anchored in afterTransform to the surviving marker
 * <hr> or the original element.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

// `section.selector` in page-templates.json is an array of candidate selectors.
function resolveSelectorList(selector) {
  if (Array.isArray(selector)) return selector;
  if (typeof selector === 'string') return [selector];
  return [];
}

function findSectionEl(root, selector) {
  const selectors = resolveSelectorList(selector);
  for (let i = 0; i < selectors.length; i += 1) {
    try {
      const el = root.querySelector(selectors[i]);
      if (el) return el;
    } catch (e) {
      // ignore unsupported selectors and try the next candidate
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
      // First section needs neither a leading break nor a marker (no style).
      if (i === 0 && !section.style) continue;

      const sectionEl = findSectionEl(element, section.selector);
      if (!sectionEl) continue; // selector didn't match on this page — skip, never guess

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Block parsers have now run and may have replaced section elements. Anchor
    // each styled section's Section Metadata block to whichever anchor survived:
    // the marker <hr> inserted above, or the original element.
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
