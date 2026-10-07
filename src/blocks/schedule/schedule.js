import Swiper from 'swiper';
import { Navigation, Grid } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/grid';

function initSchedule() {
    // ── Swiper ──────────────────────────────────────────────────────────────────

    new Swiper('.schedule__swiper', {
        modules: [Navigation, Grid],
        slidesPerView: 1,
        grid: {
            rows: 1,
        },
        spaceBetween: 24,
        navigation: {
            nextEl: '.button-next',
            prevEl: '.button-prev',
        },
        breakpoints: {
            768: {
                slidesPerView: 2,
                grid: {
                    rows: 2,
                },
            },
            1200: {
                slidesPerView: 3,
                grid: {
                    rows: 2,
                },
            },
        },
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSchedule);
} else {
    initSchedule();
}