# footer

Подвал сайта. Содержит копирайт. Получает данные из `global.json`.

## Использование

```njk
{% from "blocks/footer/footer.njk" import footer %}

{{ footer({ siteName: global.site.name }) }}
```

Подключается автоматически через `layouts/base.njk` — отдельно импортировать на страницах не нужно.

## Параметры

| Параметр   | Тип    | По умолчанию | Описание                            |
| ---------- | ------ | ------------ | ----------------------------------- |
| `siteName` | string | —            | Название сайта, выводится в копирайт |

## Структура HTML

```html
<footer class="footer">
  <div class="container footer__container">
    <p class="footer__copy">© Site name</p>
  </div>
</footer>
```
