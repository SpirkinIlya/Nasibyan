# Nasibyan Frontend

Многостраничный frontend-проект на Vite + Nunjucks с компонентной структурой блоков.

Проект автоматически:

- находит страницы в `src/pages/`;
- собирает каждую страницу в отдельный URL;
- формирует служебную главную страницу со ссылками на все страницы проекта;
- определяет используемые Nunjucks-блоки по цепочке зависимостей шаблонов;
- подключает CSS и JS только тех блоков, которые используются на конкретной странице;
- обрабатывает CSS, JS и ассеты через Vite;
- поддерживает HMR в режиме разработки.

---

## Требования

- Node.js `>=20.19.0`
- npm

Проверить версию Node.js:

```bash
node -v
```

---

## Установка

```bash
npm install
```

---

## Основные команды

### Режим разработки

```bash
npm run dev
```

Проект запускается по адресу:

```
http://localhost:3000/
```

Корневой URL `/` — служебный навигатор, автоматически содержит ссылки на все страницы.

### Production-сборка

```bash
npm run build
```

Результат создаётся в `dist/`.

### Просмотр production-сборки

```bash
npm run build
npm run preview
```

### Линтинг

```bash
npm run lint        # JS + CSS
npm run lint:js     # только ESLint
npm run lint:css    # только Stylelint
```

### Форматирование

```bash
npm run format
```

Prettier форматирует JS, CSS, Nunjucks, JSON.

---

## Структура проекта

```text
project/
│
├── public/
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   │
│   ├── assets/
│   │   ├── fonts/
│   │   ├── icons/
│   │   └── images/
│   │
│   ├── blocks/
│   │   ├── button/
│   │   │   ├── button.njk
│   │   │   ├── button.css
│   │   │   └── button.md      ← документация блока
│   │   │
│   │   ├── header/
│   │   │   ├── header.njk
│   │   │   ├── header.css
│   │   │   └── header.md
│   │   │
│   │   └── footer/
│   │       ├── footer.njk
│   │       ├── footer.css
│   │       └── footer.md
│   │
│   ├── data/
│   │   └── global.json
│   │
│   ├── layouts/
│   │   └── base.njk
│   │
│   ├── pages/
│   │   ├── index/
│   │   │   ├── index.njk
│   │   │   ├── index.json
│   │   │   ├── index.css
│   │   │   └── index.js
│   │   │
│   │   └── ui/
│   │       ├── ui.njk
│   │       ├── ui.json
│   │       └── ui.css
│   │
│   ├── scripts/
│   │   └── main.js
│   │
│   └── styles/
│       ├── fonts.css       ← @font-face объявления
│       ├── reset.css
│       ├── variables.css
│       ├── typography.css
│       └── globals.css
│
├── vite.config.js
├── package.json
├── package-lock.json
├── .editorconfig
├── .gitignore
├── .nvmrc
├── .prettierrc
├── eslint.config.js
└── .stylelintrc.json
```

---

## URL страниц

Корневой URL `/` — служебный навигатор (авто-генерируется):

```
http://localhost:3000/
```

Страницы проекта доступны по шаблону `/<page>/`:

```
/index/    ← главная страница сайта
/ui/       ← UI Kit
/about/    ← пример будущей страницы
```

> Страница `index` — это полноценная страница проекта, она открывается по `/index/`, а не по `/`. Корневой `/` — только навигатор для разработки.

---

## Production-структура

```text
dist/
├── index.html          ← навигатор (служебная страница)
├── index/
│   └── index.html      ← главная страница сайта → /index/
├── ui/
│   └── index.html      ← UI Kit → /ui/
└── assets/
    ├── main-[hash].css
    ├── main-[hash].js
    ├── index-[hash].css
    ├── ui-[hash].css
    └── *.ttf / *.woff2 / *.svg / *.webp
```

---

## Создание новой страницы

Например, требуется страница `about`.

1. Создать директорию:

```text
src/pages/about/
```

2. Обязательный файл:

```text
src/pages/about/about.njk
```

3. При необходимости:

```text
src/pages/about/about.json   ← данные страницы
src/pages/about/about.css    ← стили страницы
src/pages/about/about.js     ← скрипты страницы
```

