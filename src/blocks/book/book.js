
// Импорт функции-конструктора GLightbox
import GLightbox from 'glightbox';

// Импорт стилей (обязательно для корректного отображения)
import 'glightbox/dist/css/glightbox.min.css';

function initBookGallery() {

    const lightbox = GLightbox({
        selector: '.book__gallery-item',
        zoomable: false
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBookGallery);
} else {
    initBookGallery();
}