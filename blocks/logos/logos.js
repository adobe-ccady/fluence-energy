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
    if (cell) cell.classList.add('logos-logo');
  });
}
