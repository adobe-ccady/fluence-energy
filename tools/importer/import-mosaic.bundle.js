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

  // tools/importer/import-mosaic.js
  var import_mosaic_exports = {};
  __export(import_mosaic_exports, {
    default: () => import_mosaic_default
  });

  // tools/importer/parsers/mosaic-hero.js
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

  // tools/importer/parsers/mosaic-ticker.js
  function parse2(element, { document: document2 }) {
    const links = [...element.querySelectorAll("ul li a, a[href]")];
    const rows = [];
    links.forEach((link) => {
      const text = link.textContent.trim();
      if (!text) return;
      const a = document2.createElement("a");
      a.href = link.getAttribute("href");
      const target = link.getAttribute("target");
      if (target) a.setAttribute("target", target);
      a.textContent = text;
      rows.push([a]);
    });
    if (!rows.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "ticker",
      cells: rows
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/mosaic-columns-split.js
  function parse3(element, { document: document2 }) {
    const grid = element.querySelector(".columns-two-thirds") || element;
    const contentCol = grid.querySelector(".col-two-third") || grid.children[0];
    const otherCol = grid.querySelector(".col-one-third") || grid.children[1];
    const contentWrap = contentCol ? contentCol.querySelector(".page-content") || contentCol : null;
    const contentCell = [];
    if (contentWrap) {
      [...contentWrap.querySelectorAll(":scope > p")].forEach((p) => {
        if (p.textContent.trim() || p.querySelector("img, a")) {
          contentCell.push(p.cloneNode(true));
        }
      });
    }
    const otherWrap = otherCol ? otherCol.querySelector(".page-content") || otherCol : null;
    const otherCell = [];
    if (otherWrap) {
      const img = otherWrap.querySelector("img");
      if (img) {
        const p = document2.createElement("p");
        p.appendChild(img.cloneNode(true));
        otherCell.push(p);
      } else {
        const heading = otherWrap.querySelector("h1, h2, h3");
        if (heading && heading.textContent.trim()) {
          const h2 = document2.createElement("h2");
          h2.textContent = heading.textContent.trim();
          otherCell.push(h2);
        } else {
          [...otherWrap.querySelectorAll(":scope > p")].forEach((p) => {
            if (p.textContent.trim()) otherCell.push(p.cloneNode(true));
          });
        }
      }
    }
    if (!contentCell.length && !otherCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const isLeft = grid.classList.contains("columns-two-thirds--left") || !!element.querySelector(".columns-two-thirds--left");
    const row = isLeft ? [otherCell, contentCell] : [contentCell, otherCell];
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "Columns",
      variants: ["columns-split"],
      cells: [row]
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/mosaic-columns-pullquote.js
  function parse4(element, { document: document2 }) {
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

  // tools/importer/parsers/mosaic-columns-cta.js
  var normalize = (text) => (text || "").trim().replace(/\s+/g, " ").toLowerCase();
  function parse5(element, { document: document2 }) {
    const section = element.closest("section") || element;
    const items = [...section.querySelectorAll(".l-column-item")].filter((item) => item.querySelector("h4, h3"));
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    items.forEach((item) => {
      const wrap = item.querySelector(".page-content") || item;
      const cell = [];
      const icon = wrap.querySelector("img");
      if (icon) {
        const p = document2.createElement("p");
        p.appendChild(icon.cloneNode(true));
        cell.push(p);
      }
      const titles = [...wrap.querySelectorAll("h4, h3")].filter((h) => h.textContent.trim());
      let titleText = "";
      if (titles.length) {
        titleText = titles[titles.length - 1].textContent.trim();
        const h3 = document2.createElement("h3");
        h3.textContent = titleText;
        cell.push(h3);
      }
      let descText = "";
      [...wrap.querySelectorAll(":scope > p")].forEach((p) => {
        if (p.textContent.trim()) {
          descText += ` ${p.textContent.trim()}`;
          const np = document2.createElement("p");
          np.textContent = p.textContent.trim();
          cell.push(np);
        }
      });
      const key = normalize(`${titleText}${descText}`);
      if (!key || seen.has(key)) return;
      seen.add(key);
      cells.push(cell);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "Columns",
      variants: ["columns-cta"],
      cells: [cells]
    });
    const fragment = document2.createDocumentFragment();
    const prevSection = section.previousElementSibling;
    const heading = prevSection && prevSection.querySelector ? prevSection.querySelector("h2") : null;
    if (heading && heading.textContent.trim()) {
      const h2 = document2.createElement("h2");
      h2.textContent = heading.textContent.trim();
      fragment.appendChild(h2);
    }
    const ctaLink = section.querySelector('a[href*="brochure"], .hs-cta-wrapper a[href]');
    if (ctaLink) {
      const a = document2.createElement("a");
      a.href = ctaLink.getAttribute("href");
      const target = ctaLink.getAttribute("target");
      if (target) a.setAttribute("target", target);
      const ctaImg = ctaLink.querySelector("img");
      if (ctaImg) {
        a.appendChild(ctaImg.cloneNode(true));
      } else {
        a.textContent = ctaLink.textContent.trim() || "Download the Brochure";
      }
      const p = document2.createElement("p");
      p.appendChild(a);
      fragment.appendChild(p);
    }
    fragment.appendChild(block);
    element.replaceWith(fragment);
  }

  // tools/importer/parsers/mosaic-stats.js
  function parse6(element, { document: document2 }) {
    const items = [...element.querySelectorAll(".l-column-item")];
    const cells = [];
    items.forEach((item) => {
      const wrap = item.querySelector(".page-content") || item;
      const img = wrap.querySelector("img");
      const iconCell = document2.createElement("p");
      if (img) iconCell.appendChild(img.cloneNode(true));
      const value = wrap.querySelector("h1, h2, h3, h4, h5, h6");
      const numberCell = document2.createElement("h3");
      if (value && value.textContent.trim()) numberCell.textContent = value.textContent.trim();
      const headings = [...wrap.querySelectorAll("h1, h2, h3, h4, h5, h6")];
      let labelEl = null;
      if (headings.length > 1) {
        labelEl = headings[headings.length - 1];
      } else {
        labelEl = [...wrap.querySelectorAll("p")].filter((p) => !p.querySelector("img")).pop() || null;
      }
      const labelCell = document2.createElement("p");
      if (labelEl && labelEl !== value && labelEl.textContent.trim()) {
        labelCell.textContent = labelEl.textContent.trim();
      }
      if (img || numberCell.textContent || labelCell.textContent) {
        cells.push([iconCell, numberCell, labelCell]);
      }
    });
    const next = element.nextElementSibling;
    const footnote = next && next.querySelector ? next.querySelector("p") : null;
    let footnoteEl = null;
    if (footnote && footnote.textContent.trim()) {
      footnoteEl = document2.createElement("p");
      footnoteEl.textContent = footnote.textContent.trim();
      if (next && next.parentNode) next.remove();
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
    const heading = [...element.querySelectorAll(".section-header h2, header h2, h2")].find((h) => h.textContent.trim());
    if (heading) {
      const h2 = document2.createElement("h2");
      h2.textContent = heading.textContent.trim();
      fragment.appendChild(h2);
    }
    fragment.appendChild(block);
    if (footnoteEl) fragment.appendChild(footnoteEl);
    element.replaceWith(fragment);
  }

  // tools/importer/parsers/mosaic-cards-feature.js
  var normalize2 = (text) => (text || "").trim().replace(/\s+/g, " ").toLowerCase();
  function parse7(element, { document: document2 }) {
    const section = element.closest("section") || element;
    const items = [...section.querySelectorAll(".l-column-item")].filter((item) => item.querySelector("h4, h3, p"));
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    items.forEach((item) => {
      const wrap = item.querySelector(".page-content") || item;
      const row = document2.createElement("div");
      let titleText = "";
      const heading = wrap.querySelector("h3, h4, h5");
      if (heading && heading.textContent.trim()) {
        titleText = heading.textContent.trim();
        const h3 = document2.createElement("h3");
        h3.textContent = titleText;
        row.appendChild(h3);
      }
      let descText = "";
      const desc = wrap.querySelector("p");
      if (desc && desc.textContent.trim()) {
        descText = desc.textContent.trim();
        const p = document2.createElement("p");
        p.textContent = descText;
        row.appendChild(p);
      }
      if (!row.childElementCount) return;
      const key = normalize2(`${titleText} ${descText}`);
      if (seen.has(key)) return;
      seen.add(key);
      const imageCell = document2.createElement("div");
      cells.push([imageCell, row]);
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
    section.querySelectorAll(".l-columns--3").forEach((grid) => {
      if (grid !== element && grid.parentNode) grid.remove();
    });
    const fragment = document2.createDocumentFragment();
    const prevSection = section.previousElementSibling;
    if (prevSection && prevSection.querySelector) {
      const h2 = prevSection.querySelector("h2");
      if (h2 && h2.textContent.trim()) {
        const nh2 = document2.createElement("h2");
        nh2.textContent = h2.textContent.trim();
        fragment.appendChild(nh2);
      }
      const h3 = prevSection.querySelector("h3");
      if (h3 && h3.textContent.trim()) {
        const nh3 = document2.createElement("h3");
        nh3.textContent = h3.textContent.trim();
        fragment.appendChild(nh3);
      }
    }
    fragment.appendChild(block);
    element.replaceWith(fragment);
  }

  // tools/importer/parsers/mosaic-cards-product.js
  function parse8(element, { document: document2 }) {
    const items = [...element.querySelectorAll(".l-column-item")];
    const cells = [];
    items.forEach((item) => {
      const wrap = item.querySelector(".page-content") || item;
      const body = document2.createElement("div");
      const title = wrap.querySelector("h1, h2, h3, h4, h5, h6");
      if (title && title.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = title.textContent.trim();
        body.appendChild(p);
      }
      const paras = [...wrap.querySelectorAll(":scope > p")];
      paras.forEach((para) => {
        const link = para.querySelector("a");
        const isCtaOnly = link && para.textContent.trim() === link.textContent.trim();
        if (isCtaOnly) return;
        if (para.textContent.trim()) {
          const p = document2.createElement("p");
          p.textContent = para.textContent.trim();
          body.appendChild(p);
        }
      });
      const cta = wrap.querySelector("a.button, a.grad-button, a[href]");
      if (cta) {
        const a = document2.createElement("a");
        a.href = cta.getAttribute("href");
        const target = cta.getAttribute("target");
        if (target) a.setAttribute("target", target);
        const span = cta.querySelector("span");
        a.textContent = (span ? span.textContent : cta.textContent).trim();
        const p = document2.createElement("p");
        p.appendChild(a);
        body.appendChild(p);
      }
      if (body.childElementCount) cells.push([document2.createElement("div"), body]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "Cards",
      variants: ["cards-product"],
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/mosaic-cards-article.js
  function parse9(element, { document: document2 }) {
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

  // tools/importer/transformers/mosaic-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        // --- Desktop header / masthead (OUT OF SCOPE — already migrated) ---
        "#masthead",
        "header#masthead",
        ".site-header",
        // --- Mobile header + nav tray ---
        ".site-header--mobile",
        "#mobile-nav-tray",
        ".mobile-nav-tray",
        ".navigation--mobile",
        ".navigation--mobile-utility",
        // --- Footer / colophon (OUT OF SCOPE — already migrated) ---
        "#colophon",
        "footer#colophon",
        ".site-footer",
        // --- Skip-to-content link ---
        "a.site-skip-link",
        ".site-skip-link",
        '[class*="skip-link"]',
        // --- OneTrust consent SDK ---
        "#onetrust-consent-sdk",
        "#onetrust-banner-sdk",
        "#onetrust-pc-sdk",
        '[id^="onetrust"]',
        '[class^="ot-"]',
        '[class*="optanon"]',
        // --- HubSpot web-interactives containers/anchors ---
        '[id^="hs-web-interactives"]',
        // --- reCAPTCHA (defensive) ---
        ".grecaptcha-badge",
        "#g-recaptcha-response",
        '[class^="grecaptcha"]',
        // --- Non-authorable head-ish / script elements ---
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

  // tools/importer/transformers/mosaic-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function findSectionEl(element, selector) {
    const candidates = Array.isArray(selector) ? selector : [selector];
    for (let i = 0; i < candidates.length; i += 1) {
      const sel = candidates[i];
      if (typeof sel === "string" && sel.length) {
        const el = element.querySelector(sel);
        if (el) return el;
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
        const style = section.style || null;
        if (i === 0 && !style) continue;
        const sectionEl = findSectionEl(element, section.selector);
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
        const anchor = marker || findSectionEl(element, section.selector);
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

  // tools/importer/import-mosaic.js
  var PAGE_TEMPLATE = {
    name: "mosaic",
    description: "Fluence Mosaic intelligent bidding software product page.",
    urls: ["https://fluenceenergy.com/mosaic-intelligent-bidding-software/"],
    // Full section objects (with selectors) so the sections transformer can
    // locate boundaries and emit section-metadata (style=dark) for the 3 dark
    // sections. Selectors use nth-of-type on article > section because the
    // WordPress sections share identical class combinations.
    sections: [
      { id: "hero", name: "hero", selector: ["#main > header.banner"], style: null, blocks: ["hero"], defaultContent: [] },
      { id: "market-ticker", name: "market-ticker", selector: ["#main > .banner-nav-animation-wrap"], style: null, blocks: ["ticker"], defaultContent: [] },
      { id: "what-if", name: "what-if", selector: ["#main article > section:nth-of-type(1)"], style: null, blocks: ["columns"], defaultContent: [] },
      { id: "testimonial", name: "testimonial", selector: ["#main article > section.quote-block"], style: "dark", blocks: ["columns"], defaultContent: [] },
      { id: "stats", name: "stats", selector: ["#main article > section:nth-of-type(3)"], style: null, blocks: ["stats"], defaultContent: [] },
      { id: "technology-agnostic", name: "technology-agnostic", selector: ["#main article > section:nth-of-type(5)"], style: "dark", blocks: ["columns"], defaultContent: [] },
      { id: "automates", name: "automates", selector: ["#main article > section:nth-of-type(7)"], style: null, blocks: ["columns"], defaultContent: [] },
      { id: "power-tools", name: "power-tools", selector: ["#main article > section:nth-of-type(9)"], style: null, blocks: ["cards"], defaultContent: [] },
      { id: "markets", name: "markets", selector: ["#main article > section.color-option-4"], style: "dark", blocks: ["cards"], defaultContent: [] },
      { id: "test-drive", name: "test-drive", selector: ["#main article > section:nth-of-type(11)"], style: null, blocks: [], defaultContent: [] },
      { id: "in-the-press", name: "in-the-press", selector: ["#main article > section:nth-of-type(12)"], style: null, blocks: ["cards"], defaultContent: [] }
    ]
  };
  var BLOCK_REGISTRY = [
    { parser: parse, selectors: ["#main > header.banner"] },
    { parser: parse2, selectors: ["#main > .banner-nav-animation-wrap nav.navigation--banner"] },
    // What-if split promo (image right) — article section 1
    { parser: parse3, selectors: [
      "#main article > section:nth-of-type(1) .columns-two-thirds",
      "#main article > section:nth-of-type(5) .columns-two-thirds"
    ] },
    // Pull-quote testimonial — section 2
    { parser: parse4, selectors: ["#main article > section:nth-of-type(2) blockquote"] },
    // 3 icon CTA columns ("Mosaic automates...") — section 7 grid
    { parser: parse5, selectors: ["#main article > section:nth-of-type(7) .l-columns--3"] },
    // Stats row — section 3 (whole; parser pulls the footnote from section 4)
    { parser: parse6, selectors: ["#main article > section:nth-of-type(3)"] },
    // 6 text feature cards ("Power Tools") — section 9 grid(s)
    { parser: parse7, selectors: ["#main article > section:nth-of-type(9) .l-columns--3"] },
    // 3 market tiles ("Energy markets...") — section 10 (color-option-4) grid
    { parser: parse8, selectors: ["#main article > section:nth-of-type(10) .l-columns--3"] },
    // 4-col press article cards — section 12
    { parser: parse9, selectors: ["#main article > section:nth-of-type(12) .l-grid--four-col"] }
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
  var import_mosaic_default = {
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
  return __toCommonJS(import_mosaic_exports);
})();
