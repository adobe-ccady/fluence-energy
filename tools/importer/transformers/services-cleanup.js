/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Fluence services (Energy Storage Services) site-wide cleanup.
 *
 * Removes non-authorable site chrome and third-party widgets, then resolves
 * leftover elements and relative image sources. All selectors verified against
 * migration-work/services/cleaned.html.
 *
 * Source URL: https://fluenceenergy.com/energy-storage-services/
 * Authorable content lives entirely under #main (main.site-main):
 *   #main > header.banner (hero) and #main > article (11 sections).
 */

const SOURCE_URL = 'https://fluenceenergy.com/energy-storage-services/';

const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Site chrome (header/nav/footer) — verified in cleaned.html:
    //   #masthead / .site-header (line 124), .site-header--mobile (line 14),
    //   #mobile-nav-tray / .mobile-nav-tray (line 30), .navigation--mobile (line 37/89),
    //   #colophon / .site-footer (line 889), a.site-skip-link (line 6).
    WebImporter.DOMUtils.remove(element, [
      '#masthead',
      '.site-header',
      '.site-header--mobile',
      '#mobile-nav-tray',
      '.mobile-nav-tray',
      '.navigation--mobile',
      '#colophon',
      '.site-footer',
      'a.site-skip-link',
      '[class*="skip-link"]',
    ]);

    // OneTrust cookie consent (lines 969+), HubSpot web interactives (line 2),
    // grecaptcha, and scripts/styles — all non-authorable.
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '[id^="onetrust"]',
      '[class^="ot-"]',
      '[class*="optanon"]',
      '[id^="hs-web-interactives"]',
      '[class^="grecaptcha"]',
      '#g-recaptcha-response',
      'script',
      'noscript',
      'style',
    ]);
  }

  if (hookName === H.after) {
    // Remove leftover non-authorable elements that may survive block parsing.
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'link',
      'source',
      'noscript',
    ]);

    // Resolve relative image sources to absolute URLs against the source URL,
    // so imported markdown references the correct origin.
    element.querySelectorAll('img[src]').forEach((img) => {
      const src = img.getAttribute('src');
      if (!src) return;
      if (src.startsWith('data:')) return;
      if (/^https?:\/\//i.test(src)) return;
      try {
        img.setAttribute('src', new URL(src, SOURCE_URL).href);
      } catch (e) {
        // leave unchanged if it cannot be resolved
      }
    });
  }
}
