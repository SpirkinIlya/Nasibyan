/**
 * lectures — interactive lecture selector
 *
 * Click a lectures__item:
 *   - Desktop (≥ 1200px): lecture-card appears below the entire grid
 *   - Mobile / Tablet (< 1200px): lecture-card appears inside the grid,
 *     spanning full width, directly after the row of the clicked item
 *
 * Clicking the active item again closes the card.
 * Clicking a different item updates the card content.
 *
 * data-js="lectures"       — root <section>
 * data-js="lectures-wrap"  — container holding the grid + card
 * data-js="lectures-items" — CSS grid with item buttons
 * data-js="lectures-item"  — individual item button
 */

const DESKTOP_BP = 1200;
const ANIM_MS = 350;

// Minimal HTML escape to safely insert data-attribute values into innerHTML
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Count grid columns from computed style
function getColCount(itemsEl) {
  return getComputedStyle(itemsEl).gridTemplateColumns.split(' ').length;
}

// Index of the last item in the same grid row as clickedIndex
function rowEndIndex(clickedIndex, totalItems, itemsEl) {
  const cols = getColCount(itemsEl);
  const rowStart = Math.floor(clickedIndex / cols) * cols;
  return Math.min(rowStart + cols - 1, totalItems - 1);
}

// Build and return a new .lecture-card element
function buildCard(lecture) {
  const card = document.createElement('div');
  card.className = 'lecture-card';
  card.dataset.js = 'lecture-card';

  card.innerHTML = `
    <img class="lecture-card__image"
         src="${esc(lecture.image)}"
         alt="${esc(lecture.title)}"
         loading="lazy">
    <div class="lecture-card__info">
      <p class="lecture-card__title">${esc(lecture.title)}</p>
      <p class="lecture-card__description">${esc(lecture.description)}</p>
      <a class="button button_theme_primary" href="${esc(lecture.url)}">
        <span class="button__text">Подробнее</span>
      </a>
    </div>
  `;

  return card;
}

// Insert card at the right position depending on viewport width
function insertCard(card, activeItem, items, itemsEl, wrap) {
  if (window.innerWidth >= DESKTOP_BP) {
    // Desktop: append after the grid inside the wrap
    wrap.appendChild(card);
  } else {
    // Mobile / Tablet: insert after the last item in the clicked item's row
    const idx = parseInt(activeItem.dataset.index, 10);
    const endIdx = rowEndIndex(idx, items.length, itemsEl);
    items[endIdx].insertAdjacentElement('afterend', card);
  }
}

// Animate card out, call onDone after animation completes
function closeCard(card, onDone) {
  card.dataset.state = 'closing';
  setTimeout(() => {
    card.remove();
    onDone?.();
  }, ANIM_MS);
}

function initLectures() {
  document.querySelectorAll('[data-js="lectures"]').forEach((root) => {
    const wrap = root.querySelector('[data-js="lectures-wrap"]');
    const itemsEl = root.querySelector('[data-js="lectures-items"]');
    if (!wrap || !itemsEl) return;

    const items = Array.from(itemsEl.querySelectorAll('[data-js="lectures-item"]'));
    if (!items.length) return;

    let activeItem = null; // currently selected button
    let card = null;       // current .lecture-card element
    let isAnimating = false;

    function getLecture(item) {
      return {
        title: item.dataset.title ?? '',
        description: item.dataset.description ?? '',
        image: item.dataset.image ?? '',
        url: item.dataset.url ?? '#',
      };
    }

    function deactivateAll() {
      items.forEach((it) => {
        it.setAttribute('aria-expanded', 'false');
      });
    }

    function openCard(item) {
      deactivateAll();
      item.setAttribute('aria-expanded', 'true');
      activeItem = item;

      card = buildCard(getLecture(item));
      insertCard(card, item, items, itemsEl, wrap);
    }

    function handleItemClick(item) {
      if (isAnimating) return;

      // Same item — toggle off
      if (activeItem === item) {
        isAnimating = true;
        deactivateAll();
        activeItem = null;

        closeCard(card, () => {
          card = null;
          isAnimating = false;
        });

        return;
      }

      // Different item — close existing, then open new
      if (card) {
        isAnimating = true;

        closeCard(card, () => {
          card = null;
          openCard(item);
          isAnimating = false;
        });
      } else {
        openCard(item);
      }
    }

    items.forEach((item) => {
      item.addEventListener('click', () => handleItemClick(item));
    });

    // ── Reposition card on resize (width change only) ──────────────────────

    let prevWidth = root.offsetWidth;
    let resizeTimer;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = Math.round(entry.contentRect.width);
        if (newWidth === prevWidth) continue;
        prevWidth = newWidth;

        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (!activeItem || !card || !card.isConnected) return;

          // Re-insert without animation (instant reposition)
          card.style.animation = 'none';
          card.remove();
          insertCard(card, activeItem, items, itemsEl, wrap);

          // Re-enable animation on next frame
          requestAnimationFrame(() => {
            card.style.animation = '';
          });
        }, 150);
      }
    });

    observer.observe(root);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLectures);
} else {
  initLectures();
}
