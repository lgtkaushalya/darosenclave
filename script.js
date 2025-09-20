document.addEventListener('DOMContentLoaded', () => {
  // Init lucide icons (Airbnb-like outline style)
  try { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons(); } catch (_) {}
  // Theme Toggle
  // Dark mode removed: no theme toggle logic

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

  // Mobile menu toggle
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const themeToggleMobile = null;
  function setMobileMenu(open) {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.hidden = !open;
    mobileMenu.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    setMobileMenu(!open);
  });
  // Close when clicking a link
  mobileMenu?.addEventListener('click', (e) => {
    const link = e.target.closest('a,button');
    if (!link) return;
    if (link.tagName === 'A') setMobileMenu(false);
  });
  // Sync dark mode button in mobile
  // no-op
  // ESC closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMobileMenu(false);
  });
  // On resize to desktop, ensure menu closed
  window.addEventListener('resize', () => {
    if (window.innerWidth > 960) setMobileMenu(false);
  });

  // Persona interactions: expand card into host area without touching hero slideshow
  const personaHost = document.getElementById('personaExpandedHost');
  let transitionLock = false;
  let hasOpenedOnce = false;

  function buildExpandedWrapper(fromBtn, animate) {
    const content = fromBtn.querySelector('.persona-expanded');
    if (!content) return null;
    const clone = content.cloneNode(true);
    clone.hidden = false;
    const teaserTitle = fromBtn.querySelector('h3')?.textContent || '';
    const headingWrap = document.createElement('div');
    headingWrap.className = 'persona-header';
    const headingEl = document.createElement('h3');
    headingEl.textContent = teaserTitle;
    headingEl.className = 'mt-0';
    const minimize = document.createElement('button');
    minimize.className = 'persona-close';
    minimize.setAttribute('aria-label', 'Minimize');
    minimize.innerHTML = '×';
    headingWrap.appendChild(headingEl);
    headingWrap.appendChild(minimize);
    const wrapper = document.createElement('div');
    if (animate) wrapper.className = 'persona-expanded-enter';
    wrapper.appendChild(headingWrap);
    wrapper.appendChild(clone);
    return { wrapper, minimize };
  }

  function renderExpanded(fromBtn) {
    if (!personaHost) return;
    const built = buildExpandedWrapper(fromBtn, !hasOpenedOnce ? true : false);
    if (!built) return;
    const { wrapper, minimize } = built;
    personaHost.innerHTML = '';
    personaHost.appendChild(wrapper);
    personaHost.hidden = false;
    personaHost.classList.add('open');
    if (!hasOpenedOnce) {
      requestAnimationFrame(() => {
        wrapper.classList.add('persona-expanded-enter-active');
        hasOpenedOnce = true;
      });
    }
    minimize.addEventListener('click', () => collapseExpanded());
  }

  function collapseExpanded() {
    if (!personaHost) return;
    const wrapper = personaHost.querySelector('.persona-expanded-enter, .persona-expanded-enter-active');
    if (wrapper) {
      if (transitionLock) return; // prevent flicker when switching quickly
      transitionLock = true;
      wrapper.classList.remove('persona-expanded-enter-active');
      wrapper.classList.add('persona-expanded-exit-active');
      setTimeout(() => {
        personaHost.hidden = true;
        personaHost.classList.remove('open');
        personaHost.innerHTML = '';
        // reset expanded state on cards
        document.querySelectorAll('.persona[aria-expanded="true"]').forEach(p => p.setAttribute('aria-expanded','false'));
        transitionLock = false;
      }, 300);
    } else {
      personaHost.hidden = true;
      personaHost.classList.remove('open');
      personaHost.innerHTML = '';
      document.querySelectorAll('.persona[aria-expanded="true"]').forEach(p => p.setAttribute('aria-expanded','false'));
    }
  }

  document.querySelectorAll('.persona').forEach(btn => {
    btn.addEventListener('click', () => {
      if (transitionLock) return; // avoid flicker by ignoring clicks during transition
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      // if another card is open, close it first then open the new one after transition
      const anyOpen = document.querySelector('.persona[aria-expanded="true"]');
      if (anyOpen && anyOpen !== btn) {
        // Replace content immediately, no closing animation
        document.querySelectorAll('.persona').forEach(p => p.setAttribute('aria-expanded','false'));
        anyOpen.setAttribute('aria-expanded','false');
        btn.setAttribute('aria-expanded','true');
        // swap content in host without animating
        if (personaHost) {
          const built = buildExpandedWrapper(btn, false);
          if (built) {
            const { wrapper, minimize } = built;
            personaHost.innerHTML = '';
            personaHost.appendChild(wrapper);
            personaHost.hidden = false;
            personaHost.classList.add('open');
            minimize.addEventListener('click', () => collapseExpanded());
          }
        }
      } else {
        document.querySelectorAll('.persona').forEach(p => p.setAttribute('aria-expanded','false'));
        if (isOpen) {
          collapseExpanded();
          return;
        }
        btn.setAttribute('aria-expanded','true');
        renderExpanded(btn);
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




