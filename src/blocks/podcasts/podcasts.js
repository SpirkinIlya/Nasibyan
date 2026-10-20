/**
 * Podcasts — YouTube modal player
 *
 * Открывает модальное окно с iframe при клике на кнопку воспроизведения.
 * Поддерживает обычные видео и плейлисты.
 * Закрывается по крестику, клику на оверлей, клавише Escape.
 * Iframe создаётся только при открытии, очищается при закрытии — экономия трафика.
 */

function initPodcasts() {
  const items = document.querySelectorAll('[data-js="podcast-item"]');
  if (!items.length) return;

  /* ── Создаём модальное окно один раз ─────────────────────────────────── */
  const modal = document.createElement('div');
  modal.className = 'podcast-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Видеоподкаст');
  modal.hidden = true;
  modal.innerHTML = `
    <div class="podcast-modal__overlay" data-js="podcast-overlay"></div>
    <div class="podcast-modal__content">
      <button class="podcast-modal__close" data-js="podcast-close" aria-label="Закрыть">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="20" y1="4" x2="4" y2="20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      <div class="podcast-modal__player" data-js="podcast-player"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const overlay = modal.querySelector('[data-js="podcast-overlay"]');
  const closeBtn = modal.querySelector('[data-js="podcast-close"]');
  const player = modal.querySelector('[data-js="podcast-player"]');

  /* ── Открыть модалку ──────────────────────────────────────────────────── */
  function openModal(url) {
    /* autoplay=1 — начать воспроизведение сразу */
    const separator = url.includes('?') ? '&' : '?';
    const embedUrl = `${url}${separator}autoplay=1&rel=0`;

    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.title = 'Видеоподкаст';

    player.appendChild(iframe);
    modal.hidden = false;
    document.documentElement.style.overflow = 'hidden';

    /* Фокус на кнопку закрытия */
    closeBtn.focus();
  }

  /* ── Закрыть модалку ──────────────────────────────────────────────────── */
  function closeModal() {
    modal.hidden = true;
    document.documentElement.style.overflow = '';
    /* Очищаем iframe — останавливаем видео и освобождаем память */
    player.innerHTML = '';
  }

  /* ── События ──────────────────────────────────────────────────────────── */
  items.forEach((item) => {
    const btn = item.querySelector('[data-js="podcast-play"]');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const url = item.dataset.url;
      if (url) openModal(url);
    });
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPodcasts);
} else {
  initPodcasts();
}
