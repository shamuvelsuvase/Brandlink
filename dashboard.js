/* ════════════════════════════════════════════
   js/dashboard.js — Dashboard Render, Search, Filters
   ════════════════════════════════════════════ */
import { INFLUENCERS, BRANDS } from './data.js';

/* ── Toast ── */
function showToast(msg) {
  const toast    = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ── Format budget ── */
function fmtBudget(n) {
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `$${n}`;
}

/* ── Connect modal ── */
function initConnectModal() {
  const overlay     = document.getElementById('connect-overlay');
  const nameEl      = document.getElementById('connect-name');
  const roleEl      = document.getElementById('connect-role');
  const avatarEl    = document.getElementById('connect-avatar');
  const msgEl       = document.getElementById('connect-message');
  const sendBtn     = document.getElementById('connect-send');
  const cancelBtn   = document.getElementById('connect-cancel');
  const closeBtn    = document.getElementById('connect-close');

  function open({ name, role, gradient, initials }) {
    nameEl.textContent   = name;
    roleEl.textContent   = role;
    avatarEl.textContent = initials;
    avatarEl.style.background = gradient;
    msgEl.value          = '';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => msgEl.focus(), 300);
  }

  function close() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeBtn?.addEventListener('click',  close);
  cancelBtn?.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  sendBtn?.addEventListener('click', () => {
    close();
    showToast(`✅ Request sent to ${nameEl.textContent}!`);
  });

  return { open };
}

/* ── Influencer card HTML ── */
function influencerCardHTML(inf) {
  return `
    <div class="profile-card" data-id="${inf.id}">
      <div class="card-top">
        <div class="card-av" style="background:${inf.gradient}">${inf.initials}</div>
        <div class="card-head">
          <h4>${inf.name}</h4>
          <p class="card-handle">${inf.handle} · ${inf.location}</p>
          <span class="card-platform-badge ${inf.badge}">${inf.platform}</span>
        </div>
      </div>
      <div class="card-tags">
        <span class="card-tag"><i class="fa-solid fa-hashtag" style="font-size:.58rem"></i> ${inf.niche}</span>
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
      <button class="card-action collab-btn"
        data-name="${inf.name}"
        data-role="${inf.niche} · ${inf.followers} followers · ${inf.location}"
        data-gradient="${inf.gradient}"
        data-initials="${inf.initials}">
        <i class="fa-solid fa-handshake"></i> Collaborate
      </button>
    </div>`;
}

/* ── Brand card HTML ── */
function brandCardHTML(brand) {
  return `
    <div class="profile-card" data-id="${brand.id}">
      <div class="card-top">
        <div class="card-av" style="background:${brand.gradient}">${brand.initials}</div>
        <div class="card-head">
          <h4>${brand.name}</h4>
          <p class="card-handle"><i class="fa-solid fa-location-dot" style="font-size:.65rem;margin-right:3px"></i>${brand.location}</p>
        </div>
      </div>
      <div class="brand-niche-tag"><i class="fa-solid fa-tag" style="font-size:.6rem"></i> ${brand.niche}</div>
      <div class="budget-range">
        <i class="fa-solid fa-sack-dollar"></i>
        <span>Budget: <strong>${fmtBudget(brand.budgetMin)} – ${fmtBudget(brand.budgetMax)}</strong></span>
      </div>
      <div class="card-stats">
        <div class="c-stat">
          <span class="c-stat-val">${fmtBudget(brand.budgetMin)}</span>
          <span class="c-stat-lbl">Min Budget</span>
        </div>
        <div class="c-stat">
          <span class="c-stat-val">${fmtBudget(brand.budgetMax)}</span>
          <span class="c-stat-lbl">Max Budget</span>
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
    </div>`;
}

/* ── Render helpers ── */
function renderCards(gridId, htmlArr, connectModal, btnClass) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  if (!htmlArr.length) {
    grid.innerHTML = `<div class="empty-state">
      <i class="fa-solid fa-magnifying-glass"></i>
      <p>No results found. Try adjusting your filters.</p>
    </div>`;
    return;
  }

  grid.innerHTML = htmlArr.join('');

  grid.querySelectorAll(`.${btnClass}`).forEach(btn => {
    btn.addEventListener('click', () => {
      connectModal.open({
        name:      btn.dataset.name,
        role:      btn.dataset.role,
        gradient:  btn.dataset.gradient,
        initials:  btn.dataset.initials,
      });
    });
  });
}

