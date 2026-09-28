document.querySelectorAll('.smotrim-facade').forEach(function (facade) {
    facade.addEventListener('click', function () {
        if (facade.dataset.loaded === 'true') {
            return;
        }

        facade.dataset.loaded = 'true';

        const videoId = facade.dataset.videoId;

        const iframe = document.createElement('iframe');

        iframe.src = 'https://player.smotrim.ru/iframe/video/id/' + videoId;
        iframe.allow = 'autoplay; fullscreen; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.setAttribute('title', 'Видео');

        facade.innerHTML = '';
        facade.appendChild(iframe);
    });
});