// KSM Media — Script v2

/* ─── SCROLL PROGRESS BAR ─────────────────── */
const progressBar = document.createElement('div');
progressBar.id = 'progress-bar';
document.body.prepend(progressBar);
window.addEventListener('scroll', () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  if (total > 0) progressBar.style.width = `${(window.scrollY / total) * 100}%`;
}, { passive: true });

/* ─── DARK MODE — white is always default ─── */
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
// Always start in light mode; dark is opt-in and not persisted
html.setAttribute('data-theme', 'light');
themeToggle?.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
});

/* ─── NAV SCROLL + ACTIVE LINK ────────────── */
const nav = document.getElementById('nav');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
  let current = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 130) current = s.id; });
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${current}`));
}, { passive: true });

/* ─── MOBILE MENU ─────────────────────────── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger?.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('is-open', open);
});
document.querySelectorAll('.mobile-link').forEach(l => {
  l.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('is-open');
  });
});

/* ─── FAQ ACCORDION ───────────────────────── */
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-q');
  btn?.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* ─── REEL STRIP — pause on hover handled by CSS ─── */
/* No filter needed — reel strip is always visible */

/* ─── ANIMATED STAT COUNTERS ─────────────── */
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const start = performance.now();
  const duration = 1800;
  (function step(now) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 4);
    el.textContent = Math.round(target * ease) + suffix;
    if (p < 1) requestAnimationFrame(step);
  })(start);
}
const statsRow = document.querySelector('.stats-row');
if (statsRow) {
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    statsRow.querySelectorAll('.stat-num[data-target]').forEach(animateCounter);
    obs.unobserve(statsRow);
  }, { threshold: 0.5 }).observe(statsRow);
}

/* ─── SCROLL FADE-UP ANIMATIONS ──────────── */
const fadeTargets = [
  '.service-card', '.hiw-step', '.section-header',
  '.about-right',
  '.contact-left', '.expect-card',
  '.stats-card', '.cta-banner-left', '.cta-banner-right',
  '.hiw-left', '.astat'
].join(', ');

document.querySelectorAll(fadeTargets).forEach((el, i) => {
  el.classList.add('fade-up');
  el.dataset.delay = (i % 5) * 70;
});

const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    setTimeout(() => e.target.classList.add('visible'), +e.target.dataset.delay || 0);
    io.unobserve(e.target);
  });
}, { threshold: 0.07, rootMargin: '0px 0px -24px 0px' });
document.querySelectorAll(fadeTargets).forEach(el => io.observe(el));

/* ─── CURSOR SPOTLIGHT ────────────────────── */
const spotlight = document.createElement('div');
spotlight.id = 'cursor-spotlight';
document.body.appendChild(spotlight);
window.addEventListener('mousemove', e => {
  spotlight.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
}, { passive: true });

/* ─── MAGNETIC BUTTONS ────────────────────── */
document.querySelectorAll('.btn-dark, .btn-ghost, .btn-black, .btn-green').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    btn.style.transform = `translate(${(e.clientX - r.left - r.width/2) * 0.16}px, ${(e.clientY - r.top - r.height/2) * 0.16}px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

/* ─── SMOOTH ANCHOR SCROLL ────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (target) { e.preventDefault(); window.scrollTo({ top: target.offsetTop - 100, behavior: 'smooth' }); }
  });
});

/* ─── SCROLL-TO-TOP ───────────────────────── */
const toTop = document.createElement('button');
toTop.id = 'to-top';
toTop.innerHTML = '↑';
toTop.setAttribute('aria-label', 'Back to top');
document.body.appendChild(toTop);
window.addEventListener('scroll', () => toTop.classList.toggle('show', window.scrollY > 600), { passive: true });
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ─── PAGE LOAD REVEAL + HERO ENTRANCE ───── */
window.addEventListener('load', () => {
  document.body.classList.add('loaded');

  // Stagger hero [data-anim] elements
  document.querySelectorAll('[data-anim]').forEach(el => {
    const delay = parseInt(el.dataset.animDelay || 0);
    setTimeout(() => el.classList.add('anim-in'), delay);
  });
});

/* ─── VSL PLAYER — direct video (no YouTube) ── */
(function initVSL() {
  const thumb    = document.getElementById('vslThumb');
  const vslVideo = document.getElementById('vslVideo');
  const btn      = document.getElementById('vslPlayBtn');
  if (!btn || !thumb || !vslVideo) return;

  function playVSL() {
    thumb.classList.add('hidden');
    vslVideo.classList.add('active');
    vslVideo.play().catch(() => {});
  }
  btn.addEventListener('click', playVSL);

  // Click on the playing video to pause / resume
  vslVideo.addEventListener('click', () => {
    if (vslVideo.paused) { vslVideo.play(); }
    else { vslVideo.pause(); }
  });
})();

/* ─── CUSTOM VIDEO PLAYER ─────────────────── */
(function initCustomPlayer() {
  const modal      = document.getElementById('vidModal');
  const video      = document.getElementById('vidModalPlayer');
  const modalBg    = document.getElementById('vidModalBg');
  const closeBtn   = document.getElementById('vidModalClose');
  const cplayerUI  = document.getElementById('cplayerUI');

  const playBtn    = document.getElementById('cplayerPlayBtn');
  const muteBtn    = document.getElementById('cplayerMuteBtn');
  const fsBtn      = document.getElementById('cplayerFsBtn');
  const progressEl = document.getElementById('cplayerProgress');
  const fillEl     = document.getElementById('cplayerFill');
  const knobEl     = document.getElementById('cplayerKnob');
  const volFill    = document.getElementById('cplayerVolFill');
  const volInput   = document.getElementById('cplayerVolInput');
  const cpCurrent  = document.getElementById('cpCurrent');
  const cpDuration = document.getElementById('cpDuration');

  const cpIconPlay    = document.getElementById('cpIconPlay');
  const cpIconPause   = document.getElementById('cpIconPause');
  const cpIconVolOn   = document.getElementById('cpIconVolOn');
  const cpIconVolOff  = document.getElementById('cpIconVolOff');
  const cpIconFs      = document.getElementById('cpIconFs');
  const cpIconExitFs  = document.getElementById('cpIconExitFs');

  if (!modal || !video) return;

  let hideTimer, isDragging = false;

  /* ── Helpers ── */
  function fmt(s) {
    if (!isFinite(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  }

  function showControls() {
    cplayerUI.classList.remove('cp-hidden');
    clearTimeout(hideTimer);
    if (!video.paused) {
      hideTimer = setTimeout(() => cplayerUI.classList.add('cp-hidden'), 3000);
    }
  }

  function syncPlayIcons() {
    cpIconPlay.style.display  = video.paused ? '' : 'none';
    cpIconPause.style.display = video.paused ? 'none' : '';
  }

  function syncVolIcons() {
    const muted = video.muted || video.volume === 0;
    cpIconVolOn.style.display  = muted ? 'none' : '';
    cpIconVolOff.style.display = muted ? '' : 'none';
    volFill.style.width = (muted ? 0 : video.volume * 100) + '%';
    if (volInput) volInput.value = muted ? 0 : video.volume * 100;
  }

  /* ── Open / Close ── */
  function openModal(src) {
    video.src = src;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    video.play().catch(() => {});
    showControls();
  }

  function closeModal() {
    modal.classList.remove('open');
    video.pause();
    video.src = '';
    document.body.style.overflow = '';
    clearTimeout(hideTimer);
    cplayerUI.classList.remove('cp-hidden');
    if (document.fullscreenElement) document.exitFullscreen?.();
  }

  /* Wire reel cards */
  document.querySelectorAll('.reel-card[data-video]').forEach(card => {
    card.addEventListener('click', () => {
      const src = card.dataset.video;
      if (src) openModal(src);
    });
  });

  closeBtn?.addEventListener('click', closeModal);
  modalBg?.addEventListener('click', closeModal);

  /* ── Play / Pause ── */
  playBtn?.addEventListener('click', e => {
    e.stopPropagation();
    video.paused ? video.play() : video.pause();
    showControls();
  });
  video.addEventListener('click', () => {
    video.paused ? video.play() : video.pause();
    showControls();
  });
  video.addEventListener('play',  () => { syncPlayIcons(); showControls(); });
  video.addEventListener('pause', () => { syncPlayIcons(); showControls(); });
  video.addEventListener('ended', () => { syncPlayIcons(); showControls(); });

  /* ── Progress bar ── */
  function updateProgress() {
    if (!video.duration || isDragging) return;
    const pct = (video.currentTime / video.duration) * 100;
    fillEl.style.width    = pct + '%';
    knobEl.style.left     = pct + '%';
    cpCurrent.textContent = fmt(video.currentTime);
  }
  video.addEventListener('timeupdate', updateProgress);
  video.addEventListener('loadedmetadata', () => {
    cpDuration.textContent = fmt(video.duration);
    syncVolIcons();
  });

  /* Seek on click/drag */
  function seekTo(e) {
    const rect = progressEl.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pct * video.duration;
    fillEl.style.width = pct * 100 + '%';
    knobEl.style.left  = pct * 100 + '%';
  }
  progressEl?.addEventListener('mousedown', e => {
    isDragging = true; seekTo(e);
    e.stopPropagation();
    const up   = () => { isDragging = false; document.removeEventListener('mouseup', up); document.removeEventListener('mousemove', move); };
    const move = e => seekTo(e);
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  });

  /* ── Volume ── */
  muteBtn?.addEventListener('click', e => {
    e.stopPropagation();
    video.muted = !video.muted;
    syncVolIcons();
    showControls();
  });
  volInput?.addEventListener('input', e => {
    e.stopPropagation();
    video.volume = e.target.value / 100;
    video.muted  = video.volume === 0;
    syncVolIcons();
    showControls();
  });

  /* ── Fullscreen ── */
  fsBtn?.addEventListener('click', e => {
    e.stopPropagation();
    const wrap = document.getElementById('vidModalInner');
    if (!document.fullscreenElement) {
      wrap.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    showControls();
  });
  document.addEventListener('fullscreenchange', () => {
    const isFs = !!document.fullscreenElement;
    cpIconFs.style.display      = isFs ? 'none' : '';
    cpIconExitFs.style.display  = isFs ? '' : 'none';
  });

  /* ── Auto-hide controls on mouse activity ── */
  document.getElementById('vidModalInner')?.addEventListener('mousemove', showControls);
  document.getElementById('vidModalInner')?.addEventListener('touchstart', showControls, { passive: true });

  /* ── Keyboard shortcuts ── */
  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('open')) return;
    switch (e.key) {
      case ' ': case 'k':
        e.preventDefault(); video.paused ? video.play() : video.pause(); showControls(); break;
      case 'm': case 'M':
        video.muted = !video.muted; syncVolIcons(); showControls(); break;
      case 'f': case 'F':
        fsBtn?.click(); break;
      case 'ArrowRight':
        e.preventDefault(); video.currentTime = Math.min(video.duration||0, video.currentTime + 5); showControls(); break;
      case 'ArrowLeft':
        e.preventDefault(); video.currentTime = Math.max(0, video.currentTime - 5); showControls(); break;
      case 'Escape':
        closeModal(); break;
    }
  });
})();

/* ─── TESTIMONIAL v2 PLAY BUTTONS ────────── */
document.querySelectorAll('.testi-v2-play[data-video]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const src = btn.dataset.video;
    if (!src) return;
    const modal    = document.getElementById('vidModal');
    const video    = document.getElementById('vidModalPlayer');
    const cplayerUI = document.getElementById('cplayerUI');
    if (!modal || !video) return;
    video.src = src;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    video.play().catch(() => {});
    cplayerUI?.classList.remove('cp-hidden');
  });
});

