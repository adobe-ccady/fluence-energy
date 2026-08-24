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
    // Each item is authored as [eyebrow, heading(empty), text(empty), link].
    // The title lives in the link cell; promote it into an <h3> so it matches
    // the source styling (bold white linked title under the teal eyebrow).
    const link = item.querySelector('a[href]');
    if (link && !item.querySelector('h3')) {
      const h3 = document.createElement('h3');
      link.after(h3);
      h3.append(link);
    }
    // Make the whole item clickable via its title link, if present.
    if (link) {
      item.classList.add('announcements-item-linked');
      item.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        link.click();
      });
    }
    // Drop empty authored cells (empty heading/text divs) so they don't add gaps.
    [...item.querySelectorAll(':scope > div')].forEach((cell) => {
      if (!cell.textContent.trim() && !cell.querySelector('img,svg,a')) cell.remove();
    });
    list.append(item);
  });

  block.append(list);
}
