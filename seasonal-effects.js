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
    // Fewer particles and longer fall times make the seasonal effect calmer.
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
      // Positive, spread-out delays prevent a shower of leaves on first load.
      particle.style.setProperty('--delay', `${Math.random() * (reducedMotion ? 30 : 24)}s`);
      particle.style.setProperty('--sway', `${-55 + Math.random() * 110}px`);
      fragment.append(particle);
    }
    layer.replaceChildren(fragment);
    decorateLogos(theme);
  }

  function start() {
    addStyles();
    ensureLayer();
    renderTheme();
    document.getElementById('theme-select')?.addEventListener('change', () => requestAnimationFrame(renderTheme));
    document.addEventListener('visibilitychange', () => layer?.classList.toggle('paused', document.hidden));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
