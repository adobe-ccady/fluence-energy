/* eslint-disable */
/* global WebImporter */

import contactHeroParser from './parsers/contact-hero.js';
import contactCardsInquiryParser from './parsers/contact-cards-inquiry.js';
import contactCardsOfficeParser from './parsers/contact-cards-office.js';

import contactCleanupTransformer from './transformers/contact-cleanup.js';
import contactSectionsTransformer from './transformers/contact-sections.js';

const A = '#main > article > section';
const sp = (n) => `${A}:nth-of-type(${n})`;

const PAGE_TEMPLATE = {
  name: 'contact',
  description: 'Fluence Contact page.',
  urls: ['https://fluenceenergy.com/contact/'],
  sections: [
    { id: 'hero', name: 'hero', selector: ['#main > header.banner'], style: null, blocks: ['hero'], defaultContent: [] },
    { id: 'connect', name: 'connect', selector: [sp(1)], style: null, blocks: ['cards'], defaultContent: [] },
    { id: 'offices-heading', name: 'offices-heading', selector: [sp(2)], style: null, blocks: [], defaultContent: [sp(2)] },
    { id: 'americas', name: 'americas', selector: [sp(3)], style: null, blocks: ['cards'], defaultContent: [] },
    { id: 'emea', name: 'emea', selector: [sp(4)], style: null, blocks: ['cards'], defaultContent: [] },
    { id: 'apac', name: 'apac', selector: [sp(5)], style: null, blocks: ['cards'], defaultContent: [] },
    { id: 'closing', name: 'closing', selector: [sp(6)], style: null, blocks: [], defaultContent: [sp(6)] },
  ],
};

// Office/inquiry tiles span two complementary .l-columns grids per section;
// the parsers collect across all grids and dedup, then detached siblings are
// skipped via the parentNode guard.
const BLOCK_REGISTRY = [
  { parser: contactHeroParser, selectors: ['#main > header.banner'] },
  { parser: contactCardsInquiryParser, selectors: [`${sp(1)} .l-columns`, `${sp(1)} .l-grid`] },
  { parser: contactCardsOfficeParser, selectors: [
    `${sp(3)} .l-columns`, `${sp(3)} .l-grid`,
    `${sp(4)} .l-columns`, `${sp(4)} .l-grid`,
    `${sp(5)} .l-columns`, `${sp(5)} .l-grid`,
  ] },
];

const transformers = [
  contactCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [contactSectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn.call(null, hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
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
      try { block.parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse block (${block.selector}):`, e); }
    });
    executeTransformers('afterTransform', main, payload);
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);
    return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.selector) } }];
  },
};
