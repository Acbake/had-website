const SHEET_ID = '157AYRw6wbe7FAcyypG1iCfl2DQQ2O8K16LFyCGWH3Ho';
const SHEET_GID = '1938901917';
const REFRESH_MS = 60_000;
let sheetHeaders = [];
let sheetRows = [];
let selectedPosition = 'QB';
const POSITION_TERMS = {
  QB: /quarter\s*back|passing|pass\s*(yd|yard|td|att|comp)|completion|interception|\bqb\b/i,
  WR: /wide\s*receiver|receiv|catch|target|\byac\b|\bwr\b/i,
  DB: /defensive\s*back|corner|safety|tackle|interception|pass\s*def|\bdb\b/i,
  DE: /defensive\s*end|sack|qb\s*hit|pressure|tackle\s*for\s*loss|forced\s*fumble|\bde\b/i
};
const POSITION_ALIASES = {
  QB: ['QB', 'QUARTERBACK', 'QUARTER BACK'],
  WR: ['WR', 'WIDE RECEIVER', 'WIDERECEIVER'],
  DB: ['DB', 'DEFENSIVE BACK', 'CORNERBACK', 'SAFETY'],
  DE: ['DE', 'DEFENSIVE END']
};
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
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
function normalized(value) { return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9 ]/g, ''); }
function positionColumnIndex() {
  return sheetHeaders.findIndex((header) => /^(pos|position|role|player position)$/i.test(String(header).trim()));
}
function columnRelevant(header, position) {
  const value = String(header || '').trim();
  if (!value) return false;
  if (/^(team|player|name|pos|position|role|number|#|season|week|game|division|jersey)$/i.test(value)) return true;
  const words = POSITION_TERMS[position];
  return words.test(value);
}
function renderPositionStats() {
  const host = document.getElementById('stats-table');
  const hint = document.getElementById('position-hint');
  const title = document.getElementById('stats-table-title');
  if (!host) return;
  title.textContent = `${selectedPosition} • LIVE DATA`;
  if (!sheetHeaders.length) return;
  const posIndex = positionColumnIndex();
  const matchingRows = posIndex < 0 ? sheetRows : sheetRows.filter((row) => {
    const value = normalized(row[posIndex]);
    return POSITION_ALIASES[selectedPosition].some((alias) => normalized(alias) === value);
  });
  const visibleIndexes = sheetHeaders.map((header, index) => columnRelevant(header, selectedPosition) ? index : -1).filter((index) => index >= 0);
  if (posIndex >= 0 && matchingRows.length === 0) {
    host.innerHTML = `<div class="sheet-message"><strong>No ${selectedPosition} rows found.</strong><p>Check that the spreadsheet has a Pos or Position column with ${selectedPosition} entries.</p></div>`;
    hint.textContent = `Showing rows tagged ${selectedPosition} in the spreadsheet.`;
    return;
  }
  if (posIndex < 0) {
    hint.textContent = 'This sheet has no Position column, so the view filters stat columns only. Add a Pos/Position column to filter players by role.';
  } else {
    hint.textContent = `Showing ${matchingRows.length} player row${matchingRows.length === 1 ? '' : 's'} tagged ${selectedPosition}.`;
  }
  const columns = visibleIndexes.length ? visibleIndexes : sheetHeaders.map((_, index) => index);
  if (columns.length === 0) { host.innerHTML = '<div class="sheet-message">No spreadsheet columns found.</div>'; return; }
  host.innerHTML = `<div class="table-scroll"><table><thead><tr>${columns.map((index) => `<th>${escapeHtml(sheetHeaders[index] || '—')}</th>`).join('')}</tr></thead><tbody>${matchingRows.map((row) => `<tr>${columns.map((index) => `<td>${escapeHtml(row[index] || '—')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
async function loadStats() {
  const status = document.getElementById('sheet-status');
  const dot = document.getElementById('status-dot');
  const host = document.getElementById('stats-table');
  if (!status || !dot || !host) return;
  status.textContent = 'Connecting to Google Sheets…';
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}&_=${Date.now()}`;
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error('Sheet is not publicly viewable');
    const rows = parseCsv(await response.text());
    if (!rows.length) throw new Error('No spreadsheet rows found');
    sheetHeaders = rows[0];
    sheetRows = rows.slice(1).filter((row) => row.some((value) => value.trim()));
    renderPositionStats();
    status.textContent = `Connected · updated ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    dot.classList.add('connected');
  } catch (error) {
    host.innerHTML = `<div class="sheet-message"><strong>Stats could not load.</strong><p>Set the spreadsheet access to “Anyone with the link — Viewer,” then refresh. You can still open the source sheet.</p><a href="https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?gid=${SHEET_GID}#gid=${SHEET_GID}" target="_blank" rel="noopener">Open Google Sheet ↗</a></div>`;
    status.textContent = 'Waiting for spreadsheet access';
    dot.classList.remove('connected');
  }
}

document.querySelectorAll('.position-tab').forEach((tab) => tab.addEventListener('click', () => {
  selectedPosition = tab.dataset.position;
  document.querySelectorAll('.position-tab').forEach((item) => {
    const active = item === tab;
    item.classList.toggle('active', active);
    item.setAttribute('aria-selected', String(active));
  });
  renderPositionStats();
}));
document.getElementById('refresh-stats')?.addEventListener('click', loadStats);
loadStats();
setInterval(loadStats, REFRESH_MS);
document.getElementById('year').textContent = new Date().getFullYear();
const menu = document.getElementById('main-nav');
const menuButton = document.getElementById('menu-toggle');
menuButton?.addEventListener('click', () => {
  const opened = menu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(opened));
});
menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menu.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));
