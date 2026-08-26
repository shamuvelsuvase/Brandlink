/* ════════════════════════════════════════════
   BrandLink — Main Script
   ════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────
     1. CANVAS PARTICLE BACKGROUND
  ───────────────────────────────────────── */
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];

  function resizeCanvas() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.r  = Math.random() * 1.8 + 0.4;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.5 ? '0,229,255' : '162,89,255';
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 90; i++) particles.push(new Particle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,229,255,${0.07 * (1 - dist / 110)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  // Floating orbs
  const orbs = [
    { x: 0.15, y: 0.5,  color: '157,0,255',   r: 280, speed: 0.0004 },
    { x: 0.85, y: 0.3,  color: '0,229,255',   r: 220, speed: 0.0003 },
    { x: 0.5,  y: 0.85, color: '255,107,203', r: 180, speed: 0.0005 },
  ];

  function drawOrbs(t) {
    orbs.forEach(o => {
      const x = (o.x + Math.sin(t * o.speed) * 0.05) * W;
      const y = (o.y + Math.cos(t * o.speed) * 0.05) * H;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, o.r);
      grad.addColorStop(0, `rgba(${o.color},0.1)`);
      grad.addColorStop(1, `rgba(${o.color},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, o.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  let animT = 0;
  function animateCanvas() {
    ctx.clearRect(0, 0, W, H);
    animT++;
    drawOrbs(animT);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animateCanvas);
  }
  animateCanvas();

  /* ─────────────────────────────────────────
     2. HEADER SCROLL
  ───────────────────────────────────────── */
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* ─────────────────────────────────────────
     3. HAMBURGER / MOBILE MENU
  ───────────────────────────────────────── */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('.mobile-link').forEach(l => {
    l.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });

  /* ─────────────────────────────────────────
     4. SCROLL REVEAL
  ───────────────────────────────────────── */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('active');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* ─────────────────────────────────────────
     5. COUNTER ANIMATION
  ───────────────────────────────────────── */
  function animateCounter(el, target) {
    let start = 0;
    const duration = 1800;
    const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.round(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const statsObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const target = parseInt(e.target.dataset.target, 10);
        animateCounter(e.target, target);
        statsObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-num').forEach(el => statsObs.observe(el));

  /* ─────────────────────────────────────────
     6. CARD HOVER GLOW
  ───────────────────────────────────────── */
  document.querySelectorAll('.glass, .feature-card, .testimonial-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 20;
      const y = ((e.clientY - r.top)  / r.height - 0.5) * 20;
      card.style.transform = `rotateY(${x * 0.3}deg) rotateX(${-y * 0.3}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ─────────────────────────────────────────
     7. AUTH MODAL STATE
  ───────────────────────────────────────── */
  const authOverlay  = document.getElementById('auth-overlay');
  const stepChoose   = document.getElementById('step-choose');
  const stepForm     = document.getElementById('step-form');
  const formTitle    = document.getElementById('form-title');
  const formSubtitle = document.getElementById('form-subtitle');
  const formSubmitBtn= document.getElementById('form-submit-btn');
  const formSwitchBtn= document.getElementById('form-switch-btn');
  const formSwitchTxt= document.getElementById('form-switch-text');
  const brandFields  = document.getElementById('brand-fields');
  const infFields    = document.getElementById('influencer-fields');
  const formRoleSel  = document.getElementById('form-role-selector');
  const tabLogin     = document.getElementById('tab-login');
  const tabSignup    = document.getElementById('tab-signup');
  const froleBrand   = document.getElementById('frole-brand');
  const froleInf     = document.getElementById('frole-influencer');

  let currentRole = 'brand'; // 'brand' | 'influencer'
  let currentTab  = 'signup'; // 'signup' | 'login'

  function openModal(startStep = 'choose') {
    authOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (startStep === 'choose') {
      showStep('choose');
    } else {
      showStep('form');
      setTab('login');
    }
  }

  function closeModal() {
    authOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showStep(step) {
    stepChoose.classList.toggle('hidden', step !== 'choose');
    stepForm.classList.toggle('hidden', step !== 'form');
  }

  function setRole(role) {
    currentRole = role;
    // Update form role buttons
    froleBrand.classList.toggle('active', role === 'brand');
    froleInf.classList.toggle('active', role === 'influencer');
    // Show/hide field sections
    if (currentTab === 'signup') {
      brandFields.classList.toggle('hidden', role !== 'brand');
      infFields.classList.toggle('hidden',   role !== 'influencer');
    }
    // Update submit button text
    updateSubmitText();
  }

  function setTab(tab) {
    currentTab = tab;
    tabLogin.classList.toggle('active',  tab === 'login');
    tabSignup.classList.toggle('active', tab === 'signup');

    if (tab === 'login') {
      formTitle.textContent    = 'Welcome back';
      formSubtitle.textContent = 'Log in to your BrandLink account.';
      formRoleSel.classList.add('hidden');
      brandFields.classList.add('hidden');
      infFields.classList.add('hidden');
      formSwitchTxt.innerHTML = "Don't have an account? <button class='link-btn' id='form-switch-btn'>Sign up</button>";
      formSwitchTxt.querySelector('#form-switch-btn').addEventListener('click', () => setTab('signup'));
      updateSubmitText();
    } else {
      formTitle.textContent    = 'Create your account';
      formSubtitle.textContent = "Tell us who you are — we'll tune your matches from day one.";
      formRoleSel.classList.remove('hidden');
      setRole(currentRole);
      formSwitchTxt.innerHTML = "Already have an account? <button class='link-btn' id='form-switch-btn'>Log in</button>";
      formSwitchTxt.querySelector('#form-switch-btn').addEventListener('click', () => setTab('login'));
      updateSubmitText();
    }
  }

  function updateSubmitText() {
    if (currentTab === 'login') {
      formSubmitBtn.textContent = 'Log in';
    } else {
      formSubmitBtn.textContent = currentRole === 'brand'
        ? 'Create brand account'
        : 'Create influencer account';
    }
  }

  // Trigger open
  ['nav-login-btn', 'nav-signup-btn', 'hero-cta', 'cta-bottom', 'mobile-cta'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const isLogin = id === 'nav-login-btn';
      openModal(isLogin ? 'form' : 'choose');
      if (isLogin) setTab('login');
    });
  });

  document.getElementById('logo-home')?.addEventListener('click', (e) => e.preventDefault());

  // Close
  document.getElementById('modal-close').addEventListener('click', closeModal);
  authOverlay.addEventListener('click', (e) => { if (e.target === authOverlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // Step 1 choose role
  document.getElementById('choose-brand').addEventListener('click', () => {
    currentRole = 'brand';
    showStep('form');
    setTab('signup');
    setRole('brand');
  });
  document.getElementById('choose-influencer').addEventListener('click', () => {
    currentRole = 'influencer';
    showStep('form');
    setTab('signup');
    setRole('influencer');
  });
  document.getElementById('already-login').addEventListener('click', () => {
    showStep('form');
    setTab('login');
  });

  // Tab switching
  tabLogin.addEventListener('click',  () => setTab('login'));
  tabSignup.addEventListener('click', () => setTab('signup'));

  // Role switching within form
  froleBrand.addEventListener('click', () => setRole('brand'));
  froleInf.addEventListener('click',   () => setRole('influencer'));

  // Password toggle
  document.getElementById('toggle-pw').addEventListener('click', () => {
    const pw = document.getElementById('f-password');
    const icon = document.querySelector('#toggle-pw i');
    if (pw.type === 'password') {
      pw.type = 'text';
      icon.className = 'fa-regular fa-eye-slash';
    } else {
      pw.type = 'password';
      icon.className = 'fa-regular fa-eye';
    }
  });

  // Form submit
  document.getElementById('auth-form').addEventListener('submit', (e) => {
    e.preventDefault();
    closeModal();
    if (currentTab === 'login' || currentTab === 'signup') {
      if (currentRole === 'brand') {
        showDashboard('brand');
      } else {
        showDashboard('influencer');
      }
    }
  });

  /* ─────────────────────────────────────────
     8. DASHBOARD DATA
  ───────────────────────────────────────── */
  const INFLUENCERS = [
    { id:1,  name:'Priya Nair',     handle:'@priya.creates',  platform:'Instagram', niche:'Lifestyle',       followers:'480K', engRate:'4.2%', rate:'$320', bio:'Lifestyle creator based in Mumbai, crafting authentic stories for 480K followers.',     initials:'PN', gradient:'linear-gradient(135deg,#a8edea,#fed6e3)', badge:'badge-ig' },
    { id:2,  name:'Marcus Vale',    handle:'@marcusvale',     platform:'YouTube',   niche:'Tech & Gadgets',  followers:'1.2M', engRate:'3.8%', rate:'$850', bio:'In-depth tech reviews and unboxings for over 1.2M subscribers.',                       initials:'MV', gradient:'linear-gradient(135deg,#ff6b6b,#ffd93d)', badge:'badge-yt' },
    { id:3,  name:'Théo Lambert',   handle:'@theotech',       platform:'YouTube',   niche:'Tech & Gadgets',  followers:'390K', engRate:'5.1%', rate:'$280', bio:'French tech reviewer breaking down complex gadgets into simple, engaging content.',      initials:'TL', gradient:'linear-gradient(135deg,#f093fb,#f5576c)', badge:'badge-yt' },
    { id:4,  name:'Aiko Tanaka',    handle:'@aikocooks',      platform:'TikTok',    niche:'Food & Cooking',  followers:'2.3M', engRate:'6.7%', rate:'$1200',bio:'Viral food creator sharing Japanese fusion recipes with a modern twist.',               initials:'AT', gradient:'linear-gradient(135deg,#4facfe,#00f2fe)', badge:'badge-tt' },
    { id:5,  name:'Sofia Morales',  handle:'@sofiastyle',     platform:'Instagram', niche:'Fashion',         followers:'760K', engRate:'3.9%', rate:'$550', bio:'Fashion-forward content from Milan — editorial looks made accessible for everyone.',    initials:'SM', gradient:'linear-gradient(135deg,#f7971e,#ffd200)', badge:'badge-ig' },
    { id:6,  name:'Raj Patel',      handle:'@rajfitness',     platform:'Instagram', niche:'Fitness & Health',followers:'220K', engRate:'7.3%', rate:'$180', bio:'Certified personal trainer helping 220K followers build strength with zero equipment.', initials:'RP', gradient:'linear-gradient(135deg,#11998e,#38ef7d)', badge:'badge-ig' },
    { id:7,  name:'Luna Chen',      handle:'@lunabeauty',     platform:'TikTok',    niche:'Beauty & Skincare',followers:'890K', engRate:'8.2%', rate:'$620', bio:'Skincare scientist turned creator — making routines simple, effective and fun.',       initials:'LC', gradient:'linear-gradient(135deg,#ee0979,#ff6a00)', badge:'badge-tt' },
    { id:8,  name:'James Okafor',   handle:'@james_plays',    platform:'TikTok',    niche:'Gaming',          followers:'1.5M', engRate:'5.5%', rate:'$950', bio:'Gaming content with a comedic twist — entertaining 1.5M fans across platforms.',       initials:'JO', gradient:'linear-gradient(135deg,#8e2de2,#4a00e0)', badge:'badge-tt' },
    { id:9,  name:'Emma Brooks',    handle:'@emmaontravels',  platform:'Instagram', niche:'Travel & Adventure',followers:'340K', engRate:'4.8%', rate:'$260',bio:'Adventure travel photographer documenting hidden gems across 50+ countries.',          initials:'EB', gradient:'linear-gradient(135deg,#00b09b,#96c93d)', badge:'badge-ig' },
    { id:10, name:'Dev Sharma',     handle:'@devfinance',     platform:'YouTube',   niche:'Finance & Business',followers:'580K', engRate:'3.2%', rate:'$420',bio:'Simplifying stock markets, crypto, and personal finance for everyday Indians.',        initials:'DS', gradient:'linear-gradient(135deg,#1a1a2e,#16213e)', badge:'badge-yt' },
    { id:11, name:'Chloe Martin',   handle:'@chloeeats',      platform:'Instagram', niche:'Food & Cooking',  followers:'150K', engRate:'9.1%', rate:'$130', bio:'Micro-creator with massive engagement — plant-based recipes your followers will love.',  initials:'CM', gradient:'linear-gradient(135deg,#fddb92,#d1fdff)', badge:'badge-ig' },
    { id:12, name:'Alex Rivera',    handle:'@alexgames',      platform:'YouTube',   niche:'Gaming',          followers:'920K', engRate:'4.4%', rate:'$680', bio:'Long-form gaming reviews and lore dives for the most dedicated gaming community.',     initials:'AR', gradient:'linear-gradient(135deg,#2af598,#009efd)', badge:'badge-yt' },
  ];

  const BRANDS = [
    { id:1,  name:'Nova Labs',       niche:'Tech',             location:'Berlin, Germany',   budgetMin:2000, budgetMax:8000,  needs:'Short-form video creators for a product launch campaign.',       initials:'NL', gradient:'linear-gradient(135deg,#4facfe,#00f2fe)' },
    { id:2,  name:'Lumen Skincare',  niche:'Beauty & Skincare',location:'Mumbai, India',     budgetMin:500,  budgetMax:3000,  needs:'Skincare tutorial creators with authentic routines and engaged audiences.', initials:'LS', gradient:'linear-gradient(135deg,#f093fb,#f5576c)' },
    { id:3,  name:'Nortide',         niche:'Fashion',          location:'Paris, France',     budgetMin:1500, budgetMax:7000,  needs:'Editorial fashion creators for our summer SS26 collection.',    initials:'NT', gradient:'linear-gradient(135deg,#f7971e,#ffd200)' },
    { id:4,  name:'GreenPlate',      niche:'Food & Beverage',  location:'New York, USA',     budgetMin:300,  budgetMax:2000,  needs:'Food bloggers and recipe creators for our plant-based line.',   initials:'GP', gradient:'linear-gradient(135deg,#11998e,#38ef7d)' },
    { id:5,  name:'IronCore Gym',    niche:'Health & Fitness', location:'London, UK',        budgetMin:800,  budgetMax:4500,  needs:'Fitness influencers for supplement and equipment promotions.',   initials:'IC', gradient:'linear-gradient(135deg,#ee0979,#ff6a00)' },
    { id:6,  name:'Wanderlust Co.',  niche:'Travel',           location:'Bali, Indonesia',   budgetMin:1000, budgetMax:5000,  needs:'Travel vloggers for destination content and brand integrations.', initials:'WC', gradient:'linear-gradient(135deg,#00b09b,#96c93d)' },
    { id:7,  name:'PixelForge',      niche:'Gaming',           location:'Seoul, South Korea',budgetMin:2500, budgetMax:12000, needs:'Gaming streamers and YouTubers for our new AAA title launch.',   initials:'PF', gradient:'linear-gradient(135deg,#8e2de2,#4a00e0)' },
    { id:8,  name:'WealthWise',      niche:'Finance',          location:'Toronto, Canada',   budgetMin:600,  budgetMax:3500,  needs:'Finance educators and micro-creators for our investing app.',    initials:'WW', gradient:'linear-gradient(135deg,#1a1a2e,#4a90e2)' },
    { id:9,  name:'EduSpark',        niche:'Education',        location:'Singapore',         budgetMin:400,  budgetMax:2500,  needs:'Educational creators for online course promotion and tutorials.', initials:'ES', gradient:'linear-gradient(135deg,#fddb92,#d1fdff)' },
    { id:10, name:'UrbanThreads',    niche:'Fashion',          location:'Milan, Italy',      budgetMin:3000, budgetMax:15000, needs:'High-fashion macro creators for luxury streetwear lookbooks.',   initials:'UT', gradient:'linear-gradient(135deg,#232526,#414345)' },
    { id:11, name:'ByteSnack',       niche:'Tech',             location:'San Francisco, USA',budgetMin:1200, budgetMax:6000,  needs:'Tech reviewers for our new AI productivity app.',               initials:'BS', gradient:'linear-gradient(135deg,#2af598,#009efd)' },
    { id:12, name:'SolarSip',        niche:'Food & Beverage',  location:'Melbourne, Australia',budgetMin:200,budgetMax:1500, needs:'Lifestyle and wellness creators for our functional drink range.', initials:'SS', gradient:'linear-gradient(135deg,#f7971e,#84fab0)' },
  ];

  /* ─────────────────────────────────────────
     9. RENDER INFLUENCER CARDS
  ───────────────────────────────────────── */
  function renderInfluencers(list) {
    const grid = document.getElementById('influencer-grid');
    grid.innerHTML = list.map(inf => `
      <div class="inf-profile-card" data-id="${inf.id}">
        <div class="card-top">
          <div class="card-av" style="background:${inf.gradient}">${inf.initials}</div>
          <div class="card-head">
            <h4>${inf.name}</h4>
            <p class="card-handle">${inf.handle}</p>
            <span class="card-platform-badge ${inf.badge}">${inf.platform}</span>
          </div>
        </div>
        <div class="card-tags">
          <span class="card-tag"><i class="fa-solid fa-hashtag" style="font-size:.6rem"></i> ${inf.niche}</span>
        </div>
        <div class="card-stats">
          <div class="c-stat">
            <span class="c-stat-val">${inf.followers}</span>
            <span class="c-stat-lbl">Followers</span>
          </div>
          <div class="c-stat">
            <span class="c-stat-val">${inf.engRate}</span>
            <span class="c-stat-lbl">Eng. Rate</span>
          </div>
          <div class="c-stat">
            <span class="c-stat-val">${inf.rate}</span>
            <span class="c-stat-lbl">Per Post</span>
          </div>
        </div>
        <p class="card-bio">${inf.bio}</p>
        <button class="card-action collaborate-btn"
          data-name="${inf.name}"
          data-role="${inf.niche} · ${inf.followers} followers"
          data-gradient="${inf.gradient}"
          data-initials="${inf.initials}">
          <i class="fa-solid fa-handshake"></i> Collaborate
        </button>
      </div>
    `).join('');
    attachCollaborateListeners();
  }

  /* ─────────────────────────────────────────
     10. RENDER BRAND CARDS
  ───────────────────────────────────────── */
  function formatBudget(min, max) {
    const fmt = n => n >= 1000 ? `$${(n/1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `$${n}`;
    return `${fmt(min)} – ${fmt(max)}`;
  }

  function renderBrands(list) {
    const grid = document.getElementById('brand-grid');
    grid.innerHTML = list.map(brand => `
      <div class="brand-profile-card" data-id="${brand.id}">
        <div class="card-top">
          <div class="card-av" style="background:${brand.gradient}">${brand.initials}</div>
          <div class="card-head">
            <h4>${brand.name}</h4>
            <p class="card-handle"><i class="fa-solid fa-location-dot" style="font-size:.7rem;margin-right:3px"></i>${brand.location}</p>
          </div>
        </div>
        <div class="brand-niche-tag"><i class="fa-solid fa-tag" style="font-size:.65rem"></i> ${brand.niche}</div>
        <div class="budget-range">
          <i class="fa-solid fa-sack-dollar"></i>
          <span>Campaign budget: <strong style="color:var(--text-1)">${formatBudget(brand.budgetMin, brand.budgetMax)}</strong></span>
        </div>
        <div class="card-stats">
          <div class="c-stat">
            <span class="c-stat-val">${formatBudget(brand.budgetMin, brand.budgetMax)}</span>
            <span class="c-stat-lbl">Budget Range</span>
          </div>
          <div class="c-stat">
            <span class="c-stat-val">${brand.niche}</span>
            <span class="c-stat-lbl">Industry</span>
          </div>
        </div>
        <p class="card-bio">${brand.needs}</p>
        <button class="card-action connect-btn"
          data-name="${brand.name}"
          data-role="${brand.niche} · ${brand.location}"
          data-gradient="${brand.gradient}"
          data-initials="${brand.initials}">
          <i class="fa-solid fa-link"></i> Connect
        </button>
      </div>
    `).join('');
    attachConnectListeners();
  }

  /* ─────────────────────────────────────────
     11. CONNECT / COLLABORATE MODAL
  ───────────────────────────────────────── */
  const connectOverlay = document.getElementById('connect-overlay');
  const connectName    = document.getElementById('connect-name');
  const connectRole    = document.getElementById('connect-role');
  const connectAvatar  = document.getElementById('connect-avatar');

  function openConnectModal(name, role, gradient, initials) {
    connectName.textContent  = name;
    connectRole.textContent  = role;
    connectAvatar.textContent= initials;
    connectAvatar.style.background = gradient;
    document.getElementById('connect-message').value = '';
    connectOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeConnectModal() {
    connectOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.getElementById('connect-close').addEventListener('click', closeConnectModal);
  document.getElementById('connect-cancel').addEventListener('click', closeConnectModal);
  connectOverlay.addEventListener('click', e => { if (e.target === connectOverlay) closeConnectModal(); });

  document.getElementById('connect-send').addEventListener('click', () => {
    closeConnectModal();
    showToast(`Request sent to ${connectName.textContent}! 🚀`);
  });

  function attachCollaborateListeners() {
    document.querySelectorAll('.collaborate-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        openConnectModal(
          btn.dataset.name, btn.dataset.role,
          btn.dataset.gradient, btn.dataset.initials
        );
      });
    });
  }

  function attachConnectListeners() {
    document.querySelectorAll('.connect-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        openConnectModal(
          btn.dataset.name, btn.dataset.role,
          btn.dataset.gradient, btn.dataset.initials
        );
      });
    });
  }

  /* ─────────────────────────────────────────
     12. DASHBOARD SHOW / HIDE
  ───────────────────────────────────────── */
  function showDashboard(role) {
    const landingPage = document.getElementById('landing-page');
    const brandDash   = document.getElementById('brand-dashboard');
    const infDash     = document.getElementById('influencer-dashboard');

    landingPage.style.display = 'none';
    canvas.style.display      = 'none';

    if (role === 'brand') {
      brandDash.classList.remove('hidden');
      infDash.classList.add('hidden');
      // Update greeting with form value if available
      const companyVal = document.getElementById('f-company').value.trim();
      if (companyVal) document.getElementById('brand-greeting').textContent = `Welcome back, ${companyVal} 👋`;
      renderInfluencers(INFLUENCERS);
      setupDashboardSearch('influencer-search', INFLUENCERS, renderInfluencers, 'name');
      setupFilters('brand');
    } else {
      infDash.classList.remove('hidden');
      brandDash.classList.add('hidden');
      const nameVal = document.getElementById('f-fullname').value.trim();
      if (nameVal) document.getElementById('influencer-greeting').textContent = `Welcome back, ${nameVal.split(' ')[0]} 👋`;
      renderBrands(BRANDS);
      setupDashboardSearch('brand-search', BRANDS, renderBrands, 'name');
      setupFilters('influencer');
    }

    // Sidebar links
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }

  // Logout buttons
  document.getElementById('brand-logout').addEventListener('click', () => location.reload());
  document.getElementById('influencer-logout').addEventListener('click', () => location.reload());

  /* ─────────────────────────────────────────
     13. DASHBOARD SEARCH
  ───────────────────────────────────────── */
  function setupDashboardSearch(inputId, data, renderFn, searchKey) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener('input', () => {
      const query = input.value.toLowerCase();
      const filtered = data.filter(item =>
        item[searchKey].toLowerCase().includes(query) ||
        (item.niche && item.niche.toLowerCase().includes(query))
      );
      renderFn(filtered);
    });
  }

  /* ─────────────────────────────────────────
     14. FILTERS
  ───────────────────────────────────────── */
  function setupFilters(dashType) {
    if (dashType === 'brand') {
      const platSel = document.getElementById('filter-platform');
      const nicheSel = document.getElementById('filter-niche');
      const follSel  = document.getElementById('filter-followers');

      function applyInfluencerFilters() {
        let list = [...INFLUENCERS];
        if (platSel.value)  list = list.filter(i => i.platform === platSel.value);
        if (nicheSel.value) list = list.filter(i => i.niche === nicheSel.value);
        if (follSel.value) {
          const map = {
            'Nano (1K–10K)':       v => parseInt(v) <= 10,
            'Micro (10K–50K)':     v => parseInt(v) > 10 && parseInt(v) <= 50,
            'Mid-tier (50K–200K)': v => parseInt(v) > 50 && parseInt(v) <= 200,
            'Macro (200K–1M)':     v => parseInt(v) > 200 && parseInt(v) <= 1000,
            'Mega (1M+)':          v => parseInt(v) > 1000,
          };
          const fn = map[follSel.value];
          if (fn) list = list.filter(i => fn(i.followers));
        }
        renderInfluencers(list);
      }
      [platSel, nicheSel, follSel].forEach(s => s && s.addEventListener('change', applyInfluencerFilters));
    } else {
      const nicheSel   = document.getElementById('filter-brand-niche');
      const budgetSel  = document.getElementById('filter-budget');

      function applyBrandFilters() {
        let list = [...BRANDS];
        if (nicheSel.value) list = list.filter(b => b.niche === nicheSel.value);
        if (budgetSel.value) {
          const ranges = {
            '$0 – $500':    b => b.budgetMax <= 500,
            '$500 – $2K':   b => b.budgetMin >= 500  && b.budgetMax <= 2000,
            '$2K – $10K':   b => b.budgetMin >= 2000 && b.budgetMax <= 10000,
            '$10K+':        b => b.budgetMin >= 10000,
          };
          const fn = ranges[budgetSel.value];
          if (fn) list = list.filter(fn);
        }
        renderBrands(list);
      }
      [nicheSel, budgetSel].forEach(s => s && s.addEventListener('change', applyBrandFilters));
    }
  }

  /* ─────────────────────────────────────────
     15. TOAST
  ───────────────────────────────────────── */
  function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }

  /* ─────────────────────────────────────────
     16. CARD ENTER ANIMATIONS (stagger)
  ───────────────────────────────────────── */
  const cardObs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.style.opacity = '1', i * 60);
        cardObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.05 });

  // Observe future cards (profiles grid re-rendered dynamically)
  // Stagger on render via CSS animation
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @keyframes cardIn {
      from { opacity:0; transform: translateY(24px) scale(0.97); }
      to   { opacity:1; transform: translateY(0) scale(1); }
    }
    .inf-profile-card, .brand-profile-card {
      animation: cardIn 0.5s ease both;
    }
    .profiles-grid .inf-profile-card:nth-child(1),
    .profiles-grid .brand-profile-card:nth-child(1) { animation-delay: 0.05s; }
    .profiles-grid .inf-profile-card:nth-child(2),
    .profiles-grid .brand-profile-card:nth-child(2) { animation-delay: 0.1s; }
    .profiles-grid .inf-profile-card:nth-child(3),
    .profiles-grid .brand-profile-card:nth-child(3) { animation-delay: 0.15s; }
    .profiles-grid .inf-profile-card:nth-child(4),
    .profiles-grid .brand-profile-card:nth-child(4) { animation-delay: 0.2s; }
    .profiles-grid .inf-profile-card:nth-child(5),
    .profiles-grid .brand-profile-card:nth-child(5) { animation-delay: 0.25s; }
    .profiles-grid .inf-profile-card:nth-child(6),
    .profiles-grid .brand-profile-card:nth-child(6) { animation-delay: 0.3s; }
    .profiles-grid .inf-profile-card:nth-child(n+7),
    .profiles-grid .brand-profile-card:nth-child(n+7) { animation-delay: 0.35s; }
  `;
  document.head.appendChild(styleTag);

});
