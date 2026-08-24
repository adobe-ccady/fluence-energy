/**
 * Decorate the hero-carousel variant: a full-bleed background video/media
 * behind a rotating set of content slides (heading + optional sub + CTA).
 *
 * Expected authored structure (each direct child div = one row):
 *  - Optional first row containing only media (a <video>/<a> to .mp4, a picture,
 *    or a bare <img> in a <p>) with no heading → used as the background layer.
 *  - Each remaining row = one slide with a heading, optional paragraph, and CTA.
 */
function decorateCarousel(block) {
  const rows = [...block.children];

  // Detect an optional background-media row (media only, no heading).
  let bgRow = null;
  if (rows.length > 1) {
    const first = rows[0];
    const hasHeading = first.querySelector('h1,h2,h3,h4,h5,h6');
    const hasMedia = first.querySelector('video, picture, img, a[href$=".mp4"]');
    if (!hasHeading && hasMedia) bgRow = first;
  }

  // Build background layer.
  if (bgRow) {
    bgRow.classList.add('hero-carousel-bg');
    // Promote an <a> to a video file (.mp4/.webm/.ogg) into a muted, looping,
    // autoplaying <video>. Use any sibling poster <img> as the video poster so
    // a still frame shows before/if the video plays.
    const videoLink = bgRow.querySelector('a[href$=".mp4"], a[href$=".webm"], a[href$=".ogg"]');
    if (videoLink && !bgRow.querySelector('video')) {
      const poster = bgRow.querySelector('img');
      const video = document.createElement('video');
      video.src = videoLink.getAttribute('href');
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('aria-hidden', 'true');
      if (poster && poster.src) video.poster = poster.src;
      // Replace the whole media paragraph/cell contents with just the video.
      const holder = videoLink.closest('p') || videoLink;
      holder.replaceWith(video);
      // Drop the now-redundant poster picture wrapper if it remains.
      const leftoverPicture = bgRow.querySelector('picture');
      if (leftoverPicture) {
        const pWrap = leftoverPicture.closest('p');
        (pWrap || leftoverPicture).remove();
      }
    }
  }

  // Remaining rows are slides.
  const slides = rows.filter((r) => r !== bgRow);
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
