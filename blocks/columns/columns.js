// Decorative gradient-circle icons shown above each CTA column in the
// columns-cta variant (matches the source contact section). Icons are
// self-hosted SVG files; index maps to column order.
const CTA_ICONS = ['contact-rocket', 'contact-chat'];

export default function decorate(block) {
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      const img = col.querySelector(':scope > p > img');
      if ((pic && col.children.length === 1) || (img && col.children.length === 1)) {
        col.classList.add('columns-img-col');
      } else {
        col.classList.add('columns-text-col');
      }
    });
  });

  // columns-cta: prepend the decorative icon to each text column.
  if (block.classList.contains('columns-cta')) {
    const base = window.hlx?.codeBasePath || '';
    const cols = block.querySelectorAll(':scope > div > .columns-text-col');
    cols.forEach((col, i) => {
      const iconName = CTA_ICONS[i] || CTA_ICONS[0];
      const icon = document.createElement('img');
      icon.className = 'columns-cta-icon';
      icon.src = `${base}/icons/${iconName}.svg`;
      icon.width = 53;
      icon.height = 53;
      icon.loading = 'lazy';
      icon.setAttribute('alt', '');
      icon.setAttribute('aria-hidden', 'true');
      col.prepend(icon);
    });
  }
}
