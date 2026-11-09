const SHEET_ID = '157AYRw6wbe7FAcyypG1iCfl2DQQ2O8K16LFyCGWH3Ho';
const SHEET_GID = '1938901917';
const REFRESH_MS = 60_000;
const DEFAULT_CONTENT = {
  season: 2,
  bulletins: [
    'Kansas City keeps its perfect season alive',
    'The playoff race is heating up across both divisions',
    'Check the live stats sheet for the latest league numbers'
  ],
  updates: [
    'Official playoff bracket and matchup reveal',
    'Expanded player stats and weekly leaders',
    'More league announcements and event coverage'
  ]
};
const STORAGE_KEY = 'had-operator-content-v1';

function loadContent() {
  try { return { ...DEFAULT_CONTENT, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
  catch { return { ...DEFAULT_CONTENT }; }
}
let content = loadContent();
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

function renderSeason() {
  document.getElementById('hero-season').textContent = `SEASON ${content.season}`;
  document.getElementById('bar-season').textContent = `HFL · SEASON ${content.season}`;
  document.getElementById('season-footer').textContent = content.season;
}
function renderBulletins() {
  const icons = ['✦', '↗', '▤'];
  document.getElementById('bulletin-list').innerHTML = content.bulletins.map((item, index) => `
    <article class="bulletin-card"><span class="bulletin-icon">${icons[index % icons.length]}</span><div><p class="eyebrow">HFL UPDATE · ${String(index + 1).padStart(2, '0')}</p><h3>${escapeHtml(item)}</h3><span class="bulletin-date">LEAGUE CENTRAL</span></div><span class="card-arrow">↗</span></article>`).join('');
  document.getElementById('update-list').innerHTML = content.updates.map((item, index) => `
    <article class="update-item"><span class="update-index">0${index + 1}</span><div><h3>${escapeHtml(item)}</h3><p>IN DEVELOPMENT</p></div><span class="update-status">COMING SOON</span></article>`).join('');
}
function openOperator() {
  document.getElementById('season-input').value = content.season;
  document.getElementById('bulletin-input').value = content.bulletins.join('\n');
  document.getElementById('updates-input').value = content.updates.join('\n');
  document.getElementById('operator-dialog').showModal();
}
document.getElementById('operator-toggle').addEventListener('click', openOperator);
document.getElementById('save-content').addEventListener('click', () => {
  content = {
    season: Math.max(1, Number(document.getElementById('season-input').value) || DEFAULT_CONTENT.season),
    bulletins: document.getElementById('bulletin-input').value.split('\n').map((line) => line.trim()).filter(Boolean),
    updates: document.getElementById('updates-input').value.split('\n').map((line) => line.trim()).filter(Boolean)
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  renderSeason(); renderBulletins();
  document.getElementById('operator-dialog').close();
});
document.getElementById('reset-content').addEventListener('click', () => {
  content = { ...DEFAULT_CONTENT, bulletins: [...DEFAULT_CONTENT.bulletins], updates: [...DEFAULT_CONTENT.updates] };
  localStorage.removeItem(STORAGE_KEY); renderSeason(); renderBulletins(); openOperator();
});

function parseCsv(text) {
  const rows = []; let row = []; let cell = ''; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"' && quoted && text[i + 1] === '"') { cell += '"'; i++; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); if (row.some((value) => value.trim())) rows.push(row); row = []; cell = '';
    } else cell += char;
  }
  row.push(cell); if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}
async function loadStats() {
  const table = document.getElementById('stats-table');
  const status = document.getElementById('sheet-status');
  const dot = document.getElementById('status-dot');
  const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}&_=${Date.now()}`;
  try {
    const response = await fetch(csvUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error('Sheet is not publicly viewable');
    const rows = parseCsv(await response.text()).filter((row) => row.some((cell) => cell.trim()));
    if (!rows.length) throw new Error('No spreadsheet rows found');
    const headers = rows[0];
    const body = rows.slice(1).filter((row) => row.some((cell) => cell.trim()));
    table.innerHTML = `<div class="table-scroll"><table><thead><tr>${headers.map((value) => `<th>${escapeHtml(value || '—')}</th>`).join('')}</tr></thead><tbody>${body.map((row) => `<tr>${headers.map((_, index) => `<td>${escapeHtml(row[index] || '—')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    status.textContent = `Connected · updated ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    dot.classList.add('connected');
  } catch (error) {
    table.innerHTML = `<div class="sheet-error"><span>▤</span><h3>Stats couldn’t load yet.</h3><p>Make sure the Google Sheet is shared as “Anyone with the link” can view, then refresh. You can still open the sheet directly or view its embedded version below.</p><a href="https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?gid=${SHEET_GID}#gid=${SHEET_GID}" target="_blank" rel="noopener">Open the spreadsheet ↗</a></div>`;
    status.textContent = 'Waiting for spreadsheet access';
    dot.classList.remove('connected');
  }
}
document.getElementById('refresh-stats').addEventListener('click', loadStats);
loadStats(); setInterval(loadStats, REFRESH_MS);
renderSeason(); renderBulletins();
document.getElementById('year').textContent = new Date().getFullYear();
const menu = document.getElementById('main-nav');
const menuButton = document.getElementById('menu-toggle');
menuButton.addEventListener('click', () => { const opened = menu.classList.toggle('open'); menuButton.setAttribute('aria-expanded', String(opened)); });
menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { menu.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); }));
