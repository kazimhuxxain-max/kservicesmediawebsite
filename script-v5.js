/* ═══════════════════════════════════════════════════════════
   KSM MEDIA v5 — 3D MOTION ENGINE
   WebGL depth scene · scroll camera · 3D tilt · Framer reveals
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  /* ───────────────────────────────────────────
     1. WEBGL 3D BACKGROUND SCENE (Three.js)
     Particles + wireframe shapes in deep space,
     camera flies down as you scroll, parallaxes
     with the mouse. The whole page lives inside it.
  ─────────────────────────────────────────── */
  function initScene() {
    if (reduceMotion || typeof THREE === 'undefined') return;
    const canvas = document.getElementById('webgl');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas, alpha: true, antialias: true, powerPreference: 'high-performance'
    });
    // Cap DPR lower on touch devices — halves GPU fill cost, visually identical for dots
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isTouch ? 1.5 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05050a, 0.028);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 14;

    /* — 3D particle starfield (true depth, not 2D) — */
    const COUNT = isTouch ? 350 : 900;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const palette = [
      new THREE.Color(0x39ff14), // brand neon green
      new THREE.Color(0xffffff), // white
    ];
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 60;   // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 90;   // y — tall, covers full scroll
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;   // z — depth
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.09, vertexColors: true, transparent: true, opacity: 0.85,
      sizeAttenuation: true, depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const stars = new THREE.Points(pGeo, pMat);
    scene.add(stars);

    /* — Mouse + scroll state — */
    let mouseX = 0, mouseY = 0, camX = 0, camY = 0;
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    let scrollProgress = 0;
    function updateScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = max > 0 ? window.scrollY / max : 0;
    }
    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();

    const clock = new THREE.Clock();
    let frameVisible = true;
    document.addEventListener('visibilitychange', () => { frameVisible = !document.hidden; });

    function animate() {
      requestAnimationFrame(animate);
      if (!frameVisible) return;
      const t = clock.getElapsedTime();

      // Camera descends through the 3D world as you scroll
      const targetY = -scrollProgress * 34;
      camX += ((mouseX * 1.6) - camX) * 0.04;
      camY += ((-mouseY * 1.2) - camY) * 0.04;
      camera.position.x = camX;
      camera.position.y += (targetY + camY - camera.position.y) * 0.06;
      camera.rotation.z = Math.sin(t * 0.1) * 0.012;
      camera.lookAt(camX * 0.4, camera.position.y, 0);

      // Starfield slow drift
      stars.rotation.y = t * 0.012;

      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, { passive: true });
  }

  /* ───────────────────────────────────────────
     2. SMOOTH MOMENTUM SCROLL — Framer feel
  ─────────────────────────────────────────── */
  function initSmoothScroll() {
    if (reduceMotion || isTouch) return;
    let target = window.scrollY, current = window.scrollY, raf = null;
    const ease = 0.085;

    function tick() {
      current += (target - current) * ease;
      if (Math.abs(target - current) > 0.5) {
        window.scrollTo(0, current);
        raf = requestAnimationFrame(tick);
      } else {
        window.scrollTo(0, target);
        current = target;
        raf = null;
      }
    }
    window.addEventListener('wheel', (e) => {
      e.preventDefault();
      target = Math.max(0, Math.min(
        document.documentElement.scrollHeight - window.innerHeight,
        target + e.deltaY
      ));
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: false });

    // Stay in sync when something else scrolls (anchors, to-top)
    window.addEventListener('scroll', () => {
      if (!raf) { target = window.scrollY; current = window.scrollY; }
    }, { passive: true });
  }

  /* ───────────────────────────────────────────
     3. HERO TITLE — 3D char split entrance
  ─────────────────────────────────────────── */
  function initSplitText() {
    document.querySelectorAll('.split-3d [data-split]').forEach((el) => {
      const text = el.textContent;
      el.textContent = '';
      el.setAttribute('aria-label', text);
      [...text].forEach((ch, i) => {
        const span = document.createElement('span');
        span.className = 'ch';
        span.setAttribute('aria-hidden', 'true');
        span.textContent = ch === ' ' ? ' ' : ch;
        span.style.setProperty('--d', `${200 + i * 45}ms`);
        el.appendChild(span);
      });
    });
  }

  /* ───────────────────────────────────────────
     4. 3D SCROLL REVEALS — Framer-style
  ─────────────────────────────────────────── */
  function initReveals() {
    const els = document.querySelectorAll('.reveal-3d');
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const delay = parseInt(e.target.dataset.rd || 0, 10);
        setTimeout(() => e.target.classList.add('in'), delay);
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    // Stagger siblings inside grids
    document.querySelectorAll('.portfolio-grid, .services-grid, .pricing-grid').forEach((grid) => {
      grid.querySelectorAll('.reveal-3d').forEach((el, i) => { el.dataset.rd = i * 110; });
    });
    els.forEach((el) => io.observe(el));
  }

  /* ───────────────────────────────────────────
     5. 3D TILT CARDS + glare + inner depth
  ─────────────────────────────────────────── */
  function initTilt() {
    if (isTouch || reduceMotion) return;
    document.querySelectorAll('.tilt-3d').forEach((card) => {
      // Inject glare layer
      if (!card.querySelector('.glare')) {
        const g = document.createElement('div');
        g.className = 'glare';
        card.appendChild(g);
      }
      const strength = parseFloat(card.dataset.tilt || 8);

      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.classList.add('tilting');
        card.style.transform =
          `perspective(1100px) rotateX(${(-y * strength).toFixed(2)}deg) rotateY(${(x * strength).toFixed(2)}deg) translateZ(12px)`;
        card.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
        card.style.setProperty('--my', `${(y + 0.5) * 100}%`);
      });
      card.addEventListener('mouseleave', () => {
        card.classList.remove('tilting');
        card.style.transform = '';
      });
    });
  }

  /* ───────────────────────────────────────────
     6. MAGNETIC BUTTONS
  ─────────────────────────────────────────── */
  function initMagnetic() {
    if (isTouch || reduceMotion) return;
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) * 0.22;
        const dy = (e.clientY - r.top - r.height / 2) * 0.22;
        btn.style.transform = `translate(${dx}px, ${dy}px) translateZ(10px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ───────────────────────────────────────────
     7. RIPPLE CLICK
  ─────────────────────────────────────────── */
  function initRipple() {
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const wave = document.createElement('span');
        wave.className = 'ripple-wave';
        wave.style.cssText =
          `width:${size}px;height:${size}px;` +
          `left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
        this.appendChild(wave);
        wave.addEventListener('animationend', () => wave.remove());
      });
    });
  }

  /* ───────────────────────────────────────────
     8. CURSOR DOT
  ─────────────────────────────────────────── */
  function initCursor() {
    if (isTouch || reduceMotion) return;
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);
    let mx = 0, my = 0, dx = 0, dy = 0;
    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    document.querySelectorAll('a, button, .tilt-3d').forEach((el) => {
      el.addEventListener('mouseenter', () => dot.classList.add('cursor-hovering'));
      el.addEventListener('mouseleave', () => dot.classList.remove('cursor-hovering'));
    });
    (function loop() {
      dx += (mx - dx) * 0.16;
      dy += (my - dy) * 0.16;
      dot.style.transform = `translate(${dx}px, ${dy}px)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ───────────────────────────────────────────
     9. NAV — scroll state + hide on scroll down
  ─────────────────────────────────────────── */
  function initNav() {
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id]');
    let lastY = window.scrollY;

    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 40);
      // Hide nav scrolling down, reveal scrolling up
      if (y > 300 && y > lastY + 4) nav.classList.add('nav-hidden');
      else if (y < lastY - 4) nav.classList.remove('nav-hidden');
      lastY = y;

      let cur = '';
      sections.forEach((s) => { if (y >= s.offsetTop - 140) cur = s.id; });
      navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
    }, { passive: true });

    // Mobile menu
    const ham = document.getElementById('hamburger');
    const mm = document.getElementById('mobileMenu');
    const close = () => {
      mm.classList.remove('open');
      mm.setAttribute('aria-hidden', 'true');
      ham.classList.remove('is-open');
      document.body.style.overflow = '';
    };
    ham.addEventListener('click', () => {
      const open = mm.classList.toggle('open');
      mm.setAttribute('aria-hidden', String(!open));
      ham.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    document.querySelectorAll('.mob-link').forEach((l) => l.addEventListener('click', close));
  }

  /* ───────────────────────────────────────────
     10. PROGRESS BAR + TO-TOP + ANCHORS
  ─────────────────────────────────────────── */
  function initChrome() {
    const bar = document.createElement('div');
    bar.id = 'progress-bar';
    document.body.prepend(bar);
    window.addEventListener('scroll', () => {
      const t = document.documentElement.scrollHeight - window.innerHeight;
      if (t > 0) bar.style.width = (window.scrollY / t * 100) + '%';
    }, { passive: true });

    const top = document.getElementById('to-top');
    window.addEventListener('scroll', () => top.classList.toggle('show', window.scrollY > 600), { passive: true });
    top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href').slice(1);
        if (!id) return;
        const t = document.getElementById(id);
        if (t) { e.preventDefault(); window.scrollTo({ top: t.offsetTop - 88, behavior: 'smooth' }); }
      });
    });
  }

  /* ───────────────────────────────────────────
     11. STAT COUNTERS
  ─────────────────────────────────────────── */
  function initCounters() {
    document.querySelectorAll('.stat-num[data-target]').forEach((el) => {
      const io = new IntersectionObserver(([e], obs) => {
        if (!e.isIntersecting) return;
        const end = +el.dataset.target, sfx = el.dataset.suffix || '';
        const t0 = performance.now();
        (function step(now) {
          const p = Math.min((now - t0) / 1600, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4))) + sfx;
          if (p < 1) requestAnimationFrame(step);
        })(t0);
        obs.unobserve(el);
      }, { threshold: 0.6 });
      io.observe(el);
    });
  }

  /* ───────────────────────────────────────────
     12. VSL INLINE PLAYER + VIDEO MODAL
  ─────────────────────────────────────────── */
  function initVideo() {
    const btn = document.getElementById('vslPlayBtn');
    const thumb = document.getElementById('vslThumb');
    if (btn && thumb) {
      btn.addEventListener('click', () => {
        thumb.innerHTML =
          '<iframe class="vsl-iframe" src="https://www.youtube.com/embed/9ASxwAw124A?autoplay=1&rel=0&modestbranding=1&color=white" ' +
          'frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
      });
    }

    const modal = document.getElementById('vidModal');
    const player = document.getElementById('vidModalPlayer');
    const closeBtn = document.getElementById('vidModalClose');
    const backdrop = document.getElementById('vidModalBackdrop');
    if (!modal) return;

    function openModal(videoId) {
      player.innerHTML =
        '<iframe src="https://www.youtube.com/embed/' + videoId +
        '?autoplay=1&rel=0&modestbranding=1&color=white" frameborder="0" ' +
        'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(() => { player.innerHTML = ''; }, 350);
    }
    document.querySelectorAll('.port-play[data-video]').forEach((b) => {
      b.addEventListener('click', () => openModal(b.dataset.video));
    });
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }

  /* ───────────────────────────────────────────
     13. TESTIMONIAL 3D SLIDER
  ─────────────────────────────────────────── */
  function initTestimonials() {
    const slides = document.querySelectorAll('.ts-slide');
    const dots = document.querySelectorAll('.ts-dot');
    const prev = document.getElementById('tsPrev');
    const next = document.getElementById('tsNext');
    if (!slides.length) return;

    let cur = 0;
    function goTo(n) {
      slides[cur].classList.remove('active');
      dots[cur].classList.remove('ts-dot--active');
      cur = (n + slides.length) % slides.length;
      slides[cur].classList.add('active');
      dots[cur].classList.add('ts-dot--active');
    }
    slides[0].classList.add('active');
    prev.addEventListener('click', () => goTo(cur - 1));
    next.addEventListener('click', () => goTo(cur + 1));
    dots.forEach((d, i) => {
      d.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      d.addEventListener('click', () => goTo(i));
    });

    document.querySelectorAll('.ts-play-btn').forEach((btn) => {
      btn.addEventListener('click', function () {
        const box = this.closest('.ts-video');
        const vid = box.dataset.video;
        if (!vid) return;
        box.innerHTML =
          '<iframe src="https://www.youtube.com/embed/' + vid +
          '?autoplay=1&rel=0&modestbranding=1" frameborder="0" ' +
          'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
      });
    });
  }

  /* ───────────────────────────────────────────
     14. HERO ORB PARALLAX (mouse depth layers)
  ─────────────────────────────────────────── */
  function initOrbParallax() {
    if (isTouch || reduceMotion) return;
    const orbs = document.querySelectorAll('.hero-orb');
    if (!orbs.length) return;
    let mx = 0, my = 0;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
      orbs.forEach((orb, i) => {
        const depth = (i + 1) * 18;
        orb.style.transform = `translate3d(${mx * depth}px, ${my * depth}px, 0)`;
      });
    }, { passive: true });
  }

  /* ─── BOOT ─── */
  function boot() {
    initSplitText();
    initScene();
    initSmoothScroll();
    initReveals();
    initTilt();
    initMagnetic();
    initRipple();
    initCursor();
    initNav();
    initChrome();
    initCounters();
    initVideo();
    initTestimonials();
    initOrbParallax();
    document.body.classList.add('loaded');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
