/* The enhancement file now contains the complete site app. Load it once to avoid
   redeclaring globals from the legacy app and breaking the stats renderer. */
(() => {
  const app = document.createElement('script');
  app.src = 'site-enhancements.js?v=top10-restored-20261109';
  app.onerror = () => {
    const status = document.getElementById('sheet-status');
    if (status) status.textContent = 'Could not load the site app. Please refresh.';
  };
  document.body.append(app);
})();
