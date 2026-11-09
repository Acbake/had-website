(() => {
  'use strict';

  const themes = {
    autumn: {
      background: 'linear-gradient(135deg, rgba(247,220,183,.76), rgba(235,192,154,.5)), radial-gradient(ellipse at 12% 18%, #f6d7a8 0, transparent 48%), radial-gradient(ellipse at 90% 78%, #d89270 0, transparent 48%)',
      color: '#b65a32', symbols: ['🍂','🍁','🌾','🍃']
    },
    winter: {
      background: 'linear-gradient(135deg, rgba(205,230,245,.72), rgba(225,237,247,.5)), radial-gradient(ellipse at 12% 18%, #b8d7eb 0, transparent 48%), radial-gradient(ellipse at 90% 78%, #d2e0f0 0, transparent 48%)',
      color: '#4386aa', symbols: ['❄','❅','✦','❆']
    },
    spring: {
      background: 'linear-gradient(135deg, rgba(218,239,210,.72), rgba(235,235,205,.5)), radial-gradient(ellipse at 12% 18%, #c4e6b8 0, transparent 48%), radial-gradient(ellipse at 90% 78%, #f0cadd 0, transparent 48%)',
      color: '#6a9c5e', symbols: ['🌼','🌷','✿','🌸']
    },
    summer: {
      background: 'linear-gradient(135deg, rgba(250,229,173,.74), rgba(245,207,146,.5)), radial-gradient(ellipse at 12% 18%, #ffe08b 0, transparent 48%), radial-gradient(ellipse at 90% 78%, #f3b99f 0, transparent 48%)',
      color: '#d38b27', symbols: ['☀','🌴','🌊','✦']
    }
  };
  const themeName = () => themes[document.documentElement.dataset.theme] ? document.documentElement.dataset.theme : 'autumn';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!document.getElementById('seasonal-effects-style')) {
    const style = document.createElement('style');
    style.id = 'seasonal-effects-style';
    style.textContent = `
      html,body{min-height:100%;}
      body{background-image:var(--season-background)!important;background-attachment:fixed!important;}
      main>section:not(.hero){background-image:linear-gradient(var(--season-tint),var(--season-tint)),var(--section-original-image,none);}
      #seasonal-effects-layer{position:fixed;inset:0;z-index:30;overflow:hidden;pointer-events:none;contain:strict}
      .seasonal-faller{position:absolute;top:-12vh;left:var(--left);font-size:var(--size);opacity:var(--opacity);filter:drop-shadow(0 2px 2px rgba(16,36,55,.12));will-change:transform;animation:seasonal-fall var(--duration) linear var(--delay) infinite}
      @keyframes seasonal-fall{0%{transform:translate3d(0,-12vh,0) rotate(0deg)}50%{transform:translate3d(var(--sway),55vh,0) rotate(240deg)}100%{transform:translate3d(calc(var(--sway)*-.35),115vh,0) rotate(540deg)}}
      @media(prefers-reduced-motion:reduce){.seasonal-faller{animation:none;top:auto;bottom:2vh;opacity:.35}}
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
    const theme = themes[themeName()];
    document.documentElement.style.setProperty('--season-background', theme.background);
    document.documentElement.style.setProperty('--season-tint', `${theme.color}0a`);
    layer.replaceChildren();
    const count = reducedMotion ? 8 : 24;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('span');
      particle.className = 'seasonal-faller';
      particle.textContent = theme.symbols[i % theme.symbols.length];
      particle.style.setProperty('--left', `${Math.random() * 100}%`);
      particle.style.setProperty('--size', `${14 + Math.random() * 16}px`);
      particle.style.setProperty('--opacity', `${.28 + Math.random() * .42}`);
      particle.style.setProperty('--duration', `${9 + Math.random() * 13}s`);
      particle.style.setProperty('--delay', `${-Math.random() * 22}s`);
      particle.style.setProperty('--sway', `${-65 + Math.random() * 130}px`);
      layer.append(particle);
    }
  }

  applyTheme();
  document.getElementById('theme-select')?.addEventListener('change', () => requestAnimationFrame(applyTheme));
  const observer = new MutationObserver(() => {
    if (layer.dataset.theme !== themeName()) {
      layer.dataset.theme = themeName();
      applyTheme();
    }
  });
  observer.observe(document.documentElement, {attributes:true, attributeFilter:['data-theme']});
})();
