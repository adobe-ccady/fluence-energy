/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Fluence Energy cleanup.
 * Removes non-authorable site chrome and third-party widgets from the
 * fluenceenergy.com source pages, and normalizes the hero Owl carousel so the
 * hero parser sees only the 4 real slides.
 *
 * ALL selectors verified against migration-work/cleaned.html (captured DOM).
 * Header (#masthead) and footer (#colophon) are OUT OF SCOPE for content import
 * (handled by separate nav/footer workflows) and are removed here.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // --- Non-authorable site chrome & third-party widgets ---------------------
    // Verified in cleaned.html:
    //   line 124  <header id="masthead" class="site-header ...">   (site header + megamenu)
    //   line 14   <div class="site-header--mobile">                (mobile header)
    //   line 1043 <footer id="colophon" class="site-footer">       (site footer)
    //   line 6    <a class="grad-button site-skip-link vh focusable" href="#main">
    //   line 2    <div id="hs-web-interactives-top-push-anchor" ...> (HubSpot web-interactives)
    //   line 1123 <div id="onetrust-consent-sdk"> + .ot-* elements   (OneTrust consent SDK)
    //   line 1021 .grecaptcha-badge / #g-recaptcha-response          (reCAPTCHA)
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
      // reCAPTCHA
      '.grecaptcha-badge',
      '#g-recaptcha-response',
      '[class^="grecaptcha"]',
      // Scripts / non-authorable head-ish elements
      'script',
      'noscript',
      'style',
    ]);

    // --- Contact CTA: strip the embedded HubSpot newsletter form --------------
    // Keep the "Subscribe" button (a.js-pop-button, line 1012) but remove the
    // embedded form markup (iframe + reCAPTCHA) beneath it.
    //   line 1015 <div class="hubspot-signup-box-container"> ... <iframe class="hs-form-iframe">
    WebImporter.DOMUtils.remove(element, [
      '.hubspot-signup-box-container',
      '.hubspot-signup-box',
      '.hbspt-form',
      '.hs-form-iframe',
    ]);

    // --- Hero Owl carousel normalization --------------------------------------
    // The Owl carousel DUPLICATES slides as .owl-item.cloned (verified lines
    // 552, 560, 600, 608). Remove the clones so only the 4 real .owl-item slides
    // remain. Also remove the presentation-only nav/dots wrappers (lines 618,
    // 626) which are not authorable content.
    WebImporter.DOMUtils.remove(element, [
      '.owl-item.cloned',
      '.owl-nav',
      '.owl-dots',
    ]);

    // Owl adds .owl-stage-outer / .owl-stage / .owl-item wrappers with inline
    // transforms (translate3d, width, etc.). Strip those inline styles so the
    // hero parser is not confused by presentation transforms. Selectors verified
    // at lines 550, 551, 568.
    element
      .querySelectorAll('.owl-stage-outer, .owl-stage, .owl-item')
      .forEach((el) => el.removeAttribute('style'));
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove leftover non-authorable embeds/links that block parsers may have
    // left behind (iframes, <link>, <source>). Verified: reCAPTCHA iframes at
    // lines 1018/1023/1031 live inside the contact section.
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'link',
      'source',
      'noscript',
    ]);

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
