/**
 * Announcements block — a featured lead announcement (left) alongside a
 * stacked list of categorized resource links (right), on a full-bleed
 * brand-blue background.
 *
 * Expected authored structure:
 *   row 1 (featured): eyebrow (h4) + heading (h3) + paragraph + CTA link
 *   rows 2..n (resource items): each = category label (h4) + linked title (h3)
 *
 * The first row becomes the featured lead; all remaining rows become
 * categorized items in the right-hand list. Each list item is fully clickable
 * via its title link.
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const [featured, ...items] = rows;

  featured.classList.add('announcements-featured');

  // The featured CTA is a bare <p><a> link (EDS does not add .button to it),
  // so tag it explicitly for ghost-button styling.
  const cta = featured.querySelector('p:last-child > a');
  if (cta) cta.classList.add('announcements-cta');

  const list = document.createElement('div');
  list.className = 'announcements-list';
  items.forEach((item) => {
    item.classList.add('announcements-item');
    // Make the whole item clickable via its title link, if present.
    const link = item.querySelector('a');
    if (link) {
      item.classList.add('announcements-item-linked');
      item.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        link.click();
      });
    }
    list.append(item);
  });

  block.append(list);
}
