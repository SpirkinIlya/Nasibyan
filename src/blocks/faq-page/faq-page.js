/**
 * faq-page — category tabs + search filtering
 *
 * Performance strategy:
 *   1. Build an in-memory index once on init (normalized strings, no DOM reads in hot path)
 *   2. Category switch is instant (no index needed — uses data-category attribute)
 *   3. Search debounced at 200 ms to avoid per-keystroke layout work
 *   4. All DOM visibility mutations batched in a single requestAnimationFrame
 *   5. Filter loop is a plain for-loop — O(n), no regex, no allocations
 *
 * data-js="faq-page"        — root element
 * data-js="faq-search"      — <input type="search">
 * data-js="faq-tabs"        — tabs container
 * data-js="faq-tab"         — individual category button (data-category="…")
 * data-js="faq-items"       — questions wrapper
 * data-js="faq-item"        — single question wrapper (data-category="…")
 * data-js="faq-no-results"  — "nothing found" message
 */

const DEBOUNCE_MS = 200;

/** Lowercase + collapse whitespace for consistent matching */
function normalize(str) {
  return str.toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Simple debounce */
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function initFaqPage() {
  document.querySelectorAll('[data-js="faq-page"]').forEach((root) => {
    const searchInput = root.querySelector('[data-js="faq-search"]');
    const tabs        = Array.from(root.querySelectorAll('[data-js="faq-tab"]'));
    const items       = Array.from(root.querySelectorAll('[data-js="faq-item"]'));
    const noResults   = root.querySelector('[data-js="faq-no-results"]');

    if (!items.length) return;

    // ── 1. Build search index ──────────────────────────────────────────────
    // Read all text from the DOM once — never re-read in the filter loop.
    const index = items.map((el) => {
      const questionEl = el.querySelector('.question__text');
      const answerEl   = el.querySelector('.question__answer');

      return {
        el,
        category: el.dataset.category ?? '',
        q: normalize(questionEl ? questionEl.textContent : ''),
        a: normalize(answerEl   ? answerEl.textContent   : ''),
      };
    });

    // ── 2. State ───────────────────────────────────────────────────────────
    let activeCategory = 'all';
    let searchTerm     = '';
    let rafScheduled   = false;

    // ── 3. Core filter — called at most once per rAF frame ─────────────────
    function applyFilter() {
      rafScheduled = false;

      let visibleCount = 0;

      for (const entry of index) {
        const catMatch =
          activeCategory === 'all' || entry.category === activeCategory;

        const searchMatch =
          searchTerm === '' ||
          entry.q.includes(searchTerm) ||
          entry.a.includes(searchTerm);

        const visible = catMatch && searchMatch;
        entry.el.hidden = !visible;
        if (visible) visibleCount++;
      }

      if (noResults) {
        noResults.hidden = visibleCount > 0;
      }
    }

    function scheduleFilter() {
      if (!rafScheduled) {
        rafScheduled = true;
        requestAnimationFrame(applyFilter);
      }
    }

    // ── 4. Tab click ───────────────────────────────────────────────────────
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        if (tab.dataset.category === activeCategory) return;

        // Update active tab UI
        tabs.forEach((t) => {
          t.classList.remove('tab_active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('tab_active');
        tab.setAttribute('aria-selected', 'true');

        activeCategory = tab.dataset.category ?? 'all';
        scheduleFilter();
      });
    });

    // ── 5. Search input (debounced) ────────────────────────────────────────
    if (searchInput) {
      const onSearch = debounce(() => {
        searchTerm = normalize(searchInput.value);
        scheduleFilter();
      }, DEBOUNCE_MS);

      searchInput.addEventListener('input', onSearch);

      // Clear search on Escape
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          searchInput.value = '';
          searchTerm = '';
          scheduleFilter();
        }
      });
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFaqPage);
} else {
  initFaqPage();
}
