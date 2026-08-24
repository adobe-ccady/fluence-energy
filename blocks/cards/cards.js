import { createOptimizedPicture } from '../../scripts/aem.js';

const IMG_URL_RE = /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i;

// In Universal Editor an image `reference` field holding an external URL is
// rendered as a bare <a href="...png"> or plain-text URL rather than an <img>.
// Promote an image-only cell's link/text into a real <img> so it is treated as
// the card image (and not misclassified as a text body cell).
function promoteImageCell(div) {
  if (div.querySelector('img, picture')) return;
  const anchors = [...div.querySelectorAll('a[href]')];
  // Only promote when the cell is JUST an image link (no other real content),
  // so we never turn a body CTA into an image.
  const imgLink = anchors.find((a) => IMG_URL_RE.test(a.getAttribute('href')));
  const text = (div.textContent || '').trim();
  let url = null;
  if (imgLink && anchors.length === 1 && text === imgLink.textContent.trim()) {
    url = imgLink.getAttribute('href');
  } else if (!anchors.length && IMG_URL_RE.test(text) && /^https?:\/\//i.test(text)) {
    url = text;
  }
  if (!url) return;
  const p = document.createElement('p');
  const img = document.createElement('img');
  img.src = url;
  img.alt = '';
  img.loading = 'lazy';
  p.append(img);
  div.replaceChildren(p);
}

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
    // Promote any image-URL-only cell (UE external reference) into a real <img>
    // before classifying cells as image vs body.
    [...li.children].forEach((div) => promoteImageCell(div));
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
