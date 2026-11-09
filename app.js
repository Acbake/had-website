/* Load the existing site behavior, then apply the live stats and playoff improvements. */
(() => {
  const original = document.createElement('script');
  original.src = 'https://raw.githubusercontent.com/Acbake/had-website/5841efcabb3abdc39a0efd4d01c5e60cba82479c/app.js';
  original.onload = () => {
    const enhancements = document.createElement('script');
    enhancements.src = 'https://raw.githubusercontent.com/Acbake/had-website/main/site-enhancements.js';
    enhancements.onerror = () => {
      const status = document.getElementById('sheet-status');
      if (status) status.textContent = 'Could not load the stats and playoff enhancements. Please refresh.';
    };
    document.body.append(enhancements);
  };
  original.onerror = () => {
    const status = document.getElementById('sheet-status');
    if (status) status.textContent = 'Could not load the site scripts. Please refresh.';
  };
  document.body.append(original);
})();
