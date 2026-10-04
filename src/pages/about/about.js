/**
 * about — intro text collapsible
 *
 * Shows 6 lines of text on mobile (< 1200px).
 * On desktop the text is always fully visible and toggle is hidden via CSS.
 *
 * data-js="intro-text"        — root wrapper (receives data-state)
 * data-js="intro-text-wrap"   — collapsible text container
 * data-js="intro-text-toggle" — button with arrow icon
 */

import { animateMaxHeight } from '../../scripts/utils/animate-height.js';

const COLLAPSED_LINES = 6;
const DESKTOP_BP = 1200;
const TRANSITION_MS = 400;

function initIntroText() {
  const root = document.querySelector('[data-js="intro-text"]');
  if (!root) return;

  const wrap = root.querySelector('[data-js="intro-text-wrap"]');
  const toggle = root.querySelector('[data-js="intro-text-toggle"]');
  if (!wrap || !toggle) return;

  // Reference paragraph for line-height measurement
  const textEl = wrap.querySelector('p') ?? wrap;

  function getMetrics() {
    const lineHeight = parseFloat(getComputedStyle(textEl).lineHeight);
    return {
      lineHeight,
      collapsedHeight: Math.round(lineHeight * COLLAPSED_LINES),
    };
  }

  function isDesktop() {
    return window.innerWidth >= DESKTOP_BP;
  }

  function applyState(instant = false) {
    // On desktop: remove all restrictions, CSS hides the toggle
    if (isDesktop()) {
      wrap.style.transition = 'none';
      wrap.style.maxHeight = 'none';
      delete root.dataset.state;
      return;
    }

    const { lineHeight, collapsedHeight } = getMetrics();
    const isOpen = root.dataset.state === 'open';

    // Content fits within 6 lines — no toggle needed
    if (wrap.scrollHeight <= collapsedHeight + lineHeight) {
      wrap.style.maxHeight = 'none';
      root.dataset.state = 'no-clamp';
      return;
    }

    if (instant) {
      wrap.style.transition = 'none';
    }

    wrap.style.maxHeight = isOpen
      ? `${wrap.scrollHeight}px`
      : `${collapsedHeight}px`;

    if (!isOpen && root.dataset.state !== 'no-clamp') {
      delete root.dataset.state;
    }

    if (instant) {
      requestAnimationFrame(() => {
        wrap.style.transition = `max-height ${TRANSITION_MS}ms ease`;
      });
    }
  }

  // ── Initial state (no animation) ───────────────────────────────────────────

  applyState(true);
  toggle.setAttribute('aria-expanded', 'false');

  // ── Toggle click ────────────────────────────────────────────────────────────

  toggle.addEventListener('click', () => {
    const { collapsedHeight } = getMetrics();
    const isOpen = root.dataset.state === 'open';

    if (isOpen) {
      // Collapse — the toggle stays fixed, content above folds down
      animateMaxHeight(wrap, collapsedHeight, { anchor: true });

      delete root.dataset.state;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Читать полностью');
    } else {
      animateMaxHeight(wrap, wrap.scrollHeight);
      root.dataset.state = 'open';
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Свернуть');
    }
  });

  // ── Resize — recalculate on width change only ───────────────────────────────

  let prevWidth = root.offsetWidth;
  let resizeTimer;

  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const newWidth = Math.round(entry.contentRect.width);
      if (newWidth === prevWidth) continue;
      prevWidth = newWidth;

      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const wasOpen = root.dataset.state === 'open';
        applyState(true);

        if (wasOpen && !isDesktop()) {
          // Restore open state after resize
          wrap.style.maxHeight = `${wrap.scrollHeight}px`;
          root.dataset.state = 'open';
        }
      }, 150);
    }
  });

  observer.observe(root);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initIntroText);
} else {
  initIntroText();
}
