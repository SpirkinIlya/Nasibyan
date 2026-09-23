/**
 * autobiography — collapsible text block
 *
 * Same logic as my-way: shows 10 lines, hides the rest.
 * Recalculates on container width change.
 *
 * data-js="autobiography"        — root element
 * data-js="autobiography-wrap"   — scrollable text wrapper
 * data-js="autobiography-toggle" — button
 * data-state="open"              — set on root when expanded
 * data-state="no-clamp"          — set on root when content fits (no toggle needed)
 */

const COLLAPSED_LINES = 12;

function initAutobiography() {
  document
    .querySelectorAll('[data-js="autobiography"]')
    .forEach((root) => {
      const wrap = root.querySelector('[data-js="autobiography-wrap"]');
      const toggle = root.querySelector('[data-js="autobiography-toggle"]');

      if (!wrap || !toggle) return;

      const textEl = wrap.querySelector('p') ?? wrap;

      function getMetrics() {
        const lineHeight = parseFloat(getComputedStyle(textEl).lineHeight);
        return {
          lineHeight,
          collapsedHeight: Math.round(lineHeight * COLLAPSED_LINES),
        };
      }

      function applyState() {
        const { lineHeight, collapsedHeight } = getMetrics();
        const isOpen = root.dataset.state === 'open';

        // Content fits within 10 lines — hide toggle, remove restriction
        if (wrap.scrollHeight <= collapsedHeight + lineHeight) {
          toggle.hidden = true;
          wrap.style.maxHeight = 'none';
          root.dataset.state = 'no-clamp';
          return;
        }

        toggle.hidden = false;

        if (isOpen) {
          wrap.style.maxHeight = `${wrap.scrollHeight}px`;
        } else {
          wrap.style.maxHeight = `${collapsedHeight}px`;
          delete root.dataset.state;
        }
      }

      // Initial
      applyState();

      // Toggle click
      toggle.addEventListener('click', () => {
        const { collapsedHeight } = getMetrics();
        const isOpen = root.dataset.state === 'open';

        if (isOpen) {
          // Pin current height so the animation has a starting point
          wrap.style.maxHeight = `${wrap.scrollHeight}px`;

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              // Record where the toggle sits in the viewport RIGHT BEFORE collapse
              const anchorY = toggle.getBoundingClientRect().top;

              // Start CSS transition
              wrap.style.maxHeight = `${collapsedHeight}px`;

              // During the 400ms transition, keep the toggle anchored at anchorY
              // by compensating scroll every frame
              const TRANSITION_MS = 400;
              const startTime = performance.now();

              function tick(now) {
                const drift = toggle.getBoundingClientRect().top - anchorY;

                if (Math.abs(drift) >= 1) {
                  window.scrollBy({ top: drift, behavior: 'instant' });
                }

                if (now - startTime < TRANSITION_MS) {
                  requestAnimationFrame(tick);
                }
              }

              requestAnimationFrame(tick);
            });
          });

          delete root.dataset.state;
          toggle.setAttribute('aria-expanded', 'false');
          toggle.setAttribute('aria-label', 'Читать полностью');
        } else {
          // Expand
          wrap.style.maxHeight = `${wrap.scrollHeight}px`;
          root.dataset.state = 'open';
          toggle.setAttribute('aria-expanded', 'true');
          toggle.setAttribute('aria-label', 'Свернуть');
        }
      });

      // Recalculate only on WIDTH change (avoid loop from height changes)
      let prevWidth = root.offsetWidth;
      let resizeTimer;

      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const newWidth = Math.round(entry.contentRect.width);
          if (newWidth === prevWidth) continue;
          prevWidth = newWidth;
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(applyState, 150);
        }
      });

      observer.observe(root);
    });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAutobiography);
} else {
  initAutobiography();
}
