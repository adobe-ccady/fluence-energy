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

  // tools/importer/import-services.js
  var import_services_exports = {};
  __export(import_services_exports, {
    default: () => import_services_default
  });

  // tools/importer/parsers/services-hero.js
  function parse(element, { document: document2 }) {
    const cells = [];
    const bgImg = element.querySelector(":scope > img") || element.querySelector("img");
    if (bgImg) {
      cells.push([bgImg.cloneNode(true)]);
    } else {
      const style = element.getAttribute("style") || "";
      const m = style.match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
      if (m && m[1]) {
        const img = document2.createElement("img");
        img.src = m[1];
        img.setAttribute("alt", "");
        cells.push([img]);
      }
    }
    const contentCell = [];
    const eyebrow = element.querySelector(".banner-title p.h4, .banner-title p, p.h4");
    if (eyebrow && eyebrow.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = eyebrow.textContent.trim();
      contentCell.push(p);
    }
    const heading = element.querySelector(".banner-title h1, h1");
    if (heading && heading.textContent.trim()) {
      const h1 = document2.createElement("h1");
      h1.textContent = heading.textContent.trim();
      contentCell.push(h1);
    }
    if (contentCell.length) cells.push([contentCell]);
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "Hero",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/services-columns-about.js
  function parse2(element, { document: document2 }) {
    const columns = [...element.children].filter((c) => c.classList.contains("l-column-item"));
    const src = columns.length ? columns : [...element.children];
    const buildCell = (col) => {
      const wrap = col.querySelector(".page-content") || col;
      const img = wrap.querySelector("img");
      if (img) {
        const p = document2.createElement("p");
        p.appendChild(img.cloneNode(true));
        return [p];
      }
      const parts = [];
      [...wrap.children].forEach((child) => {
        const tag = child.tagName.toLowerCase();
        if (/^h[1-6]$/.test(tag)) {
          if (child.textContent.trim()) parts.push(child.cloneNode(true));
        } else if (tag === "p") {
          if (child.textContent.trim() || child.querySelector("a, img")) {
            parts.push(child.cloneNode(true));
          }
        } else if (tag === "ul" || tag === "ol") {
          if (child.querySelector("li")) parts.push(child.cloneNode(true));
        }
      });
      return parts;
    };
    const row = src.map((col) => buildCell(col));
    if (!row.some((cell) => cell.length)) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "Columns",
      variants: ["columns-about"],
      cells: [row]
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/services-columns-promo.js
  var normalize = (text) => (text || "").trim().replace(/\s+/g, " ").toLowerCase();
  function parse3(element, { document: document2 }) {
    const section = element.closest("section") || element;
    const items = [...section.querySelectorAll(".l-columns--3 .l-column-item, .l-columns--4 .l-column-item")];
    const source = items.length ? items : [...element.children];
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    source.forEach((item) => {
      const wrap = item.querySelector(".page-content") || item;
      const cell = [];
      const icon = wrap.querySelector("img");
      if (icon) {
        const p = document2.createElement("p");
        p.appendChild(icon.cloneNode(true));
        cell.push(p);
      }
      const title = wrap.querySelector("h3, h4");
      let titleText = "";
      if (title && title.textContent.trim()) {
        titleText = title.textContent.trim();
        const h3 = document2.createElement("h3");
        const titleLink = title.querySelector("a[href]");
        if (titleLink) {
          const a = document2.createElement("a");
          a.href = titleLink.getAttribute("href");
          const target = titleLink.getAttribute("target");
          if (target) a.setAttribute("target", target);
          a.textContent = titleText;
          h3.appendChild(a);
        } else {
          h3.textContent = titleText;
        }
        cell.push(h3);
      }
      let descText = "";
      [...wrap.querySelectorAll(":scope > p")].forEach((p) => {
        if (p.textContent.trim() || p.querySelector("a")) {
          descText += ` ${p.textContent.trim()}`;
          cell.push(p.cloneNode(true));
        }
      });
      const key = normalize(`${titleText}${descText}`);
      if (!key || seen.has(key) || !cell.length) return;
      seen.add(key);
      cells.push(cell);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "Columns",
      variants: ["columns-promo"],
      cells: [cells]
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/services-cards-article.js
  function parse4(element, { document: document2 }) {
    const cards = [...element.querySelectorAll(".card-post")];
    const cells = [];
    cards.forEach((card) => {
      const link = card.querySelector("a[href]");
      const href = link ? link.getAttribute("href") : null;
      const col1 = document2.createElement("div");
      const img = card.querySelector(".card-post__header img, img");
      if (img) {
        col1.appendChild(img.cloneNode(true));
      } else {
        const header = card.querySelector(".card-post__header") || card;
        const style = header.getAttribute("style") || "";
        const m = style.match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
        if (m && m[1]) {
          const bg = document2.createElement("img");
          bg.src = m[1];
          bg.setAttribute("alt", "");
          col1.appendChild(bg);
        }
      }
      const col2 = document2.createElement("div");
      const headline = card.querySelector(".card-post__body h4, .card-post__body h3, h4, h3");
      if (headline && headline.textContent.trim()) {
        const h3 = document2.createElement("h3");
        if (href) {
          const a = document2.createElement("a");
          a.href = href;
          const target = link.getAttribute("target");
          if (target) a.setAttribute("target", target);
          a.textContent = headline.textContent.trim();
          h3.appendChild(a);
        } else {
          h3.textContent = headline.textContent.trim();
        }
        col2.appendChild(h3);
      }
      cells.push([col1, col2]);
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
    element.replaceWith(block);
  }

  // tools/importer/transformers/services-cleanup.js
  var SOURCE_URL = "https://fluenceenergy.com/energy-storage-services/";
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        "#masthead",
        ".site-header",
        ".site-header--mobile",
        "#mobile-nav-tray",
        ".mobile-nav-tray",
        ".navigation--mobile",
        "#colophon",
        ".site-footer",
        "a.site-skip-link",
        '[class*="skip-link"]'
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        '[id^="onetrust"]',
        '[class^="ot-"]',
        '[class*="optanon"]',
        '[id^="hs-web-interactives"]',
        '[class^="grecaptcha"]',
        "#g-recaptcha-response",
        "script",
        "noscript",
        "style"
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        "iframe",
        "link",
        "source",
        "noscript"
      ]);
      element.querySelectorAll("img[src]").forEach((img) => {
        const src = img.getAttribute("src");
        if (!src) return;
        if (src.startsWith("data:")) return;
        if (/^https?:\/\//i.test(src)) return;
        try {
          img.setAttribute("src", new URL(src, SOURCE_URL).href);
        } catch (e) {
        }
      });
    }
  }

  // tools/importer/transformers/services-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function resolveSelectorList(selector) {
    if (Array.isArray(selector)) return selector;
    if (typeof selector === "string") return [selector];
    return [];
  }
  function findSectionEl(root, selector) {
    const selectors = resolveSelectorList(selector);
    for (let i = 0; i < selectors.length; i += 1) {
      const el = root.querySelector(selectors[i]);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
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

  // tools/importer/import-services.js
  var A = "#main > article > section";
  var PAGE_TEMPLATE = {
    name: "services",
    description: "Fluence Energy Storage Services page.",
    urls: ["https://fluenceenergy.com/energy-storage-services/"],
    sections: [
      { id: "hero", name: "hero", selector: ["#main header.banner"], style: null, blocks: ["hero"], defaultContent: [] },
      { id: "intro", name: "intro", selector: [`${A}:nth-of-type(1)`], style: null, blocks: [], defaultContent: [`${A}:nth-of-type(1)`] },
      { id: "remote-monitoring", name: "remote-monitoring", selector: [`${A}:nth-of-type(2)`], style: "accent", blocks: [], defaultContent: [`${A}:nth-of-type(2)`] },
      { id: "service-solutions-smart", name: "service-solutions-smart", selector: [`${A}:nth-of-type(3)`], style: null, blocks: ["columns"], defaultContent: [] },
      { id: "service-plans-three", name: "service-plans-three", selector: [`${A}:nth-of-type(4)`], style: null, blocks: ["columns"], defaultContent: [] },
      { id: "complete-service", name: "complete-service", selector: [`${A}:nth-of-type(5)`], style: null, blocks: ["columns"], defaultContent: [] },
      { id: "shared-service", name: "shared-service", selector: [`${A}:nth-of-type(6)`], style: null, blocks: ["columns"], defaultContent: [] },
      { id: "guided-service", name: "guided-service", selector: [`${A}:nth-of-type(7)`], style: null, blocks: ["columns"], defaultContent: [] },
      { id: "delivery-services", name: "delivery-services", selector: [`${A}:nth-of-type(8)`], style: null, blocks: ["columns"], defaultContent: [] },
      { id: "fluence-academy", name: "fluence-academy", selector: [`${A}:nth-of-type(9)`], style: null, blocks: ["columns"], defaultContent: [] },
      { id: "connect-with-us", name: "connect-with-us", selector: [`${A}:nth-of-type(10)`], style: null, blocks: [], defaultContent: [`${A}:nth-of-type(10)`] },
      { id: "want-to-learn-more", name: "want-to-learn-more", selector: [`${A}:nth-of-type(11)`], style: null, blocks: ["cards"], defaultContent: [] }
    ]
  };
  var BLOCK_REGISTRY = [
    { parser: parse, selectors: ["#main > header.banner"] },
    // Two-column text/image promos (about): sections 3,5,6,7,9
    { parser: parse2, selectors: [
      `${A}:nth-of-type(3) .l-columns--2`,
      `${A}:nth-of-type(5) .l-columns--2`,
      `${A}:nth-of-type(6) .l-columns--2`,
      `${A}:nth-of-type(7) .l-columns--2`,
      `${A}:nth-of-type(9) .l-columns--2`
    ] },
    // Promo-tile grids: section 4 (3-up), section 8 (4-up)
    { parser: parse3, selectors: [
      `${A}:nth-of-type(4) .l-columns--3`,
      `${A}:nth-of-type(8) .l-columns--4`
    ] },
    // Blog article cards: section 11
    { parser: parse4, selectors: [
      `${A}:nth-of-type(11) .l-grid`,
      `${A}:nth-of-type(11) .l-columns--3`
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
  var import_services_default = {
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
  return __toCommonJS(import_services_exports);
})();
