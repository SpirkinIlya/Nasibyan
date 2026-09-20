/**
 * form — base form handler
 *
 * Intercepts submit, sets data-state="loading" during processing.
 * Dispatches custom events for external handlers to hook into.
 *
 * data-js="form"              — <form> element
 * data-state="loading"        — while submitting
 * data-state="success"        — on successful response
 * data-state="error"          — on failed response
 *
 * Custom events fired on the form element:
 *   form:submit  — before send  (detail: { formData })
 *   form:success — on success   (detail: { response })
 *   form:error   — on failure   (detail: { error })
 */

function initForms() {
  document.querySelectorAll('[data-js="form"]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);

      // Notify listeners that submit started
      form.dispatchEvent(
        new CustomEvent('form:submit', { bubbles: true, detail: { formData } })
      );

      form.dataset.state = 'loading';

      try {
        const response = await fetch(form.action, {
          method: form.method || 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        form.dataset.state = 'success';
        form.dispatchEvent(
          new CustomEvent('form:success', { bubbles: true, detail: { response } })
        );
      } catch (error) {
        form.dataset.state = 'error';
        form.dispatchEvent(
          new CustomEvent('form:error', { bubbles: true, detail: { error } })
        );
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initForms);
} else {
  initForms();
}
