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

  // tools/importer/import-nispera.js
  var import_nispera_exports = {};
  __export(import_nispera_exports, {
    default: () => import_nispera_default
  });

  // tools/importer/parsers/nispera-hero.js
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
    const eyebrow = element.querySelector(".banner-title p, p.h4, .banner-title .h4");
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

  // tools/importer/parsers/nispera-columns-split.js
  var normalizeWs = (t) => (t || "").replace(/\s+/g, " ").trim();
  function buildCta(p, document2) {
    const a = p.querySelector("a[href]");
    if (!a) return null;
    const href = a.getAttribute("href");
    if (!href) return null;
    const img = a.querySelector("img");
    let label = normalizeWs(a.textContent);
    if (!label && img) label = normalizeWs(img.getAttribute("alt"));
    if (!label) label = "Learn More";
    const np = document2.createElement("p");
    const na = document2.createElement("a");
    na.href = href;
    const target = a.getAttribute("target");
    if (target) na.setAttribute("target", target);
    na.textContent = label;
    np.appendChild(na);
    return np;
  }
  function collectContent(wrap, document2) {
    const out = [];
    const walk = (node) => {
      [...node.children].forEach((child) => {
        const tag = child.tagName.toLowerCase();
        if (/^h[1-6]$/.test(tag)) {
          const t = normalizeWs(child.textContent);
          if (t) {
            const h = document2.createElement(tag);
            h.textContent = t;
            out.push(h);
          } else {
            const img = child.querySelector("img");
            if (img) {
              const p = document2.createElement("p");
              p.appendChild(img.cloneNode(true));
              out.push(p);
            }
          }
        } else if (tag === "p") {
          const cta = buildCta(child, document2);
          if (cta) {
            out.push(cta);
            return;
          }
          const img = child.querySelector("img");
          if (img && !normalizeWs(child.textContent)) {
            const p = document2.createElement("p");
            p.appendChild(img.cloneNode(true));
            out.push(p);
          } else if (normalizeWs(child.textContent)) {
            out.push(child.cloneNode(true));
          }
        } else if (tag === "ul" || tag === "ol") {
          if (child.querySelector("li")) out.push(child.cloneNode(true));
        } else if (tag === "div") {
          walk(child);
        }
      });
    };
    walk(wrap);
    return out;
  }
  function parseTwoThirds(element, document2) {
    const twoThird = element.querySelector(".col-two-third");
    const oneThird = element.querySelector(".col-one-third");
    const contentCell = collectContent(
      twoThird && twoThird.querySelector(".page-content") || twoThird || element,
      document2
    );
    const otherCell = collectContent(
      oneThird && oneThird.querySelector(".page-content") || oneThird || document2.createElement("div"),
      document2
    );
    const isLeft = element.classList.contains("columns-two-thirds--left");
    return isLeft ? [otherCell, contentCell] : [contentCell, otherCell];
  }
  function parseLColumns(element, document2) {
    const items = [...element.children].filter((c) => c.classList.contains("l-column-item"));
    const src = items.length ? items : [...element.children];
    const cells = src.map((col) => collectContent(
      col.querySelector(".page-content") || col,
      document2
    ));
    const hasCta = element.querySelector("a[href]");
    if (!hasCta) {
      const section = element.closest("section");
      const next = section && section.nextElementSibling;
      if (next && next.tagName === "SECTION") {
        const nextLink = next.querySelector("a[href]");
        const nextHasHeading = next.querySelector("h1, h2, h3, h4, h5, h6");
        if (nextLink && !nextHasHeading) {
          const cta = buildCta(nextLink.closest("p") || nextLink.parentNode || nextLink, document2);
          if (cta) {
            let targetIndex = -1;
            cells.forEach((cell, i) => {
              const isImageOnly = cell.length === 1 && cell[0].tagName === "P" && cell[0].querySelector("img");
              if (!isImageOnly && cell.length) targetIndex = i;
            });
            if (targetIndex === -1) targetIndex = 0;
            cells[targetIndex].push(cta);
            next.remove();
          }
        }
      }
    }
    return cells;
  }
  function parseSplitContent(element, document2) {
    const imageEl = element.querySelector(":scope > .split-image") || element.querySelector(".split-image");
    const contentEl = element.querySelector(":scope > .split-content") || element.querySelector(".split-content");
    const imageCell = [];
    const img = imageEl && imageEl.querySelector("img");
    if (img) {
      const p = document2.createElement("p");
      p.appendChild(img.cloneNode(true));
      imageCell.push(p);
    }
    const textCell = contentEl ? collectContent(contentEl, document2) : [];
    const isLeft = element.classList.contains("split-left");
    return isLeft ? [imageCell, textCell] : [textCell, imageCell];
  }
  function parse2(element, { document: document2 }) {
    let cells;
    if (element.classList.contains("split-content-section") || element.querySelector(":scope > .split-image, :scope > .split-content")) {
      cells = parseSplitContent(element, document2);
    } else if (element.classList.contains("columns-two-thirds") || element.querySelector(".col-two-third, .col-one-third")) {
      cells = parseTwoThirds(element, document2);
    } else {
      cells = parseLColumns(element, document2);
    }
    const row = cells.filter((c) => c && c.length);
    if (!row.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "Columns",
      variants: ["columns-split"],
      cells: [row]
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/nispera-columns-pullquote.js
  function parse3(element, { document: document2 }) {
    const quote = element.querySelector(".quote-block-body p, blockquote p, p");
    const cite = element.querySelector(".quote-block-citation, cite");
    const cell = [];
    if (quote && quote.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = quote.textContent.trim();
      cell.push(p);
    }
    if (cite) {
      const name = cite.querySelector(".quote-name");
      const title = cite.querySelector(".quote-title");
      const parts = [];
      if (name && name.textContent.trim()) parts.push(name.textContent.trim());
      if (title && title.textContent.trim()) parts.push(title.textContent.trim());
      const attribution = parts.length ? parts.join(", ") : cite.textContent.trim();
      if (attribution) {
        const p = document2.createElement("p");
        const em = document2.createElement("em");
        em.textContent = attribution;
        p.appendChild(em);
        cell.push(p);
      }
    }
    if (!cell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "Columns",
      variants: ["columns-pullquote"],
      cells: [[cell]]
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/nispera-cards-feature.js
  var normalize = (text) => (text || "").trim().replace(/\s+/g, " ").toLowerCase();
  function parse4(element, { document: document2 }) {
    const section = element.closest("section") || element;
    const items = [...section.querySelectorAll(".l-column-item")].filter((item) => item.querySelector("h3, h4, h5"));
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    items.forEach((item) => {
      const wrap = item.querySelector(".page-content") || item;
      const body = document2.createElement("div");
      let titleText = "";
      const heading = wrap.querySelector("h3, h4, h5");
      if (heading && heading.textContent.trim()) {
        titleText = heading.textContent.trim();
        const h3 = document2.createElement("h3");
        h3.textContent = titleText;
        body.appendChild(h3);
      }
      let linkText = "";
      const link = wrap.querySelector("a[href]");
      if (link && link.textContent.trim()) {
        linkText = link.textContent.trim();
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = link.getAttribute("href");
        const target = link.getAttribute("target");
        if (target) a.setAttribute("target", target);
        a.textContent = linkText;
        p.appendChild(a);
        body.appendChild(p);
      }
      if (!body.childElementCount) return;
      const key = normalize(`${titleText} ${linkText}`);
      if (seen.has(key)) return;
      seen.add(key);
      cells.push([document2.createElement("div"), body]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "Cards",
      variants: ["cards-feature"],
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/nispera-cards-article.js
  function parse5(element, { document: document2 }) {
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
    element.replaceWith(block);
  }

  // tools/importer/transformers/nispera-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Header / masthead + desktop megamenu
        "#masthead",
        "header#masthead",
        ".site-header",
        // Mobile header + nav tray (siblings, removed explicitly)
        ".site-header--mobile",
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
        // reCAPTCHA (defensive parity with sibling pages)
        ".grecaptcha-badge",
        "#g-recaptcha-response",
        '[class^="grecaptcha"]',
        // Scripts / styles / noscript
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
      let articleSections = element.querySelectorAll("#main > article > section");
      if (!articleSections.length) {
        articleSections = element.querySelectorAll("article > section");
      }
      articleSections.forEach((section) => {
        const hasText = section.textContent && section.textContent.trim().length > 0;
        const hasImg = !!section.querySelector("img");
        const hasLink = !!section.querySelector("a");
        if (!hasText && !hasImg && !hasLink) {
          section.remove();
        }
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

  // tools/importer/transformers/nispera-sections.js
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
        const style = section.style;
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
        const style = section.style;
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

  // tools/importer/import-nispera.js
  var A = "#main > article > section";
  var sp = (n) => `${A}:nth-of-type(${n})`;
  var PAGE_TEMPLATE = {
    name: "nispera",
    description: "Fluence Nispera APM software product page.",
    urls: ["https://fluenceenergy.com/nispera-energy-asset-performance-management-software/"],
    sections: [
      { id: "hero", name: "hero", selector: ["#main > header.banner"], style: null, blocks: ["hero"], defaultContent: [] },
      { id: "intro-apm-stat", name: "intro-apm-stat", selector: [sp(1)], style: null, blocks: ["columns"], defaultContent: [] },
      { id: "one-apm-icons", name: "one-apm-icons", selector: [sp(2)], style: null, blocks: ["cards"], defaultContent: [`${sp(2)} h2`, `${sp(2)} h3`] },
      { id: "quote-vedaschi", name: "quote-vedaschi", selector: [sp(3)], style: null, blocks: ["columns"], defaultContent: [] },
      { id: "spend-less-time", name: "spend-less-time", selector: [sp(4)], style: null, blocks: ["columns"], defaultContent: [] },
      { id: "case-study-lekela", name: "case-study-lekela", selector: [sp(5)], style: "dark", blocks: ["columns"], defaultContent: [] },
      { id: "optimize-downtime", name: "optimize-downtime", selector: [sp(6)], style: null, blocks: ["columns"], defaultContent: [] },
      { id: "savings-incident", name: "savings-incident", selector: [sp(8)], style: null, blocks: ["columns"], defaultContent: [] },
      { id: "quote-spannaus", name: "quote-spannaus", selector: [sp(10)], style: "dark", blocks: ["columns"], defaultContent: [] },
      { id: "streamline-comms", name: "streamline-comms", selector: [sp(11)], style: null, blocks: ["columns"], defaultContent: [] },
      { id: "case-study-aediles", name: "case-study-aediles", selector: [sp(12)], style: "dark", blocks: ["columns"], defaultContent: [] },
      { id: "om-services", name: "om-services", selector: [sp(14)], style: null, blocks: ["columns"], defaultContent: [] },
      { id: "want-to-learn-more", name: "want-to-learn-more", selector: [sp(15)], style: null, blocks: [], defaultContent: [sp(15)] },
      { id: "in-the-news", name: "in-the-news", selector: [sp(16)], style: null, blocks: ["cards"], defaultContent: [`${sp(16)} h2`] }
    ]
  };
  var BLOCK_REGISTRY = [
    { parser: parse, selectors: ["#main > header.banner"] },
    { parser: parse2, selectors: [
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
      `${sp(14)}.split-content-section`
    ] },
    { parser: parse3, selectors: [
      `${sp(3)} blockquote`,
      `${sp(10)} blockquote`
    ] },
    { parser: parse4, selectors: [`${sp(2)} .l-columns--4`] },
    { parser: parse5, selectors: [`${sp(16)} .l-grid`] }
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
  var import_nispera_default = {
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
  return __toCommonJS(import_nispera_exports);
})();
