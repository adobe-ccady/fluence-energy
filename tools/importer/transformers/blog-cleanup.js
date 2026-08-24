/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Fluence Energy — blog article page cleanup.
 *
 * The blog lives on the HubSpot-hosted subdomain (blog.fluenceenergy.com) so its
 * chrome differs from the WordPress fluenceenergy.com pages, but the intent is
 * the same as the sibling *-cleanup transformers: strip everything an author
 * would NOT create when authoring the article, then resolve leftover elements
 * and relative image sources.
 *
 * ALL selectors verified against migration-work/cleaned.html (captured DOM):
 *   line   6  <div class="header-container-wrapper">            (site header shell)
 *   line  18  <div class="site-header--mobile">
 *   line  34  <div id="mobile-nav-tray" class="mobile-nav-tray">
 *   line  41  <nav class="navigation--mobile">
 *   line  93  <div class="navigation--mobile-utility">
 *   line 128  <header id="masthead" class="site-header ...">
 *   line 131  <nav class="js-accessible-menu navigation--utility">
 *   line 174  <nav class="navigation--main">
 *   line 557  <header class="banner banner--single-post">        ← ARTICLE TITLE BANNER, KEPT
 *   line 614  <div class="hs-cta-embed ..."> (empty JS-hydrated CTA iframe)
 *   line 661  <div class="hs-cta-embed ..."> (empty JS-hydrated CTA iframe)
 *   line 672  <div class="post-social-share"> (Share + LinkedIn/Facebook/X)
 *   line 708  <div class="article-subscribe"> (heading + HubSpot form + reCAPTCHA)
 *   line 744  <div class="hs_recaptcha ..."> / .grecaptcha-badge / #g-recaptcha-response
 *   line 915  <div class="footer-container-wrapper">             (site footer shell)
 *   line 921  <footer id="colophon" class="site-footer">
 *   line   2  <div id="hs-web-interactives-top-push-anchor"> and #hs-web-interactives-*
 *   line 1006 <script ...>
 *   line 1036 <div id="onetrust-consent-sdk"> / #onetrust-banner-sdk / #onetrust-pc-sdk / .ot-* / optanon
 *
 * NOTE — banner--single-post is the article title banner (date eyebrow + h1 +
 * byline), NOT the site header. It is the "hero" block source and MUST be kept.
 *
 * HubSpot in-body CTAs: the two .hs-cta-embed nodes are JS-hydrated placeholders.
 * In the static/cleaned HTML they contain only an <iframe> pointing at a HubSpot
 * web-interactive endpoint (…/hs-web-interactive-…) — there is no recoverable
 * destination href, and the button labels ("DOWNLOAD" / "LET'S TALK") are injected
 * client-side and are absent here. Per task guidance, with no href recoverable we
 * DROP the empty placeholders rather than emit an empty/wrong link.
 *
 * Newsletter subscribe form: keep only the heading ("Get the latest news") and the
 * short consent note paragraph; strip the actual <form> internals and reCAPTCHA.
 * The consent note lives INSIDE the <form> (.legal-consent-container .hs-richtext),
 * so it is relocated out before the form is removed.
 *
 * Source URL: https://blog.fluenceenergy.com/building-the-power-blueprint-for-tomorrows-ai-factories
 */

const SOURCE_URL = 'https://blog.fluenceenergy.com/building-the-power-blueprint-for-tomorrows-ai-factories';