Страница автоматически доступна по:

```
/about/
```

И появляется в навигаторе на `/`. Изменять `vite.config.js` не нужно.

---

## Блоки

Переиспользуемые компоненты находятся в `src/blocks/`.

### Структура блока

```text
blocks/
└── card/
    ├── card.njk    ← шаблон (макрос)
    ├── card.css    ← стили (опционально)
    ├── card.js     ← скрипты (опционально)
    └── card.md     ← документация блока
```

CSS и JS блока необязательны. Если их нет, блок всё равно работает.

### Авто-подключение CSS и JS блоков

**Ручное добавление CSS/JS блоков в `base.njk` не требуется.**

`vite.config.js` автоматически анализирует цепочку Nunjucks-зависимостей страницы и инжектирует CSS и JS только тех блоков, которые реально используются.

Если страница использует:

```njk
{% extends "layouts/base.njk" %}
```

А `base.njk` использует `header` и `footer`, то CSS и JS этих блоков подключатся автоматически — даже через несколько уровней вложенности.

**Важно**: анализ зависимостей работает только со статическими путями:

```njk
{% include "blocks/card/card.njk" %}   ← ✅ определяется автоматически
{% include blockPath %}                 ← ❌ динамический путь, не определяется
```

### Использование блока в шаблоне

```njk
{% from "blocks/button/button.njk" import button %}

{{ button({ text: "Нажать", theme: "primary" }) }}
```

Или через include:

```njk
{% include "blocks/card/card.njk" %}
```

---

## Документация блоков

Каждый блок должен содержать файл `<block>.md` с описанием параметров.

Пример для `button.md`:

```markdown
# button

## Параметры

| Параметр | Тип    | По умолчанию | Описание          |
| -------- | ------ | ------------ | ----------------- |
| text     | string | —            | Текст кнопки      |
| theme    | string | —            | primary/secondary |
| type     | string | —            | "link" → рендерит <a> |
```

---

## Данные

### Данные страницы

```text
src/pages/about/about.json
```

```json
{
  "meta": {
    "title": "О нас",
    "description": "Страница о нас",
    "canonical": "/about/"
  }
}
```

Доступны в шаблоне через объект `page`:

```njk
{{ page.meta.title }}
```

### Глобальные данные

```text
src/data/global.json
```

```json
{
  "site": { "name": "Nasibyan" },
  "navigation": [
    { "text": "Главная", "href": "/index/" }
  ]
}
```

Доступны в любом шаблоне через `global`:

```njk
{{ global.site.name }}
```

Изменения `global.json` вызывают полный reload в dev-режиме.

---

## Layout

Основной layout:

```text
src/layouts/base.njk
```

Содержит HTML-скелет, глобальные стили, header и footer.

Пример страницы:

```njk
{% extends "layouts/base.njk" %}

{% block content %}
  <section class="hero">
    <h1>Заголовок</h1>
  </section>
{% endblock %}
```

Доступные блоки:

```njk
{% block head %}{% endblock %}      ← дополнительные теги в <head>
{% block content %}{% endblock %}   ← контент страницы
{% block scripts %}{% endblock %}   ← дополнительные скрипты перед </body>
```

---

## Стили

### Глобальные стили (`src/styles/`)

| Файл              | Назначение                          |
| ----------------- | ----------------------------------- |
| `fonts.css`       | `@font-face` объявления             |
| `reset.css`       | Сброс браузерных стилей             |
| `variables.css`   | CSS-переменные (токены)             |
| `typography.css`  | Типографика (заголовки, body)       |
| `globals.css`     | Общие стили: `.container` и т.д.   |

Подключаются в `base.njk` один раз для всех страниц.

### Стили блоков

```text
src/blocks/card/card.css
```

Подключаются **автоматически** для страниц, которые используют блок. Не нужно добавлять вручную в `base.njk`.

### Стили страниц

```text
src/pages/about/about.css
```

Подключаются вручную через блок `{% block head %}`:

```njk
{% block head %}
  <link rel="stylesheet" href="/pages/about/about.css" />
{% endblock %}
```

