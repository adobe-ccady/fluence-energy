/**
 * Promote a link/text that points at an image file into an actual <img>.
 * In Universal Editor an image `reference` field holding an external URL is
 * rendered as a bare <a href="...png">...</a> (or plain text URL) rather than a
 * <picture>/<img>. Convert those so the logo actually shows.
 * @param {Element} scope element to search within
 */
const IMG_URL_RE = /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i;

function promoteImageLinks(scope) {
  if (scope.querySelector('img')) return; // already a real image
  // Case 1: an <a> whose href is an image file.
  const link = [...scope.querySelectorAll('a[href]')]
    .find((a) => IMG_URL_RE.test(a.getAttribute('href')));
  let url = link ? link.getAttribute('href') : null;
  // Case 2: a plain-text URL with no anchor.
  if (!url) {
    const text = (scope.textContent || '').trim();
    if (IMG_URL_RE.test(text) && /^https?:\/\//i.test(text)) url = text;
  }
  if (!url) return;
  const img = document.createElement('img');
  img.src = url;
  img.alt = '';
  img.loading = 'lazy';
  scope.replaceChildren(img);
}

/**
 * Logos block — a responsive grid of partner/customer logos.
 * Each authored row is one cell containing a single logo image
 * (one logo is wrapped in a link). We keep the native EDS row/cell
 * structure and add semantic classes for styling.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('logos-item');
    const cell = row.firstElementChild;
    if (cell) {
      cell.classList.add('logos-logo');
      promoteImageLinks(cell);
    }
  });
}
