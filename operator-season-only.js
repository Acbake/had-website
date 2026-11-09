(() => {
  'use strict';

  const STORAGE_KEY = 'had-operator-content-v3';

  function readContent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function updateVisibleSeason(value) {
    const season = Number(value) || 1;
    const heroSeason = document.getElementById('hero-season');
    if (heroSeason) heroSeason.textContent = `SEASON ${season}`;
    document.documentElement.dataset.season = String(season);
  }

  function applyOnlySeasonForm() {
    const dialog = document.getElementById('operator-dialog');
    if (!dialog) return;

    const form = dialog.querySelector('form');
    if (!form) return;

    const seasonField = form.querySelector('#season-input');
    if (seasonField) {
      const saved = readContent();
      if (saved && Number(saved.season)) seasonField.value = Number(saved.season);
      seasonField.setAttribute('min', '1');
    }

    const hideableSelector = [
      '.standings-editor-heading',
      '.standings-editor',
      '.staff-editor-heading',
      '.staff-editor-grid',
      'label:has(#bulletin-input)',
      'label:has(#updates-input)',
      '#reset-content'
    ].join(', ');

    form.querySelectorAll(hideableSelector).forEach(el => {
      el.style.display = 'none';
      el.hidden = true;
    });

    const actionButtons = form.querySelectorAll('.dialog-actions button');
    actionButtons.forEach(button => {
      if (button.id === 'save-content') {
        button.textContent = 'Save season';
      }
    });

    const heading = dialog.querySelector('.dialog-head h2');
    if (heading) heading.textContent = 'Change the season';
  }

  function saveSeasonOnly() {
    const input = document.getElementById('season-input');
    if (!input) return;

    const value = Number(input.value);
    if (!Number.isFinite(value) || value < 1) return;

    const current = readContent() || {};
    current.season = value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    updateVisibleSeason(value);
  }

  function bindSaveSeasonOnly() {
    const button = document.getElementById('save-content');
    if (!button) return;
    button.onclick = (event) => {
      event.preventDefault();
      saveSeasonOnly();
      const dialog = document.getElementById('operator-dialog');
      if (dialog && typeof dialog.close === 'function') dialog.close();
    };
  }

  function start() {
    applyOnlySeasonForm();
    bindSaveSeasonOnly();
    const openButton = document.getElementById('operator-toggle');
    if (openButton) {
      const original = openButton.onclick;
      openButton.onclick = (event) => {
        if (typeof original === 'function') original.call(openButton, event);
        const seasonInput = document.getElementById('season-input');
        if (seasonInput) {
          const saved = readContent();
          if (saved && Number(saved.season)) seasonInput.value = Number(saved.season);
        }
      };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
