/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS — one per Fluence homepage block variant
import heroParser from './parsers/hero.js';
import columnsSplitParser from './parsers/columns-split.js';
import columnsCtaParser from './parsers/columns-cta.js';
import cardsProductParser from './parsers/cards-product.js';
import statsParser from './parsers/stats.js';
import logosParser from './parsers/logos.js';
import announcementsParser from './parsers/announcements.js';

// TRANSFORMER IMPORTS — site-wide cleanup + section breaks
import fluenceCleanupTransformer from './transformers/fluence-cleanup.js';
import fluenceSectionsTransformer from './transformers/fluence-sections.js';

// PAGE TEMPLATE CONFIGURATION — embedded from page-templates.json (homepage template)
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Fluence Energy homepage.',
  urls: ['https://fluenceenergy.com/'],
  blocks: [
    { name: 'hero', instances: ['#main > article.homepage > section.hero.background-video'] },
    { name: 'columns', instances: [
      '#main > article.homepage > section.home-split-block-right',
      '#main > article.homepage > section.home-split-block-left',
      '#main > article.homepage > section.cols-full-bkg--contact',
    ] },
    { name: 'stats', instances: ['#main > article.homepage > section.our-stat-block'] },
    { name: 'logos', instances: ['#main > article.homepage > section.customer-block'] },
    { name: 'cards', instances: ['#main > article.homepage > section.our-system-block'] },
    { name: 'announcements', instances: ['#main > article.homepage > section.resource-block'] },
  ],
  sections: [
    { id: 'hero', name: 'hero', selector: ['#main > article.homepage > section.hero.background-video'], style: null, blocks: ['hero'], defaultContent: [] },
    { id: 'split-data-center', name: 'split-data-center', selector: ['#main > article.homepage > section.home-split-block-right:nth-of-type(2)'], style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'split-energy-storage-solutions', name: 'split-energy-storage-solutions', selector: ['#main > article.homepage > section.home-split-block-left'], style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'split-smartstack', name: 'split-smartstack', selector: ['#main > article.homepage > section.home-split-block-right:nth-of-type(4)'], style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'stats', name: 'stats', selector: ['#main > article.homepage > section.our-stat-block'], style: null, blocks: ['stats'], defaultContent: ['#main > article.homepage > section.our-stat-block h2'] },
    { id: 'customers', name: 'customers', selector: ['#main > article.homepage > section.customer-block'], style: null, blocks: ['logos'], defaultContent: ['#main > article.homepage > section.customer-block h2'] },
    { id: 'products', name: 'products', selector: ['#main > article.homepage > section.our-system-block'], style: null, blocks: ['cards'], defaultContent: ['#main > article.homepage > section.our-system-block h2'] },
    { id: 'announcements', name: 'announcements', selector: ['#main > article.homepage > section.resource-block'], style: 'accent-blue', blocks: ['announcements'], defaultContent: [] },
    { id: 'contact-cta', name: 'contact-cta', selector: ['#main > article.homepage > section.cols-full-bkg--contact'], style: null, blocks: ['columns'], defaultContent: [] },
  ],
};

// BLOCK REGISTRY — content-driven: each entry pairs a parser with the DOM
// selectors that identify it. Detection is purely selector-based (no URL,
// order, or positional assumptions). More specific selectors are listed so a
// section matches exactly one parser. The base "columns" template block maps to
// two distinct parsers (split promo vs. text CTA) resolved here by selector.
const BLOCK_REGISTRY = [
  { parser: heroParser, selectors: ['#main > article.homepage > section.hero.background-video'] },
  { parser: columnsSplitParser, selectors: [
    '#main > article.homepage > section.home-split-block-right',
    '#main > article.homepage > section.home-split-block-left',
  ] },
  { parser: columnsCtaParser, selectors: ['#main > article.homepage > section.cols-full-bkg--contact'] },
  { parser: statsParser, selectors: ['#main > article.homepage > section.our-stat-block'] },
  { parser: logosParser, selectors: ['#main > article.homepage > section.customer-block'] },
  { parser: cardsProductParser, selectors: ['#main > article.homepage > section.our-system-block'] },
  { parser: announcementsParser, selectors: ['#main > article.homepage > section.resource-block'] },
];

// TRANSFORMER REGISTRY — cleanup first, then section breaks/metadata
const transformers = [
  fluenceCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [fluenceSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook.
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform (document.body)
 * @param {Object} payload - { document, url, html, params }
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
 * Each matched element is paired with its parser. Elements already contained
 * within an earlier match are skipped to prevent double-parsing nested blocks.
 * @param {Document} document
 * @returns {Array<{parser: Function, selector: string, element: Element}>}
 */
function findBlocksOnPage(document) {
  const found = [];
  const claimed = [];
  BLOCK_REGISTRY.forEach(({ parser, selectors }) => {
    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        // Skip if nested inside an already-claimed block element
        if (claimed.some((c) => c !== element && c.contains(element))) return;
        // Skip duplicate matches of the same element across selectors
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

    // 1. beforeTransform — initial cleanup (chrome, cookie banners, cloned slides)
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

    // 6. Sanitized path. Map the root/homepage URL to `/index` — a `/` pathname
    //    becomes '' after trailing-slash stripping, which crashes the bundled
    //    importer (`.cwd is not a function`).
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
