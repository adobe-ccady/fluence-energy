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

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document: document2 }) {
    var _a;
    const cells = [];
    const video = element.querySelector("video.hero-video-bkg, video");
    if (video) {
      const bgCell = [];
      const poster = video.getAttribute("poster");
      if (poster) {
        const img = document2.createElement("img");
        img.src = poster;
        img.setAttribute("alt", "");
        bgCell.push(img);
      }
      const src = video.getAttribute("src") || ((_a = video.querySelector("source")) == null ? void 0 : _a.getAttribute("src"));
      if (src) {
        const a = document2.createElement("a");
        a.href = src;
        a.textContent = src;
        bgCell.push(a);
      }
      if (bgCell.length) cells.push([bgCell]);
    }
    let slides = [...element.querySelectorAll(".hero-carousel .hero-box")];
    if (!slides.length) slides = [...element.querySelectorAll(".hero-box")];
    slides = slides.filter((s) => !s.closest(".cloned"));
    slides.forEach((slide) => {
      const slideCell = [];
      const eyebrow = slide.querySelector("h4");
      if (eyebrow && eyebrow.textContent.trim()) {
        const h4 = document2.createElement("h4");
        h4.textContent = eyebrow.textContent.trim();
        slideCell.push(h4);
      }
      const heading = slide.querySelector("h1, h2, h3");
      if (heading && heading.textContent.trim()) {
        const h1 = document2.createElement("h1");
        h1.textContent = heading.textContent.trim();
        slideCell.push(h1);
      }
      const sub = slide.querySelector("p");
      if (sub && sub.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = sub.textContent.trim();
        slideCell.push(p);
      }
      const cta = slide.querySelector("a");
      if (cta) {
        const a = document2.createElement("a");
        a.className = "button";
        a.href = cta.getAttribute("href");
        const target = cta.getAttribute("target");
        if (target) a.setAttribute("target", target);
        a.textContent = cta.textContent.trim();
        const p = document2.createElement("p");
        p.appendChild(a);
        slideCell.push(p);
      }
      if (slideCell.length) cells.push([slideCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "Hero (hero-carousel)",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-split.js
  function parse2(element, { document: document2 }) {
    const photo = element.querySelector(".photo-block img, .photo-block picture");
    const imageCell = [];
    if (photo) {
      const p = document2.createElement("p");
      p.appendChild(photo.cloneNode(true));
      imageCell.push(p);
    }
    const wrap = element.querySelector(".content-block .split-wrap") || element.querySelector(".content-block") || element;
    const contentCell = [];
    const icon = wrap.querySelector(":scope > img, img");
    if (icon) {
      const p = document2.createElement("p");
      p.appendChild(icon.cloneNode(true));
      contentCell.push(p);
    }
    const heading = wrap.querySelector("h2, h3");
    if (heading && heading.textContent.trim()) {
      const h2 = document2.createElement("h2");
      h2.textContent = heading.textContent.trim();
      contentCell.push(h2);
    }
    const paras = [...wrap.querySelectorAll(":scope > p")];
    paras.forEach((para) => {
      const soleLink = para.querySelector("a.grad-button");
      const isCtaOnly = soleLink && para.textContent.trim() === soleLink.textContent.trim();
      if (isCtaOnly) return;
      if (para.textContent.trim()) contentCell.push(para.cloneNode(true));
    });
    const cta = wrap.querySelector('a.grad-button, a[class*="button"]');
    if (cta) {
      const a = document2.createElement("a");
      a.href = cta.getAttribute("href");
      const target = cta.getAttribute("target");
      if (target) a.setAttribute("target", target);
      const span = cta.querySelector("span");
      a.textContent = (span ? span.textContent : cta.textContent).trim();
      const p = document2.createElement("p");
      p.appendChild(a);
      contentCell.push(p);
    }
    if (!contentCell.length && !imageCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const imageLeft = element.classList.contains("home-split-block-left");
    const row = imageLeft ? [imageCell, contentCell] : [contentCell, imageCell];
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "Columns (columns-split)",
      cells: [row]
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-cta.js
  function parse3(element, { document: document2 }) {
    const columns = [...element.querySelectorAll(":scope > .cols-full-bkg-item")];
    const row = [];
    columns.forEach((column) => {
      const wrap = column.querySelector(".cols-full-bkg-wrap") || column;
      const cell = [];
      const heading = wrap.querySelector("h2, h3");
      if (heading && heading.textContent.trim()) {
        const h2 = document2.createElement("h2");
        h2.textContent = heading.textContent.trim();
        cell.push(h2);
      }
      const para = wrap.querySelector("p");
      if (para && para.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = para.textContent.trim();
        cell.push(p);
      }
      const cta = wrap.querySelector("a.grad-button, a[href]");
      if (cta) {
        const a = document2.createElement("a");
        a.href = cta.getAttribute("href");
        const target = cta.getAttribute("target");
        if (target) a.setAttribute("target", target);
        const span = cta.querySelector("span");
        a.textContent = (span ? span.textContent : cta.textContent).trim();
        const p = document2.createElement("p");
        p.appendChild(a);
        cell.push(p);
      }
      row.push(cell);
    });
    if (!row.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "Columns (columns-cta)",
      cells: [row]
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product.js
  function parse4(element, { document: document2 }) {
    const items = [...element.querySelectorAll(".our-system-item")];
    const cells = [];
    items.forEach((item) => {
      const imageCell = [];
      const img = item.querySelector(".item-header img, img");
      if (img) {
        const p = document2.createElement("p");
        p.appendChild(img.cloneNode(true));
        imageCell.push(p);
      }
      const bodyCell = [];
      const name = item.querySelector(".item-body p, p");
      if (name && name.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = name.textContent.trim();
        bodyCell.push(p);
      }
      const cta = item.querySelector("a.grad-button, a[href]");
      if (cta) {
        const a = document2.createElement("a");
        a.href = cta.getAttribute("href");
        const target = cta.getAttribute("target");
        if (target) a.setAttribute("target", target);
        const span = cta.querySelector("span");
        a.textContent = (span ? span.textContent : cta.textContent).trim();
        const p = document2.createElement("p");
        p.appendChild(a);
        bodyCell.push(p);
      }
      cells.push([imageCell, bodyCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "Cards (cards-product)",
      cells
    });
    const fragment = document2.createDocumentFragment();
    const header = element.querySelector(".section-header");
    if (header) {
      const heading = header.querySelector("h1, h2");
      if (heading) {
        const h2 = document2.createElement("h2");
        h2.textContent = heading.textContent.trim();
        fragment.appendChild(h2);
      }
      const intro = header.querySelector("p");
      if (intro && intro.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = intro.textContent.trim();
        fragment.appendChild(p);
      }
    }
    fragment.appendChild(block);
    element.replaceWith(fragment);
  }

  // tools/importer/parsers/stats.js
  function parse5(element, { document: document2 }) {
    const items = [...element.querySelectorAll(".our-stat-item")];
    const cells = [];
    items.forEach((item) => {
      const cell = [];
      const img = item.querySelector("img");
      if (img) {
        const p = document2.createElement("p");
        p.appendChild(img.cloneNode(true));
        cell.push(p);
      }
      const odometer = item.querySelector("[data-animate-number]");
      const heading = item.querySelector("h1, h2, h3, h4, h5, h6");
      const number = odometer ? odometer.getAttribute("data-animate-number") : heading ? heading.textContent.replace(/[^\d]/g, "") : "";
      if (number) {
        const h3 = document2.createElement("h3");
        h3.textContent = number;
        cell.push(h3);
      }
      const label = item.querySelector("p");
      if (label && label.textContent.trim()) {
        const p = document2.createElement("p");
        p.innerHTML = label.innerHTML;
        cell.push(p);
      }
      if (cell.length) cells.push([cell]);
    });
    const footnote = element.querySelector(".number-animation-block-footer p");
    if (footnote && footnote.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = footnote.textContent.trim();
      cells.push([[p]]);
    }
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "stats",
      cells
    });
    const fragment = document2.createDocumentFragment();
    const sectionHeading = element.querySelector("h1, h2");
    if (sectionHeading) fragment.appendChild(sectionHeading.cloneNode(true));
    fragment.appendChild(block);
    element.replaceWith(fragment);
  }

  // tools/importer/parsers/logos.js
  function parse6(element, { document: document2 }) {
    const items = [...element.querySelectorAll(".l-grid-item")];
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector("img");
      if (!img) return;
      const link = item.querySelector("a[href]");
      if (link) {
        const a = document2.createElement("a");
        a.href = link.getAttribute("href");
        const target = link.getAttribute("target");
        if (target) a.setAttribute("target", target);
        a.appendChild(img.cloneNode(true));
        cells.push([[a]]);
      } else {
        cells.push([[img.cloneNode(true)]]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "logos",
      cells
    });
    const fragment = document2.createDocumentFragment();
    const sectionHeading = element.querySelector("h1, h2");
    if (sectionHeading) fragment.appendChild(sectionHeading.cloneNode(true));
    fragment.appendChild(block);
    element.replaceWith(fragment);
  }

  // tools/importer/parsers/announcements.js
  function parse7(element, { document: document2 }) {
    const cells = [];
    const left = element.querySelector(".resource-block-left");
    if (left) {
      const cell = [];
      const eyebrow = left.querySelector("h4");
      if (eyebrow && eyebrow.textContent.trim()) {
        const h4 = document2.createElement("h4");
        h4.textContent = eyebrow.textContent.trim();
        cell.push(h4);
      }
      const heading = left.querySelector("h3, h2");
      if (heading && heading.textContent.trim()) {
        const h3 = document2.createElement("h3");
        h3.textContent = heading.textContent.trim();
        cell.push(h3);
      }
      const para = left.querySelector("p");
      if (para && para.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = para.textContent.trim();
        cell.push(p);
      }
      const cta = left.querySelector("a.button, a[href]");
      if (cta) {
        const a = document2.createElement("a");
        a.className = "button";
        a.href = cta.getAttribute("href");
        const target = cta.getAttribute("target");
        if (target) a.setAttribute("target", target);
        a.textContent = cta.textContent.trim();
        const p = document2.createElement("p");
        p.appendChild(a);
        cell.push(p);
      }
      if (cell.length) cells.push([cell]);
    }
    const items = [...element.querySelectorAll(".resource-block-right .post-item")];
    items.forEach((item) => {
      const link = item.querySelector("a[href]");
      const href = link ? link.getAttribute("href") : null;
      const target = link ? link.getAttribute("target") : null;
      const cell = [];
      const category = item.querySelector("h4");
      if (category && category.textContent.trim()) {
        const h4 = document2.createElement("h4");
        h4.textContent = category.textContent.trim();
        cell.push(h4);
      }
      const title = item.querySelector("h3, h2");
      if (title && title.textContent.trim()) {
        const h3 = document2.createElement("h3");
        if (href) {
          const a = document2.createElement("a");
          a.href = href;
          if (target) a.setAttribute("target", target);
          a.textContent = title.textContent.trim();
          h3.appendChild(a);
        } else {
          h3.textContent = title.textContent.trim();
        }
        cell.push(h3);
      }
      if (cell.length) cells.push([cell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "announcements",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/transformers/fluence-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Header / masthead
        "#masthead",
        "header#masthead",
        ".site-header",
        ".site-header--mobile",
        // Mobile navigation tray (sibling of .site-header--mobile, NOT nested — so
        // it survives removal of .site-header--mobile and must be removed explicitly)
        "#mobile-nav-tray",
        ".mobile-nav-tray",
        ".navigation--mobile",
        ".navigation--mobile-utility",
        "nav.navigation--utility",
        // Footer / colophon
        "#colophon",
        "footer#colophon",
        ".site-footer",
        // Skip-to-content link
        "a.site-skip-link",
        ".site-skip-link",
        '[class*="skip-link"]',
        // OneTrust consent SDK
        "#onetrust-consent-sdk",
        "#onetrust-banner-sdk",
        "#onetrust-pc-sdk",
        '[id^="onetrust"]',
        '[class^="ot-"]',
        '[class*="optanon"]',
        // HubSpot web-interactives containers
        "#hs-web-interactives-top-push-anchor",
        '[id^="hs-web-interactives"]',
        // reCAPTCHA
        ".grecaptcha-badge",
        "#g-recaptcha-response",
        '[class^="grecaptcha"]',
        // Scripts / non-authorable head-ish elements
        "script",
        "noscript",
        "style"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".hubspot-signup-box-container",
        ".hubspot-signup-box",
        ".hbspt-form",
        ".hs-form-iframe"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".owl-item.cloned",
        ".owl-nav",
        ".owl-dots"
      ]);
      element.querySelectorAll(".owl-stage-outer, .owl-stage, .owl-item").forEach((el) => el.removeAttribute("style"));
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "iframe",
        "link",
        "source",
        "noscript"
      ]);
      const sourceUrl = payload && payload.params && payload.params.originalURL;
      if (sourceUrl) {
        element.querySelectorAll("img").forEach((img) => {
          const src = img.getAttribute("src");
          if (src && !src.startsWith("http") && !src.startsWith("data:") && !src.startsWith("blob:")) {
            try {
              img.setAttribute("src", new URL(src, sourceUrl).href);
            } catch (e) {
            }
          }
        });
      }
    }
  }

  // tools/importer/transformers/fluence-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  var SKIP_METADATA_IDS = /* @__PURE__ */ new Set(["hero", "announcements"]);
  function firstSelector(selector) {
    if (Array.isArray(selector)) return selector.find((s) => typeof s === "string" && s.length);
    return selector;
  }
  function metadataStyleFor(section) {
    if (!section.style) return null;
    if (SKIP_METADATA_IDS.has(section.id)) return null;
    return section.style;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const style = metadataStyleFor(section);
        if (i === 0 && !style) continue;
        const sel = firstSelector(section.selector);
        if (!sel) continue;
        const sectionEl = element.querySelector(sel);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const style = metadataStyleFor(section);
        if (!style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const sel = firstSelector(section.selector);
        const anchor = marker || (sel ? element.querySelector(sel) : null);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Fluence Energy homepage.",
    urls: ["https://fluenceenergy.com/"],
    blocks: [
      { name: "hero", instances: ["#main > article.homepage > section.hero.background-video"] },
      { name: "columns", instances: [
        "#main > article.homepage > section.home-split-block-right",
        "#main > article.homepage > section.home-split-block-left",
        "#main > article.homepage > section.cols-full-bkg--contact"
      ] },
      { name: "stats", instances: ["#main > article.homepage > section.our-stat-block"] },
      { name: "logos", instances: ["#main > article.homepage > section.customer-block"] },
      { name: "cards", instances: ["#main > article.homepage > section.our-system-block"] },
      { name: "announcements", instances: ["#main > article.homepage > section.resource-block"] }
    ],
    sections: [
      { id: "hero", name: "hero", selector: ["#main > article.homepage > section.hero.background-video"], style: null, blocks: ["hero"], defaultContent: [] },
      { id: "split-data-center", name: "split-data-center", selector: ["#main > article.homepage > section.home-split-block-right:nth-of-type(2)"], style: null, blocks: ["columns"], defaultContent: [] },
      { id: "split-energy-storage-solutions", name: "split-energy-storage-solutions", selector: ["#main > article.homepage > section.home-split-block-left"], style: null, blocks: ["columns"], defaultContent: [] },
      { id: "split-smartstack", name: "split-smartstack", selector: ["#main > article.homepage > section.home-split-block-right:nth-of-type(4)"], style: null, blocks: ["columns"], defaultContent: [] },
      { id: "stats", name: "stats", selector: ["#main > article.homepage > section.our-stat-block"], style: null, blocks: ["stats"], defaultContent: ["#main > article.homepage > section.our-stat-block h2"] },
      { id: "customers", name: "customers", selector: ["#main > article.homepage > section.customer-block"], style: null, blocks: ["logos"], defaultContent: ["#main > article.homepage > section.customer-block h2"] },
      { id: "products", name: "products", selector: ["#main > article.homepage > section.our-system-block"], style: null, blocks: ["cards"], defaultContent: ["#main > article.homepage > section.our-system-block h2"] },
      { id: "announcements", name: "announcements", selector: ["#main > article.homepage > section.resource-block"], style: "accent-blue", blocks: ["announcements"], defaultContent: [] },
      { id: "contact-cta", name: "contact-cta", selector: ["#main > article.homepage > section.cols-full-bkg--contact"], style: null, blocks: ["columns"], defaultContent: [] }
    ]
  };
  var BLOCK_REGISTRY = [
    { parser: parse, selectors: ["#main > article.homepage > section.hero.background-video"] },
    { parser: parse2, selectors: [
      "#main > article.homepage > section.home-split-block-right",
      "#main > article.homepage > section.home-split-block-left"
    ] },
    { parser: parse3, selectors: ["#main > article.homepage > section.cols-full-bkg--contact"] },
    { parser: parse5, selectors: ["#main > article.homepage > section.our-stat-block"] },
    { parser: parse6, selectors: ["#main > article.homepage > section.customer-block"] },
    { parser: parse4, selectors: ["#main > article.homepage > section.our-system-block"] },
    { parser: parse7, selectors: ["#main > article.homepage > section.resource-block"] }
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
  var import_homepage_default = {
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
  return __toCommonJS(import_homepage_exports);
})();