/* ─── REEL STRIP — seamless JS loop ──────── */
(function initReelLoop() {
  const strip = document.getElementById('reelStrip');
  if (!strip) return;

  // Kill the CSS animation — we drive it with rAF
  strip.style.animation = 'none';
  strip.style.willChange = 'transform';

  const wrap = strip.closest('.reel-strip-wrap');

  // Wait one paint so scrollWidth is correct
  requestAnimationFrame(() => {
    const singleSetW = strip.scrollWidth / 2; // two identical sets
    let pos = 0;
    let paused = false;
    const PX_PER_FRAME = 0.55; // ~33 px/s at 60 fps

    if (wrap) {
      wrap.addEventListener('mouseenter', () => { paused = true; });
      wrap.addEventListener('mouseleave', () => { paused = false; });
    }

    function tick() {
      if (!paused) {
        pos += PX_PER_FRAME;
        if (pos >= singleSetW) pos -= singleSetW; // invisible jump — sets are identical
        strip.style.transform = `translateX(-${pos}px)`;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
})();

/* ─── RIPPLE CLICK EFFECT ─────────────────── */
function addRipple(btn) {
  btn.addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const wave = document.createElement('span');
    wave.className = 'ripple-wave';
    wave.style.cssText = [
      `width:${size}px`,
      `height:${size}px`,
      `left:${e.clientX - rect.left - size / 2}px`,
      `top:${e.clientY - rect.top - size / 2}px`,
    ].join(';');
    this.appendChild(wave);
    wave.addEventListener('animationend', () => wave.remove());
  });
}
document.querySelectorAll('.ripple-btn, .btn').forEach(addRipple);

/* ─── 3D CARD TILT ────────────────────────── */
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg) translateY(-6px)`;
    card.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
    card.style.setProperty('--my', `${(y + 0.5) * 100}%`);
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ─── SCROLL REVEAL — new sections ───────────── */
const newFadeTargets = '.pricing-card, .result-card, .testi-card';
const newIO = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (!e.isIntersecting) return;
    const siblings = [...e.target.parentElement.children].filter(el => el.matches(newFadeTargets));
    const idx = siblings.indexOf(e.target);
    setTimeout(() => e.target.classList.add('visible'), idx * 90);
    newIO.unobserve(e.target);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
document.querySelectorAll(newFadeTargets).forEach(el => newIO.observe(el));

/* ─── REVEAL-LEFT / REVEAL-RIGHT — section content ── */
// HIW cards: each gets a stagger from left
document.querySelectorAll('.hiw-portrait-card').forEach((el, i) => {
  el.classList.add('reveal-left');
  el.style.transitionDelay = `${i * 100}ms`;
});
// About: text reveal
const aboutTxt = document.querySelector('.about-right');
if (aboutTxt) aboutTxt.classList.add('reveal-left');

// Pricing cards stagger from below (already handled by newIO)
// Contact columns
const contactL = document.querySelector('.contact-left');
const contactR = document.querySelector('.contact-right');
if (contactL) contactL.classList.add('reveal-left');
if (contactR) contactR.classList.add('reveal-right');

const revealIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealIO.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal-left, .reveal-right').forEach(el => revealIO.observe(el));

/* ─── CURSOR DOT ──────────────────────────── */
(function initCursorDot() {
  if (window.matchMedia('(hover: none)').matches) return; // touch devices — skip
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  document.body.appendChild(dot);

  let mx = 0, my = 0, dx = 0, dy = 0;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  // Enlarge dot when hovering interactive elements
  document.querySelectorAll('a, button, .tilt-card, .reel-card').forEach(el => {
    el.addEventListener('mouseenter', () => dot.classList.add('cursor-hovering'));
    el.addEventListener('mouseleave', () => dot.classList.remove('cursor-hovering'));
  });

  (function animateDot() {
    dx += (mx - dx) * 0.14;
    dy += (my - dy) * 0.14;
    dot.style.transform = `translate(${dx}px, ${dy}px)`;
    requestAnimationFrame(animateDot);
  })();
})();

/* ─── FRAMER-STYLE SMOOTH MOMENTUM SCROLL ── */
(function initSmoothScroll() {
  // Skip on touch/mobile — native scroll is already smooth there
  if (window.matchMedia('(hover: none)').matches) return;

  let target = window.scrollY;
  let current = window.scrollY;
  let raf = null;
  const ease = 0.1; // 0 = instant, 1 = never arrives; ~0.1 = Framer feel

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    current = lerp(current, target, ease);
    const diff = Math.abs(target - current);
    window.scrollTo(0, current);
    if (diff > 0.5) {
      raf = requestAnimationFrame(tick);
    } else {
      window.scrollTo(0, target);
      current = target;
      raf = null;
    }
  }

  window.addEventListener('wheel', e => {
    e.preventDefault();
    target = Math.max(0, Math.min(
      document.documentElement.scrollHeight - window.innerHeight,
      target + e.deltaY * 1.1
    ));
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: false });

  // Keep target in sync when scrolled by JS (anchors, to-top, etc.)
  window.addEventListener('scroll', () => {
    if (!raf) { target = window.scrollY; current = window.scrollY; }
  }, { passive: true });
})();

/* ─── FLOATING STATS BADGES IN HERO ──────── */
// Subtle counter on any [data-count] elements
document.querySelectorAll('[data-count]').forEach(el => {
  const io2 = new IntersectionObserver(([e], obs) => {
    if (!e.isIntersecting) return;
    const end = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    let start = performance.now();
    const dur = 1600;
    (function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(end * ease) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(start);
    obs.unobserve(el);
  }, { threshold: 0.6 });
  io2.observe(el);
});
