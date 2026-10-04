/**
 * animateMaxHeight — JS-driven max-height animation with optional scroll anchor.
 *
 * Why not a CSS transition + scroll compensation in rAF?
 *   - rAF reads the layout of the PREVIOUS frame, while the CSS transition
 *     advances during style recalc → compensation always lags one frame.
 *     With tall content (thousands of px on mobile) that lag = visible jitter.
 *   - The JS timer and the CSS transition never end at the same moment →
 *     the last frames are not compensated → jump at the end.
 *   - Native scroll anchoring (overflow-anchor) fights with manual scrolling.
 *
 * Here height and scroll are written in the same frame, so the element
 * below the collapsing block (the toggle) stays perfectly still.
 *
 * @param {HTMLElement} el            element whose max-height is animated
 * @param {number}      to            target max-height in px
 * @param {object}      [options]
 * @param {boolean}     [options.anchor=false] keep content BELOW `el` fixed
 *                                     in the viewport (use when collapsing)
 * @param {Function}    [options.onDone] called when the animation finishes
 */

const running = new WeakMap();
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const MIN_DURATION = 300;
const MAX_DURATION = 700;
const MS_PER_PX = 0.35;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
}

export function animateMaxHeight(el, to, { anchor = false, onDone } = {}) {
  // Interrupt an animation already running on this element
  running.get(el)?.cancel();

  const from = el.getBoundingClientRect().height;
  const delta = to - from;

  const duration = reducedMotion.matches
    ? 0
    : Math.min(MAX_DURATION, Math.max(MIN_DURATION, Math.abs(delta) * MS_PER_PX));

  const html = document.documentElement;
  const prevTransition = el.style.transition;
  const prevOverflowAnchor = html.style.overflowAnchor;

  el.style.transition = 'none';
  html.style.overflowAnchor = 'none';

  const startScroll = window.scrollY;
  const startTime = performance.now();
  let rafId = 0;

  function finish() {
    running.delete(el);
    // Flush styles BEFORE restoring the CSS transition, otherwise the browser
    // would animate the last few px again and the page would jump at the end
    void el.offsetHeight;
    el.style.transition = prevTransition;
    html.style.overflowAnchor = prevOverflowAnchor;
  }

  function frame(now) {
    const t = duration ? Math.min(1, (now - startTime) / duration) : 1;
    const height = from + delta * easeInOutCubic(t);

    el.style.maxHeight = `${height}px`;

    if (anchor) {
      // Height shrank by (from - height) → scroll up by the same amount
      window.scrollTo({ top: startScroll + (height - from), behavior: 'instant' });
    }

    if (t < 1) {
      rafId = requestAnimationFrame(frame);
    } else {
      finish();
      onDone?.();
    }
  }

  running.set(el, {
    cancel() {
      cancelAnimationFrame(rafId);
      finish();
    },
  });

  rafId = requestAnimationFrame(frame);
}
