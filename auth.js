/* ════════════════════════════════════════════
   js/auth.js — Auth Modal Flow
   ════════════════════════════════════════════ */

export function initAuth(onLoginSuccess) {
  /* ── DOM refs ── */
  const overlay       = document.getElementById('auth-overlay');
  const stepChoose    = document.getElementById('step-choose');
  const stepForm      = document.getElementById('step-form');
  const formTitle     = document.getElementById('form-title');
  const formSubtitle  = document.getElementById('form-subtitle');
  const submitBtn     = document.getElementById('form-submit-btn');
  const brandFields   = document.getElementById('brand-fields');
  const infFields     = document.getElementById('influencer-fields');
  const formRoleSel   = document.getElementById('form-role-selector');
  const tabLogin      = document.getElementById('tab-login');
  const tabSignup     = document.getElementById('tab-signup');
  const froleBrand    = document.getElementById('frole-brand');
  const froleInf      = document.getElementById('frole-influencer');
  const switchTextEl  = document.getElementById('form-switch-text');
  const togglePwBtn   = document.getElementById('toggle-pw');
  const passwordInput = document.getElementById('f-password');
  const authForm      = document.getElementById('auth-form');

  let currentRole = 'brand';   // 'brand' | 'influencer'
  let currentTab  = 'signup';  // 'signup' | 'login'

  /* ── Open / Close ── */
  function open(startStep = 'choose', tab = 'signup', role = 'brand') {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    currentRole = role;
    if (startStep === 'choose') {
      showStep('choose');
    } else {
      showStep('form');
      setTab(tab);
    }
  }

  function close() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showStep(step) {
    stepChoose.classList.toggle('hidden', step !== 'choose');
    stepForm.classList.toggle('hidden',   step !== 'form');
  }

  /* ── Role ── */
  function setRole(role) {
    currentRole = role;
    froleBrand.classList.toggle('active', role === 'brand');
    froleInf.classList.toggle('active',   role === 'influencer');

    if (currentTab === 'signup') {
      brandFields.classList.toggle('hidden', role !== 'brand');
      infFields.classList.toggle('hidden',   role !== 'influencer');
    }
    updateSubmitText();
  }

  /* ── Tab ── */
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
      switchTextEl.innerHTML = `Don't have an account? <button class="link-btn" id="sw-btn">Sign up</button>`;
    } else {
      formTitle.textContent    = 'Create your account';
      formSubtitle.textContent = "Tell us who you are — we'll tune your matches from day one.";
      formRoleSel.classList.remove('hidden');
      setRole(currentRole);
      switchTextEl.innerHTML = `Already have an account? <button class="link-btn" id="sw-btn">Log in</button>`;
    }

    document.getElementById('sw-btn')?.addEventListener('click', () => {
      setTab(tab === 'login' ? 'signup' : 'login');
    });

    updateSubmitText();
  }

  function updateSubmitText() {
    if (currentTab === 'login') {
      submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Log in';
    } else if (currentRole === 'brand') {
      submitBtn.innerHTML = '<i class="fa-solid fa-building-columns"></i> Create brand account';
    } else {
      submitBtn.innerHTML = '<i class="fa-solid fa-user-astronaut"></i> Create influencer account';
    }
  }

  /* ── Trigger buttons ── */
  const triggers = [
    { id: 'nav-login-btn',  step: 'form', tab: 'login'  },
    { id: 'nav-signup-btn', step: 'choose' },
    { id: 'hero-cta',       step: 'choose' },
    { id: 'cta-bottom',     step: 'choose' },
    { id: 'mobile-cta',     step: 'choose' },
  ];
  triggers.forEach(({ id, step, tab = 'signup' }) => {
    document.getElementById(id)?.addEventListener('click', (e) => {
      e.preventDefault();
      open(step, tab);
    });
  });

  /* ── Close triggers ── */
  document.getElementById('modal-close')?.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  /* ── Step 1 role cards ── */
  document.getElementById('choose-brand')?.addEventListener('click', () => {
    currentRole = 'brand';
    showStep('form');
    setTab('signup');
    setRole('brand');
  });
  document.getElementById('choose-influencer')?.addEventListener('click', () => {
    currentRole = 'influencer';
    showStep('form');
    setTab('signup');
    setRole('influencer');
  });
  document.getElementById('already-login')?.addEventListener('click', () => {
    showStep('form');
    setTab('login');
  });

  /* ── In-form tab switches ── */
  tabLogin?.addEventListener('click',  () => setTab('login'));
  tabSignup?.addEventListener('click', () => setTab('signup'));

  /* ── In-form role switches ── */
  froleBrand?.addEventListener('click', () => setRole('brand'));
  froleInf?.addEventListener('click',   () => setRole('influencer'));

  /* ── Password toggle ── */
  togglePwBtn?.addEventListener('click', () => {
    const isText = passwordInput.type === 'text';
    passwordInput.type = isText ? 'password' : 'text';
    togglePwBtn.querySelector('i').className = isText
      ? 'fa-regular fa-eye'
      : 'fa-regular fa-eye-slash';
  });

  /* ── Form submit ── */
  authForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const userData = collectFormData();
    close();
    onLoginSuccess(currentRole, userData);
  });

  function collectFormData() {
    return {
      role: currentRole,
      email:      document.getElementById('f-email')?.value.trim() || '',
      company:    document.getElementById('f-company')?.value.trim() || '',
      fullname:   document.getElementById('f-fullname')?.value.trim() || '',
      niche:      document.getElementById('f-niche')?.value || '',
      location:   document.getElementById('f-location')?.value.trim() || '',
      budgetMin:  document.getElementById('f-budget-min')?.value || '',
      budgetMax:  document.getElementById('f-budget-max')?.value || '',
      needs:      document.getElementById('f-campaign-needs')?.value.trim() || '',
      handle:     document.getElementById('f-handle')?.value.trim() || '',
      platform:   document.getElementById('f-platform')?.value || '',
      followers:  document.getElementById('f-followers')?.value || '',
      contentNiche: document.getElementById('f-content-niche')?.value || '',
      rate:       document.getElementById('f-rate')?.value || '',
      bio:        document.getElementById('f-bio')?.value.trim() || '',
    };
  }

  /* ── Logo click → home ── */
  document.getElementById('logo-home')?.addEventListener('click', e => e.preventDefault());

  // Expose open for external use
  return { open, close };
}
