/**
 * bottom-nav — fixed mobile navigation bar
 *
 * Appears after scrolling SCROLL_THRESHOLD px down.
 * Hidden on viewports >= 768px via CSS.
 *
 * data-js="bottom-nav"  — the nav element
 * data-state="visible"  — added when bar should be shown
 */

const SCROLL_THRESHOLD = 50;

function initBottomNav() {
  const nav = document.querySelector('[data-js="bottom-nav"]');
  if (!nav) return;

  function update() {
    if (window.scrollY >= SCROLL_THRESHOLD) {
      nav.dataset.state = 'visible';
    } else {
      delete nav.dataset.state;
    }
  }

  window.addEventListener('scroll', update, { passive: true });

  // Check position on load (e.g. page opened mid-scroll)
  update();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBottomNav);
} else {
  initBottomNav();
}
