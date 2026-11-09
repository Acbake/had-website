const SHEET_ID = '157AYRw6wbe7FAcyypG1iCfl2DQQ2O8K16LFyCGWH3Ho';
// Leaders sheet (Top 50): https://docs.google.com/spreadsheets/d/<ID>/edit?gid=1438388237
const SHEET_GID = '1438388237';
const REFRESH_MS = 60_000;
const STORAGE_KEY = 'had-operator-content-v2';
const DEFAULT_CONTENT = {
  season: 2,
  bulletins: ['Kansas City keeps its perfect season alive', 'The playoff race is heating up across both divisions', 'Check the live stats sheet for the latest league numbers'],
  updates: ['Official playoff bracket and matchup reveal', 'Expanded player stats and weekly leaders', 'More league announcements and event coverage'],
  standings: {
    crown: [
      { team: 'Kansas City Firebirds', emoji: '', rank: 1, record: '8-0', pd: '+94' },
      { team: 'Pittsburgh Bullets', emoji: '', rank: 2, record: '5-3', pd: '+71' },
      { team: 'San Francisco Reapers', emoji: '', rank: 3, record: '5-3', pd: '+16' },
      { team: 'Boston Knights', emoji: '', rank: 4, record: '4-4', pd: '+24' },
      { team: 'Cleveland Pirates', emoji: '', rank: 5, record: '4-4', pd: '-17' },
      { team: 'Oklahoma City Monarchs', emoji: '', rank: 6, record: '4-4', pd: '-27' },
      { team: 'New Orleans Dragons', emoji: '', rank: 7, record: '3-5', pd: '-61' },
      { team: 'Tampa Bay Ravens', emoji: '', rank: 8, record: '3-5', pd: '-105' }
    ],
    ascended: [
      { team: 'Denver Lightning', emoji: '', rank: 1, record: '7-1', pd: '+119' },
      { team: 'Las Vegas Bulls', emoji: '', rank: 2, record: '5-3', pd: '+63' },
      { team: 'Portland Huskies', emoji: '', rank: 3, record: '5-3', pd: '+58' },
      { team: 'Salt Lake City Bugles', emoji: '', rank: 4, record: '4-4', pd: '-17' },
      { team: 'Seattle Mustangs', emoji: '', rank: 5, record: '4-4', pd: '-18' },
      { team: 'Minnesota Tarpedos', emoji: '', rank: 6, record: '3-5', pd: '-43' },
      { team: 'San Antonio Aztecs', emoji: '', rank: 7, record: '2-6', pd: '-68' },
      { team: 'Phoenix Dolphins', emoji: '', rank: 8, record: '1-7', pd: '-129' }
    ]
  }
};
let content;
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  content = saved ? { ...DEFAULT_CONTENT, ...saved, standings: { crown: saved.standings?.crown || DEFAULT_CONTENT.standings.crown, ascended: saved.standings?.ascended || DEFAULT_CONTENT.standings.ascended } } : structuredClone(DEFAULT_CONTENT);
} catch { content = structuredClone(DEFAULT_CONTENT); }
let sheetHeaders = [], sheetRows = [], selectedPosition = 'QB';
const POSITION_TERMS = {
  QB: /quarter\s*back|passing|pass\s*(yd|yard|td|att|comp)|completion|interception|\bqb\b|\bqbr\b/i,
  WR: /wide\s*receiver|receiv|catch|target|\byac\b|\bwr\b/i,
  DB: /defensive\s*back|corner|safety|tackle|interception|pass\s*def|\bdb\b/i,
  DE: /defensive\s*end|sack|qb\s*hit|pressure|tackle\s*for\s*loss|forced\s*fumble|\bde\b/i
};
const POSITION_ALIASES = { QB: ['QB', 'QUARTERBACK', 'QUARTER BACK'], WR: ['WR', 'WIDE RECEIVER', 'WIDERECEIVER'], DB: ['DB', 'DEFENSIVE BACK', 'CORNERBACK', 'SAFETY'], DE: ['DE', 'DEFENSIVE END'] };
const COMMON_COLUMNS = /^(team|player|name|pos|position|role|number|#|season|week|game|division|jersey)$/i;
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
function parseCsv(text) {
  const rows = []; let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"' && quoted && text[i + 1] === '"') { cell += '"'; i++; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); if (row.some(value => value.trim())) rows.push(row); row = []; cell = '';
    } else cell += char;
  }
  row.push(cell); if (row.some(value => value.trim())) rows.push(row);
  return rows;
}
const normalize = value => String(value || '').trim().toUpperCase().replace(/[^A-Z0-9 ]/g, '');
function findHeaderRow(rows) {
  const scan = rows.slice(0, 25);
  const index = scan.findIndex(row => row.some(cell => /^(player|player name|name)$/i.test(String(cell).trim())) && row.filter(cell => String(cell).trim()).length >= 3);
  return index < 0 ? 0 : index;
}
function renderSeason() {
  const season = Number(content.season) || 2;
  const hero = document.getElementById('hero-season');
  if (hero) hero.textContent = `SEASON ${season}`;
  const footer = document.getElementById('season-footer');
  if (footer) footer.textContent = season;
}
function renderStandings() {
  for (const division of ['crown', 'ascended']) {
    const list = document.getElementById(`${division}-standings`);
    if (!list) continue;
    const teams = [...(content.standings?.[division] || [])].sort((a, b) => (Number(a.rank) || 99) - (Number(b.rank) || 99)).slice(0, 8);
    list.innerHTML = teams.map((item, index) => `<li class="standing-row"><span class="standing-rank">${index + 1}</span><span class="standing-emoji">${escapeHtml(item.emoji) || '<span class="emoji-placeholder">•</span>'}</span><span class="standing-team">${escapeHtml(item.team)}</span><span class="standing-record">${escapeHtml(item.record || '—')}</span><span class="standing-pd ${String(item.pd).trim().startsWith('-') ? 'negative' : 'positive'}">${escapeHtml(item.pd || '—')} <small>PD</small></span></li>`).join('');
  }
  const directory = document.getElementById('team-directory');
  if (directory) directory.innerHTML = [...content.standings.crown, ...content.standings.ascended].map(item => `<div class="team-card"><span>${escapeHtml(item.emoji) || '✦'}</span><b>${escapeHtml(item.team)}</b></div>`).join('');
}
function renderStandingsEditor() {
  for (const division of ['crown', 'ascended']) {
    const root = document.getElementById(`${division}-editor`);
    if (!root) continue;
    root.innerHTML = (content.standings[division] || []).map((item, index) => `<div class="editor-team-row"><span class="editor-team-name">${escapeHtml(item.team)}</span>${[['rank','Rank'],['emoji','Emoji'],['record','W-L'],['pd','PD']].map(([field,label]) => `<label>${label}<input type="${field === 'rank' ? 'number' : 'text'}" ${field === 'rank' ? 'min="1" max="8"' : 'maxlength="10"'} data-division="${division}" data-index="${index}" data-field="${field}" value="${escapeHtml(item[field])}"></label>`).join('')}</div>`).join('');
  }
}
function renderBulletins() {
  const bulletinList = document.getElementById('bulletin-list');
  if (bulletinList) bulletinList.innerHTML = (content.bulletins || []).map((text, i) => `<article class="bulletin-card"><span class="bulletin-icon">${['✦','↗','▤'][i % 3]}</span><div><p class="eyebrow dark">HFL NEWS · ${String(i + 1).padStart(2, '0')}</p><h3>${escapeHtml(text)}</h3><small>LEAGUE CENTRAL</small></div></article>`).join('');
  const updateList = document.getElementById('update-list');
  if (updateList) updateList.innerHTML = (content.updates || []).map((text, i) => `<article class="update-item"><span class="update-index">${String(i + 1).padStart(2, '0')}</span><div><h3>${escapeHtml(text)}</h3><small>IN DEVELOPMENT</small></div><span class="update-status">COMING SOON</span></article>`).join('');
}
function renderPositionStats() {
  const host = document.getElementById('stats-table'), hint = document.getElementById('position-hint');
  if (!host || !sheetHeaders.length) return;
  const title = document.getElementById('stats-table-title');
  if (title) title.textContent = `${selectedPosition} · TOP LEADERS`;
  const positionIndex = sheetHeaders.findIndex(header => /^(pos|position|role|player position)$/i.test(String(header).trim()));
  const rows = positionIndex < 0 ? sheetRows : sheetRows.filter(row => POSITION_ALIASES[selectedPosition].some(alias => normalize(alias) === normalize(row[positionIndex])));
  const columns = sheetHeaders.map((header, index) => COMMON_COLUMNS.test(String(header).trim()) || POSITION_TERMS[selectedPosition].test(String(header)) ? index : -1).filter(index => index >= 0);
  const visible = columns.length ? columns : sheetHeaders.map((_, index) => index);
  if (positionIndex >= 0 && rows.length === 0) {
    host.innerHTML = `<div class="sheet-message"><strong>No ${selectedPosition} leaders found.</strong><p>Check the sheet’s Pos/Position values for this position.</p></div>`;
    if (hint) hint.textContent = `No top-leader rows are tagged ${selectedPosition}.`;
    return;
  }
  if (hint) hint.textContent = positionIndex < 0 ? 'Showing leaders from the Top 50 sheet. Add a Pos/Position column if you want player rows filtered by position.' : `Showing ${rows.length} ${selectedPosition} leader${rows.length === 1 ? '' : 's'} from the sheet.`;
  host.innerHTML = `<div class="table-scroll"><table><thead><tr>${visible.map(index => `<th>${escapeHtml(sheetHeaders[index] || '—')}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${visible.map(index => `<td>${escapeHtml(row[index] || '—')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
async function loadStats() {
  const status = document.getElementById('sheet-status'), dot = document.getElementById('status-dot'), host = document.getElementById('stats-table');
  if (!status || !dot || !host) return;
  status.textContent = 'Connecting to leaders sheet…';
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}&_=${Date.now()}`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error('Sheet unavailable');
    const parsed = parseCsv(await response.text());
    if (!parsed.length) throw new Error('No rows');
    const headerIndex = findHeaderRow(parsed);
    sheetHeaders = parsed[headerIndex];
    sheetRows = parsed.slice(headerIndex + 1).filter(row => row.some(value => value.trim())).slice(0, 50);
    renderPositionStats();
    status.textContent = `Connected · Top ${sheetRows.length} · updated ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    dot.classList.add('connected');
  } catch {
    host.innerHTML = `<div class="sheet-message"><strong>Leaders could not load.</strong><p>Make sure the Top 50 Google Sheet is shared as “Anyone with the link — Viewer,” then refresh.</p><a href="https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?gid=${SHEET_GID}#gid=${SHEET_GID}" target="_blank" rel="noopener">Open Top 50 leaders sheet ↗</a></div>`;
    status.textContent = 'Waiting for spreadsheet access';
    dot.classList.remove('connected');
  }
}
document.querySelectorAll('.position-tab').forEach(tab => tab.addEventListener('click', () => {
  selectedPosition = tab.dataset.position;
  document.querySelectorAll('.position-tab').forEach(item => { const active = item === tab; item.classList.toggle('active', active); item.setAttribute('aria-selected', String(active)); });
  renderPositionStats();
}));
document.getElementById('refresh-stats')?.addEventListener('click', loadStats);
loadStats(); setInterval(loadStats, REFRESH_MS);
renderSeason(); renderStandings(); renderBulletins();
const year = document.getElementById('year'); if (year) year.textContent = new Date().getFullYear();
const menu = document.getElementById('main-nav'), menuButton = document.getElementById('menu-toggle');
menuButton?.addEventListener('click', () => { const open = menu.classList.toggle('open'); menuButton.setAttribute('aria-expanded', String(open)); });
menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.classList.remove('open'); menuButton?.setAttribute('aria-expanded', 'false'); }));
const operator = document.getElementById('operator-dialog');
document.getElementById('operator-toggle')?.addEventListener('click', () => {
  const season = document.getElementById('season-input'); if (season) season.value = content.season;
  const bulletins = document.getElementById('bulletin-input'); if (bulletins) bulletins.value = (content.bulletins || []).join('\n');
  const updates = document.getElementById('updates-input'); if (updates) updates.value = (content.updates || []).join('\n');
  renderStandingsEditor(); operator?.showModal();
});
document.querySelector('.close-dialog')?.addEventListener('click', () => operator?.close());
document.getElementById('save-content')?.addEventListener('click', () => {
  document.querySelectorAll('.editor-team-row input').forEach(input => { const { division, index, field } = input.dataset; if (content.standings?.[division]?.[Number(index)]) content.standings[division][Number(index)][field] = field === 'rank' ? Math.min(8, Math.max(1, Number(input.value) || 1)) : input.value.trim(); });
  content.season = Math.max(1, Number(document.getElementById('season-input')?.value) || 2);
  content.bulletins = (document.getElementById('bulletin-input')?.value || '').split('\n').map(line => line.trim()).filter(Boolean);
  content.updates = (document.getElementById('updates-input')?.value || '').split('\n').map(line => line.trim()).filter(Boolean);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content)); renderSeason(); renderStandings(); renderBulletins(); operator?.close();
});
document.getElementById('reset-content')?.addEventListener('click', () => { content = structuredClone(DEFAULT_CONTENT); localStorage.removeItem(STORAGE_KEY); renderSeason(); renderStandings(); renderBulletins(); operator?.close(); });
(function addFallingLeaves() { const host = document.getElementById('falling-leaves'); if (!host || matchMedia('(prefers-reduced-motion: reduce)').matches) return; const colors = ['#b94e2c','#d97732','#e9ae42','#9b572f','#d4a044']; for (let i = 0; i < 18; i++) { const leaf = document.createElement('span'); leaf.className = 'fall-leaf'; leaf.style.left = `${Math.random() * 100}%`; leaf.style.setProperty('--delay', `${Math.random() * 18}s`); leaf.style.setProperty('--duration', `${12 + Math.random() * 15}s`); leaf.style.setProperty('--sway', `${-90 + Math.random() * 180}px`); leaf.style.setProperty('--leaf-color', colors[i % colors.length]); leaf.style.setProperty('--leaf-scale', `${.55 + Math.random() * .75}`); host.appendChild(leaf); } })();
