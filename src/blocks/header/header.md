# header

Шапка сайта. Содержит логотип и навигационное меню. Получает данные из `global.json`.

## Использование

```njk
{% from "blocks/header/header.njk" import header %}

{{ header({ navigation: global.navigation, siteName: global.site.name }) }}
```

Подключается автоматически через `layouts/base.njk` — отдельно импортировать на страницах не нужно.

## Параметры

| Параметр      | Тип    | По умолчанию | Описание                                      |
| ------------- | ------ | ------------ | --------------------------------------------- |
| `siteName`    | string | —            | Название сайта, отображается как логотип-ссылка |
| `navigation`  | array  | —            | Массив пунктов меню (см. структуру ниже)      |

### Структура `navigation`

```json
[
  { "text": "Главная", "href": "/" },
  { "text": "Услуги",  "href": "/services/" },
  { "text": "Контакты", "href": "/contacts/" }
]
```

| Поле   | Тип    | Описание          |
| ------ | ------ | ----------------- |
| `text` | string | Текст пункта меню |
| `href` | string | URL пункта меню   |

## Данные

Меню берётся из `src/data/global.json`:

```json
{
  "site": { "name": "Site name" },
  "navigation": [
    { "text": "Главная", "href": "/" }
  ]
}
```

## Структура HTML

```html
<header class="header">
  <div class="container header__container">
    <a class="header__logo" href="/">Site name</a>
    <nav class="header__nav" aria-label="Основная навигация">
      <ul class="header__list">
        <li class="header__item">
          <a class="header__link" href="/">Главная</a>
        </li>
      </ul>
    </nav>
  </div>
</header>
```
