/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS — blog article page (reuses existing hero + cards-article variants)
import blogHeroParser from './parsers/blog-hero.js';
import blogCardsArticleParser from './parsers/blog-cards-article.js';

// TRANSFORMER IMPORTS — blog-specific cleanup + section breaks
import blogCleanupTransformer from './transformers/blog-cleanup.js';
import blogSectionsTransformer from './transformers/blog-sections.js';

// PAGE TEMPLATE CONFIGURATION — embedded from page-templates.json (blog template)
const PAGE_TEMPLATE = {
  name: 'blog',
  description: 'Fluence Energy blog article page.',
  urls: ['https://blog.fluenceenergy.com/building-the-power-blueprint-for-tomorrows-ai-factories'],
  sections: [
    { id: 'article-title-banner', name: 'article-title-banner', selector: ['header.banner.banner--single-post'], style: null, blocks: ['hero'], defaultContent: [] },
    { id: 'article-body', name: 'article-body', selector: ['section.section--post-content'], style: null, blocks: [], defaultContent: ['section.section--post-content'] },
    { id: 'author-bio', name: 'author-bio', selector: ['section.post-author-block'], style: 'author', blocks: [], defaultContent: ['section.post-author-block'] },
    { id: 'newsletter-subscribe', name: 'newsletter-subscribe', selector: ['section.fullwidth-column.section:has(.article-subscribe)'], style: 'subscribe', blocks: [], defaultContent: ['section.fullwidth-column.section:has(.article-subscribe)'] },
    { id: 'related-posts', name: 'related-posts', selector: ['section.fullwidth-column.section:has(.recommended-posts)'], style: null, blocks: ['cards'], defaultContent: [] },
    { id: 'most-popular', name: 'most-popular', selector: ['section.fullwidth-column.section:has(.popular-posts)'], style: null, blocks: ['cards'], defaultContent: [] },
  ],
};

// BLOCK REGISTRY — content-driven, anchored by class selectors.
const BLOCK_REGISTRY = [
  { parser: blogHeroParser, selectors: ['header.banner.banner--single-post'] },
  { parser: blogCardsArticleParser, selectors: [
    'section.fullwidth-column.section:has(.recommended-posts)',
    'section.fullwidth-column.section:has(.popular-posts)',
  ] },
];

const transformers = [
  blogCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [blogSectionsTransformer] : []),
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
