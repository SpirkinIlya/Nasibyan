/**
 * Form Modal
 *
 * Глобальное модальное окно с формой записи на курс.
 *
 * Открытие — любой элемент с атрибутом data-js="show-form-modal":
 *   <button data-js="show-form-modal">Записаться</button>
 *
 * Кастомный заголовок через data-title:
 *   <button data-js="show-form-modal" data-title="Записаться на тренинг">...</button>
 *
 * Если data-title не задан — используется заголовок по умолчанию.
 *
 * Закрытие — крестик, клик на оверлей, клавиша Escape.
 */

const DEFAULT_TITLE = 'Записаться на курс';

function initFormModal() {
  const modal = document.querySelector('[data-js="form-modal"]');
  if (!modal) return;

  const overlay = modal.querySelector('[data-js="form-modal-overlay"]');
  const closeBtn = modal.querySelector('[data-js="form-modal-close"]');
  const titleEl = modal.querySelector('[data-js="form-modal-title"]');

  let lastTrigger = null;

  /* ── Открыть ────────────────────────────────────────────────────────────── */
  function openModal(trigger) {
    lastTrigger = trigger || null;

    /* Устанавливаем заголовок из data-title или дефолтный */
    if (titleEl) {
      titleEl.textContent = (trigger && trigger.dataset.title) || DEFAULT_TITLE;
    }

    modal.hidden = false;
    requestAnimationFrame(() => {
      modal.dataset.state = 'open';
    });
    document.documentElement.style.overflow = 'hidden';
    closeBtn.focus();
  }

  /* ── Закрыть ────────────────────────────────────────────────────────────── */
  function closeModal() {
    modal.hidden = true;
    delete modal.dataset.state;
    document.documentElement.style.overflow = '';
    if (lastTrigger) {
      lastTrigger.focus();
      lastTrigger = null;
    }
  }

  /* ── Триггеры — любой элемент с data-js="show-form-modal" ──────────────── */
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-js="show-form-modal"]');
    if (!trigger) return;
    e.preventDefault();
    openModal(trigger);
  });

  /* ── Закрытие ───────────────────────────────────────────────────────────── */
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFormModal);
} else {
  initFormModal();
}
