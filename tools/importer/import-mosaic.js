/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS — mosaic page block variants (source DOM differs from homepage,
// so these are mosaic-specific parsers that emit the reused EDS block variants).
import mosaicHeroParser from './parsers/mosaic-hero.js';
import mosaicTickerParser from './parsers/mosaic-ticker.js';
import mosaicColumnsSplitParser from './parsers/mosaic-columns-split.js';
import mosaicColumnsPullquoteParser from './parsers/mosaic-columns-pullquote.js';
import mosaicColumnsCtaParser from './parsers/mosaic-columns-cta.js';
import mosaicStatsParser from './parsers/mosaic-stats.js';
import mosaicCardsFeatureParser from './parsers/mosaic-cards-feature.js';
import mosaicCardsProductParser from './parsers/mosaic-cards-product.js';
import mosaicCardsArticleParser from './parsers/mosaic-cards-article.js';

// TRANSFORMER IMPORTS — mosaic-specific cleanup + section breaks
import mosaicCleanupTransformer from './transformers/mosaic-cleanup.js';
import mosaicSectionsTransformer from './transformers/mosaic-sections.js';

// PAGE TEMPLATE CONFIGURATION — embedded from page-templates.json (mosaic template)
const PAGE_TEMPLATE = {
  name: 'mosaic',
  description: 'Fluence Mosaic intelligent bidding software product page.',
  urls: ['https://fluenceenergy.com/mosaic-intelligent-bidding-software/'],
  // Full section objects (with selectors) so the sections transformer can
  // locate boundaries and emit section-metadata (style=dark) for the 3 dark
  // sections. Selectors use nth-of-type on article > section because the
  // WordPress sections share identical class combinations.
  sections: [
    { id: 'hero', name: 'hero', selector: ['#main > header.banner'], style: null, blocks: ['hero'], defaultContent: [] },
    { id: 'market-ticker', name: 'market-ticker', selector: ['#main > .banner-nav-animation-wrap'], style: null, blocks: ['ticker'], defaultContent: [] },
    { id: 'what-if', name: 'what-if', selector: ['#main article > section:nth-of-type(1)'], style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'testimonial', name: 'testimonial', selector: ['#main article > section.quote-block'], style: 'dark', blocks: ['columns'], defaultContent: [] },
    { id: 'stats', name: 'stats', selector: ['#main article > section:nth-of-type(3)'], style: null, blocks: ['stats'], defaultContent: [] },
    { id: 'technology-agnostic', name: 'technology-agnostic', selector: ['#main article > section:nth-of-type(5)'], style: 'dark', blocks: ['columns'], defaultContent: [] },
    { id: 'automates', name: 'automates', selector: ['#main article > section:nth-of-type(7)'], style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'power-tools', name: 'power-tools', selector: ['#main article > section:nth-of-type(9)'], style: null, blocks: ['cards'], defaultContent: [] },
    { id: 'markets', name: 'markets', selector: ['#main article > section.color-option-4'], style: 'dark', blocks: ['cards'], defaultContent: [] },
    { id: 'test-drive', name: 'test-drive', selector: ['#main article > section:nth-of-type(11)'], style: null, blocks: [], defaultContent: [] },
    { id: 'in-the-press', name: 'in-the-press', selector: ['#main article > section:nth-of-type(12)'], style: null, blocks: ['cards'], defaultContent: [] },
  ],
};

// BLOCK REGISTRY — content-driven. WordPress sections on this page share
// identical class combinations, so we anchor each parser to its section via
// nth-of-type (article > section, 1-indexed) to avoid cross-section collisions.
const BLOCK_REGISTRY = [
  { parser: mosaicHeroParser, selectors: ['#main > header.banner'] },
  { parser: mosaicTickerParser, selectors: ['#main > .banner-nav-animation-wrap nav.navigation--banner'] },
  // What-if split promo (image right) — article section 1
  { parser: mosaicColumnsSplitParser, selectors: [
    '#main article > section:nth-of-type(1) .columns-two-thirds',
    '#main article > section:nth-of-type(5) .columns-two-thirds',
  ] },
  // Pull-quote testimonial — section 2
  { parser: mosaicColumnsPullquoteParser, selectors: ['#main article > section:nth-of-type(2) blockquote'] },
  // 3 icon CTA columns ("Mosaic automates...") — section 7 grid
  { parser: mosaicColumnsCtaParser, selectors: ['#main article > section:nth-of-type(7) .l-columns--3'] },
  // Stats row — section 3 (whole; parser pulls the footnote from section 4)
  { parser: mosaicStatsParser, selectors: ['#main article > section:nth-of-type(3)'] },
  // 6 text feature cards ("Power Tools") — section 9 grid(s)
  { parser: mosaicCardsFeatureParser, selectors: ['#main article > section:nth-of-type(9) .l-columns--3'] },
  // 3 market tiles ("Energy markets...") — section 10 (color-option-4) grid
  { parser: mosaicCardsProductParser, selectors: ['#main article > section:nth-of-type(10) .l-columns--3'] },
  // 4-col press article cards — section 12
  { parser: mosaicCardsArticleParser, selectors: ['#main article > section:nth-of-type(12) .l-grid--four-col'] },
];

// TRANSFORMER REGISTRY — cleanup first, then section breaks/metadata
const transformers = [
  mosaicCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [mosaicSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook.
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all block instances on the page using the content-driven registry.
 * Elements nested inside an already-claimed block are skipped.
 */
function findBlocksOnPage(document) {
  const found = [];
  const claimed = [];
  BLOCK_REGISTRY.forEach(({ parser, selectors }) => {
    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        if (claimed.some((c) => c !== element && c.contains(element))) return;
        if (found.some((f) => f.element === element)) return;
        found.push({ parser, selector, element });
        claimed.push(element);
      });
    });
  });
  console.log(`Found ${found.length} block instances on page`);
  return found;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. beforeTransform — cleanup (chrome, cookie banner, mobile nav)
    executeTransformers('beforeTransform', main, payload);

    // 2. Discover blocks (content-driven, selector-based)
    const pageBlocks = findBlocksOnPage(document);

    // 3. Parse each block via its registered parser
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // already replaced by an earlier parser
      try {
        block.parser(block.element, { document, url, params });
      } catch (e) {
        console.error(`Failed to parse block (${block.selector}):`, e);
      }
    });

    // 4. afterTransform — final cleanup + section breaks/metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path (full localized path without extension). Root maps to /index.
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.selector),
      },
    }];
  },
};
