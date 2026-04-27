const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// NAV TOGGLE
const navToggle = $('.nav-toggle');
const siteNav = $('#site-nav');
if (navToggle && siteNav) {
  const setOpen = (isOpen) => {
    siteNav.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  };

  navToggle.addEventListener('click', () => {
    const isOpen = !siteNav.classList.contains('is-open');
    setOpen(isOpen);
  });

  siteNav.addEventListener('click', (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.matches('a')) setOpen(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 720) setOpen(false);
  });
}

// FOOTER YEAR
const yearEl = $('#year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// REVEAL ON SCROLL
const revealEls = $$('.reveal-on-scroll');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.14 });

  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-in'));
}

// LIGHTBOX for gallery tiles (support static tiles inside .projects-grid)
const lightboxId = 'taag-lightbox';
let lightbox = $('#' + lightboxId);
if (!lightbox) {
  lightbox = document.createElement('div');
  lightbox.id = lightboxId;
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <div class="lightbox-backdrop" data-lb-close="true"></div>
    <div class="lightbox-panel">
      <button class="lightbox-close" data-lb-close="true">✕</button>
      <img id="taag-lightbox-img" class="lightbox-img" src="" alt="" />
      <div class="lightbox-meta">
        <div id="taag-lightbox-title" class="lightbox-title"></div>
        <div class="lightbox-nav">
          <button id="taag-lb-prev" aria-label="Previous">◀</button>
          <button id="taag-lb-next" aria-label="Next">▶</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(lightbox);
}

const lbImg = $('#taag-lightbox-img');
const lbTitle = $('#taag-lightbox-title');
const lbPrev = $('#taag-lb-prev');
const lbNext = $('#taag-lb-next');

const projectTiles = Array.from(document.querySelectorAll('.projects-grid figure'));
let galleryItems = projectTiles.map((fig) => {
  const img = fig.querySelector('img');
  const src = img ? (img.dataset?.src || img.currentSrc || img.src) : '';
  const title = fig.querySelector('figcaption')?.textContent?.trim() || img?.alt || '';
  return { src: src || '', title };
});

function openLightbox(index) {
  const item = galleryItems[index];
  if (!item) return;
  lbImg.src = new URL(item.src, location.href).href;
  lbImg.alt = item.title || '';
  if (lbTitle) lbTitle.textContent = item.title || '';
  lightbox.classList.add('is-open');
}

function closeLightbox() {
  lightbox.classList.remove('is-open');
}

let currentIndex = 0;
projectTiles.forEach((fig, i) => {
  fig.addEventListener('click', (e) => {
    e.preventDefault();
    currentIndex = i;
    openLightbox(i);
  });
});

if (lbPrev) lbPrev.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
  openLightbox(currentIndex);
});
if (lbNext) lbNext.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % galleryItems.length;
  openLightbox(currentIndex);
});

$$('[data-lb-close="true"]').forEach(el => el.addEventListener('click', closeLightbox));

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
  if (lightbox.classList.contains('is-open')) {
    if (e.key === 'ArrowLeft') lbPrev?.click();
    if (e.key === 'ArrowRight') lbNext?.click();
  }
});

// HERO: simple background cycle if hero element present and assets exist
const heroSection = document.querySelector('.hero');
if (heroSection) {
  const heroImages = galleryItems.map(i => i.src).filter(Boolean).map(s => `url('${new URL(s, location.href).href}')`);
  if (heroImages.length) {
    let hi = 0;
    const HERO_DURATION = 7000;
    const setBg = (idx) => {
      heroSection.style.setProperty('--hero-bg-a', heroImages[idx % heroImages.length]);
      heroSection.dataset.activeBg = 'a';
    };
    setBg(0);
    setInterval(() => {
      hi = (hi + 1) % heroImages.length;
      heroSection.style.setProperty('--hero-bg-b', heroImages[hi]);
      heroSection.dataset.activeBg = heroSection.dataset.activeBg === 'a' ? 'b' : 'a';
    }, HERO_DURATION);
  }
}

// Accessibility: focus trap for mobile nav close on outside click
document.addEventListener('click', (e) => {
  if (!siteNav) return;
  if (!siteNav.contains(e.target) && !e.target.closest('.nav-toggle')) {
    siteNav.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }
});
