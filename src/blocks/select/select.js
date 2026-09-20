/**
 * select — custom dropdown replacing native <select>
 *
 * Trigger button looks like an underline input.
 * Dropdown panel styled in the site's warm dark palette.
 * Selected value is written to a hidden <input> for form submission.
 *
 * data-js="select"          — root element
 * data-js="select-trigger"  — trigger button
 * data-js="select-display"  — text span inside trigger
 * data-js="select-dropdown" — dropdown panel
 * data-js="select-input"    — hidden <input>
 * data-state="open"         — set on root when dropdown is visible
 */

function initSelects() {
  document.querySelectorAll('[data-js="select"]').forEach((root) => {
    const trigger = root.querySelector('[data-js="select-trigger"]');
    const display = root.querySelector('[data-js="select-display"]');
    const dropdown = root.querySelector('[data-js="select-dropdown"]');
    const hiddenInput = root.querySelector('[data-js="select-input"]');
    const options = Array.from(root.querySelectorAll('.select__option'));

    if (!trigger || !display || !dropdown || !hiddenInput) return;

    // ── State ────────────────────────────────────────────────────────────────

    let isOpen = false;

    function open() {
      isOpen = true;
      root.dataset.state = 'open';
      trigger.setAttribute('aria-expanded', 'true');
      dropdown.setAttribute('aria-hidden', 'false');

      // Focus the currently selected option (or the first one)
      const selected = options.find((o) => o.getAttribute('aria-selected') === 'true');
      (selected || options[0])?.focus();
    }

    function close(returnFocus = true) {
      isOpen = false;
      delete root.dataset.state;
      trigger.setAttribute('aria-expanded', 'false');
      dropdown.setAttribute('aria-hidden', 'true');
      if (returnFocus) trigger.focus();
    }

    // ── Select an option ─────────────────────────────────────────────────────

    function selectOption(option) {
      const value = option.dataset.value;
      const text = option.textContent.trim();

      hiddenInput.value = value;
      display.textContent = text;

      // Update placeholder class
      root.classList.remove('select_placeholder');

      // Update aria-selected + CSS modifier on all options
      options.forEach((o) => {
        o.setAttribute('aria-selected', 'false');
        o.classList.remove('select__option_selected');
      });
      option.setAttribute('aria-selected', 'true');
      option.classList.add('select__option_selected');

      close();
    }

    // ── Event listeners ──────────────────────────────────────────────────────

    // Toggle on trigger click
    trigger.addEventListener('click', () => {
      isOpen ? close() : open();
    });

    // Open with keyboard on trigger
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isOpen) open();
      }
    });

    // Option interactions
    options.forEach((option, i) => {
      option.addEventListener('click', () => selectOption(option));

      option.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            options[(i + 1) % options.length].focus();
            break;
          case 'ArrowUp':
            e.preventDefault();
            options[(i - 1 + options.length) % options.length].focus();
            break;
          case 'Enter':
          case ' ':
            e.preventDefault();
            selectOption(option);
            break;
          case 'Escape':
            close();
            break;
          case 'Tab':
            close(false);
            break;
        }
      });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) close();
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (isOpen && !root.contains(e.target)) close(false);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSelects);
} else {
  initSelects();
}
