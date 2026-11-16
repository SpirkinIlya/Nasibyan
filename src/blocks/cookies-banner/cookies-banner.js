var cookieConsentKey = 'nasibyanConsentAcceptedAt';
var cookieConsentDuration = 30 * 24 * 60 * 60 * 1000;

try {
    var storedValue = window.localStorage
        ? window.localStorage.getItem(cookieConsentKey)
        : null;

    var now = Date.now();
    var shouldShowBanner = true;

    if (storedValue) {
        var storedTime = parseInt(storedValue, 10);

        if (!isNaN(storedTime) && now - storedTime < cookieConsentDuration) {
            shouldShowBanner = false;
        }
    }

    if (shouldShowBanner) {
        var banner = document.createElement('div');
        banner.className = 'cookie-banner';

        banner.innerHTML = `
            <div class="cookie-banner__inner">
                <div class="cookie-banner__text">
                    Мы используем файлы кукис для улучшения работы сайта.
                    Продолжая использовать сайт, Вы соглашаетесь с нашей
                    <a class="link" href="usloviya-obrabotki-personalnyix-dannyix">
                        Политикой конфиденциальности
                    </a>
                    и
                    <a class="link"
                       href="agree">
                        Обработкой персональных данных
                    </a>
                </div>
                <button class="cookie-banner__button" type="button">
                    Принять
                </button>
            </div>
        `;

        document.body.appendChild(banner);

        var acceptButton = banner.querySelector('.cookie-banner__button');

        acceptButton.addEventListener('click', function () {
            try {
                if (window.localStorage) {
                    window.localStorage.setItem(cookieConsentKey, String(Date.now()));
                }
            } catch (e) { }

            banner.classList.remove('cookie-banner_visible');

            setTimeout(function () {
                banner.remove();
            }, 300);
        });

        setTimeout(function () {
            banner.classList.add('cookie-banner_visible');
        }, 10);
    }
} catch (e) { }