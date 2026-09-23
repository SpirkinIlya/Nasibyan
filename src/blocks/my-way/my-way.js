/**
 * my-way — collapsible text block
 *
 * Shows COLLAPSED_LINES lines of text, hides the rest.
 * Clicking the toggle expands / collapses with a smooth animation.
 * Recalculates on container width change (e.g. window resize).
 *
 * data-js="my-way"        — root element
 * data-js="my-way-wrap"   — scrollable text wrapper
 * data-js="my-way-toggle" — button
 * data-state="open"       — set on root when expanded
 * data-state="no-clamp"   — set on root when content fits (no toggle needed)
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

      /** Returns current lineHeight and collapsedHeight based on computed styles. */
      function getMetrics() {
        const lineHeight = parseFloat(getComputedStyle(textEl).lineHeight);
        return {
          lineHeight,
          collapsedHeight: Math.round(lineHeight * COLLAPSED_LINES),
        };
      }

      /**
       * Applies the correct state (clamped / open / no-clamp).
       * Safe to call repeatedly — idempotent when dimensions haven't changed.
       */
      function applyState() {
        const { lineHeight, collapsedHeight } = getMetrics();
        const isOpen = root.dataset.state === 'open';

        // Content fits: hide button, remove height limit and gradient.
        if (wrap.scrollHeight <= collapsedHeight + lineHeight) {
          toggle.hidden = true;
          wrap.style.maxHeight = 'none';
          root.dataset.state = 'no-clamp';
          return;
        }

        // Content is long enough to clamp.
        toggle.hidden = false;

        if (isOpen) {
          // Keep expanded: update to new scrollHeight (text may reflow on resize).
          wrap.style.maxHeight = `${wrap.scrollHeight}px`;
        } else {
          // Collapsed: apply clamped height and clear any stale state.
          wrap.style.maxHeight = `${collapsedHeight}px`;
          delete root.dataset.state;
        }
      }

      // ── Initial state ────────────────────────────────────────────────────

      applyState();

      // ── Toggle click ─────────────────────────────────────────────────────

      toggle.addEventListener('click', () => {
        const { collapsedHeight } = getMetrics();
        const isOpen = root.dataset.state === 'open';

        if (isOpen) {
          // Pin current height so the animation has a defined start
          wrap.style.maxHeight = `${wrap.scrollHeight}px`;

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const anchorY = toggle.getBoundingClientRect().top;

              wrap.style.maxHeight = `${collapsedHeight}px`;

              const TRANSITION_MS = 350;
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
          // Expand: animate to full content height.
          wrap.style.maxHeight = `${wrap.scrollHeight}px`;
          root.dataset.state = 'open';
          toggle.setAttribute('aria-expanded', 'true');
          toggle.setAttribute('aria-label', 'Свернуть');
        }
      });

      // ── Resize handling ──────────────────────────────────────────────────
      // Recalculate only when container WIDTH changes to avoid looping on
      // height changes caused by expand / collapse animation.

      let prevWidth = root.offsetWidth;
      let resizeTimer;

      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const newWidth = Math.round(entry.contentRect.width);

          if (newWidth === prevWidth) continue; // height-only change — skip

          prevWidth = newWidth;
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(applyState, 150);
        }
      });

      observer.observe(root);
    });
}

// Module scripts are deferred — DOM may already be ready by the time this runs.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMyWay);
} else {
  initMyWay();
}
