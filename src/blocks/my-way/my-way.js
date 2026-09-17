/**
 * my-way — collapsible text block
 *
 * Reads 10 lines from computed line-height, hides the rest.
 * Clicking the toggle expands / collapses with a smooth animation.
 *
 * data-js="my-way"        — root element
 * data-js="my-way-wrap"   — scrollable text wrapper
 * data-js="my-way-toggle" — button
 * data-state="open"       — set on root when expanded
 */

const COLLAPSED_LINES = 10;

function initMyWay() {
  document
    .querySelectorAll('[data-js="my-way"]')
    .forEach((root) => {
      const wrap = root.querySelector('[data-js="my-way-wrap"]');
      const toggle = root.querySelector('[data-js="my-way-toggle"]');

      if (!wrap || !toggle) return;

      const textEl = wrap.querySelector('p') ?? wrap;
      const lineHeight = parseFloat(getComputedStyle(textEl).lineHeight);
      const collapsedHeight = Math.round(lineHeight * COLLAPSED_LINES);

      // If the content is short enough — hide the toggle
      if (wrap.scrollHeight <= collapsedHeight) {
        toggle.hidden = true;
        return;
      }

      wrap.style.maxHeight = `${collapsedHeight}px`;

      toggle.addEventListener('click', () => {
        const isOpen = root.dataset.state === 'open';

        if (isOpen) {
          // Collapse: set current scrollHeight first, then animate down
          wrap.style.maxHeight = `${wrap.scrollHeight}px`;

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              wrap.style.maxHeight = `${collapsedHeight}px`;
            });
          });

          delete root.dataset.state;
          toggle.setAttribute('aria-expanded', 'false');
          toggle.setAttribute('aria-label', 'Читать полностью');
        } else {
          // Expand: animate to full height
          wrap.style.maxHeight = `${wrap.scrollHeight}px`;

          root.dataset.state = 'open';
          toggle.setAttribute('aria-expanded', 'true');
          toggle.setAttribute('aria-label', 'Свернуть');
        }
      });
    });
}

// Module scripts are deferred — DOM may already be ready by the time this runs.
// Check readyState to avoid missing the DOMContentLoaded event.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMyWay);
} else {
  initMyWay();
}
