/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Fluence Energy — Sustainability page cleanup.
 *
 * Removes the same non-authorable fluenceenergy.com site chrome and third-party
 * widgets as the other Fluence pages (header/masthead, mobile nav tray, footer,
 * skip link, OneTrust consent SDK, HubSpot web-interactives, reCAPTCHA, scripts/
 * styles), and strips the Sustainability page's TRULY EMPTY decorative spacer
 * sections while preserving the ones that carry real content.
 *
 * ALL selectors verified against migration-work/sustainability/cleaned.html
 * (captured DOM):
 *   <header id="masthead" class="site-header ...">          (1 match)
 *   .site-header / .site-header--mobile                     (3 matches)
 *   #mobile-nav-tray / .mobile-nav-tray / .navigation--mobile
 *   <footer id="colophon" class="site-footer">              (1 match)
 *   a.site-skip-link / [class*="skip-link"]                 (1 match)
 *   OneTrust #onetrust-* / .ot-* / optanon                  (16 matches)
 *   HubSpot [id^="hs-web-interactives"]                     (8 matches)
 *   grecaptcha (defensive; parity with sibling pages)       (0 matches)
 *
 * EMPTY-SPACER RULE — CRITICAL:
 * The article contains 10 `advanced-full-width` divider sections. Do NOT
 * blanket-remove them: several carry authorable content that must be KEPT —
 *   - nth-of-type(9), (12), (15): each holds a "LEARN MORE" <a> link
 *   - nth-of-type(7), (10), (13): each holds a topic photo <img>
 *   - nth-of-type(16), (17):      contact/report text + <a> links
 * Only nth-of-type(1) is a truly-empty presentation-only spacer.
 *
 * So instead of hardcoding indices, we remove any `#main > article > section`
 * that (after trimming) has EMPTY textContent AND no <img> AND no <a>. This
 * content-driven rule (same as nispera-cleanup) drops only section 1 and keeps
 * every content-bearing spacer automatically.
 *
 * This removal is deferred to afterTransform (NOT beforeTransform): removing
 * sections before block discovery would shift `#main > article > section`
 * nth-of-type() numbering that the import script's section/block selectors rely
 * on. Running it in afterTransform keeps nth-of-type numbering intact during
 * parsing, then cleans the leftover empty divider once parsing is done.
 *
 * Header (#masthead) and footer (#colophon) are OUT OF SCOPE for content import
 * (handled by separate nav/footer workflows) and are removed here.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // --- Non-authorable site chrome & third-party widgets ---------------------
    WebImporter.DOMUtils.remove(element, [
      // Header / masthead + desktop megamenu
      '#masthead',
      'header#masthead',
      '.site-header',
      // Mobile header + nav tray (siblings, removed explicitly)
      '.site-header--mobile',
      '#mobile-nav-tray',
      '.mobile-nav-tray',
      '.navigation--mobile',
      '.navigation--mobile-utility',
      'nav.navigation--utility',
      // Footer / colophon
      '#colophon',
      'footer#colophon',
      '.site-footer',
      // Skip-to-content link
      'a.site-skip-link',
      '.site-skip-link',
      '[class*="skip-link"]',
      // OneTrust consent SDK
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '#onetrust-pc-sdk',
      '[id^="onetrust"]',
      '[class^="ot-"]',
      '[class*="optanon"]',
      // HubSpot web-interactives containers
      '#hs-web-interactives-top-push-anchor',
      '[id^="hs-web-interactives"]',
      // reCAPTCHA (defensive parity with sibling pages)
      '.grecaptcha-badge',
      '#g-recaptcha-response',
      '[class^="grecaptcha"]',
      // Scripts / styles / noscript
      'script',
      'noscript',
      'style',
    ]);

    // NOTE: empty-spacer section removal is deferred to afterTransform (below).
    // Removing sections here (beforeTransform) would shift article > section
    // nth-of-type() numbering BEFORE block discovery/parsing runs, causing the
    // import script's nth-of-type-based section/block selectors to target the
    // wrong sections.
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove leftover non-authorable embeds/links parsers may have left behind.
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'link',
      'source',
      'noscript',
    ]);

    // --- Remove TRULY EMPTY decorative spacer sections ------------------------
    // Deferred here (after block parsing) so nth-of-type numbering is intact
    // during discovery. Any #main > article > section with no visible text AND
    // no <img> and no <a> is a presentation-only divider. On this page only the
    // leading advanced-full-width spacer (nth-of-type(1)) qualifies; every
    // "LEARN MORE" / topic-photo / contact / report spacer is preserved because
    // it still carries an <a> or <img>.
    let articleSections = element.querySelectorAll('#main > article > section');
    if (!articleSections.length) {
      articleSections = element.querySelectorAll('article > section');
    }
    articleSections.forEach((section) => {
      const hasText = section.textContent && section.textContent.trim().length > 0;
      const hasImg = !!section.querySelector('img');
      const hasLink = !!section.querySelector('a');
      if (!hasText && !hasImg && !hasLink) {
        section.remove();
      }
    });

    // Resolve relative image URLs to absolute against the source page URL so
    // downloaded assets round-trip correctly. Runs after block parsing so
    // parser-created images are also resolved.
    const sourceUrl = payload && payload.params && payload.params.originalURL;
    if (sourceUrl) {
      element.querySelectorAll('img').forEach((img) => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('blob:')) {
          try {
            img.setAttribute('src', new URL(src, sourceUrl).href);
          } catch (e) {
            // skip malformed URLs
          }
        }
      });
    }
  }
}
