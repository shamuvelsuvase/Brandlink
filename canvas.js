/* ════════════════════════════════════════════
   js/canvas.js — Particle & Orb Background
   ════════════════════════════════════════════ */

export function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, animId;
  const particles = [];
  let animT = 0;

  const COLORS = ['0,229,255', '162,89,255', '255,107,203'];

  class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x     = Math.random() * W;
      this.y     = initial ? Math.random() * H : (Math.random() > 0.5 ? -5 : H + 5);
      this.r     = Math.random() * 1.6 + 0.3;
      this.vx    = (Math.random() - 0.5) * 0.28;
      this.vy    = (Math.random() - 0.5) * 0.28;
      this.alpha = Math.random() * 0.45 + 0.08;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.life  = 0;
      this.maxLife = 600 + Math.random() * 400;
    }

    update() {
      this.x   += this.vx;
      this.y   += this.vy;
      this.life++;
      const fadeZone = 60;
      const progress = this.life / this.maxLife;
      if (progress < fadeZone / this.maxLife) {
        this.alpha = (progress / (fadeZone / this.maxLife)) * 0.5;
      } else if (progress > 1 - (fadeZone / this.maxLife)) {
        this.alpha = ((1 - progress) / (fadeZone / this.maxLife)) * 0.5;
      }
      if (this.life >= this.maxLife) this.reset();
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
      ctx.fill();
    }
  }

  const ORBS = [
    { xFrac: 0.12, yFrac: 0.5,  color: '157,0,255',  r: 320, speed: 0.0003 },
    { xFrac: 0.88, yFrac: 0.28, color: '0,229,255',  r: 260, speed: 0.00025 },
    { xFrac: 0.5,  yFrac: 0.88, color: '255,107,203',r: 200, speed: 0.0004 },
    { xFrac: 0.7,  yFrac: 0.6,  color: '162,89,255', r: 180, speed: 0.00035 },
  ];

  function drawOrbs() {
    ORBS.forEach((o, i) => {
      const phase = animT * o.speed + i * Math.PI * 0.5;
      const x = (o.xFrac + Math.sin(phase) * 0.06) * W;
      const y = (o.yFrac + Math.cos(phase * 0.8) * 0.06) * H;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, o.r);
      grad.addColorStop(0, `rgba(${o.color},0.09)`);
      grad.addColorStop(0.5, `rgba(${o.color},0.04)`);
      grad.addColorStop(1, `rgba(${o.color},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, o.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawConnections() {
    const maxDist = 100;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < maxDist * maxDist) {
          const dist = Math.sqrt(d2);
          const alpha = 0.08 * (1 - dist / maxDist);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,229,255,${alpha})`;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      }
    }
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function init() {
    resize();
    particles.length = 0;
    const count = Math.min(80, Math.floor((W * H) / 16000));
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    animT++;
    drawOrbs();
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    animId = requestAnimationFrame(frame);
  }

  init();
  frame();

  const handleResize = () => { cancelAnimationFrame(animId); init(); frame(); };
  window.addEventListener('resize', handleResize, { passive: true });

  // Pause when tab hidden (perf)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animId);
    else frame();
  });
}