---

## JavaScript

### Глобальный JS

```text
src/scripts/main.js
```

Подключается в `base.njk` для всех страниц.

### JS блока

```text
src/blocks/card/card.js
```

Подключается **автоматически** для страниц, которые используют блок.

### JS страницы

```text
src/pages/about/about.js
```

Подключается вручную через блок `{% block scripts %}`:

```njk
{% block scripts %}
  <script type="module" src="/pages/about/about.js"></script>
{% endblock %}
```

---

## CSS-переменные

Все токены проекта определены в `src/styles/variables.css`.

Основные группы:

```css
/* Контейнер */
--container-width: 1280px;
--container-padding: 40px;

/* Отступы */
--space-1: 4px; /* ... */ --space-8: 64px;

/* Цвета — primary */
--color-dark: #0e0d0b;
--color-white: #fff;

/* Цвета — accent */
--color-accent-sand: #c59857;
--color-accent-brown: #5a4025;
--color-accent-pale: #dabdab;
--color-accent-red: #9a1710;

/* Шрифты */
--font-primary: 'Rubik', sans-serif;
--font-secondary: 'Source Serif 4', serif;
--font-weight-light: 300;
--font-weight-regular: 400;
--font-weight-medium: 500;

/* Типографика заголовков */
--text-h1: 48px;   --text-h1-mobile: 40px;
--text-h2: 42px;   --text-h2-mobile: 30px;
--text-h3: 26px;
```

---

## Шрифты

Шрифтовые файлы хранятся в:

```text
src/assets/fonts/
```

`@font-face` объявления находятся в `src/styles/fonts.css`. При production-сборке файлы шрифтов получают хеш в имени и копируются в `dist/assets/`.

---

## Assets

```text
src/assets/
├── fonts/     ← шрифты
├── icons/     ← иконки
└── images/    ← изображения
```

Ресурсы проходят обработку Vite и при сборке получают хеш в имени файла.

### Public

```text
public/
├── favicon.ico
└── robots.txt
```

Копируются в корень `dist/` без обработки Vite. Используй для файлов, которым нужно сохранить исходное имя.

---

## Алиасы

| Алиас     | Путь               |
| --------- | ------------------ |
| `@blocks` | `src/blocks`       |
| `@assets` | `src/assets`       |
| `@styles` | `src/styles`       |
| `@data`   | `src/data`         |
| `@pages`  | `src/pages`        |

Доступны в JS и CSS там, где это поддерживается Vite.

---

## HMR

В режиме разработки полный reload выполняется при изменениях:

```text
*.njk                     ← любой шаблон
src/pages/**/*.json       ← данные страниц
src/data/global.json      ← глобальные данные
```

CSS и JS обрабатываются стандартным HMR Vite (без перезагрузки страницы).

---

## Правила именования

### Страницы

```text
src/pages/<page>/<page>.njk
src/pages/<page>/<page>.json
src/pages/<page>/<page>.css
src/pages/<page>/<page>.js
```

### Блоки

```text
src/blocks/<block>/<block>.njk
src/blocks/<block>/<block>.css
src/blocks/<block>/<block>.js
src/blocks/<block>/<block>.md
```

Совпадение имени директории и файлов обязательно — это используется для автоматического определения ассетов.

---

## Рекомендации

- Переиспользуемые компоненты выносить в `src/blocks/`.
- В `src/pages/` оставлять только код, специфичный для конкретной страницы.
- Не добавлять CSS/JS блоков вручную в `base.njk` — они подключаются автоматически.
- Хранить стили компонента рядом с блоком, а не в `globals.css`.
- Повторно используемые данные хранить в `global.json`, данные страницы — в `<page>.json`.
- Использовать статические пути в Nunjucks-зависимостях для корректного авто-анализа.

---

## Перед коммитом

```bash
npm run format
npm run lint
npm run build
```

---

## Быстрый старт

```bash
npm install
npm run dev
```

Открыть `http://localhost:3000/` — навигатор по страницам.

Перейти на главную страницу: `http://localhost:3000/index/`

Для production:

```bash
npm run build
npm run preview
```
