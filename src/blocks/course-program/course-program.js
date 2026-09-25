/**
 * course-program — expandable program schedule
 *
 * Collapsed: shows 1 day (mobile) or 2 days/1 grid row (≥1200px).
 * Button click expands/collapses with scroll anchor on collapse.
 * ResizeObserver recalculates on container width change.
 *
 * data-js="course-program"         — root <section>
 * data-js="course-program-wrap"    — CSS grid with .course-program__day items
 * data-js="course-program-control" — wrapper with the toggle <button>
 */

const DESKTOP_BP = 1200;
const TRANSITION_MS = 400;
const TEXT_EXPAND = 'Развернуть ↓';
const TEXT_COLLAPSE = 'Свернуть ↑';

function initCourseProgram() {
  document.querySelectorAll('[data-js="course-program"]').forEach((root) => {
    const wrap = root.querySelector('[data-js="course-program-wrap"]');
    const control = root.querySelector('[data-js="course-program-control"]');
    if (!wrap || !control) return;

    const toggle = control.querySelector('button');
    if (!toggle) return;

    const days = Array.from(wrap.querySelectorAll('.course-program__day'));
    if (!days.length) return;

    let isOpen = false;

    // ── Helpers ──────────────────────────────────────────────────────────────

    function getVisibleCount() {
      return window.innerWidth >= DESKTOP_BP ? 2 : 1;
    }

    /**
     * Height of the wrap needed to show exactly getVisibleCount() days.
     * Uses getBoundingClientRect — works even when wrap is currently clipped,
     * because overflow:hidden only clips visually, not the reported layout.
     */
    function getCollapsedHeight() {
      const visibleCount = getVisibleCount();
      const wrapTop = wrap.getBoundingClientRect().top;
      let maxBottom = 0;

      for (let i = 0; i < Math.min(visibleCount, days.length); i++) {
        const bottom = days[i].getBoundingClientRect().bottom - wrapTop;
        maxBottom = Math.max(maxBottom, bottom);
      }

      return Math.max(0, maxBottom);
    }

    function setToggleText(open) {
      const span = toggle.querySelector('.button__text');
      if (span) span.textContent = open ? TEXT_COLLAPSE : TEXT_EXPAND;
    }

    /**
     * Apply the collapsed state.
     * @param {boolean} instant — skip CSS transition (used on init and resize)
     */
    function applyCollapsed(instant) {
      // If all days fit, no need for the toggle
      if (days.length <= getVisibleCount()) {
        control.hidden = true;
        wrap.style.maxHeight = 'none';
        return;
      }

      control.hidden = false;

      const collapsed = getCollapsedHeight();

      if (instant) {
        wrap.style.transition = 'none';
        wrap.style.maxHeight = `${collapsed}px`;
        // Re-enable transition after paint so next interactions animate
        requestAnimationFrame(() => {
          wrap.style.transition = `max-height ${TRANSITION_MS}ms ease`;
        });
      } else {
        wrap.style.maxHeight = `${collapsed}px`;
      }
    }

    // ── Initial state (no animation) ─────────────────────────────────────────

    toggle.setAttribute('aria-expanded', 'false');
    applyCollapsed(true);

    // ── Toggle click ─────────────────────────────────────────────────────────

    toggle.addEventListener('click', () => {
      if (isOpen) {
        // ── Collapse with scroll anchor so button stays in viewport ──────────
        const anchorY = toggle.getBoundingClientRect().top;

        // Pin to current full height so transition has a defined start
        wrap.style.maxHeight = `${wrap.scrollHeight}px`;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const collapsed = getCollapsedHeight();
            wrap.style.maxHeight = `${collapsed}px`;

            // Keep toggle at anchorY during the transition
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

        isOpen = false;
        toggle.setAttribute('aria-expanded', 'false');
        setToggleText(false);
      } else {
        // ── Expand ────────────────────────────────────────────────────────────
        wrap.style.maxHeight = `${wrap.scrollHeight}px`;
        isOpen = true;
        toggle.setAttribute('aria-expanded', 'true');
        setToggleText(true);
      }
    });

    // ── Resize: recalculate on width change only ──────────────────────────────

    let prevWidth = root.offsetWidth;
    let resizeTimer;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = Math.round(entry.contentRect.width);
        if (newWidth === prevWidth) continue;
        prevWidth = newWidth;

        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (!isOpen) {
            applyCollapsed(true); // instant: no animation during resize
          } else {
            // Content may have reflowed (e.g. text wrapping) — update to new scrollHeight
            wrap.style.maxHeight = `${wrap.scrollHeight}px`;
          }
        }, 150);
      }
    });

    observer.observe(root);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCourseProgram);
} else {
  initCourseProgram();
}
