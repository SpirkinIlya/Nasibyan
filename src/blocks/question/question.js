/**
 * question — collapsible FAQ item
 *
 * Click anywhere on the trigger row to toggle open/closed.
 *
 * data-js="question"         — root element
 * data-js="question-trigger" — clickable button (full row)
 * data-state="open"          — set on root when expanded
 */

function initQuestions() {
  document.querySelectorAll('[data-js="question"]').forEach((root) => {
    const trigger = root.querySelector('[data-js="question-trigger"]');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isOpen = root.dataset.state === 'open';

      if (isOpen) {
        delete root.dataset.state;
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        root.dataset.state = 'open';
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initQuestions);
} else {
  initQuestions();
}
