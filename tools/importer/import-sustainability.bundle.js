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

  // tools/importer/import-sustainability.js
  var import_sustainability_exports = {};
  __export(import_sustainability_exports, {
    default: () => import_sustainability_default
  });

  // tools/importer/parsers/sustainability-hero.js
  function parse(element, { document: document2 }) {
    const cells = [];
    const style = element.getAttribute("style") || "";
    const m = style.match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    if (m && m[1]) {
      const img = document2.createElement("img");
      img.src = m[1];
      img.setAttribute("alt", "");
      cells.push([img]);
    } else {
      cells.push([""]);
    }
    const contentCell = [];
    const eyebrow = element.querySelector(".banner-title p, p.h4, .banner-title .h4");
    if (eyebrow && eyebrow.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = eyebrow.textContent.trim();
      contentCell.push(p);
    }
    const heading = element.querySelector(".banner-title h1, h1");
    if (heading) {
      const h1 = document2.createElement("h1");
      h1.innerHTML = heading.innerHTML;
      contentCell.push(h1);
    }
    const sub = element.querySelector(".banner-sub-title h3, .banner-sub-title");
    if (sub && sub.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = sub.textContent.trim();
      contentCell.push(p);
    }
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "Hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/sustainability-columns-split.js
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
          const innerImg = child.querySelector("img");
          if (innerImg && !normalizeWs(child.textContent)) {
            const p = document2.createElement("p");
            p.appendChild(innerImg.cloneNode(true));
            out.push(p);
            return;
          }
          const link = child.querySelector("a[href]");
          if (link) {
            const h = document2.createElement(tag);
            const na = document2.createElement("a");
            na.href = link.getAttribute("href");
            const target = link.getAttribute("target");
            if (target) na.setAttribute("target", target);
            na.textContent = normalizeWs(link.textContent) || normalizeWs(child.textContent);
            h.appendChild(na);
            out.push(h);
            return;
          }
          const t = normalizeWs(child.textContent);
          if (t) {
            const h = document2.createElement(tag);
            h.textContent = t;
            out.push(h);
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
            const p = document2.createElement("p");
            p.textContent = normalizeWs(child.textContent);
            out.push(p);
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
  function parseLColumns(element, document2) {
    const items = [...element.children].filter((c) => c.classList.contains("l-column-item"));
    const src = items.length ? items : [...element.children];
    return src.map((col) => collectContent(col.querySelector(".page-content") || col, document2));
  }
  function parse2(element, { document: document2 }) {
    let cells;
    if (element.classList.contains("split-content-section") || element.querySelector(":scope > .split-image, :scope > .split-content")) {
      cells = parseSplitContent(element, document2);
    } else {
      cells = parseLColumns(element, document2);
    }
    const row = cells.filter((c) => c && c.length);
    if (!row.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "Columns (columns-split)",
      cells: [row]
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/sustainability-columns-pullquote.js
  var normalizeWs2 = (t) => (t || "").replace(/\s+/g, " ").trim();
  function parse3(element, { document: document2 }) {
    const items = [...element.children].filter((c) => c.classList.contains("l-column-item"));
    const src = items.length ? items : [...element.children];
    const imageCell = [];
    const quoteCell = [];
    src.forEach((col) => {
      const wrap = col.querySelector(".page-content") || col;
      const kids = [...wrap.children];
      const loneImg = kids.length === 1 && kids[0].querySelector && kids[0].querySelector("img");
      const img = wrap.querySelector("img");
      if (loneImg && img) {
        const p = document2.createElement("p");
        p.appendChild(img.cloneNode(true));
        imageCell.push(p);
        return;
      }
      kids.forEach((child) => {
        const tag = child.tagName.toLowerCase();
        const text = normalizeWs2(child.textContent);
        if (!text) return;
        const isAttribution = tag === "p" && child.querySelector("strong");
        if (isAttribution) {
          const parts = text.split("\n").map((s) => s.trim()).filter(Boolean);
          const attribution = parts.length > 1 ? parts.join(", ") : text;
          const p = document2.createElement("p");
          const em = document2.createElement("em");
          em.textContent = attribution;
          p.appendChild(em);
          quoteCell.push(p);
        } else if (/^h[1-6]$/.test(tag) || tag === "p") {
          const p = document2.createElement("p");
          p.textContent = text;
          quoteCell.push(p);
        }
      });
    });
    const row = [imageCell, quoteCell].filter((c) => c.length);
    if (!row.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "Columns (columns-pullquote)",
      cells: [row]
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/sustainability-cards-icon.js
  var normalizeWs3 = (t) => (t || "").replace(/\s+/g, " ").trim();
  function parse4(element, { document: document2 }) {
    if (typeof element.isConnected === "boolean" && !element.isConnected) return;
    const section = element.closest("section");
    if (section && section.getAttribute("data-cards-icon-done") === "true") {
      element.remove();
      return;
    }
    const grids = section ? [...section.querySelectorAll(".l-columns--4, .l-columns--3")] : [element];
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    grids.forEach((grid) => {
      const items = [...grid.children].filter((c) => c.classList.contains("l-column-item"));
      const tiles = items.length ? items : [...grid.children];
      tiles.forEach((tile) => {
        const wrap = tile.querySelector(".page-content") || tile;
        const img = wrap.querySelector("img");
        let label = "";
        [...wrap.querySelectorAll("h1, h2, h3, h4, h5, h6")].forEach((h) => {
          const t = normalizeWs3(h.textContent);
          if (t && !label) label = t;
        });
        if (!img && !label) return;
        const key = label.toLowerCase();
        if (key && seen.has(key)) return;
        if (key) seen.add(key);
        const iconCell = document2.createElement("div");
        if (img) {
          const p = document2.createElement("p");
          p.appendChild(img.cloneNode(true));
          iconCell.appendChild(p);
        }
        const labelCell = document2.createElement("div");
        if (label) {
          const h = document2.createElement("h4");
          h.textContent = label;
          labelCell.appendChild(h);
        }
        cells.push([iconCell, labelCell]);
      });
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    if (section) {
      section.setAttribute("data-cards-icon-done", "true");
      grids.forEach((grid) => {
        if (grid !== element) grid.remove();
      });
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "Cards (cards-icon)",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/sustainability-columns-about.js
  var normalizeWs4 = (t) => (t || "").replace(/\s+/g, " ").trim();
  function parse5(element, { document: document2 }) {
    const items = [...element.children].filter((c) => c.classList.contains("l-column-item"));
    const src = items.length ? items : [...element.children];
    const buildCell = (col) => {
      const wrap = col.querySelector(".page-content") || col;
      const parts = [];
      [...wrap.children].forEach((child) => {
        const tag = child.tagName.toLowerCase();
        if (/^h[1-6]$/.test(tag)) {
          const t = normalizeWs4(child.textContent);
          if (t) {
            const h = document2.createElement(tag);
            h.textContent = t;
            parts.push(h);
          }
        } else if (tag === "ul" || tag === "ol") {
          const list = document2.createElement(tag);
          [...child.querySelectorAll(":scope > li")].forEach((li) => {
            const a = li.querySelector("a[href]");
            const label = normalizeWs4(li.textContent);
            if (!label) return;
            const newLi = document2.createElement("li");
            if (a && a.getAttribute("href")) {
              const na = document2.createElement("a");
              na.href = a.getAttribute("href");
              const target = a.getAttribute("target");
              if (target) na.setAttribute("target", target);
              na.textContent = label;
              newLi.appendChild(na);
            } else {
              newLi.textContent = label;
            }
            list.appendChild(newLi);
          });
          if (list.children.length) parts.push(list);
        } else if (tag === "p") {
          if (normalizeWs4(child.textContent) || child.querySelector("a[href]")) {
            parts.push(child.cloneNode(true));
          }
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
      name: "Columns (columns-about)",
      cells: [row]
    });
    element.replaceWith(block);
  }

  // tools/importer/transformers/sustainability-cleanup.js
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

  // tools/importer/transformers/sustainability-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function firstSelector(selector) {
    if (Array.isArray(selector)) return selector.find((s) => typeof s === "string" && s.length);
    return selector;
  }
  function metadataStyleFor(section) {
    return section.style || null;
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

  // tools/importer/import-sustainability.js
  var A = "#main > article > section";
  var sp = (n) => `${A}:nth-of-type(${n})`;
  var PAGE_TEMPLATE = {
    name: "sustainability",
    description: "Fluence Sustainability (ESG) page.",
    urls: ["https://fluenceenergy.com/sustainability/"],
    sections: [
      { id: "hero", name: "hero", selector: ["#main > header.banner"], style: null, blocks: ["hero"], defaultContent: [] },
      { id: "story-intro", name: "story-intro", selector: [sp(2)], style: null, blocks: ["columns"], defaultContent: [] },
      { id: "ceo-quote", name: "ceo-quote", selector: [sp(3)], style: null, blocks: ["columns"], defaultContent: [] },
      { id: "vision-band", name: "vision-band", selector: [sp(4)], style: "dark", blocks: [], defaultContent: [sp(4)] },
      { id: "responsible-sourcing", name: "responsible-sourcing", selector: [sp(5)], style: null, blocks: ["columns"], defaultContent: [] },
      { id: "sdg-grid", name: "sdg-grid", selector: [sp(6)], style: null, blocks: ["cards"], defaultContent: [] },
      { id: "environment-photo", name: "environment-photo", selector: [sp(7)], style: null, blocks: [], defaultContent: [sp(7)] },
      { id: "environment", name: "environment", selector: [sp(8)], style: null, blocks: ["columns"], defaultContent: [] },
      { id: "environment-cta", name: "environment-cta", selector: [sp(9)], style: null, blocks: [], defaultContent: [sp(9)] },
      { id: "social-photo", name: "social-photo", selector: [sp(10)], style: null, blocks: [], defaultContent: [sp(10)] },
      { id: "social", name: "social", selector: [sp(11)], style: null, blocks: ["columns"], defaultContent: [] },
      { id: "social-cta", name: "social-cta", selector: [sp(12)], style: null, blocks: [], defaultContent: [sp(12)] },
      { id: "governance-photo", name: "governance-photo", selector: [sp(13)], style: null, blocks: [], defaultContent: [sp(13)] },
      { id: "governance", name: "governance", selector: [sp(14)], style: null, blocks: ["columns"], defaultContent: [] },
      { id: "governance-cta", name: "governance-cta", selector: [sp(15)], style: null, blocks: [], defaultContent: [sp(15)] },
      { id: "questions", name: "questions", selector: [sp(16)], style: "center", blocks: [], defaultContent: [sp(16)] },
      { id: "report-docs", name: "report-docs", selector: [sp(17)], style: "center", blocks: [], defaultContent: [sp(17)] },
      { id: "letters-policies", name: "letters-policies", selector: [sp(18)], style: null, blocks: ["columns"], defaultContent: [] },
      { id: "forward-looking", name: "forward-looking", selector: [sp(19)], style: null, blocks: [], defaultContent: [sp(19)] }
    ]
  };
  var BLOCK_REGISTRY = [
    { parser: parse, selectors: ["#main > header.banner"] },
    // Story intro: the section itself is .split-content-section
    { parser: parse2, selectors: [`${sp(2)}.split-content-section`] },
    // CEO pull-quote (section 3 .l-columns--2)
    { parser: parse3, selectors: [`${sp(3)} .l-columns--2`] },
    // Topic splits (sections 5, 8, 11, 14 .l-columns--2)
    { parser: parse2, selectors: [
      `${sp(5)} .l-columns--2`,
      `${sp(8)} .l-columns--2`,
      `${sp(11)} .l-columns--2`,
      `${sp(14)} .l-columns--2`
    ] },
    // SDG icon grid (section 6: spans .l-columns--3 + .l-columns--4)
    { parser: parse4, selectors: [`${sp(6)} .l-columns--3`, `${sp(6)} .l-columns--4`] },
    // Letters & Policies directory (section 18 .l-columns--3)
    { parser: parse5, selectors: [`${sp(18)} .l-columns--3`] }
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
  var import_sustainability_default = {
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
  return __toCommonJS(import_sustainability_exports);
})();
