document.addEventListener("DOMContentLoaded", function () {

  document.querySelectorAll("[data-js=\"form\"]").forEach(function (form) {

    function getInputWrap(field) {
      return field.closest(".input");
    }


    function showInputError(field, message) {
      const wrap = getInputWrap(field);

      if (!wrap) {
        return;
      }

      wrap.classList.add("input_error");

      field.setAttribute("aria-invalid", "true");

      let error = wrap.querySelector(".input__error");

      if (!error) {
        error = document.createElement("span");
        error.className = "input__error";
        error.setAttribute("role", "alert");

        wrap.appendChild(error);
      }

      error.textContent = message;
    }


    function clearInputError(field) {
      const wrap = getInputWrap(field);

      if (!wrap) {
        return;
      }

      wrap.classList.remove("input_error");

      field.removeAttribute("aria-invalid");

      const error = wrap.querySelector(".input__error");

      if (error) {
        error.remove();
      }
    }


    function validateField(field) {
      const value = field.value.trim();


      /*
       * Обязательное поле
       */
      if (field.required && value === "") {

        let message = "Заполните поле";

        if (field.name === "name") {
          message = "Введите ФИО";
        }

        if (field.name === "phone") {
          message = "Введите телефон";
        }

        showInputError(field, message);

        return false;
      }


      /*
       * ФИО
       */
      if (
        field.name === "name" &&
        value !== "" &&
        !/^[А-Яа-яЁё]+(?:[\s-][А-Яа-яЁё]+)*$/u.test(value)
      ) {
        showInputError(
          field,
          "Используйте только кириллицу, пробел и дефис"
        );

        return false;
      }


      /*
       * Телефон
       */
      if (
        field.name === "phone" &&
        value !== "" &&
        !/^[0-9+\-\s]+$/.test(value)
      ) {
        showInputError(
          field,
          "Допустимы только цифры, + и -"
        );

        return false;
      }


      /*
       * Email необязательный.
       * Но если заполнен - проверяем формат.
       */
      if (
        field.name === "email" &&
        value !== "" &&
        !field.validity.valid
      ) {
        showInputError(
          field,
          "Введите корректный Email"
        );

        return false;
      }


      clearInputError(field);

      return true;
    }


    const fields = form.querySelectorAll(".input__field");


    /*
     * Обработка ввода
     */
    fields.forEach(function (field) {

      field.addEventListener("input", function () {

        let forbiddenCharEntered = false;


        /*
         * ФИО
         */
        if (field.name === "name") {

          const originalValue = field.value;

          const filteredValue = originalValue.replace(
            /[^А-Яа-яЁё\s-]/gu,
            ""
          );

          if (originalValue !== filteredValue) {

            forbiddenCharEntered = true;

            field.value = filteredValue;

            showInputError(
              field,
              "Используйте только кириллицу, пробел и дефис"
            );
          }
        }


        /*
         * Телефон
         */
        if (field.name === "phone") {

          const originalValue = field.value;

          const filteredValue = originalValue.replace(
            /[^0-9+\-\s]/g,
            ""
          );

          if (originalValue !== filteredValue) {

            forbiddenCharEntered = true;

            field.value = filteredValue;

            showInputError(
              field,
              "Допустимы только цифры, + и -"
            );
          }
        }


        /*
         * Если только что был введен запрещенный символ,
         * оставляем ошибку на экране.
         */
        if (forbiddenCharEntered) {
          return;
        }


        /*
         * Если ошибка уже есть и пользователь
         * продолжил корректный ввод - перепроверяем поле.
         */
        const wrap = getInputWrap(field);

        if (
          wrap &&
          wrap.classList.contains("input_error")
        ) {
          validateField(field);
        }

      });


      /*
       * Проверяем при уходе из поля.
       */
      field.addEventListener("blur", function () {
        validateField(field);
      });

    });


    /*
     * Проверка checkbox после изменения.
     */
    form
      .querySelectorAll("input[type=\"checkbox\"][required]")
      .forEach(function (checkbox) {

        checkbox.addEventListener("change", function () {

          if (checkbox.checked) {
            checkbox.removeAttribute("aria-invalid");
          }

        });

      });


    /*
     * Проверка перед отправкой.
     */
    form.addEventListener("submit", function (event) {

      let valid = true;
      let firstInvalid = null;


      /*
       * Обычные поля
       */
      fields.forEach(function (field) {

        if (!validateField(field)) {

          valid = false;

          if (!firstInvalid) {
            firstInvalid = field;
          }
        }

      });


      /*
       * Обязательные checkbox
       */
      form
        .querySelectorAll("input[type=\"checkbox\"][required]")
        .forEach(function (checkbox) {

          if (!checkbox.checked) {

            valid = false;

            checkbox.setAttribute(
              "aria-invalid",
              "true"
            );

            if (!firstInvalid) {
              firstInvalid = checkbox;
            }

          } else {

            checkbox.removeAttribute(
              "aria-invalid"
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
   * Серверные ошибки FetchIt 4.0.0-pl
   */
  document.addEventListener("fetchit:error", function (event) {

    const detail = event.detail || {};
    const form = detail.form;
    const response = detail.response;

    if (!form || !response) {
      return;
    }

    const errors = response.data;

    if (!errors || typeof errors !== "object") {
      return;
    }


    Object.entries(errors).forEach(function ([name, message]) {

      const field = form.elements.namedItem(name);

      if (!field) {
        return;
      }


      /*
       * Checkbox
       */
      if (field.type === "checkbox") {

        field.setAttribute(
          "aria-invalid",
          "true"
        );

        return;
      }


      /*
       * Обычный input
       */
      const wrap = field.closest(".input");

      if (!wrap) {
        return;
      }

      wrap.classList.add("input_error");

      field.setAttribute(
        "aria-invalid",
        "true"
      );


      let error = wrap.querySelector(
        ".input__error"
      );

      if (!error) {

        error = document.createElement("span");

        error.className = "input__error";

        error.setAttribute(
          "role",
          "alert"
        );

        wrap.appendChild(error);
      }


      error.textContent = Array.isArray(message)
        ? message[0]
        : message;

    });

  });


  /*
   * Успешная отправка FetchIt
   */
  document.addEventListener("fetchit:success", function (event) {

    const form = event.detail?.form;

    if (!form) {
      return;
    }


    /*
     * Очищаем ошибки
     */
    form
      .querySelectorAll(".input_error")
      .forEach(function (wrap) {

        wrap.classList.remove("input_error");

        const error = wrap.querySelector(
          ".input__error"
        );

        if (error) {
          error.remove();
        }

      });


    form
      .querySelectorAll("[aria-invalid=\"true\"]")
      .forEach(function (field) {

        field.removeAttribute(
          "aria-invalid"
        );

      });


    /*
     * Если форма находилась внутри form-modal — закрываем его.
     */
    const formModal = form.closest("[data-js=\"form-modal\"]");

    if (formModal) {
      formModal.hidden = true;
      delete formModal.dataset.state;
    }


    /*
     * Показываем уведомление об успешной отправке.
     * success-modal инициализируется в success-modal.js и хранит
     * публичный метод _open на DOM-элементе.
     */
    const successModal = document.querySelector("[data-js=\"success-modal\"]");

    if (successModal && typeof successModal._open === "function") {
      successModal._open();
    }

  });


  /*
   * Сброс формы FetchIt
   */
  document.addEventListener("fetchit:reset", function (event) {

    const form = event.detail?.form;

    if (!form) {
      return;
    }


    form
      .querySelectorAll(".input_error")
      .forEach(function (wrap) {

        wrap.classList.remove("input_error");

        const error = wrap.querySelector(
          ".input__error"
        );

        if (error) {
          error.remove();
        }

      });


    form
      .querySelectorAll("[aria-invalid=\"true\"]")
      .forEach(function (field) {

        field.removeAttribute(
          "aria-invalid"
        );

      });

  });

});