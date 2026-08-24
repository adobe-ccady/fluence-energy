/* eslint-disable */
/* global WebImporter */

import sustHeroParser from './parsers/sustainability-hero.js';
import sustColumnsSplitParser from './parsers/sustainability-columns-split.js';
import sustColumnsPullquoteParser from './parsers/sustainability-columns-pullquote.js';
import sustCardsIconParser from './parsers/sustainability-cards-icon.js';
import sustColumnsAboutParser from './parsers/sustainability-columns-about.js';

import sustCleanupTransformer from './transformers/sustainability-cleanup.js';
import sustSectionsTransformer from './transformers/sustainability-sections.js';

const A = '#main > article > section';
const sp = (n) => `${A}:nth-of-type(${n})`;

const PAGE_TEMPLATE = {
  name: 'sustainability',
  description: 'Fluence Sustainability (ESG) page.',
  urls: ['https://fluenceenergy.com/sustainability/'],
  sections: [
    { id: 'hero', name: 'hero', selector: ['#main > header.banner'], style: null, blocks: ['hero'], defaultContent: [] },
    { id: 'story-intro', name: 'story-intro', selector: [sp(2)], style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'ceo-quote', name: 'ceo-quote', selector: [sp(3)], style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'vision-band', name: 'vision-band', selector: [sp(4)], style: 'dark', blocks: [], defaultContent: [sp(4)] },
    { id: 'responsible-sourcing', name: 'responsible-sourcing', selector: [sp(5)], style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'sdg-grid', name: 'sdg-grid', selector: [sp(6)], style: null, blocks: ['cards'], defaultContent: [] },
    { id: 'environment-photo', name: 'environment-photo', selector: [sp(7)], style: null, blocks: [], defaultContent: [sp(7)] },
    { id: 'environment', name: 'environment', selector: [sp(8)], style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'environment-cta', name: 'environment-cta', selector: [sp(9)], style: null, blocks: [], defaultContent: [sp(9)] },
    { id: 'social-photo', name: 'social-photo', selector: [sp(10)], style: null, blocks: [], defaultContent: [sp(10)] },
    { id: 'social', name: 'social', selector: [sp(11)], style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'social-cta', name: 'social-cta', selector: [sp(12)], style: null, blocks: [], defaultContent: [sp(12)] },
    { id: 'governance-photo', name: 'governance-photo', selector: [sp(13)], style: null, blocks: [], defaultContent: [sp(13)] },
    { id: 'governance', name: 'governance', selector: [sp(14)], style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'governance-cta', name: 'governance-cta', selector: [sp(15)], style: null, blocks: [], defaultContent: [sp(15)] },
    { id: 'questions', name: 'questions', selector: [sp(16)], style: 'center', blocks: [], defaultContent: [sp(16)] },
    { id: 'report-docs', name: 'report-docs', selector: [sp(17)], style: 'center', blocks: [], defaultContent: [sp(17)] },
    { id: 'letters-policies', name: 'letters-policies', selector: [sp(18)], style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'forward-looking', name: 'forward-looking', selector: [sp(19)], style: null, blocks: [], defaultContent: [sp(19)] },
  ],
};

const BLOCK_REGISTRY = [
  { parser: sustHeroParser, selectors: ['#main > header.banner'] },
  // Story intro: the section itself is .split-content-section
  { parser: sustColumnsSplitParser, selectors: [`${sp(2)}.split-content-section`] },
  // CEO pull-quote (section 3 .l-columns--2)
  { parser: sustColumnsPullquoteParser, selectors: [`${sp(3)} .l-columns--2`] },
  // Topic splits (sections 5, 8, 11, 14 .l-columns--2)
  { parser: sustColumnsSplitParser, selectors: [
    `${sp(5)} .l-columns--2`,
    `${sp(8)} .l-columns--2`,
    `${sp(11)} .l-columns--2`,
    `${sp(14)} .l-columns--2`,
  ] },
  // SDG icon grid (section 6: spans .l-columns--3 + .l-columns--4)
  { parser: sustCardsIconParser, selectors: [`${sp(6)} .l-columns--3`, `${sp(6)} .l-columns--4`] },
  // Letters & Policies directory (section 18 .l-columns--3)
  { parser: sustColumnsAboutParser, selectors: [`${sp(18)} .l-columns--3`] },
];

const transformers = [
  sustCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sustSectionsTransformer] : []),
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
