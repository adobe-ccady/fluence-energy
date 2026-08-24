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

  // tools/importer/import-contact.js
  var import_contact_exports = {};
  __export(import_contact_exports, {
    default: () => import_contact_default
  });

  // tools/importer/parsers/contact-hero.js
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

  // tools/importer/parsers/contact-cards-inquiry.js
  function parse2(element, { document: document2 }) {
    const section = element.closest("section") || element.parentElement;
    const grids = [...section.querySelectorAll(".l-columns, .l-grid")].filter((g) => !g.parentElement.closest(".l-columns, .l-grid"));
    const norm = (t) => (t || "").replace(/\s+/g, " ").trim();
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    grids.forEach((grid) => {
      [...grid.querySelectorAll(".l-column-item")].filter((tile) => !tile.parentElement.closest(".l-column-item")).forEach((tile) => {
        const content = tile.querySelector(".page-content") || tile;
        const heading = content.querySelector("h1, h2, h3, h4, h5, h6");
        const paras = [...content.querySelectorAll(":scope > p")];
        const descP = paras.find((p) => !p.querySelector("a[href]"));
        const cta = content.querySelector("a.grad-button[href], a[href]");
        if ((!heading || !heading.textContent.trim()) && !cta) return;
        const key = norm(tile.textContent);
        if (!key || seen.has(key)) return;
        seen.add(key);
        const cell = document2.createElement("div");
        if (heading && heading.textContent.trim()) {
          const h3 = document2.createElement("h3");
          h3.textContent = heading.textContent.trim();
          cell.appendChild(h3);
        }
        if (descP && descP.textContent.trim()) {
          const p = document2.createElement("p");
          p.textContent = descP.textContent.trim();
          cell.appendChild(p);
        }
        if (cta) {
          const p = document2.createElement("p");
          const a = document2.createElement("a");
          a.href = cta.getAttribute("href");
          const target = cta.getAttribute("target");
          if (target) a.setAttribute("target", target);
          a.textContent = norm(cta.textContent) || cta.getAttribute("href");
          p.appendChild(a);
          cell.appendChild(p);
        }
        if (cell.childNodes.length) cells.push([cell]);
      });
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "Cards (cards-inquiry)",
      cells
    });
    element.replaceWith(block);
    grids.forEach((g) => {
      if (g !== element && g.parentNode) g.remove();
    });
  }

  // tools/importer/parsers/contact-cards-office.js
  function parse3(element, { document: document2 }) {
    const section = element.closest("section") || element.parentElement;
    const grids = [...section.querySelectorAll(".l-columns, .l-grid")].filter((g) => !g.parentElement.closest(".l-columns, .l-grid"));
    const norm = (t) => (t || "").replace(/\s+/g, " ").trim();
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    grids.forEach((grid) => {
      [...grid.querySelectorAll(".l-column-item")].filter((tile) => !tile.parentElement.closest(".l-column-item")).forEach((tile) => {
        const content = tile.querySelector(".page-content") || tile;
        const heading = content.querySelector("h1, h2, h3, h4, h5, h6");
        const paras = [...content.querySelectorAll(":scope > p")].filter((p) => p.textContent.trim());
        if ((!heading || !heading.textContent.trim()) && !paras.length) return;
        const key = norm(tile.textContent);
        if (!key || seen.has(key)) return;
        seen.add(key);
        const cell = document2.createElement("div");
        if (heading && heading.textContent.trim()) {
          const h3 = document2.createElement("h3");
          h3.textContent = heading.textContent.trim();
          cell.appendChild(h3);
        }
        paras.forEach((p) => cell.appendChild(p.cloneNode(true)));
        if (cell.childNodes.length) cells.push([cell]);
      });
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "Cards (cards-office)",
      cells
    });
    element.replaceWith(block);
    grids.forEach((g) => {
      if (g !== element && g.parentNode) g.remove();
    });
  }

  // tools/importer/transformers/contact-cleanup.js
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
        // Footer / colophon
        "#colophon",
        "footer#colophon",
        ".site-footer",
        // Skip-to-content link
        "a.site-skip-link",
        ".site-skip-link",
        '[class*="skip-link"]',
        // OneTrust consent SDK (+ cookie banner)
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
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "iframe",
        "link",
        "source",
        "noscript"
      ]);
      element.querySelectorAll("#main > article > section").forEach((section) => {
        const hasText = section.textContent && section.textContent.trim().length > 0;
        const hasImg = !!section.querySelector("img");
        const hasLink = !!section.querySelector("a");
        if (!hasText && !hasImg && !hasLink) section.remove();
      });
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

  // tools/importer/transformers/contact-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function firstSelector(selector) {
    if (Array.isArray(selector)) return selector.find((s) => typeof s === "string" && s.length);
    return selector;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const style = section.style || null;
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
        const style = section.style || null;
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

  // tools/importer/import-contact.js
  var A = "#main > article > section";
  var sp = (n) => `${A}:nth-of-type(${n})`;
  var PAGE_TEMPLATE = {
    name: "contact",
    description: "Fluence Contact page.",
    urls: ["https://fluenceenergy.com/contact/"],
    sections: [
      { id: "hero", name: "hero", selector: ["#main > header.banner"], style: null, blocks: ["hero"], defaultContent: [] },
      { id: "connect", name: "connect", selector: [sp(1)], style: null, blocks: ["cards"], defaultContent: [] },
      { id: "offices-heading", name: "offices-heading", selector: [sp(2)], style: null, blocks: [], defaultContent: [sp(2)] },
      { id: "americas", name: "americas", selector: [sp(3)], style: null, blocks: ["cards"], defaultContent: [] },
      { id: "emea", name: "emea", selector: [sp(4)], style: null, blocks: ["cards"], defaultContent: [] },
      { id: "apac", name: "apac", selector: [sp(5)], style: null, blocks: ["cards"], defaultContent: [] },
      { id: "closing", name: "closing", selector: [sp(6)], style: null, blocks: [], defaultContent: [sp(6)] }
    ]
  };
  var BLOCK_REGISTRY = [
    { parser: parse, selectors: ["#main > header.banner"] },
    { parser: parse2, selectors: [`${sp(1)} .l-columns`, `${sp(1)} .l-grid`] },
    { parser: parse3, selectors: [
      `${sp(3)} .l-columns`,
      `${sp(3)} .l-grid`,
      `${sp(4)} .l-columns`,
      `${sp(4)} .l-grid`,
      `${sp(5)} .l-columns`,
      `${sp(5)} .l-grid`
    ] }
  ];
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn.call(null, hookName, element, enhancedPayload);
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
  var import_contact_default = {
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
      return [{ element: main, path, report: { title: document2.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.selector) } }];
    }
  };
  return __toCommonJS(import_contact_exports);
})();
