/**
 * Success Modal
 *
 * Показывается автоматически при успешной отправке любой формы (событие fetchit:success).
 * Если форма находилась внутри form-modal — тот закрывается первым.
 *
 * Закрытие — кнопка «Закрыть», клик на оверлей, клавиша Escape.
 * Автозакрытие через AUTO_CLOSE_MS если пользователь не взаимодействовал.
 */

const AUTO_CLOSE_MS = 5000;

function initSuccessModal() {
  const modal = document.querySelector('[data-js="success-modal"]');
  if (!modal) return;

  const overlay = modal.querySelector('[data-js="success-modal-overlay"]');
  const closeBtn = modal.querySelector('[data-js="success-modal-close"]');

  let autoCloseTimer = null;

  /* ── Открыть ────────────────────────────────────────────────────────────── */
  function openModal() {
    modal.hidden = false;
    requestAnimationFrame(() => {
      modal.dataset.state = 'open';
    });
    /* Скролл уже заблокирован если была form-modal, иначе блокируем сами */
    document.documentElement.style.overflow = 'hidden';
    closeBtn.focus();

    autoCloseTimer = setTimeout(closeModal, AUTO_CLOSE_MS);
  }

  /* ── Закрыть ────────────────────────────────────────────────────────────── */
  function closeModal() {
    clearTimeout(autoCloseTimer);
    modal.hidden = true;
    delete modal.dataset.state;
    document.documentElement.style.overflow = '';
  }

  /* ── Закрытие ───────────────────────────────────────────────────────────── */
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  /* Любое взаимодействие сбрасывает таймер автозакрытия */
  modal.addEventListener('pointerdown', () => clearTimeout(autoCloseTimer));

  /* ── Публичный API для form.js ──────────────────────────────────────────── */
  modal._open = openModal;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSuccessModal);
} else {
  initSuccessModal();
}
