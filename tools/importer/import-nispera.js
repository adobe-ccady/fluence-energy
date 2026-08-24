/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS — nispera page (reuses existing block variants; page-specific parsers)
import nisperaHeroParser from './parsers/nispera-hero.js';
import nisperaColumnsSplitParser from './parsers/nispera-columns-split.js';
import nisperaColumnsPullquoteParser from './parsers/nispera-columns-pullquote.js';
import nisperaCardsFeatureParser from './parsers/nispera-cards-feature.js';
import nisperaCardsArticleParser from './parsers/nispera-cards-article.js';

// TRANSFORMER IMPORTS — nispera-specific cleanup + section breaks
import nisperaCleanupTransformer from './transformers/nispera-cleanup.js';
import nisperaSectionsTransformer from './transformers/nispera-sections.js';

const A = '#main > article > section';
const sp = (n) => `${A}:nth-of-type(${n})`;

// PAGE TEMPLATE CONFIGURATION — embedded from page-templates.json (nispera template)
const PAGE_TEMPLATE = {
  name: 'nispera',
  description: 'Fluence Nispera APM software product page.',
  urls: ['https://fluenceenergy.com/nispera-energy-asset-performance-management-software/'],
  sections: [
    { id: 'hero', name: 'hero', selector: ['#main > header.banner'], style: null, blocks: ['hero'], defaultContent: [] },
    { id: 'intro-apm-stat', name: 'intro-apm-stat', selector: [sp(1)], style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'one-apm-icons', name: 'one-apm-icons', selector: [sp(2)], style: null, blocks: ['cards'], defaultContent: [`${sp(2)} h2`, `${sp(2)} h3`] },
    { id: 'quote-vedaschi', name: 'quote-vedaschi', selector: [sp(3)], style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'spend-less-time', name: 'spend-less-time', selector: [sp(4)], style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'case-study-lekela', name: 'case-study-lekela', selector: [sp(5)], style: 'dark', blocks: ['columns'], defaultContent: [] },
    { id: 'optimize-downtime', name: 'optimize-downtime', selector: [sp(6)], style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'savings-incident', name: 'savings-incident', selector: [sp(8)], style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'quote-spannaus', name: 'quote-spannaus', selector: [sp(10)], style: 'dark', blocks: ['columns'], defaultContent: [] },
    { id: 'streamline-comms', name: 'streamline-comms', selector: [sp(11)], style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'case-study-aediles', name: 'case-study-aediles', selector: [sp(12)], style: 'dark', blocks: ['columns'], defaultContent: [] },
    { id: 'om-services', name: 'om-services', selector: [sp(14)], style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'want-to-learn-more', name: 'want-to-learn-more', selector: [sp(15)], style: null, blocks: [], defaultContent: [sp(15)] },
    { id: 'in-the-news', name: 'in-the-news', selector: [sp(16)], style: null, blocks: ['cards'], defaultContent: [`${sp(16)} h2`] },
  ],
};

// BLOCK REGISTRY — content-driven, anchored per WordPress section (nth-of-type).
// The three split-container markups (.columns-two-thirds, .l-columns--2,
// .split-content-section) all route to the same columns-split parser.
const BLOCK_REGISTRY = [
  { parser: nisperaHeroParser, selectors: ['#main > header.banner'] },
  { parser: nisperaColumnsSplitParser, selectors: [
    `${sp(1)} .columns-two-thirds`,
    `${sp(4)} .l-columns--2`,
    // Sections 5, 8, 12, 14 are themselves `section.split-content-section`
    // (the .split-content-section class is ON the section, not a descendant),
    // so target the section element directly.
    `${sp(5)}.split-content-section`,
    `${sp(6)} .l-columns--2`,
    `${sp(8)}.split-content-section`,
    `${sp(11)} .l-columns--2`,
    `${sp(12)}.split-content-section`,
    `${sp(14)}.split-content-section`,
  ] },
  { parser: nisperaColumnsPullquoteParser, selectors: [
    `${sp(3)} blockquote`,
    `${sp(10)} blockquote`,
  ] },
  { parser: nisperaCardsFeatureParser, selectors: [`${sp(2)} .l-columns--4`] },
  { parser: nisperaCardsArticleParser, selectors: [`${sp(16)} .l-grid`] },
];

const transformers = [
  nisperaCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [nisperaSectionsTransformer] : []),
];

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

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      try {
        block.parser(block.element, { document, url, params });
      } catch (e) {
        console.error(`Failed to parse block (${block.selector}):`, e);
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

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
