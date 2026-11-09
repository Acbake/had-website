(() => {
  'use strict';

  const palettes = {
    autumn: {
      background: 'radial-gradient(ellipse at 12% 10%, rgba(245,174,79,.32), transparent 42%), radial-gradient(ellipse at 88% 82%, rgba(177,79,39,.2), transparent 44%), linear-gradient(135deg,#f6ead7,#ead7bd)',
      paper: '#f4eadb', surface: '#fffaf1', surfaceAlt: '#ead9c3', line: '#d9c6aa', ink: '#34271f', muted: '#796657', accent: '#a94e27', accentSoft: '#df9b32',
      symbols: ['🍂','🍁','🍂','🍃','🍁','🍂']
    },
    winter: {
      background: 'radial-gradient(ellipse at 15% 12%, rgba(142,199,230,.32), transparent 44%), radial-gradient(ellipse at 86% 78%, rgba(179,205,235,.28), transparent 45%), linear-gradient(135deg,#eaf4fb,#d9e8f4)',
      paper: '#eaf3f9', surface: '#f9fcff', surfaceAlt: '#dbe9f4', line: '#c4d7e5', ink: '#1e3342', muted: '#647a89', accent: '#4386aa', accentSoft: '#9ac9df',
      symbols: ['❄','❅','✦','❆','❄','✧']
    },
    spring: {
      background: 'radial-gradient(ellipse at 12% 14%, rgba(150,205,120,.28), transparent 44%), radial-gradient(ellipse at 88% 82%, rgba(235,163,193,.24), transparent 45%), linear-gradient(135deg,#eef3df,#e4eddc)',
      paper: '#edf2e3', surface: '#fbfff5', surfaceAlt: '#e0ead8', line: '#ccd9c5', ink: '#29382a', muted: '#687666', accent: '#668d52', accentSoft: '#e2ab62',
      symbols: ['🌼','🌷','✿','🌸','🍃','🌼']
    },
    summer: {
      background: 'radial-gradient(ellipse at 12% 8%, rgba(255,215,100,.42), transparent 42%), radial-gradient(ellipse at 88% 76%, rgba(50,174,190,.25), transparent 46%), linear-gradient(135deg,#fff1c8,#d9f0e9)',
      paper: '#eef7f1', surface: '#fffdf5', surfaceAlt: '#d9eee8', line: '#c7ddd5', ink: '#173a43', muted: '#5d7778', accent: '#d27a27', accentSoft: '#e9b946',
      symbols: ['☀','🌴','🌊','✦','☀','🌊']
    }
  };
  const themeName = () => palettes[document.documentElement.dataset.theme] ? document.documentElement.dataset.theme : 'autumn';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!document.getElementById('seasonal-effects-style')) {
    const style = document.createElement('style');
    style.id = 'seasonal-effects-style';
    style.textContent = `
      html,body{min-height:100%;}
      body{background-color:var(--paper)!important;background-image:var(--season-background)!important;background-attachment:fixed!important;}
      main>section:not(.hero){background-color:var(--paper)!important;}
      #seasonal-effects-layer{position:fixed!important;inset:0!important;width:100vw;height:100vh;height:100dvh;z-index:9999!important;overflow:hidden;pointer-events:none;}
      .seasonal-faller{position:absolute;display:block;top:-12vh;left:var(--left);font-size:var(--size);line-height:1;opacity:var(--opacity);filter:drop-shadow(0 2px 2px rgba(40,25,10,.2));will-change:transform;animation:seasonal-fall var(--duration) linear var(--delay) infinite;}
      @keyframes seasonal-fall{0%{transform:translate3d(0,-12vh,0) rotate(0deg)}50%{transform:translate3d(var(--sway),55vh,0) rotate(220deg)}100%{transform:translate3d(calc(var(--sway)*-.3),112vh,0) rotate(500deg)}}
      @media(prefers-reduced-motion:reduce){.seasonal-faller{animation-duration:32s;opacity:.22}}
    `;
    document.head.append(style);
  }

  let layer = document.getElementById('seasonal-effects-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'seasonal-effects-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.append(layer);
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

    layer.replaceChildren();
    const count = reducedMotion ? 14 : 32;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('span');
      particle.className = 'seasonal-faller';
      particle.textContent = palette.symbols[i % palette.symbols.length];
      particle.style.setProperty('--left', `${Math.random() * 100}%`);
      particle.style.setProperty('--size', `${16 + Math.random() * 17}px`);
      particle.style.setProperty('--opacity', `${.55 + Math.random() * .35}`);
      particle.style.setProperty('--duration', `${8 + Math.random() * 10}s`);
      particle.style.setProperty('--delay', `${-Math.random() * 18}s`);
      particle.style.setProperty('--sway', `${-70 + Math.random() * 140}px`);
      layer.append(particle);
    }
  }

  applyTheme();
  document.getElementById('theme-select')?.addEventListener('change', () => requestAnimationFrame(applyTheme));
  new MutationObserver(() => {
    if (layer.dataset.theme !== themeName()) {
      layer.dataset.theme = themeName();
      applyTheme();
    }
  }).observe(document.documentElement, {attributes:true, attributeFilter:['data-theme']});
})();
