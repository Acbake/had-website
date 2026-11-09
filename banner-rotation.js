(() => {
  'use strict';

  const BANNERS = [
    'assets/week-banners/lightning.svg',
    'assets/week-banners/returns.svg',
    'assets/week-banners/season-two.svg'
  ];

  function getBannerIndex() {
    const now = new Date();
    const year = now.getFullYear();
    const sundayStart = new Date(year, 0, 1);
    const day = sundayStart.getDay();
    const offset = (day === 0 ? 0 : 7 - day);
    const startOfFirstWeek = new Date(year, 0, 1 + offset);
    const diffMs = now.getTime() - startOfFirstWeek.getTime();
    const weekIndex = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
    return Math.abs(weekIndex) % BANNERS.length;
  }

  function ensureBanner() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    let layer = document.querySelector('.weekly-hero-banner');
    if (!layer) {
      layer = document.createElement('img');
      layer.className = 'weekly-hero-banner';
      layer.alt = 'Weekly league banner';
      layer.setAttribute('aria-hidden', 'true');
      hero.prepend(layer);
    }

    const index = getBannerIndex();
    const src = BANNERS[index];
    layer.src = src;
    layer.style.display = 'block';
  }

  function installStyles() {
    if (document.getElementById('weekly-banner-style')) return;
    const style = document.createElement('style');
    style.id = 'weekly-banner-style';
    style.textContent = `
      .hero{position:relative;isolation:isolate;overflow:hidden}
      .weekly-hero-banner{
        position:absolute;
        inset:0;
        width:100%;
        height:100%;
        object-fit:cover;
        object-position:center center;
        opacity:.84;
        pointer-events:none;
        z-index:0;
      }
      .hero > .wrap{position:relative;z-index:1}
    `;
    document.head.append(style);
  }

  function refresh() {
    installStyles();
    ensureBanner();
  }

  refresh();
  setInterval(refresh, 60_000);
})();
