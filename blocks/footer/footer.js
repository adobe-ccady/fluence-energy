import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { getContentRoot } from '../../scripts/scripts.js';

const CODE_ROOT = window.hlx?.codeBasePath || '';

// White Fluence footer logo (distinct from the color header BRAND_LOGO)
const FOOTER_LOGO = `<img class="footer-logo-img" src="${CODE_ROOT}/icons/fluence-logo-white.svg" width="236" height="54" alt="Fluence Energy" loading="lazy"/>`;

// Map a social link URL to its circle icon file + accessible network name
const SOCIAL_ICONS = [
  { match: /linkedin/i, icon: 'linkedin-circle', name: 'LinkedIn' },
  { match: /facebook/i, icon: 'facebook-circle', name: 'Facebook' },
  { match: /(twitter|x\.com)/i, icon: 'twitter-circle', name: 'Twitter' },
];

/**
 * Converts a list of text social links into icon links with accessible labels.
 * @param {HTMLUListElement} list social link <ul>
 */
function decorateSocialLinks(list) {
  list.classList.add('footer-social-list');
  list.querySelectorAll(':scope > li > a').forEach((a) => {
    const href = a.getAttribute('href') || '';
    const cfg = SOCIAL_ICONS.find((s) => s.match.test(href));
    const name = cfg ? cfg.name : (a.textContent.trim() || 'social');
    const iconName = cfg ? cfg.icon : null;

    // Preserve the original text as an accessible label
    a.setAttribute('aria-label', `Follow us on ${name}`);
    a.setAttribute('rel', 'noopener');
    a.setAttribute('target', '_blank');
    a.classList.add('footer-social-link');

    if (iconName) {
      a.textContent = '';
      const img = document.createElement('img');
      img.className = 'footer-social-icon';
      img.src = `${CODE_ROOT}/icons/${iconName}.svg`;
      img.width = 39;
      img.height = 39;
      img.loading = 'lazy';
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      a.append(img);
    }
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : `${getContentRoot()}/footer`;
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Label the two content sections
  const sections = footer.querySelectorAll(':scope > .section');
  if (sections.length >= 2) {
    sections[0].classList.add('footer-top');
    sections[sections.length - 1].classList.add('footer-bottom');
  } else if (sections.length === 1) {
    sections[0].classList.add('footer-top');
  }

  // ---- Top region: brand logo (left) + Connect heading & social icons (right) ----
  const footerTop = footer.querySelector('.footer-top');
  if (footerTop) {
    const wrapper = footerTop.querySelector('.default-content-wrapper') || footerTop;

    // Brand link → white Fluence logo image
    const brandLink = wrapper.querySelector('a');
    if (brandLink) {
      brandLink.classList.add('footer-brand-link');
      brandLink.setAttribute('aria-label', 'Fluence Energy Home');
      brandLink.innerHTML = FOOTER_LOGO;
      // Strip any EDS button decoration
      const btnWrapper = brandLink.closest('.button-container, .button-wrapper');
      if (btnWrapper) btnWrapper.replaceWith(...btnWrapper.childNodes);
    }

    // Build a left column for the brand
    const brandCol = document.createElement('div');
    brandCol.className = 'footer-branding';
    const brandHost = brandLink ? (brandLink.closest('p') || brandLink) : null;
    if (brandHost) brandCol.append(brandHost);

    // Build a right column for Connect heading + social icons
    const connectCol = document.createElement('div');
    connectCol.className = 'footer-social';
    const heading = wrapper.querySelector('h1, h2, h3, h4, h5, h6');
    const socialList = wrapper.querySelector('ul');
    if (heading) connectCol.append(heading);
    if (socialList) {
      decorateSocialLinks(socialList);
      connectCol.append(socialList);
    }

    wrapper.textContent = '';
    wrapper.classList.add('footer-primary');
    wrapper.append(brandCol, connectCol);
  }

  // ---- Bottom region: copyright + legal links, GDPR text, attribution ----
  const footerBottom = footer.querySelector('.footer-bottom');
  if (footerBottom) {
    const wrapper = footerBottom.querySelector('.default-content-wrapper') || footerBottom;
    wrapper.classList.add('footer-siteinfo');

    const paras = [...wrapper.querySelectorAll(':scope > p')];
    const legalList = wrapper.querySelector('ul');
    const copyP = paras.find((p) => /copyright/i.test(p.textContent));
    const attributionP = paras.find((p) => p.querySelector('a') && /website by/i.test(p.textContent));
    const gdprP = paras.find(
      (p) => p !== copyP && p !== attributionP && p.textContent.trim().length > 0,
    );

    if (legalList) legalList.classList.add('footer-legal-list');
    if (gdprP) gdprP.classList.add('footer-gdpr');
    if (attributionP) {
      attributionP.classList.add('footer-attribution');
      // Replace the plain "Imagebox" text link with the Imagebox logo SVG
      // (source uses the 81x24 logo image), keeping "Website by" preceding text.
      const attrLink = attributionP.querySelector('a');
      if (attrLink) {
        attrLink.setAttribute('rel', 'noopener');
        attrLink.setAttribute('target', '_blank');
        attrLink.setAttribute('aria-label', 'Website by Imagebox');
        attrLink.classList.add('footer-imagebox-link');
        attrLink.textContent = '';
        const logo = document.createElement('img');
        logo.className = 'footer-imagebox-logo';
        logo.src = `${CODE_ROOT}/icons/imagebox-logo.svg`;
        logo.width = 81;
        logo.height = 24;
        logo.loading = 'lazy';
        logo.alt = 'Imagebox';
        attrLink.append(logo);
      }
    }

    // Left box: copyright + legal links (inline row) then GDPR paragraph
    const leftBox = document.createElement('div');
    leftBox.className = 'footer-box-left';

    const legalRow = document.createElement('div');
    legalRow.className = 'footer-legal-row';
    if (copyP) legalRow.append(copyP);
    if (legalList) legalRow.append(legalList);
    leftBox.append(legalRow);
    if (gdprP) leftBox.append(gdprP);

    // Attribution box (right)
    const attrBox = document.createElement('div');
    attrBox.className = 'footer-imagebox';
    if (attributionP) attrBox.append(attributionP);

    wrapper.textContent = '';
    wrapper.append(leftBox);
    if (attributionP) wrapper.append(attrBox);
  }

  block.append(footer);
}
