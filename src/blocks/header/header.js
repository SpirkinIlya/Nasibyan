/**
 * header — mobile menu toggle
 *
 * data-js="header"              — root <header> element
 * data-js="header-burger"       — hamburger button
 * data-js="header-drawer"       — slide-in menu panel
 * data-js="header-drawer-close" — close button inside drawer
 * data-js="header-overlay"      — backdrop
 * data-state="menu-open"        — set on <header> when menu is open
 */

function initHeader() {
  const header = document.querySelector('[data-js="header"]');
  if (!header) return;

  const burger = header.querySelector('[data-js="header-burger"]');
  const drawer = header.querySelector('[data-js="header-drawer"]');
  const closeBtn = header.querySelector('[data-js="header-drawer-close"]');
  const overlay = header.querySelector('[data-js="header-overlay"]');

  if (!burger || !drawer || !closeBtn || !overlay) return;

  function openMenu() {
    header.dataset.state = 'menu-open';
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Закрыть меню');
    drawer.setAttribute('aria-hidden', 'false');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Move focus into the drawer for accessibility
    closeBtn.focus();
  }

  function closeMenu() {
    delete header.dataset.state;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Return focus to the burger button
    burger.focus();
  }

  burger.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && header.dataset.state === 'menu-open') {
      closeMenu();
    }
  });

  // Close menu when window resizes to desktop width
  const mql = window.matchMedia('(min-width: 1200px)');
  mql.addEventListener('change', (e) => {
    if (e.matches && header.dataset.state === 'menu-open') {
      closeMenu();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeader);
} else {
  initHeader();
}