/* ── Brand Dashboard ── */
function initBrandDashboard(userData, connectModal) {
  const dash = document.getElementById('brand-dashboard');
  dash.classList.remove('hidden');

  // Greeting — default to "BrandLink" if no company name entered
  const greetingName = userData.company || 'BrandLink';
  document.getElementById('brand-greeting').textContent = `Welcome, ${greetingName} 👋`;

  let filtered = [...INFLUENCERS];

  function render() {
    renderCards('influencer-grid', filtered.map(influencerCardHTML), connectModal, 'collab-btn');
  }
  render();

  // Search
  document.getElementById('influencer-search')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    filtered = INFLUENCERS.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.niche.toLowerCase().includes(q) ||
      i.location.toLowerCase().includes(q) ||
      i.handle.toLowerCase().includes(q)
    );
    applyInfluencerFilters();
  });

  // Filters
  const platSel = document.getElementById('filter-platform');
  const nicheSel = document.getElementById('filter-niche');
  const follSel  = document.getElementById('filter-followers');

  function applyInfluencerFilters() {
    let list = filtered.length !== INFLUENCERS.length ? filtered : [...INFLUENCERS];

    if (platSel?.value)  list = list.filter(i => i.platform === platSel.value);
    if (nicheSel?.value) list = list.filter(i => i.niche    === nicheSel.value);
    if (follSel?.value) {
      const follMax = { 'Under 5K': 5, '5K – 10K': 10, '10K – 15K': 15, '15K – 20K': 20 };
      const follMin = { 'Under 5K': 0, '5K – 10K': 5,  '10K – 15K': 10,'15K – 20K': 15 };
      const key = follSel.value;
      list = list.filter(i => {
        const val = parseFloat(i.followers.replace('K', ''));
        return val >= (follMin[key] || 0) && val <= (follMax[key] || 999);
      });
    }

    renderCards('influencer-grid', list.map(influencerCardHTML), connectModal, 'collab-btn');
  }

  [platSel, nicheSel, follSel].forEach(s => s?.addEventListener('change', applyInfluencerFilters));

  // Sidebar
  setupSidebarLinks(dash);

  // Logout
  document.getElementById('brand-logout')?.addEventListener('click', () => location.reload());
}

/* ── Influencer Dashboard ── */
function initInfluencerDashboard(userData, connectModal) {
  const dash = document.getElementById('influencer-dashboard');
  dash.classList.remove('hidden');

  const greetingName = userData.fullname ? userData.fullname.split(' ')[0] : 'Creator';
  document.getElementById('influencer-greeting').textContent = `Welcome, ${greetingName} 👋`;

  let filtered = [...BRANDS];

  function render() {
    renderCards('brand-grid', filtered.map(brandCardHTML), connectModal, 'connect-btn');
  }
  render();

  // Search
  document.getElementById('brand-search')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    filtered = BRANDS.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.niche.toLowerCase().includes(q) ||
      b.location.toLowerCase().includes(q)
    );
    applyBrandFilters();
  });

  // Filters
  const nicheSel  = document.getElementById('filter-brand-niche');
  const budgetSel = document.getElementById('filter-budget');

  function applyBrandFilters() {
    let list = filtered.length !== BRANDS.length ? filtered : [...BRANDS];
    if (nicheSel?.value) list = list.filter(b => b.niche === nicheSel.value);
    if (budgetSel?.value) {
      const ranges = {
        'Under $300':    b => b.budgetMax <= 300,
        '$300 – $800':   b => b.budgetMin <= 300 && b.budgetMax >= 300,
        '$800 – $1,500': b => b.budgetMin <= 800 && b.budgetMax >= 800,
        '$1,500+':       b => b.budgetMax >= 1500,
      };
      const fn = ranges[budgetSel.value];
      if (fn) list = list.filter(fn);
    }
    renderCards('brand-grid', list.map(brandCardHTML), connectModal, 'connect-btn');
  }

  [nicheSel, budgetSel].forEach(s => s?.addEventListener('change', applyBrandFilters));

  setupSidebarLinks(dash);
  document.getElementById('influencer-logout')?.addEventListener('click', () => location.reload());
}

/* ── Sidebar active link ── */
function setupSidebarLinks(dash) {
  dash.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      dash.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

/* ── Main export ── */
export function showDashboard(role, userData) {
  // Hide landing
  document.getElementById('landing-page').style.display = 'none';
  document.getElementById('bg-canvas').style.display    = 'none';

  const connectModal = initConnectModal();

  if (role === 'brand') {
    document.getElementById('influencer-dashboard').classList.add('hidden');
    initBrandDashboard(userData, connectModal);
  } else {
    document.getElementById('brand-dashboard').classList.add('hidden');
    initInfluencerDashboard(userData, connectModal);
  }
}
