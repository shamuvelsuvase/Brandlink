/* ════════════════════════════════════════════
   js/main.js — Entry point, wires everything together
   ════════════════════════════════════════════ */
import { initCanvas }     from './canvas.js';
import { initAuth }       from './auth.js';
import { showDashboard }  from './dashboard.js';
import {
  initScrollReveal,
  initCounters,
  initHoverTilt,
  addCardStaggerCSS,
  initHeader,
  initHamburger,
  initRipple,
} from './animations.js';

document.addEventListener('DOMContentLoaded', () => {

  /* 1. Canvas background */
  initCanvas();

  /* 2. Header scroll + mobile menu */
  initHeader();
  initHamburger();

  /* 3. Scroll reveal animations */
  initScrollReveal();

  /* 4. Stat counters */
  initCounters();

  /* 5. Card hover tilt */
  initHoverTilt();

  /* 6. Inject stagger animation CSS for profile cards */
  addCardStaggerCSS();

  /* 7. Button ripple */
  initRipple();

  /* 8. Auth modal — pass callback to show dashboard on success */
  initAuth((role, userData) => {
    showDashboard(role, userData);
  });

});
