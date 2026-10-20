/**
 * Buy Modal
 *
 * Открывает модальное окно со списком магазинов при клике на
 * любой элемент с атрибутом data-js="open-buy-modal".
 *
 * Кастомный список магазинов для конкретной книги:
 *   data-shops='[{"name":"Wildberries","url":"https://..."},...]'
 *
 * Если data-shops не задан — используется DEFAULT_SHOPS.
 */

/* Магазины по умолчанию (для книги "Провокатор") */
const DEFAULT_SHOPS = [
  { name: 'Wildberries', url: 'https://www.wildberries.ru/' },
  { name: 'Ozon', url: 'https://www.ozon.ru/' },
  { name: 'Лабиринт', url: 'https://www.labirint.ru/' },
  { name: 'Читай-город', url: 'https://www.chitai-gorod.ru/' },
  { name: 'Book24', url: 'https://book24.ru/' },
  { name: 'МИФ', url: 'https://www.mann-ivanov-ferber.ru/' },
];

function initBuyModal() {
  const modal = document.querySelector('[data-js="buy-modal"]');
  if (!modal) return;

  const overlay = modal.querySelector('[data-js="buy-modal-overlay"]');
  const closeBtn = modal.querySelector('[data-js="buy-modal-close"]');
  const list = modal.querySelector('[data-js="buy-modal-list"]');

  let lastTrigger = null;

  /* ── Построить список магазинов ─────────────────────────────────────── */
  function renderShops(shops) {
    list.innerHTML = shops
      .map(
        (shop) => `
        <li class="buy-modal__item">
          <a
            class="buy-modal__link"
            href="${shop.url}"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="buy-modal__link-name">${shop.name}</span>
            <svg class="buy-modal__link-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 13L13 3M13 3H6M13 3V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </li>`,
      )
      .join('');
  }

  /* ── Открыть ────────────────────────────────────────────────────────── */
  function openModal(trigger) {
    lastTrigger = trigger || null;

    /* Читаем shops из атрибута триггера или берём дефолтные */
    let shops = DEFAULT_SHOPS;
    try {
      const raw = trigger && trigger.dataset.shops;
      if (raw) shops = JSON.parse(raw);
    } catch {
      /* невалидный JSON — используем дефолт */
    }

    renderShops(shops);

    modal.hidden = false;
    requestAnimationFrame(() => {
      modal.dataset.state = 'open';
    });
    document.documentElement.style.overflow = 'hidden';
    closeBtn.focus();
  }

  /* ── Закрыть ────────────────────────────────────────────────────────── */
  function closeModal() {
    modal.hidden = true;
    delete modal.dataset.state;
    document.documentElement.style.overflow = '';
    if (lastTrigger) {
      lastTrigger.focus();
      lastTrigger = null;
    }
  }

  /* ── Делегирование событий ──────────────────────────────────────────── */
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-js="open-buy-modal"]');
    if (!trigger) return;
    e.preventDefault();
    openModal(trigger);
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBuyModal);
} else {
  initBuyModal();
}
