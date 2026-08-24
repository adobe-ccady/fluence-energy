/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Fluence Energy — Contact page cleanup.
 * Removes non-authorable site chrome and third-party widgets from the
 * fluenceenergy.com Contact page. Identical site-chrome removal to the other
 * Fluence page transformers (fluence-/mosaic-/services-/nispera-/sustainability-).
 *
 * ALL selectors verified against migration-work/contact/cleaned.html (captured DOM).
 * Header (#masthead) and footer (#colophon) are OUT OF SCOPE for content import
 * (handled by separate nav/footer workflows) and are removed here.
 *
 * Verified in cleaned.html:
 *   line 2    <div id="hs-web-interactives-top-push-anchor" ...>        (HubSpot web-interactives)
 *   line 6    <a class="grad-button site-skip-link vh focusable" ...>    (skip-to-content link)
 *   line 14   <div class="site-header--mobile">                          (mobile header)
 *   line 30   <div id="mobile-nav-tray" class="mobile-nav-tray">         (mobile nav tray, sibling)
 *   line 37   <nav class="navigation--mobile ...">                       (mobile nav)
 *   line 89   <... class="navigation--mobile-utility">                   (mobile utility nav)
 *   line 124  <header id="masthead" class="site-header ...">            (site header + megamenu)
 *   line 890  <footer id="colophon" class="site-footer">               (site footer)
 *   line 970  <div id="onetrust-consent-sdk"> + .ot-* / optanon        (OneTrust consent SDK)
 *   line 1219 <iframe class="ot-text-resize" ...>                        (OneTrust iframe)
 *   Analysis: 4 OneTrust <iframe> tags rendered after </main> — the
 *   [class^="ot-"]/[id^="onetrust"] selectors plus the afterTransform iframe
 *   removal below cover them.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // --- Non-authorable site chrome & third-party widgets ---------------------
    WebImporter.DOMUtils.remove(element, [
      // Header / masthead
      '#masthead',
      'header#masthead',
      '.site-header',
      '.site-header--mobile',
      // Mobile navigation tray (sibling of .site-header--mobile, NOT nested — so
      // it survives removal of .site-header--mobile and must be removed explicitly)
      '#mobile-nav-tray',
      '.mobile-nav-tray',
      '.navigation--mobile',
      '.navigation--mobile-utility',
      // Footer / colophon
      '#colophon',
      'footer#colophon',
      '.site-footer',
      // Skip-to-content link
      'a.site-skip-link',
      '.site-skip-link',
      '[class*="skip-link"]',
      // OneTrust consent SDK (+ cookie banner)
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '#onetrust-pc-sdk',
      '[id^="onetrust"]',
      '[class^="ot-"]',
      '[class*="optanon"]',
      // HubSpot web-interactives containers
      '#hs-web-interactives-top-push-anchor',
      '[id^="hs-web-interactives"]',
      // reCAPTCHA
      '.grecaptcha-badge',
      '#g-recaptcha-response',
      '[class^="grecaptcha"]',
      // Scripts / non-authorable head-ish elements
      'script',
      'noscript',
      'style',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove leftover non-authorable embeds/links that block parsers may have
    // left behind, plus the OneTrust iframes rendered after </main>.
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'link',
      'source',
      'noscript',
    ]);

    // Content-driven empty-spacer removal. Done in afterTransform so it does not
    // disturb the :nth-of-type() section numbering that block parsers and the
    // section transformer rely on. Defensive only — the Contact page has no real
    // spacer sections, but this guards against blank layout sections leaking
    // through as empty EDS sections.
    element
      .querySelectorAll('#main > article > section')
      .forEach((section) => {
        const hasText = section.textContent && section.textContent.trim().length > 0;
        const hasImg = !!section.querySelector('img');
        const hasLink = !!section.querySelector('a');
        if (!hasText && !hasImg && !hasLink) section.remove();
      });

    // Resolve any relative image URLs to absolute using the source page URL so
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
