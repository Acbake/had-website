(() => {
  'use strict';

  const KEY = 'had-award-leaders-v1';
  const CATEGORIES = [
    {id:'mvp', title:'Most Valuable Player', short:'MVP', icon:'✦'},
    {id:'opotY', title:'Offensive Player of the Year', short:'OPOTY', icon:'↗'},
    {id:'dpoty', title:'Defensive Player of the Year', short:'DPOTY', icon:'⬟'},
    {id:'roty', title:'Rookie of the Year', short:'ROTY', icon:'★'},
    {id:'first-team', title:'First Team', short:'FIRST TEAM', icon:'◆'}
  ];
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const grid = document.getElementById('award-grid');
  const dialog = document.getElementById('awards-dialog');
  const form = document.getElementById('award-form');
  const categorySelect = document.getElementById('award-category');
  if (!grid || !dialog || !form || !categorySelect) return;

  let leaders = {};
  try { leaders = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { leaders = {}; }
  for (const category of CATEGORIES) {
    if (!Array.isArray(leaders[category.id])) leaders[category.id] = [];
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(leaders)); }
    catch { alert('Could not save award leaders in this browser.'); }
  }

  function render() {
    grid.innerHTML = CATEGORIES.map(category => {
      const entries = leaders[category.id] || [];
      return `<article class="award-card"><div class="award-card-head"><span aria-hidden="true">${category.icon}</span><div><p class="eyebrow dark">SEASON 2 AWARD</p><h3>${category.title}</h3></div></div>${entries.length
        ? `<ol class="award-leader-list">${entries.map((entry, index) => `<li><span class="award-rank">${String(index + 1).padStart(2, '0')}</span><div><strong>${escape(entry.player)}</strong><small>${escape(entry.team || 'Team TBD')}</small>${entry.details ? `<p>${escape(entry.details)}</p>` : ''}</div></li>`).join('')}</ol>`
        : '<p class="award-empty">Leaders to be announced.</p>'}</article>`;
    }).join('');
    categorySelect.innerHTML = CATEGORIES.map(category => `<option value="${category.id}">${category.title}</option>`).join('');
    renderManageList();
  }

  function renderManageList() {
    const host = document.getElementById('award-manage-list');
    if (!host) return;
    const items = CATEGORIES.flatMap(category => (leaders[category.id] || []).map((entry, index) => ({category, entry, index})));
    host.innerHTML = `<h3>Current entries</h3>${items.length ? items.map(({category, entry, index}) => `<div class="award-manage-row"><span><b>${category.short}</b> · ${escape(entry.player)}${entry.team ? ` — ${escape(entry.team)}` : ''}</span><button type="button" data-remove-category="${category.id}" data-remove-index="${index}" aria-label="Remove ${escape(entry.player)}">Remove</button></div>`).join('') : '<p>No award leaders added yet.</p>'}`;
    host.querySelectorAll('[data-remove-category]').forEach(button => button.addEventListener('click', () => {
      leaders[button.dataset.removeCategory].splice(Number(button.dataset.removeIndex), 1);
      save(); render();
    }));
  }

  document.getElementById('manage-awards')?.addEventListener('click', () => dialog.showModal());
  document.getElementById('close-awards')?.addEventListener('click', () => dialog.close());
  form.addEventListener('submit', event => {
    event.preventDefault();
    const category = categorySelect.value;
    const player = document.getElementById('award-player').value.trim();
    if (!player || !leaders[category]) return;
    leaders[category].push({
      player,
      team: document.getElementById('award-team').value.trim(),
      details: document.getElementById('award-details').value.trim()
    });
    save();
    form.reset();
    render();
  });

  if (!document.getElementById('award-leaders-style')) {
    const style = document.createElement('style');
    style.id = 'award-leaders-style';
    style.textContent = `.awards-intro{color:#697780;margin:-.6rem 0 1.5rem}.award-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,290px),1fr));gap:1rem}.award-card{background:#fff;border:1px solid #dfe3df;border-radius:10px;padding:1.2rem;box-shadow:0 8px 24px rgba(16,36,55,.05)}.award-card-head{display:flex;align-items:center;gap:.8rem;margin-bottom:.8rem}.award-card-head>span{display:grid;place-items:center;flex:0 0 42px;height:42px;border-radius:50%;background:#102437;color:#e5b34e;font-size:1.2rem}.award-card h3{margin:.15rem 0;font-family:Oswald,Inter,sans-serif;font-size:1.25rem}.award-card .eyebrow{margin:0;font-size:.68rem}.award-leader-list{list-style:none;padding:0;margin:0}.award-leader-list li{display:flex;gap:.8rem;align-items:flex-start;padding:.8rem 0;border-top:1px solid #e8ebe8}.award-rank{color:#b65a32;font-weight:800;font-family:Oswald,Inter,sans-serif}.award-leader-list li div{display:grid;gap:.2rem}.award-leader-list small,.award-leader-list p,.award-empty,.awards-note{color:#697780}.award-leader-list p{margin:.2rem 0 0;font-size:.9rem}.award-empty{padding:.5rem 0}.awards-note{font-size:.9rem}.awards-dialog{width:min(560px,calc(100% - 2rem));max-height:85vh;overflow:auto;border:0;border-radius:12px;padding:1.4rem;box-shadow:0 20px 70px rgba(0,0,0,.25)}.awards-dialog::backdrop{background:rgba(10,25,38,.68)}.awards-dialog label{display:grid;gap:.35rem;margin:1rem 0;font-weight:600}.awards-dialog input,.awards-dialog select{width:100%;padding:.7rem;border:1px solid #d5dad9;border-radius:5px;font:inherit}.award-manage-list{margin-top:1.5rem}.award-manage-list h3{font-family:Oswald,Inter,sans-serif}.award-manage-row{display:flex;justify-content:space-between;align-items:center;gap:.7rem;padding:.6rem 0;border-top:1px solid #e8ebe8}.award-manage-row button{border:1px solid #d5dad9;border-radius:4px;padding:.4rem .6rem;background:white;color:#203a4b;cursor:pointer}`;
    document.head.append(style);
  }
  render();
})();
