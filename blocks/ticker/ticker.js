export default function decorate(block) {
  // Extract items from the first cell (EDS block structure).
  const cell = block.querySelector(':scope > div > div');
  const paragraphs = cell ? [...cell.querySelectorAll('p')] : [];

  // Detect link items (e.g. the Fluence market bar: CAISO | ERCOT | MISO | ...).
  // When the ticker holds links, render a STATIC centered row of clickable
  // items on the brand bar (source behaviour) rather than a scrolling marquee.
  const linkEls = paragraphs
    .map((p) => p.querySelector('a'))
    .filter(Boolean);

  if (linkEls.length > 0) {
    block.textContent = '';
    const nav = document.createElement('nav');
    nav.className = 'ticker-links';
    nav.setAttribute('aria-label', 'Markets');
    linkEls.forEach((a, i) => {
      if (i > 0) {
        const sep = document.createElement('span');
        sep.className = 'ticker-sep';
        sep.setAttribute('aria-hidden', 'true');
        sep.textContent = '|';
        nav.append(sep);
      }
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      const target = a.getAttribute('target');
      if (target) link.setAttribute('target', target);
      link.textContent = a.textContent.trim();
      nav.append(link);
    });
    block.append(nav);
    return;
  }

  // --- Scrolling text marquee (tag ticker, no links) ---------------------
  const items = paragraphs.length > 0
    ? paragraphs.map((p) => p.textContent.trim()).filter(Boolean)
    : [...block.children].map((row) => row.textContent.trim()).filter(Boolean);
  block.textContent = '';
  block.setAttribute('aria-hidden', 'true');

  const track = document.createElement('div');
  track.className = 'ticker-track';

  function appendItems(container) {
    items.forEach((item, i) => {
      if (i > 0) {
        const sep = document.createElement('span');
        sep.className = 'ticker-sep';
        sep.textContent = '·';
        container.append(sep);
      }
      const span = document.createElement('span');
      span.textContent = item;
      container.append(span);
    });
    const sep = document.createElement('span');
    sep.className = 'ticker-sep';
    sep.textContent = '·';
    container.append(sep);
  }

  appendItems(track);
  appendItems(track);
  block.append(track);
}
