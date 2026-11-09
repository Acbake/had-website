(() => {
  'use strict';

  const themes = {
    autumn: { symbols: ['🍂', '🍁', '🍃'], mark: '🍁' },
    winter: { symbols: ['❄️', '❅', '❆'], mark: '❄️' },
    spring: { symbols: ['🥚', '🐣', '🌷', '🌼'], mark: '🥚' },
    summer: { symbols: ['☀️', '🌴', '🌊', '✨'], mark: '☀️' }
  };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const themeName = () => themes[document.documentElement.dataset.theme]
    ? document.documentElement.dataset.theme
    : 'autumn';
  const COLOR_MODE_KEY = 'had-color-mode-v1';
  let layer;

  function addStyles() {
    if (document.getElementById('seasonal-effects-style')) return;
    const style = document.createElement('style');
    style.id = 'seasonal-effects-style';
    style.textContent = `
      :root[data-theme="autumn"]{--navy-900:#38251d;--navy-800:#583725;--navy-700:#75482d;--accent:#a84e2b;--accent-soft:#d9953b;--paper:#f4ede2;--surface:#fffaf2;--surface-alt:#efe2cf;--ink:#30251e;--muted:#796b5d;--line:#e1d1bc}
      :root[data-theme="autumn"] body{background-color:var(--paper);color:var(--ink)}
      :root[data-theme="autumn"] .league-ribbon{background:#38251d}
      :root[data-theme="autumn"] .site-header{background:#4b3022}
      :root[data-color-mode="dark"]{color-scheme:dark;--navy-900:#0b1722;--navy-800:#122536;--navy-700:#1b3a4e;--paper:#0b141d;--surface:#132330;--surface-alt:#192c3a;--ink:#edf2f5;--muted:#a9b7c1;--line:#304452;--accent:#d47643;--accent-soft:#e7ad56}
      :root[data-color-mode="dark"][data-theme="autumn"]{--navy-900:#211711;--navy-800:#332117;--navy-700:#513522;--paper:#17120f;--surface:#241a15;--surface-alt:#302219;--ink:#f4e9dc;--muted:#c0a993;--line:#4a3425;--accent:#d4753d;--accent-soft:#e5a84e}
      :root[data-color-mode="dark"] body{background:var(--paper)!important;color:var(--ink)!important}
      :root[data-color-mode="dark"] .league-ribbon,:root[data-color-mode="dark"] .site-header,:root[data-color-mode="dark"] .site-footer{background:var(--navy-900)!important;color:var(--ink)!important}
      :root[data-color-mode="dark"] .stats-section,:root[data-color-mode="dark"] .staff-section,:root[data-color-mode="dark"] .teams-section,:root[data-color-mode="dark"] .bulletin-section,:root[data-color-mode="dark"] .updates-section,:root[data-color-mode="dark"] .home-sections,:root[data-color-mode="dark"] .division-section,:root[data-color-mode="dark"] .playoff-section{background:var(--paper)!important;color:var(--ink)!important}
      :root[data-color-mode="dark"] .division-card,:root[data-color-mode="dark"] .table-panel,:root[data-color-mode="dark"] .sheet-panel,:root[data-color-mode="dark"] .home-section-card,:root[data-color-mode="dark"] .staff-card,:root[data-color-mode="dark"] .team-card,:root[data-color-mode="dark"] .bulletin-card,:root[data-color-mode="dark"] .update-item,:root[data-color-mode="dark"] .bracket-card,:root[data-color-mode="dark"] .season-schedule{background:var(--surface)!important;color:var(--ink)!important;border-color:var(--line)!important}
      :root[data-color-mode="dark"] .standings-list li,:root[data-color-mode="dark"] table th,:root[data-color-mode="dark"] table td{border-color:var(--line)!important;color:var(--ink)}
      :root[data-color-mode="dark"] .section-head h1,:root[data-color-mode="dark"] .section-head h2,:root[data-color-mode="dark"] .section-head h3,:root[data-color-mode="dark"] .division-heading h2,:root[data-color-mode="dark"] .home-section-card strong,:root[data-color-mode="dark"] .sheet-panel h2{color:var(--ink)!important}
      :root[data-color-mode="dark"] .home-section-card small,:root[data-color-mode="dark"] .section-note,:root[data-color-mode="dark"] .updates-intro,:root[data-color-mode="dark"] .bracket-note,:root[data-color-mode="dark"] .sheet-panel p{color:var(--muted)!important}
      :root[data-color-mode="dark"] input,:root[data-color-mode="dark"] textarea,:root[data-color-mode="dark"] select{background:var(--surface-alt);color:var(--ink);border-color:var(--line)}
      .mode-toggle{display:inline-flex!important;align-items:center;justify-content:center;gap:8px;min-height:38px;padding:0 14px;border:1px solid rgba(196,204,214,.42);border-radius:999px;background:rgba(255,255,255,.06);color:inherit;font:600 13px Inter,Arial,sans-serif;cursor:pointer;white-space:nowrap;transition:background .18s ease,border-color .18s ease,transform .18s ease}
      .mode-toggle:hover{border-color:var(--accent-soft,#e5b34e);background:rgba(229,179,78,.12);transform:translateY(-1px)}
      .mode-toggle:focus-visible{outline:2px solid var(--accent-soft,#e5b34e);outline-offset:3px}
      .mode-toggle-icon{font-size:16px;line-height:1}
      @media(max-width:700px){.mode-toggle{margin-left:auto;min-height:36px;padding:0 11px}.header-inner{flex-wrap:wrap}}
      #seasonal-effects-layer{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;height:100dvh!important;z-index:9999!important;overflow:hidden!important;pointer-events:none!important}
      .seasonal-faller{position:absolute!important;top:-12vh!important;left:var(--left)!important;display:block!important;font-size:var(--size)!important;line-height:1!important;opacity:var(--opacity)!important;animation:seasonal-fall var(--duration) linear var(--delay) infinite!important;will-change:transform!important}
      #seasonal-effects-layer.paused .seasonal-faller{animation-play-state:paused!important}
      @keyframes seasonal-fall{0%{transform:translate3d(0,-12vh,0) rotate(0deg)}50%{transform:translate3d(var(--sway),50vh,0) rotate(180deg)}100%{transform:translate3d(calc(var(--sway)*-.35),112vh,0) rotate(360deg)}}
      .seasonal-logo-wrap{position:relative;display:inline-flex;vertical-align:middle;isolation:isolate}
      .seasonal-logo-mark{position:absolute;z-index:2;right:-5px;top:-7px;display:grid;place-items:center;min-width:22px;height:22px;padding:2px;border:2px solid var(--accent-soft,#e5b34e);border-radius:50%;background:var(--navy-900,#102437);font-size:12px;line-height:1}
      .brand .seasonal-logo-mark{right:-2px;top:-5px;min-width:17px;height:17px;font-size:10px;border-width:1px}
      @media(prefers-reduced-motion:reduce){.seasonal-faller{animation-duration:50s!important}}
    `;
    document.head.append(style);
  }

  function ensureLayer() {
    layer = document.getElementById('seasonal-effects-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'seasonal-effects-layer';
      layer.setAttribute('aria-hidden', 'true');
      document.body.append(layer);
    }
    layer.classList.toggle('paused', document.hidden);
  }

  function setupColorMode() {
    const root = document.documentElement;
    let mode = 'light';
    try {
      mode = localStorage.getItem(COLOR_MODE_KEY) === 'dark' ? 'dark' : 'light';
    } catch (error) {
      console.warn('Color mode preference could not be read.', error);
    }
    root.dataset.colorMode = mode;

    let button = document.getElementById('mode-toggle');
    if (!button) {
      const header = document.querySelector('.header-inner');
      if (!header) return;
      button = document.createElement('button');
      button.id = 'mode-toggle';
      button.className = 'mode-toggle';
      button.type = 'button';
      button.setAttribute('aria-pressed', 'false');
      const icon = document.createElement('span');
      icon.className = 'mode-toggle-icon';
      icon.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      label.className = 'mode-toggle-label';
      button.append(icon, label);
      const nav = header.querySelector('.main-nav');
      if (nav) nav.after(button);
      else header.append(button);
      button.addEventListener('click', () => {
        mode = root.dataset.colorMode === 'dark' ? 'light' : 'dark';
        root.dataset.colorMode = mode;
        try { localStorage.setItem(COLOR_MODE_KEY, mode); } catch (error) {
          console.warn('Color mode preference could not be saved.', error);
        }
        updateButton();
      });
    }

    function updateButton() {
      const dark = root.dataset.colorMode === 'dark';
      button.querySelector('.mode-toggle-icon').textContent = dark ? '☀️' : '🌙';
      button.querySelector('.mode-toggle-label').textContent = dark ? 'Light mode' : 'Dark mode';
      button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      button.setAttribute('aria-pressed', String(dark));
      button.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    }
    updateButton();
  }

  function decorateLogos(theme) {
    document.querySelectorAll('img.brand-logo,img.hero-logo').forEach(image => {
      let wrap = image.closest('.seasonal-logo-wrap');
      if (!wrap && image.parentNode) {
        wrap = document.createElement('span');
        wrap.className = 'seasonal-logo-wrap';
        image.parentNode.insertBefore(wrap, image);
        wrap.append(image);
      }
      if (!wrap) return;
      let mark = wrap.querySelector('.seasonal-logo-mark');
      if (!mark) {
        mark = document.createElement('span');
        mark.className = 'seasonal-logo-mark';
        mark.setAttribute('aria-hidden', 'true');
        wrap.append(mark);
      }
      if (mark.textContent !== theme.mark) mark.textContent = theme.mark;
    });
  }

  function renderTheme() {
    const theme = themes[themeName()];
    ensureLayer();
    const count = reducedMotion ? 6 : 12;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('span');
      particle.className = 'seasonal-faller';
      particle.textContent = theme.symbols[i % theme.symbols.length];
      particle.style.setProperty('--left', `${Math.random() * 100}%`);
      particle.style.setProperty('--size', `${18 + Math.random() * 14}px`);
      particle.style.setProperty('--opacity', `${0.62 + Math.random() * 0.25}`);
      particle.style.setProperty('--duration', `${reducedMotion ? 50 + Math.random() * 12 : 22 + Math.random() * 14}s`);
      particle.style.setProperty('--delay', `${Math.random() * (reducedMotion ? 30 : 24)}s`);
      particle.style.setProperty('--sway', `${-55 + Math.random() * 110}px`);
      fragment.append(particle);
    }
    layer.replaceChildren(fragment);
    decorateLogos(theme);
  }

  function start() {
    addStyles();
    setupColorMode();
    ensureLayer();
    renderTheme();
    document.getElementById('theme-select')?.addEventListener('change', () => requestAnimationFrame(renderTheme));
    document.addEventListener('visibilitychange', () => layer?.classList.toggle('paused', document.hidden));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