const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // --- Non-authorable site chrome (header/nav + footer) --------------------
    // banner--single-post is intentionally NOT listed here (it is the article
    // title banner / hero source and must survive).
    //
    // ⚠️ Do NOT remove '.header-container-wrapper': the article title banner
    // (header.banner.banner--single-post, line 557) is nested INSIDE that wrapper
    // as a sibling of the site header (the wrapper spans lines 6–583). Removing
    // the wrapper deletes the banner too. Instead target only the header's own
    // chrome subtrees (#masthead / .site-header--mobile + navs), which sit
    // alongside the banner and leave it intact.
    WebImporter.DOMUtils.remove(element, [
      // Site header shell + all nav (NOT the wrapper — see note above)
      '#masthead',
      'header#masthead',
      '.site-header',
      '.site-header--mobile',
      '#mobile-nav-tray',
      '.mobile-nav-tray',
      'nav.navigation--main',
      'nav.navigation--utility',
      'nav.navigation--mobile',
      '.navigation--mobile',
      '.navigation--mobile-utility',
      // Site footer shell
      '.footer-container-wrapper',
      '#colophon',
      'footer#colophon',
      '.site-footer',
    ]);

    // --- Third-party widgets / consent / tracking ----------------------------
    WebImporter.DOMUtils.remove(element, [
      // OneTrust consent banner
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '#onetrust-pc-sdk',
      '[id^="onetrust"]',
      '[class^="ot-"]',
      '[class*="optanon"]',
      // HubSpot web-interactives anchors
      '[id^="hs-web-interactives"]',
      // reCAPTCHA (newsletter form)
      '.hs_recaptcha',
      '.grecaptcha-badge',
      '.grecaptcha-logo',
      '.grecaptcha-error',
      '#g-recaptcha-response',
      '[class^="grecaptcha"]',
      // Left-rail social-share widget (Share + LinkedIn/Facebook/X)
      '.post-social-share',
      // Scripts / styles / noscript
      'script',
      'noscript',
      'style',
    ]);

    // --- In-body HubSpot CTA embeds ------------------------------------------
    // The static HTML has only JS-hydrated placeholder iframes (no inline label
    // or href). The rendered page shows two CTAs, keyed by their hs-cta-embed
    // id: 218250703105 = "DOWNLOAD" (gated brochure asset) and 213835778992 =
    // "LET'S TALK" (contact). Replace each placeholder with a real button-link
    // so the CTA survives the import; unknown ids are dropped.
    const CTA_MAP = {
      '218250703105': { label: 'Download', href: 'https://fluenceenergy.com/contact/' },
      '213835778992': { label: "Let's Talk", href: 'https://fluenceenergy.com/contact/' },
    };
    element.querySelectorAll('.hs-cta-embed, [class*="hs-cta-embed"]').forEach((embed) => {
      const cls = embed.getAttribute('class') || '';
      const idMatch = cls.match(/hs-cta-embed-(\d+)/);
      const cta = idMatch && CTA_MAP[idMatch[1]];
      // The first CTA is wrapped in an otherwise-empty <h2>; if the embed's only
      // meaningful ancestor is an empty heading, replace THAT so the button is a
      // plain button-link paragraph (not rendered as a mid-article heading).
      let target = embed;
      const parent = embed.parentElement;
      if (parent && /^H[1-6]$/.test(parent.tagName)
        && parent.textContent.trim() === '' && parent.children.length === 1) {
        target = parent;
      }
      if (cta) {
        const p = element.ownerDocument.createElement('p');
        const a = element.ownerDocument.createElement('a');
        a.href = cta.href;
        a.textContent = cta.label;
        p.appendChild(a);
        target.replaceWith(p);
      } else {
        target.remove();
      }
    });

    // --- Newsletter subscribe form -------------------------------------------
    // Keep the heading + the consent note only; strip the <form>/reCAPTCHA.
    // The consent note is nested inside the form, so relocate it before removing.
    const subscribe = element.querySelector('.article-subscribe');
    if (subscribe) {
      const form = subscribe.querySelector('form');
      if (form) {
        const consent = form.querySelector('.legal-consent-container .hs-richtext')
          || form.querySelector('.legal-consent-container');
        if (consent) {
          form.replaceWith(consent); // preserve consent note where the form was
        } else {
          form.remove();
        }
      }
    }
  }

  if (hookName === H.after) {
    // Remove leftover non-authorable elements that may survive block parsing.
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'link',
      'source',
      'noscript',
    ]);

    // Drop empty headings/paragraphs left behind by the removed CTA embeds and
    // other HubSpot placeholders (no text, no image, no link → not authorable).
    element.querySelectorAll('h1, h2, h3, h4, h5, h6, p').forEach((el) => {
      const hasText = el.textContent && el.textContent.trim().length > 0;
      const hasImg = !!el.querySelector('img');
      const hasLink = !!el.querySelector('a[href]');
      if (!hasText && !hasImg && !hasLink) {
        el.remove();
      }
    });

    // Resolve relative image sources to absolute URLs against the source URL so
    // downloaded assets round-trip correctly. Runs after block parsing so
    // parser-created images are also resolved.
    const sourceUrl = (payload && payload.params && payload.params.originalURL) || SOURCE_URL;
    element.querySelectorAll('img[src]').forEach((img) => {
      const src = img.getAttribute('src');
      if (!src) return;
      if (src.startsWith('data:') || src.startsWith('blob:')) return;
      if (/^https?:\/\//i.test(src)) return;
      try {
        img.setAttribute('src', new URL(src, sourceUrl).href);
      } catch (e) {
        // leave unchanged if it cannot be resolved
      }
    });
  }
}
