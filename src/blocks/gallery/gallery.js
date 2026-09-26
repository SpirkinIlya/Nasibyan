import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css';

// Импорт функции-конструктора GLightbox
import GLightbox from 'glightbox';

// Импорт стилей (обязательно для корректного отображения)
import 'glightbox/dist/css/glightbox.min.css';

function initGallery() {
    // ── Swiper ──────────────────────────────────────────────────────────────────

    new Swiper('.gallery__swiper', {
        modules: [Navigation],
        slidesPerView: 1,
        spaceBetween: 24,
        navigation: {
            nextEl: '.button-next',
            prevEl: '.button-prev',
        },
        breakpoints: {
            768: { slidesPerView: 2 },
            1200: { slidesPerView: 3 },
        },
    });

    // ── PhotoSwipe ──────────────────────────────────────────────────────────────

    const lightbox = GLightbox();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGallery);
} else {
    initGallery();
}