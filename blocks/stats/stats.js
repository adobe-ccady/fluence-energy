/**
 * Stats block — a centered row of stat items, each with a circular line-icon,
 * a large brand-blue number, and a label. Numbers count up to their final value
 * when the block scrolls into view. An optional trailing row with no icon/number
 * is treated as a footnote spanning the full width below the row.
 *
 * Authored structure (each direct child div of the block = one row):
 *   row > cell > [ <p><picture><img></p>, <h3>number</h3>, <p>label</p> ]
 *   row > cell > "footnote text"   (last row, no image or heading)
 */

function animateCount(el, target) {
  const duration = 1500;
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    // easeOutCubic
    const eased = 1 - (1 - progress) ** 3;
    el.textContent = Math.round(eased * target).toString();
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toString();
  };
  requestAnimationFrame(step);
}

export default function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row) => {
    // Read across the whole row: each stat item is authored as separate cells
    // (icon, number, label) per the `stat` item model.
    const img = row.querySelector('img');
    const numberEl = row.querySelector('h1, h2, h3, h4, h5, h6');

    // A row with neither an image nor a heading is the footnote.
    if (!img && !numberEl) {
      row.classList.add('stats-footnote');
      return;
    }

    row.classList.add('stats-item');

    // Icon — the paragraph (or element) wrapping the image.
    if (img) {
      const iconWrap = img.closest('p') || img.closest('picture')?.parentElement || img.parentElement;
      iconWrap.classList.add('stats-item-icon');
    }

    // Number — the heading. Purely numeric values (e.g. "60", "314") count up
    // from 0. Values with surrounding text (e.g. "up to 10%", "900k+") are left
    // intact and flagged so CSS can size them as static text.
    if (numberEl) {
      numberEl.classList.add('stats-item-number');
      const raw = numberEl.textContent.trim();
      if (/^\d{1,3}(,\d{3})*$/.test(raw)) {
        numberEl.dataset.target = raw.replace(/,/g, '');
        numberEl.textContent = '0';
      } else {
        numberEl.classList.add('stats-item-number-text');
      }
    }

    // Label — the last paragraph that is not the icon wrapper.
    const label = [...row.querySelectorAll('p')]
      .filter((p) => !p.classList.contains('stats-item-icon'))
      .pop();
    if (label) label.classList.add('stats-item-label');
  });

  // Count up when the block scrolls into view (numeric stats only).
  const numbers = block.querySelectorAll('.stats-item-number[data-target]');
  if (!numbers.length) return;
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        numbers.forEach((n) => animateCount(n, parseInt(n.dataset.target, 10) || 0));
        obs.disconnect();
      }
    });
  }, { threshold: 0.4 });
  observer.observe(block);
}
