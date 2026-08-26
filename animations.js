/* ════════════════════════════════════════════
   js/animations.js — Scroll Reveal, Counters, Hover, Stagger
   ════════════════════════════════════════════ */

/* ── Scroll Reveal ── */
export function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => obs.observe(el));
}

/* ── Counter Animation ── */
export function initCounters() {
  const els = document.querySelectorAll('.stat-num[data-target]');
  if (!els.length) return;

  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const dur    = 1800;
      const start  = performance.now();

      function tick(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / dur, 1);
        const val      = Math.round(easeOutQuart(progress) * target);
        el.textContent = val >= 1000 ? (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1) + 'K' : val.toString();
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  els.forEach(el => obs.observe(el));
}

/* ── Hover Tilt on Glass Cards ── */
export function initHoverTilt() {
  const cards = document.querySelectorAll('.feature-card, .testimonial-card, .step-card');

  cards.forEach(card => {
    const bound = { x: 0, y: 0 };

    card.addEventListener('mousemove', (e) => {
      const r  = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width  - 0.5;
      const py = (e.clientY - r.top)  / r.height - 0.5;
      const tiltX = py * -8;
      const tiltY = px *  8;
      card.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-10px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ── Stagger animation for dynamically injected profile cards ── */
export function addCardStaggerCSS() {
  const style = document.createElement('style');
  style.textContent = `
    .profiles-grid .profile-card:nth-child(1)  { animation-delay: 0.04s; }
    .profiles-grid .profile-card:nth-child(2)  { animation-delay: 0.09s; }
    .profiles-grid .profile-card:nth-child(3)  { animation-delay: 0.14s; }
    .profiles-grid .profile-card:nth-child(4)  { animation-delay: 0.19s; }
    .profiles-grid .profile-card:nth-child(5)  { animation-delay: 0.24s; }
    .profiles-grid .profile-card:nth-child(6)  { animation-delay: 0.29s; }
    .profiles-grid .profile-card:nth-child(n+7){ animation-delay: 0.32s; }
  `;
  document.head.appendChild(style);
}

/* ── Header scroll effect ── */
export function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 55);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ── Mobile hamburger ── */
export function initHamburger() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });

  mobileMenu.querySelectorAll('.mobile-link, .mobile-cta').forEach(el => {
    el.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });
}

/* ── Smooth button ripple ── */
export function initRipple() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const r    = btn.getBoundingClientRect();
      const x    = e.clientX - r.left;
      const y    = e.clientY - r.top;
      const rip  = document.createElement('span');
      rip.style.cssText = `
        position:absolute;
        width:5px;height:5px;
        border-radius:50%;
        background:rgba(255,255,255,0.35);
        transform:scale(0);
        animation:ripple 0.6s ease-out forwards;
        left:${x}px;top:${y}px;
        pointer-events:none;
      `;
      btn.appendChild(rip);
      rip.addEventListener('animationend', () => rip.remove());
    });
  });

  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to { transform:scale(80); opacity:0; }
    }
  `;
  document.head.appendChild(style);
}
