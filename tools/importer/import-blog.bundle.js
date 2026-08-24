/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-blog.js
  var import_blog_exports = {};
  __export(import_blog_exports, {
    default: () => import_blog_default
  });

  // tools/importer/parsers/blog-hero.js
  function parse(element, { document: document2 }) {
    const cells = [];
    cells.push([document2.createElement("div")]);
    const contentCell = [];
    const dateEyebrow = element.querySelector(".banner-pre-title, .banner-title h4:first-child");
    if (dateEyebrow && dateEyebrow.textContent.trim()) {
      const h4 = document2.createElement("h4");
      h4.textContent = dateEyebrow.textContent.trim();
      contentCell.push(h4);
    }
    const headline = element.querySelector(".banner-title h1, h1");
    if (headline && headline.textContent.trim()) {
      const h1 = document2.createElement("h1");
      h1.textContent = headline.textContent.trim();
      contentCell.push(h1);
    }
    const byline = element.querySelector(".banner-post-title, .banner-title h4:last-child");
    if (byline && byline.textContent.trim() && byline !== dateEyebrow) {
      const h4 = document2.createElement("h4");
      h4.textContent = byline.textContent.trim();
      contentCell.push(h4);
    }
    if (!contentCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "Hero",
      variants: ["hero-blog"],
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/blog-cards-article.js
  function parse2(element, { document: document2 }) {
    const cards = [...element.querySelectorAll(".card-thumb")];
    const cells = [];
    const headingEl = element.querySelector("header h2, h2");
    const headingText = headingEl && headingEl.textContent.trim() ? headingEl.textContent.trim() : "";
    cards.forEach((card) => {
      const link = card.querySelector("a[href]");
      const href = link ? link.getAttribute("href") : null;
      const col1 = document2.createElement("div");
      const img = card.querySelector(".card-thumb-image img, img");
      if (img) {
        col1.appendChild(img.cloneNode(true));
      }
      const col2 = document2.createElement("div");
      const metaEls = card.querySelectorAll(".card-thumb-meta h4, .card-thumb-meta h3");
      metaEls.forEach((meta) => {
        if (meta.textContent.trim()) {
          const h4 = document2.createElement("h4");
          h4.textContent = meta.textContent.trim();
          col2.appendChild(h4);
        }
      });
      const title = card.querySelector(".card-thumb-content h3, .card-thumb-content h2, h3");
      if (title && title.textContent.trim()) {
        const h3 = document2.createElement("h3");
        if (href) {
          const a = document2.createElement("a");
          a.href = href;
          const target = link.getAttribute("target");
          if (target) a.setAttribute("target", target);
          a.textContent = title.textContent.trim();
          h3.appendChild(a);
        } else {
          h3.textContent = title.textContent.trim();
        }
        col2.appendChild(h3);
      }
      if (col1.childNodes.length || col2.childElementCount) {
        cells.push([col1, col2]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "Cards",
      variants: ["cards-article"],
      cells
    });
    const fragment = document2.createDocumentFragment();
    if (headingText) {
      const h2 = document2.createElement("h2");
      h2.textContent = headingText;
      fragment.appendChild(h2);
    }
    fragment.appendChild(block);
    element.replaceWith(fragment);
  }

  // tools/importer/transformers/blog-cleanup.js
  var SOURCE_URL = "https://blog.fluenceenergy.com/building-the-power-blueprint-for-tomorrows-ai-factories";
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        // Site header shell + all nav (NOT the wrapper — see note above)
        "#masthead",
        "header#masthead",
        ".site-header",
        ".site-header--mobile",
        "#mobile-nav-tray",
        ".mobile-nav-tray",
        "nav.navigation--main",
        "nav.navigation--utility",
        "nav.navigation--mobile",
        ".navigation--mobile",
        ".navigation--mobile-utility",
        // Site footer shell
        ".footer-container-wrapper",
        "#colophon",
        "footer#colophon",
        ".site-footer"
      ]);
      WebImporter.DOMUtils.remove(element, [
        // OneTrust consent banner
        "#onetrust-consent-sdk",
        "#onetrust-banner-sdk",
        "#onetrust-pc-sdk",
        '[id^="onetrust"]',
        '[class^="ot-"]',
        '[class*="optanon"]',
        // HubSpot web-interactives anchors
        '[id^="hs-web-interactives"]',
        // reCAPTCHA (newsletter form)
        ".hs_recaptcha",
        ".grecaptcha-badge",
        ".grecaptcha-logo",
        ".grecaptcha-error",
        "#g-recaptcha-response",
        '[class^="grecaptcha"]',
        // Left-rail social-share widget (Share + LinkedIn/Facebook/X)
        ".post-social-share",
        // Scripts / styles / noscript
        "script",
        "noscript",
        "style"
      ]);
      const CTA_MAP = {
        "218250703105": { label: "Download", href: "https://fluenceenergy.com/contact/" },
        "213835778992": { label: "Let's Talk", href: "https://fluenceenergy.com/contact/" }
      };
      element.querySelectorAll('.hs-cta-embed, [class*="hs-cta-embed"]').forEach((embed) => {
        const cls = embed.getAttribute("class") || "";
        const idMatch = cls.match(/hs-cta-embed-(\d+)/);
        const cta = idMatch && CTA_MAP[idMatch[1]];
        let target = embed;
        const parent = embed.parentElement;
        if (parent && /^H[1-6]$/.test(parent.tagName) && parent.textContent.trim() === "" && parent.children.length === 1) {
          target = parent;
        }
        if (cta) {
          const p = element.ownerDocument.createElement("p");
          const a = element.ownerDocument.createElement("a");
          a.href = cta.href;
          a.textContent = cta.label;
          p.appendChild(a);
          target.replaceWith(p);
        } else {
          target.remove();
        }
      });
      const subscribe = element.querySelector(".article-subscribe");
      if (subscribe) {
        const form = subscribe.querySelector("form");
        if (form) {
          const consent = form.querySelector(".legal-consent-container .hs-richtext") || form.querySelector(".legal-consent-container");
          if (consent) {
            form.replaceWith(consent);
          } else {
            form.remove();
          }
        }
      }
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        "iframe",
        "link",
        "source",
        "noscript"
      ]);
      element.querySelectorAll("h1, h2, h3, h4, h5, h6, p").forEach((el) => {
        const hasText = el.textContent && el.textContent.trim().length > 0;
        const hasImg = !!el.querySelector("img");
        const hasLink = !!el.querySelector("a[href]");
        if (!hasText && !hasImg && !hasLink) {
          el.remove();
        }
      });
      const sourceUrl = payload && payload.params && payload.params.originalURL || SOURCE_URL;
      element.querySelectorAll("img[src]").forEach((img) => {
        const src = img.getAttribute("src");
        if (!src) return;
        if (src.startsWith("data:") || src.startsWith("blob:")) return;
        if (/^https?:\/\//i.test(src)) return;
        try {
          img.setAttribute("src", new URL(src, sourceUrl).href);
        } catch (e) {
        }
      });
    }
  }

  // tools/importer/transformers/blog-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function resolveSelectorList(selector) {
    if (Array.isArray(selector)) return selector;
    if (typeof selector === "string") return [selector];
    return [];
  }
  function findSectionEl(root, selector) {
    const selectors = resolveSelectorList(selector);
    for (let i = 0; i < selectors.length; i += 1) {
      try {
        const el = root.querySelector(selectors[i]);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = findSectionEl(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || findSectionEl(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-blog.js
  var PAGE_TEMPLATE = {
    name: "blog",
    description: "Fluence Energy blog article page.",
    urls: ["https://blog.fluenceenergy.com/building-the-power-blueprint-for-tomorrows-ai-factories"],
    sections: [
      { id: "article-title-banner", name: "article-title-banner", selector: ["header.banner.banner--single-post"], style: null, blocks: ["hero"], defaultContent: [] },
      { id: "article-body", name: "article-body", selector: ["section.section--post-content"], style: null, blocks: [], defaultContent: ["section.section--post-content"] },
      { id: "author-bio", name: "author-bio", selector: ["section.post-author-block"], style: "author", blocks: [], defaultContent: ["section.post-author-block"] },
      { id: "newsletter-subscribe", name: "newsletter-subscribe", selector: ["section.fullwidth-column.section:has(.article-subscribe)"], style: "subscribe", blocks: [], defaultContent: ["section.fullwidth-column.section:has(.article-subscribe)"] },
      { id: "related-posts", name: "related-posts", selector: ["section.fullwidth-column.section:has(.recommended-posts)"], style: null, blocks: ["cards"], defaultContent: [] },
      { id: "most-popular", name: "most-popular", selector: ["section.fullwidth-column.section:has(.popular-posts)"], style: null, blocks: ["cards"], defaultContent: [] }
    ]
  };
  var BLOCK_REGISTRY = [
    { parser: parse, selectors: ["header.banner.banner--single-post"] },
    { parser: parse2, selectors: [
      "section.fullwidth-column.section:has(.recommended-posts)",
      "section.fullwidth-column.section:has(.popular-posts)"
    ] }
  ];
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2) {
    const found = [];
    const claimed = [];
    BLOCK_REGISTRY.forEach(({ parser, selectors }) => {
      selectors.forEach((selector) => {
        document2.querySelectorAll(selector).forEach((element) => {
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
  var import_blog_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        try {
          block.parser(block.element, { document: document2, url, params });
        } catch (e) {
          console.error(`Failed to parse block (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.selector)
        }
      }];
    }
  };
  return __toCommonJS(import_blog_exports);
})();
