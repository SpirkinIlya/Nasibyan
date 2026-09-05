# button

Универсальная кнопка. По умолчанию рендерится как `<button>`, при `type: "link"` — как `<a>`.

## Использование

```njk
{% from "blocks/button/button.njk" import button %}

{{ button({ text: "Отправить", theme: "primary" }) }}
{{ button({ text: "Подробнее", type: "link", href: "/catalog/", theme: "secondary" }) }}
```

## Параметры

| Параметр     | Тип     | По умолчанию | Описание                                                  |
| ------------ | ------- | ------------ | --------------------------------------------------------- |
| `text`       | string  | —            | Текст кнопки                                              |
| `type`       | string  | —            | `"link"` — рендерит `<a>`, иначе `<button>`              |
| `buttonType` | string  | `"button"`   | Атрибут `type` для `<button>`: `button`, `submit`, `reset` |
| `href`       | string  | `"#"`        | URL для `type: "link"`                                    |
| `target`     | string  | —            | Атрибут `target` для ссылки (`"_blank"` и др.)            |
| `theme`      | string  | —            | Визуальный вариант: `primary`, `secondary`                |
| `size`       | string  | —            | Размер: `large`, `small`                                  |
| `width`      | string  | —            | Ширина: `full`                                            |
| `disabled`   | boolean | —            | Отключает кнопку (только для `<button>`)                  |
| `ariaLabel`  | string  | —            | Атрибут `aria-label`                                      |

> При `target: "_blank"` автоматически добавляется `rel="noopener noreferrer"`.

## Модификаторы

| Класс                    | Параметр           |
| ------------------------ | ------------------ |
| `button_theme_primary`   | `theme: "primary"` |
| `button_theme_secondary` | `theme: "secondary"` |
| `button_size_large`      | `size: "large"`    |
| `button_size_small`      | `size: "small"`    |
| `button_width_full`      | `width: "full"`    |

## Примеры

```njk
{{# Обычная кнопка #}}
{{ button({ text: "Нажми меня", theme: "primary" }) }}

{{# Submit для формы #}}
{{ button({ text: "Отправить", theme: "primary", buttonType: "submit" }) }}

{{# Ссылка #}}
{{ button({ text: "Подробнее", type: "link", href: "/about/", theme: "secondary" }) }}

{{# Ссылка в новой вкладке #}}
{{ button({ text: "Открыть", type: "link", href: "https://example.com", target: "_blank" }) }}

{{# Большая кнопка на всю ширину #}}
{{ button({ text: "Получить доступ", theme: "primary", size: "large", width: "full" }) }}

{{# Неактивная кнопка #}}
{{ button({ text: "Недоступно", theme: "primary", disabled: true }) }}
```
