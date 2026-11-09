/* Replace the old spreadsheet stats panel before the site app initializes, so the
   page no longer requests or depends on the Google Sheet. */
(() => {
  const section = document.getElementById('stats');
  if (section) {
    section.className = 'awards-section section';
    section.innerHTML = `
      <div class="wrap">
        <div class="section-head">
          <div><p class="eyebrow dark">SEASON 2 HONORS</p><h2>Award leaders.</h2></div>
          <button type="button" class="btn btn-primary" id="manage-awards">Manage leaders</button>
        </div>
        <p class="awards-intro">Track the players making their case for this season’s biggest honors.</p>
        <div class="award-grid" id="award-grid" aria-live="polite"></div>
        <p class="awards-note" id="awards-note">Leaders you add are saved in this browser.</p>
        <dialog class="awards-dialog" id="awards-dialog">
          <form id="award-form">
            <div class="dialog-head"><div><p class="eyebrow dark">AWARD TRACKER</p><h2>Manage award leaders.</h2></div><button type="button" class="close-dialog" id="close-awards" aria-label="Close">×</button></div>
            <p class="awards-note">Entries are saved only in this browser and are not shared with other visitors.</p>
            <label>Award category<select id="award-category" required></select></label>
            <label>Player name<input id="award-player" maxlength="80" required placeholder="Player name"></label>
            <label>Team<input id="award-team" maxlength="80" placeholder="Team name"></label>
            <label>Case / stats<input id="award-details" maxlength="180" placeholder="A short note or key stats"></label>
            <button type="submit" class="btn btn-primary">Add award leader</button>
            <div class="award-manage-list" id="award-manage-list"></div>
          </form>
        </dialog>
      </div>`;
  }
  document.querySelectorAll('#main-nav a').forEach(link => {
    if (link.getAttribute('href') === '#stats') link.textContent = 'Awards';
  });

  const site = document.createElement('script');
  site.src = 'site-enhancements.js?v=award-leaders';
  site.onload = () => {
    const awards = document.createElement('script');
    awards.src = 'awards.js?v=season2-awards';
    awards.onerror = () => {
      const grid = document.getElementById('award-grid');
      if (grid) grid.textContent = 'Award leaders could not load. Please refresh the page.';
    };
    document.body.append(awards);
  };
  site.onerror = () => {
    const grid = document.getElementById('award-grid');
    if (grid) grid.textContent = 'The site app could not load. Please refresh the page.';
  };
  document.body.append(site);
})();
