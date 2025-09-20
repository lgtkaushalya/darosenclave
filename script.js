document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeToggleLabel();
  themeToggle?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', current);
    localStorage.setItem('theme', current);
    updateThemeToggleLabel();
  });
  function updateThemeToggleLabel() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (themeToggle) themeToggle.textContent = isDark ? 'Light' : 'Dark';
  }

  // Smooth scroll for same-page links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id && id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // Hero slideshow (from assets/slide-show)
  const hero = document.querySelector('.hero');
  const heroImages = [
    'assets/slide-show/daros-enclave-room.jpg',
    'assets/slide-show/daros-enclave-dinning-area.jpg',
    'assets/slide-show/daros-enclave-authentic-kitchen-experience.jpg',
    'assets/slide-show/daros-enclave-relaxing-outdoor-veranda.jpg',
    'assets/slide-show/depiyassegala-rock-near-by-daros-enclave.jpg',
    'assets/slide-show/surfing-at-waligama-near-by-daros-enclave.jpg',
    'assets/slide-show/kamburugamuwa-beach-near-by-daros-enclave.jpg',
    'assets/slide-show/sandy-beaches-at-kamburugamuwa.jpg',
    'assets/slide-show/sandy-beaches-at-kamburugamuwa-2.jpg',
    'assets/slide-show/garden-fruits-in-daros-enclave.jpg',
  ];
  // Preload images to avoid flicker
  const _preload = heroImages.map(src => { const i = new Image(); i.src = src; return i; });

  let heroIndex = 0;
  function setHeroBackground(src) {
    if (!hero) return;
    hero.style.backgroundImage = `url(${src})`;
  }
  function nextHero() {
    heroIndex = (heroIndex + 1) % heroImages.length;
    setHeroBackground(heroImages[heroIndex]);
  }
  if (heroImages.length > 0) {
    setHeroBackground(heroImages[0]);
  }
  let heroTimer = setInterval(nextHero, 6000);

  // Persona interactions override hero image
  document.querySelectorAll('.persona').forEach(btn => {
    btn.addEventListener('click', () => {
      const img = btn.getAttribute('data-hero');
      if (img) {
        clearInterval(heroTimer);
        setHeroBackground(img);
        // resume after a while
        heroTimer = setInterval(nextHero, 8000);
      }
    });
  });

  // Lightbox (for any .lightbox-trigger)
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImage');
  const lbCaption = document.getElementById('lightboxCaption');
  const lbClose = document.querySelector('.lightbox-close');
  function openLightbox(src, caption) {
    if (!lb || !lbImg) return;
    lbImg.src = src;
    if (lbCaption) lbCaption.textContent = caption || '';
    lb?.classList.add('open');
    lb?.setAttribute('aria-hidden', 'false');
  }
  function closeLightbox() {
    lb?.classList.remove('open');
    lb?.setAttribute('aria-hidden', 'true');
    if (lbImg) lbImg.src = '';
  }
  document.querySelectorAll('.lightbox-trigger').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const src = a.getAttribute('href');
      const caption = a.getAttribute('data-caption') || '';
      if (src) openLightbox(src, caption);
    });
  });
  lbClose?.addEventListener('click', closeLightbox);
  lb?.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox();
  });

  // Gallery page progressive reveal and category filter (if present)
  const galleryGrid = document.querySelector('[data-gallery-grid]');
  if (galleryGrid) {
    const loadMoreBtn = document.getElementById('loadMore');
    const items = Array.from(galleryGrid.querySelectorAll('[data-item]'));
    let visible = 9;
    function updateVisibility() {
      items.forEach((el, i) => {
        el.style.display = i < visible ? '' : 'none';
      });
      if (loadMoreBtn) loadMoreBtn.style.display = visible >= items.length ? 'none' : '';
    }
    updateVisibility();
    loadMoreBtn?.addEventListener('click', () => {
      visible += 9;
      updateVisibility();
    });

    // Category filter
    const filterBar = document.querySelector('[data-filter]');
    filterBar?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cat]');
      if (!btn) return;
      const cat = btn.getAttribute('data-cat');
      document.querySelectorAll('[data-cat]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filtered = items.filter(el => !cat || cat === 'all' || el.getAttribute('data-category') === cat);
      items.forEach(el => el.style.display = 'none');
      filtered.forEach((el, i) => { el.style.display = i < 12 ? '' : 'none'; });
      if (loadMoreBtn) loadMoreBtn.style.display = filtered.length > 12 ? '' : 'none';
    });
  }
});




