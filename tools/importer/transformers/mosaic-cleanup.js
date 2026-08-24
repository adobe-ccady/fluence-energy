/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Fluence Energy — Mosaic page cleanup.
 *
 * Removes non-authorable site chrome and third-party widgets from the Mosaic
 * intelligent-bidding-software page (fluenceenergy.com). This is a NEW,
 * page-namespaced transformer — it does NOT replace fluence-cleanup.js, which
 * the homepage import still depends on.
 *
 * In-scope authorable content lives in #main (main.site-main):
 *   #main > header.banner                 (hero)
 *   #main > .banner-nav-animation-wrap     (market ticker nav)
 *   #main > article                        (the WordPress <section> children)
 * Everything below is site shell / third-party chrome and is stripped.
 *
 * ALL selectors verified against migration-work/mosaic/cleaned.html (captured DOM):
 *   <header id="masthead" class="site-header is-sticky minify-header">   (desktop header + megamenu)
 *   <div class="site-header--mobile">                                    (mobile header)
 *   <div id="mobile-nav-tray" class="mobile-nav-tray">                   (mobile nav tray, sibling of mobile header)
 *   .navigation--mobile / .navigation--mobile-utility                   (mobile nav)
 *   <footer id="colophon" class="site-footer">                          (footer)
 *   <a class="grad-button site-skip-link vh focusable">                 (skip link)
 *   #onetrust-consent-sdk / #onetrust-* / .ot-* / *optanon*             (OneTrust consent SDK)
 *   #hs-web-interactives-* anchors/containers                           (HubSpot web-interactives)
 *   .grecaptcha-* / #g-recaptcha-response                               (reCAPTCHA — defensive; not always present)
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    WebImporter.DOMUtils.remove(element, [
      // --- Desktop header / masthead (OUT OF SCOPE — already migrated) ---
      '#masthead',
      'header#masthead',
      '.site-header',
      // --- Mobile header + nav tray ---
      '.site-header--mobile',
      '#mobile-nav-tray',
      '.mobile-nav-tray',
      '.navigation--mobile',
      '.navigation--mobile-utility',
      // --- Footer / colophon (OUT OF SCOPE — already migrated) ---
      '#colophon',
      'footer#colophon',
      '.site-footer',
      // --- Skip-to-content link ---
      'a.site-skip-link',
      '.site-skip-link',
      '[class*="skip-link"]',
      // --- OneTrust consent SDK ---
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '#onetrust-pc-sdk',
      '[id^="onetrust"]',
      '[class^="ot-"]',
      '[class*="optanon"]',
      // --- HubSpot web-interactives containers/anchors ---
      '[id^="hs-web-interactives"]',
      // --- reCAPTCHA (defensive) ---
      '.grecaptcha-badge',
      '#g-recaptcha-response',
      '[class^="grecaptcha"]',
      // --- Non-authorable head-ish / script elements ---
      'script',
      'noscript',
      'style',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove leftover non-authorable embeds/links block parsers may leave behind.
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'link',
      'source',
      'noscript',
    ]);

    // Resolve relative image URLs to absolute using the source page URL so
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
