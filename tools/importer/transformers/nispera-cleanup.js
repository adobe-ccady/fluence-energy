/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Fluence Energy — Nispera APM page cleanup.
 *
 * Removes the same non-authorable fluenceenergy.com site chrome and third-party
 * widgets as the other Fluence pages (header/masthead, mobile nav tray, footer,
 * skip link, OneTrust consent SDK, HubSpot web-interactives, reCAPTCHA, scripts/
 * styles), and additionally strips the Nispera page's TRULY EMPTY decorative
 * spacer sections.
 *
 * ALL selectors verified against migration-work/nispera/cleaned.html (captured DOM):
 *   line  124  <header id="masthead" class="site-header is-sticky minify-header">
 *   line   ~14 <div class="site-header--mobile"> / #mobile-nav-tray / .navigation--mobile
 *   line 1034  <footer id="colophon" class="site-footer">
 *   line    6  <a class="... site-skip-link ...">
 *   line 1117  <div id="onetrust-banner-sdk"> and #onetrust-consent-sdk / .ot-* / optanon
 *   HubSpot web-interactives: [id^="hs-web-interactives"]
 *   grecaptcha: [class^="grecaptcha"] / #g-recaptcha-response (defensive; parity with sibling pages)
 *
 * Empty-spacer rule: the article contains several `advanced-full-width` divider
 * sections. Two of them (#main > article > section nth-of-type(9) and (13)) are
 * truly empty — no text, no <img>, no <a>. Section nth-of-type(7) is also an
 * advanced-full-width divider but it holds the "Download the Brochure" image CTA
 * (has an <img> and an <a>) belonging to the optimize-downtime block, so it MUST
 * be preserved. Rather than hardcode indices, we remove any
 * `#main > article > section` that, after trimming, has empty textContent AND
 * contains no <img> and no <a>. This preserves section 7 automatically.
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
    // import script's nth-of-type-based block selectors to target wrong sections.
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
    // no <img> and no <a> is a presentation-only divider. By now the columns
    // parser has moved section 7's brochure CTA into the optimize-downtime
    // block, so section 7 is also empty and gets removed alongside 9/13.
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
