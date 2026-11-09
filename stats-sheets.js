(() => {
  'use strict';

  const sheets = {
    QB: '1938901917',
    WR: '744262326',
    DB: '1089441891', // The existing navigation calls this tab DB; the sheet is the CB sheet.
    DE: '1245136598'
  };
  const sheetId = '157AYRw6wbe7FAcyypG1iCfl2DQQ2O8K16LFyCGWH3Ho';
  const host = document.getElementById('stats-table');
  const status = document.getElementById('sheet-status');
  const dot = document.getElementById('status-dot');
  const title = document.getElementById('stats-table-title');
  const hint = document.getElementById('position-hint');
  if (!host || !status || !dot) return;

  let selected = 'QB';
  let requestNumber = 0;
  let refreshTimer;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const normalize = value => String(value ?? '').trim().toUpperCase().replace(/[^A-Z0-9#%]+/g, ' ').trim();

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
        row.push(cell); cell = '';
        if (row.some(value => value.trim())) rows.push(row);
        row = [];
      } else cell += char;
    }
    if (cell || row.length) { row.push(cell); if (row.some(value => value.trim())) rows.push(row); }
    return rows;
  }

  function headerRowIndex(rows) {
    let bestIndex = 0, bestScore = -1;
    rows.slice(0, 40).forEach((row, index) => {
      const cells = row.map(normalize);
      const score = cells.filter(value => /^(PLAYER|PLAYER NAME|NAME|ATHLETE|TEAM|POS|POSITION|PASSING|RECEIVING|TACKLES|SACKS|INT|YDS|TD|GP|GAMES)$/.test(value)).length;
      if (score > bestScore) { bestScore = score; bestIndex = index; }
    });
    return bestIndex;
  }

  function render(rows, headers, position) {
    const dataRows = rows.filter(row => row.some(value => String(value ?? '').trim()));
    if (!dataRows.length) {
      host.innerHTML = `<div class="sheet-message"><strong>No ${position} stats found.</strong><p>The sheet is connected, but it does not contain any player rows yet.</p></div>`;
      return;
    }
    const visibleRows = dataRows.slice(0, 10);
    host.innerHTML = `<div class="table-scroll"><table><thead><tr>${headers.map(value => `<th>${escapeHtml(value || '—')}</th>`).join('')}</tr></thead><tbody>${visibleRows.map(row => `<tr>${headers.map((_, index) => `<td>${escapeHtml(row[index] || '—')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    if (hint) hint.textContent = `Showing ${visibleRows.length} ${position} player${visibleRows.length === 1 ? '' : 's'} from the live ${position} stats sheet.`;
  }

  async function loadStats() {
    const position = selected;
    const request = ++requestNumber;
    status.textContent = 'Connecting to the stats sheet…';
    dot.classList.remove('offline');
    try {
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${sheets[position]}&t=${Date.now()}`;
      const response = await fetch(url, {cache:'no-store'});
      if (!response.ok) throw new Error(`Sheet request failed (${response.status}).`);
      const rows = parseCsv(await response.text());
      if (request !== requestNumber) return;
      const index = headerRowIndex(rows);
      const headers = rows[index]?.map(value => value.trim()) || [];
      render(rows.slice(index + 1), headers, position);
      status.textContent = `Live ${position} stats · refreshed ${new Date().toLocaleTimeString()}`;
      if (title) title.textContent = `${position} · TOP 10 LEADERS`;
    } catch (error) {
      if (request !== requestNumber) return;
      dot.classList.add('offline');
      status.textContent = 'Stats could not load. Make sure the Google Sheet is shared so anyone with the link can view it.';
      host.innerHTML = `<div class="sheet-message"><strong>${escapeHtml(error.message || 'Stats could not load.')}</strong><p>Check the sheet sharing settings and try again.</p></div>`;
    }
  }

  document.querySelectorAll('.position-tab').forEach(button => {
    if (button.dataset.position === 'DB') button.textContent = 'CB';
    button.addEventListener('click', () => {
      selected = button.dataset.position === 'DB' ? 'DB' : button.dataset.position;
      window.clearInterval(refreshTimer);
      loadStats();
      refreshTimer = window.setInterval(loadStats, 60_000);
    });
  });
  document.getElementById('refresh-stats')?.addEventListener('click', loadStats);
  refreshTimer = window.setInterval(loadStats, 60_000);
  loadStats();
})();
