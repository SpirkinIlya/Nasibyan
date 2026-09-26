import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import PhotoSwipeLightbox from 'photoswipe/lightbox';

import 'swiper/css';
import 'photoswipe/style.css';

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

    const lightbox = new PhotoSwipeLightbox({
        gallery: '#gallery-about',
        children: 'a',
        pswpModule: () => import('photoswipe/lightbox'),
    });

    lightbox.init();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGallery);
} else {
    initGallery();
}