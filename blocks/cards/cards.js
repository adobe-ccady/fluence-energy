import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  // cards-product: product tiles with their own CTA link — no card-wide link
  // wrap and no tag-pill (first body <p> is the product title).
  const isProduct = block.classList.contains('cards-product');
  // cards-icon: SDG-style icon + label tiles — small centered icon and a
  // heading label, no tag-pill, no card-wide link wrapper.
  const isIcon = block.classList.contains('cards-icon');
  // cards-inquiry: contact inquiry tiles — heading + description + gradient
  // pill CTA (source: a.grad-button). No image, no tag-pill, no card-wide link.
  const isInquiry = block.classList.contains('cards-inquiry');
  // cards-office: office/location directory tiles — heading + multi-line
  // address paragraph. No image, no tag-pill, no CTA, no card-wide link.
  const isOffice = block.classList.contains('cards-office');
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1
        && (div.querySelector('picture') || div.querySelector(':scope > p > img'))) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
        const first = div.querySelector(':scope > p:first-child');
        if (isProduct || isInquiry) {
          // CTA link → gradient-border pill (source: a.grad-button)
          const cta = div.querySelector(':scope > p:last-child > a');
          if (cta) cta.classList.add('cards-grad-cta');
          // product title (not a category pill) — product only
          if (isProduct && first && !first.querySelector('a, img')) first.classList.add('cards-card-title');
        } else if (!isIcon && !isOffice && first && !first.querySelector('a, img')) {
          first.classList.add('tag-pill');
        }
      }
    });
    // Wrap entire card in its link for full-surface clickability (skip for product)
    const link = li.querySelector('.cards-card-body a');
    if (link && !isProduct && !isIcon && !isInquiry && !isOffice) {
      const wrapper = document.createElement('a');
      wrapper.href = link.href;
      wrapper.className = 'cards-card-link';
      while (li.firstChild) wrapper.append(li.firstChild);
      // Remove the original link from the heading to avoid nested <a>
      const innerLink = wrapper.querySelector('.cards-card-body a');
      if (innerLink) {
        const parent = innerLink.parentElement;
        while (innerLink.firstChild) parent.append(innerLink.firstChild);
        innerLink.remove();
      }
      li.append(wrapper);
    }
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
