/**
 * Decorate the hero-carousel variant: a full-bleed background video/media
 * behind a rotating set of content slides (heading + optional sub + CTA).
 *
 * Expected authored structure (each direct child div = one row):
 *  - Optional first row containing only media (a <video>/<a> to .mp4, a picture,
 *    or a bare <img> in a <p>) with no heading → used as the background layer.
 *  - Each remaining row = one slide with a heading, optional paragraph, and CTA.
 */
const VIDEO_RE = /\.(mp4|webm|ogg)(\?.*)?$/i;
const IMAGE_RE = /\.(png|jpe?g|gif|webp|avif)(\?.*)?$/i;

// A row is "background media" when it has no heading and carries only media
// references — a poster image and/or a link to a video (or image) file. The
// carousel background can be authored as a single merged row (delivery/md2da)
// or split across several leading rows (AEM Universal Editor renders each
// container field — image, video — as its own row), so we scan all leading
// non-heading rows and merge whatever media they hold.
function isBackgroundRow(row) {
  if (row.querySelector('h1,h2,h3,h4,h5,h6')) return false;
  const hasImg = row.querySelector('picture, img');
  const link = row.querySelector('a[href]');
  const linkIsMedia = link && (VIDEO_RE.test(link.getAttribute('href')) || IMAGE_RE.test(link.getAttribute('href')));
  // A row that only holds a plain paragraph of text (e.g. an empty container
  // field) is background "filler" too, as long as it has no real slide content.
  const hasText = (row.textContent || '').trim().length > 0;
  return Boolean(hasImg || linkIsMedia || !hasText);
}

function decorateCarousel(block) {
  const rows = [...block.children];

  // Collect the leading background-media rows (media/empty rows before the
  // first slide row that has a heading).
  const bgRows = [];
  for (let i = 0; i < rows.length; i += 1) {
    if (rows.length - bgRows.length <= 1) break; // always leave at least one slide
    if (isBackgroundRow(rows[i])) bgRows.push(rows[i]);
    else break;
  }

  // Build the background layer from whatever the bg rows hold: a poster <img>
  // and a link to a video file. Merge everything into the first bg row.
  if (bgRows.length) {
    const bg = bgRows[0];
    bg.classList.add('hero-carousel-bg');

    const posterImg = bgRows.map((r) => r.querySelector('img')).find(Boolean);
    const videoLink = bgRows
      .flatMap((r) => [...r.querySelectorAll('a[href]')])
      .find((a) => VIDEO_RE.test(a.getAttribute('href')));

    if (videoLink && !bg.querySelector('video')) {
      const video = document.createElement('video');
      video.src = videoLink.getAttribute('href');
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('aria-hidden', 'true');
      if (posterImg && posterImg.src) video.poster = posterImg.src;
      bg.replaceChildren(video);
    } else if (posterImg) {
      // No video link — keep just the poster image as the background.
      const pic = posterImg.closest('picture') || posterImg;
      bg.replaceChildren(pic);
    }

    // Drop any extra bg rows (their content has been merged into the first).
    bgRows.slice(1).forEach((r) => r.remove());
  }

  // Remaining rows are slides.
  const slides = rows.filter((r) => !bgRows.includes(r));
  const track = document.createElement('div');
  track.className = 'hero-carousel-track';
  slides.forEach((slide, i) => {
    slide.classList.add('hero-carousel-slide');
    if (i === 0) slide.classList.add('is-active');
    // Mark the eyebrow (leading h4) and the CTA (last-paragraph link) so CSS
    // can target them without brittle positional selectors. EDS leaves the
    // <p><a> CTA as a plain link (no .button), so we style it via this class.
    const eyebrow = slide.querySelector('h4:first-child, h3:first-child, h5:first-child, h6:first-child');
    if (eyebrow) eyebrow.classList.add('hero-carousel-eyebrow');
    const cta = slide.querySelector('p:last-child > a:only-child');
    if (cta) cta.classList.add('hero-carousel-cta');
    track.append(slide);
  });
  block.append(track);

  // Pagination dots.
  if (slides.length > 1) {
    const dots = document.createElement('div');
    dots.className = 'hero-carousel-dots';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'hero-carousel-dot';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      if (i === 0) dot.classList.add('is-active');
      dot.addEventListener('click', () => {
        // eslint-disable-next-line no-use-before-define
        goTo(i);
      });
      dots.append(dot);
    });
    // Place the dots inside the content track (below the active slide) so they
    // sit directly under the CTA button, left-aligned with the content.
    track.append(dots);

    let current = 0;
    const dotEls = [...dots.children];
    const goTo = (idx) => {
      slides[current].classList.remove('is-active');
      dotEls[current].classList.remove('is-active');
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      dotEls[current].classList.add('is-active');
    };
    let timer = setInterval(() => goTo(current + 1), 6000);
    block.addEventListener('mouseenter', () => clearInterval(timer));
    block.addEventListener('mouseleave', () => {
      timer = setInterval(() => goTo(current + 1), 6000);
    });
  }
}

export default function decorate(block) {
  if (block.classList.contains('hero-carousel')) {
    decorateCarousel(block);
    return;
  }

  const rows = [...block.children];

  if (rows.length >= 2) {
    const imageRow = rows[0];
    const contentRow = rows[1];
    const contentCell = contentRow.querySelector(':scope > div') || contentRow;

    // Preserve existing <picture> with its <source> elements; fall back to wrapping bare <img>
    const picture = imageRow.querySelector('picture');
    if (picture) {
      block.replaceChildren(picture, contentCell);
    } else {
      const img = imageRow.querySelector('img');
      if (img) {
        const pic = document.createElement('picture');
        pic.append(img);
        block.replaceChildren(pic, contentCell);
      } else {
        block.replaceChildren(contentCell);
      }
    }
  }

  // Tag pills: eyebrow p and em-wrapped tags
  const contentDiv = block.querySelector(':scope > div');
  if (contentDiv) {
    const firstP = contentDiv.querySelector(':scope > p:first-child');
    if (firstP && !firstP.querySelector('a, img')) firstP.classList.add('tag-pill');
    contentDiv.querySelectorAll('em').forEach((em) => {
      if (!em.querySelector('a')) em.classList.add('tag-pill');
    });
  }
}
