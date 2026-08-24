I'll put together a migration plan. First, one scoping question that meaningfully changes the plan.# Fluence Energy Homepage Migration Plan

Migrate `https://fluenceenergy.com/` (homepage only) to AEM Edge Delivery Services with full visual parity across mobile, tablet, and desktop. Visual fidelity is the top priority — all content verbatim, all styling, assets, layout, and interactivity preserved.

> **Note:** This plan is built in Plan mode. Execution (scraping, importing, coding, uploading) requires switching to Execute mode.

## Approach

This follows the project's established EDS migration workflow: scrape the source → analyze page structure → map sections to blocks (reusing the 12 existing blocks + variants where possible, creating new ones only when needed) → generate import infrastructure → run the import → style for visual parity → verify side-by-side. All git operations are handled by the user through the Console UI (never by me).

## Open Considerations

- The source is a modern marketing site (likely React/Next.js) with animations, sticky header, and possibly carousels — some JS-driven scroll effects may not be 1:1 reproducible in EDS and will be flagged explicitly rather than silently approximated.
- Fonts must be identified via `@font-face` / computed styles and self-hosted; any licensed font that can't be redistributed will be flagged.
- New blocks/variants will be created only where the existing inventory (`hero`, `cards`, `columns`, `featured-article`, `gallery`, `faq-list`, `ticker`, `team-profile`, etc.) doesn't cover a section pattern.

## Checklist

### Phase 1 — Capture & Analyze Source
- [ ] Scrape `https://fluenceenergy.com/index.html` (explicit `.html` path per import URL rules) — capture cleaned HTML, metadata, and all images/media
- [ ] Extract computed styles (not just declared CSS) at mobile / tablet / desktop breakpoints: layout, spacing, typography, colors, shadows, gradients
- [ ] Identify every `@font-face` / web font source; collect the actual font files and fallback stacks
- [ ] Download all images/SVGs at full resolution; record dimensions, aspect ratios, alt text, lazy-loading, and background-vs-inline usage
- [ ] Catalog interactivity: sticky header, nav/megamenu behavior, hover/focus states, carousels, accordions, tabs, scroll-triggered animations
- [ ] Document the source's actual responsive breakpoints and how each section reflows

### Phase 2 — Structure & Block Mapping
- [ ] Identify section boundaries and content sequences (two-level analysis: sections → sequences per section)
- [ ] Survey existing block inventory and map each section to an existing block/variant where possible
- [ ] Flag sections needing a NEW block or variant; define the content model (author contract) for each before coding
- [ ] Preserve semantic HTML5 structure and heading hierarchy (single h1, ordered h2/h3…)
- [ ] Define section styles (dark/accent/secondary + narrow/center modifiers) from source CSS classes — content-driven, never hardcoded per page

### Phase 3 — Import Infrastructure
- [ ] Build/extend content-driven block parsers (`BLOCK_REGISTRY`) — detect by DOM selectors, no URL/positional assumptions
- [ ] Build/extend section transformer (`wknd-sections.js` pattern) to derive styles from source classes
- [ ] Bundle the import script (`esbuild --format=iife --global-name=CustomImportScript`)
- [ ] Run the bulk importer against the homepage URL; generate `/content/*.plain.html`
- [ ] Upload all images/media to the DAM/content with clear, consistent naming; reference from there

### Phase 4 — Blocks, Styles & Fonts
- [ ] Create/adjust any new blocks (JS decoration + CSS) following EDS conventions (scoped selectors, mobile-first, min-width 600/900/1200 breakpoints)
- [ ] Self-host fonts via `fonts.css`; preserve exact families, weights, sizes, line-heights, letter-spacing, text-transform, and fallbacks (unquoted font names per Stylelint)
- [ ] Add design tokens (colors, spacing, fonts) to `styles/styles.css` `:root`; reference via CSS custom properties, no hardcoded values
- [ ] Reproduce exact colors for text/bg/border/gradient/shadow and all hover/active/focus states
- [ ] Reproduce layout/spacing/grid/flex at each breakpoint from computed styles
- [ ] Replicate interactivity: sticky header, nav/megamenu, hover transitions, carousels/accordions/tabs, scroll effects (or flag if not reproducible)
- [ ] Preserve all links/CTAs; keep external links as-is; flag internal links needing repointing

### Phase 5 — Verify & Report
- [ ] Run `npm run lint` (and `lint:fix`) — zero lint errors
- [ ] Preview in local dev server; side-by-side visual comparison vs live source at mobile, tablet, desktop
- [ ] Verify accessibility: alt text, color contrast, semantic markup, preserved ARIA
- [ ] Produce a parity checklist confirming fonts, colors, spacing, images, and interactive elements match
- [ ] Explicitly list ANY deviations with reasons (licensed fonts, non-reproducible JS effects, etc.) — no silent approximations

## Deliverables
- Imported homepage content (`/content/index.plain.html`) + nav/footer if part of the homepage
- New/updated blocks (JS + CSS), design tokens in `styles.css`, self-hosted fonts
- Images/media in the content/DAM with consistent naming
- Import parsers/transformers for repeatable re-import
- Final visual-parity checklist + explicit deviations list

---

**Ready to build this?** Switch to Execute mode and I'll start with Phase 1 (scraping and analyzing the source). If you'd like, I can also enable the optional migration plugins (e.g. commerce/forms detection) — just say the word.
