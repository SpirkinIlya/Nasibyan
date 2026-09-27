import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css';

// Импорт функции-конструктора GLightbox
import GLightbox from 'glightbox';

// Импорт стилей (обязательно для корректного отображения)
import 'glightbox/dist/css/glightbox.min.css';

function initTravelling() {
    // ── Swiper ──────────────────────────────────────────────────────────────────

    new Swiper('.travelling__swiper', {
        modules: [Navigation],
        slidesPerView: 'auto',
        spaceBetween: 8,
        navigation: {
            nextEl: '.button-next',
            prevEl: '.button-prev',
        },
    });

    // ── PhotoSwipe ──────────────────────────────────────────────────────────────

    const lightbox = GLightbox({
        selector: '.gallery-travelling',
        zoomable: false
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTravelling);
} else {
    initTravelling();
}