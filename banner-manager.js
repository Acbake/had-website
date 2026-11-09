(() => {
  'use strict';

  const STORAGE_KEY = 'had-global-season-banner-v1';
  const MAX_FILE_BYTES = 12 * 1024 * 1024;
  const MAX_OUTPUT_BYTES = 1.6 * 1024 * 1024;
  const MAX_DIMENSION = 1800;
  const MAX_DATA_URL_LENGTH = 2_300_000;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function readBanner() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      if (value && value.length <= MAX_DATA_URL_LENGTH && value.startsWith('data:image/')) return value;
    } catch (error) { console.warn('Could not read the saved banner.', error); }
    return '';
  }

  function renderBanner(dataUrl) {
    document.querySelectorAll('.user-season-banner').forEach(el => el.remove());
    const hero = document.querySelector('.hero');
    if (!hero || !dataUrl) return;
    hero.classList.add('has-user-season-banner');
    const layer = document.createElement('div');
    layer.className = 'user-season-banner';
    layer.setAttribute('aria-hidden', 'true');
    layer.style.backgroundImage = `url("${dataUrl}")`;
    hero.prepend(layer);
  }

  function optimizeImage(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) return reject(new Error('Choose an image file for the banner.'));
      if (file.size > MAX_FILE_BYTES) return reject(new Error('Choose an image under 12 MB.'));
      const objectUrl = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const scale = Math.min(1, MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext('2d');
        if (!context) return reject(new Error('Your browser could not process this image.'));
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const result = canvas.toDataURL('image/jpeg', 0.84);
        const estimatedBytes = Math.floor((result.length - result.indexOf(',') - 1) * 0.75);
        if (estimatedBytes > MAX_OUTPUT_BYTES || result.length > MAX_DATA_URL_LENGTH) {
          return reject(new Error('This banner is too large to save in browser storage. Try a smaller image.'));
        }
        resolve(result);
      };
      image.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Could not read that image. Try a JPG, PNG, or WebP file.')); };
      image.src = objectUrl;
    });
  }

  function addStyles() {
    if (document.getElementById('season-banner-style')) return;
    const style = document.createElement('style');
    style.id = 'season-banner-style';
    style.textContent = `
      .hero.has-user-season-banner{position:relative;isolation:isolate;overflow:hidden}
      .hero .user-season-banner{position:absolute;inset:0;z-index:-1;background-size:cover;background-position:center;background-repeat:no-repeat;opacity:.32;pointer-events:none}
      .hero.has-user-season-banner>.wrap{position:relative}
      .banner-upload-panel{margin:1rem 0;padding:1rem;border:1px solid var(--line,#dfe3df);border-radius:8px;background:var(--surface,#fff)}
      .banner-upload-panel h3{margin:0 0 .4rem;font-family:Oswald,Inter,sans-serif}
      .banner-upload-panel p{margin:.35rem 0 .8rem;color:var(--muted,#697780);font-size:.9rem}
      .banner-upload-actions{display:flex;flex-wrap:wrap;align-items:center;gap:.65rem}
      .banner-upload-actions button,.banner-upload-actions label{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:.55rem .85rem;border:1px solid var(--line,#dfe3df);border-radius:4px;background:var(--surface,#fff);color:var(--ink,#202a32);font:inherit;font-weight:700;cursor:pointer}
      .banner-upload-actions input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
      .banner-upload-status{min-height:1.4em;font-size:.85rem;color:var(--muted,#697780)}
    `;
    document.head.append(style);
  }

  function installPanel() {
    const dialog = document.getElementById('operator-dialog');
    const form = dialog?.querySelector('form');
    if (!form || document.getElementById('season-banner-panel')) return false;
    const panel = document.createElement('section');
    panel.className = 'banner-upload-panel';
    panel.id = 'season-banner-panel';
    panel.innerHTML = `
      <h3>Season banner</h3>
      <p>Upload one banner that stays the same when you switch between Autumn, Winter, Spring, and Summer. It will show on this device and browser.</p>
      <div class="banner-upload-actions">
        <label for="season-banner-file">Choose banner image</label>
        <input id="season-banner-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif">
        <button id="season-banner-remove" type="button">Remove banner</button>
      </div>
      <p class="banner-upload-status" id="season-banner-status" role="status" aria-live="polite"></p>`;
    form.append(panel);
    panel.querySelector('#season-banner-file').addEventListener('change', async event => {
      const input = event.currentTarget;
      const status = panel.querySelector('#season-banner-status');
      const file = input.files?.[0];
      if (!file) return;
      status.textContent = 'Preparing banner…';
      try {
        const dataUrl = await optimizeImage(file);
        localStorage.setItem(STORAGE_KEY, dataUrl);
        renderBanner(dataUrl);
        status.textContent = 'Banner saved for all seasonal themes in this browser.';
      } catch (error) {
        status.textContent = error.message || 'Banner could not be saved.';
      } finally { input.value = ''; }
    });
    panel.querySelector('#season-banner-remove').addEventListener('click', () => {
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
      renderBanner('');
      panel.querySelector('#season-banner-status').textContent = 'Banner removed.';
    });
    return true;
  }

  addStyles();
  renderBanner(readBanner());
  if (!installPanel()) {
    const observer = new MutationObserver(() => {
      if (installPanel()) observer.disconnect();
    });
    observer.observe(document.body, {childList:true,subtree:true});
  }
})();
