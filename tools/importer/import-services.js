/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS — services page (reuses existing block variants; page-specific parsers)
import servicesHeroParser from './parsers/services-hero.js';
import servicesColumnsAboutParser from './parsers/services-columns-about.js';
import servicesColumnsPromoParser from './parsers/services-columns-promo.js';
import servicesCardsArticleParser from './parsers/services-cards-article.js';

// TRANSFORMER IMPORTS — services-specific cleanup + section breaks
import servicesCleanupTransformer from './transformers/services-cleanup.js';
import servicesSectionsTransformer from './transformers/services-sections.js';

const A = '#main > article > section';

// PAGE TEMPLATE CONFIGURATION — embedded from page-templates.json (services template)
const PAGE_TEMPLATE = {
  name: 'services',
  description: 'Fluence Energy Storage Services page.',
  urls: ['https://fluenceenergy.com/energy-storage-services/'],
  sections: [
    { id: 'hero', name: 'hero', selector: ['#main header.banner'], style: null, blocks: ['hero'], defaultContent: [] },
    { id: 'intro', name: 'intro', selector: [`${A}:nth-of-type(1)`], style: null, blocks: [], defaultContent: [`${A}:nth-of-type(1)`] },
    { id: 'remote-monitoring', name: 'remote-monitoring', selector: [`${A}:nth-of-type(2)`], style: 'accent', blocks: [], defaultContent: [`${A}:nth-of-type(2)`] },
    { id: 'service-solutions-smart', name: 'service-solutions-smart', selector: [`${A}:nth-of-type(3)`], style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'service-plans-three', name: 'service-plans-three', selector: [`${A}:nth-of-type(4)`], style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'complete-service', name: 'complete-service', selector: [`${A}:nth-of-type(5)`], style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'shared-service', name: 'shared-service', selector: [`${A}:nth-of-type(6)`], style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'guided-service', name: 'guided-service', selector: [`${A}:nth-of-type(7)`], style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'delivery-services', name: 'delivery-services', selector: [`${A}:nth-of-type(8)`], style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'fluence-academy', name: 'fluence-academy', selector: [`${A}:nth-of-type(9)`], style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'connect-with-us', name: 'connect-with-us', selector: [`${A}:nth-of-type(10)`], style: null, blocks: [], defaultContent: [`${A}:nth-of-type(10)`] },
    { id: 'want-to-learn-more', name: 'want-to-learn-more', selector: [`${A}:nth-of-type(11)`], style: null, blocks: ['cards'], defaultContent: [] },
  ],
};

// BLOCK REGISTRY — content-driven, anchored per WordPress section (nth-of-type,
// 1-indexed on article > section) since sections share class combos.
const BLOCK_REGISTRY = [
  { parser: servicesHeroParser, selectors: ['#main > header.banner'] },
  // Two-column text/image promos (about): sections 3,5,6,7,9
  { parser: servicesColumnsAboutParser, selectors: [
    `${A}:nth-of-type(3) .l-columns--2`,
    `${A}:nth-of-type(5) .l-columns--2`,
    `${A}:nth-of-type(6) .l-columns--2`,
    `${A}:nth-of-type(7) .l-columns--2`,
    `${A}:nth-of-type(9) .l-columns--2`,
  ] },
  // Promo-tile grids: section 4 (3-up), section 8 (4-up)
  { parser: servicesColumnsPromoParser, selectors: [
    `${A}:nth-of-type(4) .l-columns--3`,
    `${A}:nth-of-type(8) .l-columns--4`,
  ] },
  // Blog article cards: section 11
  { parser: servicesCardsArticleParser, selectors: [
    `${A}:nth-of-type(11) .l-grid`,
    `${A}:nth-of-type(11) .l-columns--3`,
  ] },
];

// TRANSFORMER REGISTRY — cleanup first, then section breaks/metadata
const transformers = [
  servicesCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [servicesSectionsTransformer] : []),
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
