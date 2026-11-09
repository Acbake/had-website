(() => {
  'use strict';

  const palettes = {
    autumn: {
      background: 'radial-gradient(ellipse at 12% 10%, rgba(245,174,79,.34), transparent 43%), radial-gradient(ellipse at 88% 82%, rgba(177,79,39,.2), transparent 46%), linear-gradient(135deg,#f6ead7,#ead3b4)',
      paper: '#f4eadb', surface: '#fffaf1', surfaceAlt: '#ead9c3', line: '#d9c6aa', ink: '#34271f', muted: '#796657', accent: '#a94e27', accentSoft: '#df9b32',
      symbols: ['🍂','🍁','🍂','🍃','🍁','🍂'], logoMark: '🍁', logoFilter: 'sepia(.16) saturate(1.18)'
    },
    winter: {
      background: 'radial-gradient(ellipse at 15% 12%, rgba(142,199,230,.32), transparent 44%), radial-gradient(ellipse at 86% 78%, rgba(179,205,235,.28), transparent 45%), linear-gradient(135deg,#eaf4fb,#d9e8f4)',
      paper: '#eaf3f9', surface: '#f9fcff', surfaceAlt: '#dbe9f4', line: '#c4d7e5', ink: '#1e3342', muted: '#647a89', accent: '#4386aa', accentSoft: '#9ac9df',
      symbols: ['❄','❅','✦','❆','❄','✧'], logoMark: '❄', logoFilter: 'saturate(.58) hue-rotate(155deg)'
    },
    spring: {
      background: 'radial-gradient(ellipse at 12% 14%, rgba(150,205,120,.28), transparent 44%), radial-gradient(ellipse at 88% 82%, rgba(235,163,193,.24), transparent 45%), linear-gradient(135deg,#eef3df,#e4eddc)',
      paper: '#edf2e3', surface: '#fbfff5', surfaceAlt: '#e0ead8', line: '#ccd9c5', ink: '#29382a', muted: '#687666', accent: '#668d52', accentSoft: '#e2ab62',
      symbols: ['🌼','🌷','✿','🌸','🍃','🌼'], logoMark: '🌸', logoFilter: 'saturate(.82) hue-rotate(18deg)'
    },
    summer: {
      background: 'radial-gradient(ellipse at 12% 8%, rgba(255,215,100,.42), transparent 42%), radial-gradient(ellipse at 88% 76%, rgba(50,174,190,.25), transparent 46%), linear-gradient(135deg,#fff1c8,#d9f0e9)',
      paper: '#eef7f1', surface: '#fffdf5', surfaceAlt: '#d9eee8', line: '#c7ddd5', ink: '#173a43', muted: '#5d7778', accent: '#d27a27', accentSoft: '#e9b946',
      symbols: ['☀','🌴','🌊','✦','☀','🌊'], logoMark: '☀️', logoFilter: 'saturate(1.08) sepia(.08)'
    }
  };
  const themeName = () => palettes[document.documentElement.dataset.theme] ? document.documentElement.dataset.theme : 'autumn';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function installStyles() {
    if (document.getElementById('seasonal-effects-style')) return;
    const style = document.createElement('style');
    style.id = 'seasonal-effects-style';
    style.textContent = `
      html,body{min-height:100%;}
      body{background-color:var(--paper)!important;background-image:var(--season-background)!important;background-attachment:fixed!important;}
      main>section:not(.hero){background-color:var(--paper)!important;}
      #seasonal-effects-layer{position:fixed!important;inset:0!important;width:100vw;height:100vh;height:100dvh;z-index:40!important;overflow:hidden;pointer-events:none!important;}
      .seasonal-faller{position:absolute;display:block;top:-15vh;left:var(--left);font-size:var(--size);line-height:1;opacity:var(--opacity);filter:drop-shadow(0 2px 3px rgba(40,25,10,.23));will-change:transform;animation:seasonal-fall var(--duration) linear var(--delay) infinite;}
      @keyframes seasonal-fall{0%{transform:translate3d(0,-15vh,0) rotate(0deg)}50%{transform:translate3d(var(--sway),55vh,0) rotate(220deg)}100%{transform:translate3d(calc(var(--sway)*-.3),112vh,0) rotate(500deg)}}
      .seasonal-logo-wrap{position:relative!important;display:inline-flex!important;vertical-align:middle;isolation:isolate;}
      .seasonal-logo-wrap>.brand-logo,.seasonal-logo-wrap>.hero-logo{filter:var(--season-logo-filter,none);transition:filter .35s ease,transform .35s ease;}
      .seasonal-logo-mark{position:absolute;z-index:2;right:-5px;top:-7px;display:grid;place-items:center;min-width:24px;height:24px;padding:2px;border:2px solid var(--accent-soft);border-radius:50%;background:#102437;color:#fff;font-size:15px;line-height:1;box-shadow:0 2px 7px rgba(0,0,0,.28);pointer-events:none;}
      .brand .seasonal-logo-mark{right:-2px;top:-5px;min-width:18px;height:18px;font-size:11px;border-width:1px;}
      @media(prefers-reduced-motion:reduce){.seasonal-faller{animation-duration:30s;}}
    `;
    document.head.append(style);
  }

  let layer;
  function ensureLayer() {
    layer = document.getElementById('seasonal-effects-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'seasonal-effects-layer';
      layer.setAttribute('aria-hidden', 'true');
      document.body.append(layer);
    }
  }

  function decorateLogos(palette) {
    document.querySelectorAll('img.brand-logo,img.hero-logo').forEach(image => {
      let wrap = image.closest('.seasonal-logo-wrap');
      if (!wrap) {
        wrap = document.createElement('span');
        wrap.className = 'seasonal-logo-wrap';
        image.parentNode.insertBefore(wrap, image);
        wrap.append(image);
      }
      wrap.style.setProperty('--season-logo-filter', palette.logoFilter);
      let badge = wrap.querySelector('.seasonal-logo-mark');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'seasonal-logo-mark';
        badge.setAttribute('aria-hidden', 'true');
        wrap.append(badge);
      }
      badge.textContent = palette.logoMark;
      badge.dataset.theme = themeName();
    });
  }

  function applyTheme() {
    const palette = palettes[themeName()];
    const root = document.documentElement;
    root.style.setProperty('--season-background', palette.background);
    root.style.setProperty('--paper', palette.paper);
    root.style.setProperty('--surface', palette.surface);
    root.style.setProperty('--surface-alt', palette.surfaceAlt);
    root.style.setProperty('--line', palette.line);
    root.style.setProperty('--ink', palette.ink);
    root.style.setProperty('--muted', palette.muted);
    root.style.setProperty('--accent', palette.accent);
    root.style.setProperty('--accent-soft', palette.accentSoft);

    ensureLayer();
    layer.replaceChildren();
    const count = reduceMotion ? 18 : 48;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('span');
      particle.className = 'seasonal-faller';
      particle.textContent = palette.symbols[i % palette.symbols.length];
      particle.style.setProperty('--left', `${Math.random() * 100}%`);
      particle.style.setProperty('--size', `${18 + Math.random() * 20}px`);
      particle.style.setProperty('--opacity', `${.62 + Math.random() * .34}`);
      particle.style.setProperty('--duration', `${reduceMotion ? 24 + Math.random() * 12 : 7 + Math.random() * 11}s`);
      particle.style.setProperty('--delay', `${-Math.random() * 18}s`);
      particle.style.setProperty('--sway', `${-75 + Math.random() * 150}px`);
      layer.append(particle);
    }
    decorateLogos(palette);
  }

  function start() {
    installStyles();
    ensureLayer();
    applyTheme();
    document.getElementById('theme-select')?.addEventListener('change', () => requestAnimationFrame(applyTheme));
    new MutationObserver(() => {
      if (layer?.dataset.theme !== themeName()) {
        if (layer) layer.dataset.theme = themeName();
        applyTheme();
      }
      decorateLogos(palettes[themeName()]);
    }).observe(document.documentElement, {attributes:true, attributeFilter:['data-theme']});
    // The core app inserts some images after its initial theme setup. Observe the
    // document so those logos receive the same seasonal badge and color treatment.
    new MutationObserver(() => decorateLogos(palettes[themeName()])).observe(document.body, {childList:true,subtree:true});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
