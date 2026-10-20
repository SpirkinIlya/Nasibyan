document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-js="form"]').forEach(function (form) {

    function getInputWrap(field) {
      return field.closest('.input');
    }

    function showInputError(field, message) {
      const wrap = getInputWrap(field);

      if (!wrap) {
        return;
      }

      wrap.classList.add('input_error');
      field.setAttribute('aria-invalid', 'true');

      let error = wrap.querySelector('.input__error');

      if (!error) {
        error = document.createElement('span');
        error.className = 'input__error';
        error.setAttribute('role', 'alert');
        wrap.appendChild(error);
      }

      error.textContent = message;
    }

    function clearInputError(field) {
      const wrap = getInputWrap(field);

      if (!wrap) {
        return;
      }

      wrap.classList.remove('input_error');
      field.removeAttribute('aria-invalid');

      const error = wrap.querySelector('.input__error');

      if (error) {
        error.remove();
      }
    }

    function getNativeMessage(field) {
      if (field.validity.valueMissing) {
        return field.dataset.valueMissing || 'Заполните поле';
      }

      if (field.validity.typeMismatch) {
        return field.dataset.typeMismatch || 'Введите корректное значение';
      }

      if (field.validity.patternMismatch) {
        return field.dataset.patternMismatch || 'Некорректное значение';
      }

      return 'Проверьте значение поля';
    }

    function validateField(field) {
      if (!field.required && field.value.trim() === '') {
        clearInputError(field);
        return true;
      }

      if (!field.validity.valid) {
        showInputError(field, getNativeMessage(field));
        return false;
      }

      clearInputError(field);

      return true;
    }

    const fields = form.querySelectorAll(
      '.input__field'
    );

    /*
     * Ограничение ввода + очистка ошибки
     */
    fields.forEach(function (field) {
      field.addEventListener('input', function () {

        if (field.name === 'name') {
          field.value = field.value.replace(
            /[^А-Яа-яЁё\s-]/g,
            ''
          );
        }

        if (field.name === 'phone') {
          field.value = field.value.replace(
            /[^0-9+\-\s]/g,
            ''
          );
        }

        if (
          getInputWrap(field) &&
          getInputWrap(field).classList.contains('input_error')
        ) {
          validateField(field);
        }
      });

      field.addEventListener('blur', function () {
        validateField(field);
      });
    });


    /*
     * Нативная проверка перед отправкой
     */
    form.addEventListener('submit', function (event) {
      let valid = true;
      let firstInvalid = null;

      fields.forEach(function (field) {
        if (!validateField(field)) {
          valid = false;

          if (!firstInvalid) {
            firstInvalid = field;
          }
        }
      });

      const checkboxes = form.querySelectorAll(
        'input[type="checkbox"][required]'
      );

      checkboxes.forEach(function (checkbox) {
        if (!checkbox.checked) {
          valid = false;

          checkbox.setAttribute(
            'aria-invalid',
            'true'
          );

          if (!firstInvalid) {
            firstInvalid = checkbox;
          }
        } else {
          checkbox.removeAttribute(
            'aria-invalid'
          );
        }
      });

      if (!valid) {
        event.preventDefault();

        if (firstInvalid) {
          firstInvalid.focus();
        }
      }
    });
  });


  /*
   * Ошибки FetchIt 4 / FormIt
   */
  document.addEventListener('fetchit:error', function (event) {
    const {
      form,
      response
    } = event.detail;

    /*
     * response === null означает сетевую/транспортную
     * ошибку, а не ошибку конкретного поля.
     */
    if (!form || !response) {
      return;
    }

    const errors = response.data;

    if (!errors || typeof errors !== 'object') {
      return;
    }

    Object.entries(errors).forEach(function ([name, message]) {

      const field = form.elements.namedItem(name);

      if (!field) {
        return;
      }

      /*
       * Наш визуальный формат предназначен
       * для обычных input.
       */
      const wrap = field.closest('.input');

      if (!wrap) {
        field.setAttribute(
          'aria-invalid',
          'true'
        );

        return;
      }

      wrap.classList.add('input_error');

      field.setAttribute(
        'aria-invalid',
        'true'
      );

      let error = wrap.querySelector(
        '.input__error'
      );

      if (!error) {
        error = document.createElement('span');
        error.className = 'input__error';
        error.setAttribute('role', 'alert');

        wrap.appendChild(error);
      }

      error.textContent = Array.isArray(message)
        ? message[0]
        : message;
    });
  });


  /*
   * Успешная отправка
   */
  document.addEventListener('fetchit:success', function (event) {
    const { form } = event.detail;

    if (!form) {
      return;
    }

    form.querySelectorAll('.input_error').forEach(function (wrap) {
      wrap.classList.remove('input_error');

      const error = wrap.querySelector(
        '.input__error'
      );

      if (error) {
        error.remove();
      }
    });

    form.querySelectorAll('[aria-invalid="true"]').forEach(function (field) {
      field.removeAttribute('aria-invalid');
    });
  });


  /*
   * FetchIt 4 вызывает reset после штатного сброса формы.
   * На всякий случай чистим визуальные ошибки и там.
   */
  document.addEventListener('fetchit:reset', function (event) {
    const { form } = event.detail;

    if (!form) {
      return;
    }

    form.querySelectorAll('.input_error').forEach(function (wrap) {
      wrap.classList.remove('input_error');

      const error = wrap.querySelector(
        '.input__error'
      );

      if (error) {
        error.remove();
      }
    });

    form.querySelectorAll('[aria-invalid="true"]').forEach(function (field) {
      field.removeAttribute('aria-invalid');
    });
  });
});