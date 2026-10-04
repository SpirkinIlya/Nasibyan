/**
 * articles — tabs collapse/expand
 *
 * If articles__tabs natural height > 169px, shows a toggle button.
 * Clicking it expands / collapses the tabs list.
 *
 * data-js="articles-tabs-wrap"   — outer wrapper
 * data-js="articles-tabs"        — flex tabs container (overflow hidden)
 * data-js="articles-tabs-toggle" — expand/collapse button (hidden by default)
 */

import { animateMaxHeight } from '../../scripts/utils/animate-height.js';

const COLLAPSED_HEIGHT = 176;

function initArticlesTabs() {
  document.querySelectorAll('[data-js="articles-tabs-wrap"]').forEach((wrap) => {
    const tabs = wrap.querySelector('[data-js="articles-tabs"]');
    const toggle = wrap.querySelector('[data-js="articles-tabs-toggle"]');

    if (!tabs || !toggle) return;

    let isOpen = false;

    function getScrollHeight() {
      // Temporarily remove max-height to measure full height
      tabs.style.maxHeight = 'none';
      const h = tabs.scrollHeight;
      tabs.style.maxHeight = '';
      return h;
    }

    function update() {
      const fullHeight = getScrollHeight();

      if (fullHeight <= COLLAPSED_HEIGHT) {
        // All tabs fit — hide button, remove max-height restriction
        toggle.hidden = true;
        tabs.style.maxHeight = 'none';
        tabs.removeAttribute('data-state');
      } else {
        // Tabs overflow — show button
        toggle.hidden = false;

        if (!isOpen) {
          tabs.style.setProperty('--tabs-scroll-height', `${fullHeight}px`);
          tabs.style.maxHeight = `${COLLAPSED_HEIGHT}px`;
          tabs.removeAttribute('data-state');
        } else {
          tabs.style.setProperty('--tabs-scroll-height', `${fullHeight}px`);
          tabs.style.maxHeight = `${fullHeight}px`;
          tabs.dataset.state = 'open';
        }
      }
    }

    toggle.addEventListener('click', () => {
      const fullHeight = getScrollHeight();
      tabs.style.setProperty('--tabs-scroll-height', `${fullHeight}px`);

      if (!isOpen) {
        // Open
        isOpen = true;
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Свернуть фильтры');
        tabs.dataset.state = 'open';
        animateMaxHeight(tabs, fullHeight);
      } else {
        // Close — the toggle stays fixed, page collapses downward
        isOpen = false;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Развернуть фильтры');
        tabs.removeAttribute('data-state');
        animateMaxHeight(tabs, COLLAPSED_HEIGHT, { anchor: true });
      }
    });

    // Initial check
    update();

    // Re-check on width resize only
    let prevWidth = wrap.offsetWidth;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = Math.round(entry.contentRect.width);

        if (newWidth === prevWidth) continue;

        prevWidth = newWidth;
        update();
      }
    });

    observer.observe(wrap);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initArticlesTabs);
} else {
  initArticlesTabs();
}
