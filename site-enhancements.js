(() => {
  'use strict';

  const SHEET_ID = '157AYRw6wbe7FAcyypG1iCfl2DQQ2O8K16LFyCGWH3Ho';
  const SHEET_GID = '1438388237';
  const POSITION_ALIASES = {
    QB: ['QB', 'QUARTERBACK', 'QUARTER BACK'],
    WR: ['WR', 'WIDE RECEIVER', 'WIDERECEIVER'],
    DB: ['DB', 'DEFENSIVE BACK', 'CORNERBACK', 'SAFETY'],
    DE: ['DE', 'DEFENSIVE END']
  };
  const POSITION_TERMS = {
    QB: /quarter\s*back|passing|pass\s*(yd|yard|td|att|comp)|completion|interception|\bqb\b|\bqbr\b/i,
    WR: /wide\s*receiver|receiv|catch|target|\byac\b|\bwr\b/i,
    DB: /defensive\s*back|corner|safety|tackle|interception|pass\s*def|\bdb\b/i,
    DE: /defensive\s*end|sack|qb\s*hit|pressure|tackle\s*for\s*loss|forced\s*fumble|\bde\b/i
  };
  const COMMON_COLUMNS = /^(team|player|player name|name|athlete|pos|position|role|number|#|season|week|game|division|jersey)$/i;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = value => String(value ?? '').trim().toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
  let table = null;
  let selectedPosition = document.querySelector('.position-tab.active')?.dataset.position || 'QB';
  let requestNumber = 0;

  function gvizUrl() {
    return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${SHEET_GID}&tqx=out:json;responseHandler:hadStatsResponse_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  function loadSheet() {
    return new Promise((resolve, reject) => {
      const callbackName = `hadStatsResponse_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement('script');
      const timer = setTimeout(() => finish(new Error('Google Sheets did not respond in time.')), 15000);
      function finish(error, result) {
        clearTimeout(timer);
        try { delete window[callbackName]; } catch { window[callbackName] = undefined; }
        script.remove();
        error ? reject(error) : resolve(result);
      }
      window[callbackName] = response => {
        if (!response || response.status !== 'ok' || !response.table) {
          finish(new Error(response?.errors?.map(item => item.detailed_message || item.message).join('; ') || 'The sheet did not return a readable table.'));
          return;
        }
        finish(null, response.table);
      };
      script.onerror = () => finish(new Error('Google Sheets blocked the request. Check that the spreadsheet is shared for public viewing.'));
      script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${SHEET_GID}&headers=1&tqx=${encodeURIComponent(`out:json;responseHandler:${callbackName}`)}`;
      document.head.append(script);
    });
  }

  function cellValue(cell) {
    if (!cell) return '';
    return cell.f !== null && cell.f !== undefined ? String(cell.f) : (cell.v === null || cell.v === undefined ? '' : String(cell.v));
  }

  function csvEscape(value) {
    const text = String(value ?? '');
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function tableToCsv(data) {
    const headers = data.cols.map((col, i) => col.label || col.id || `Stat ${i + 1}`);
    return [headers, ...data.rows.map(row => (row.c || []).map(cellValue))]
      .map(row => row.map(csvEscape).join(',')).join('\r\n');
  }

  // Keep the existing site's rendering and per-player emoji fields, but feed them
  // through Google's JSONP endpoint (no browser CORS fetch required).
  const nativeFetch = window.fetch?.bind(window);
  if (nativeFetch) {
    window.fetch = (input, options) => {
      const url = typeof input === 'string' ? input : input?.url;
      if (url && url.includes('docs.google.com/spreadsheets') && url.includes('format=csv')) {
        return loadSheet().then(data => new Response(tableToCsv(data), {
          status: 200,
          headers: { 'Content-Type': 'text/csv; charset=utf-8' }
        }));
      }
      return nativeFetch(input, options);
    };
  }

  function showStatsError(error, id) {
    if (id !== requestNumber) return;
    const status = document.getElementById('sheet-status');
    const dot = document.getElementById('status-dot');
    const host = document.getElementById('stats-table');
    if (status) status.textContent = 'Could not connect to the public stats sheet';
    dot?.classList.remove('connected');
    if (host) host.innerHTML = `<div class="sheet-message"><strong>Stats sheet could not be read.</strong><p>${escapeHtml(error?.message || 'Check the sheet sharing settings and try again.')}</p><p>Open the linked sheet, then use Share → General access → Anyone with the link → Viewer. If it is already public, check that the Top 50 tab is not hidden or restricted.</p><a href="https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?gid=${SHEET_GID}#gid=${SHEET_GID}" target="_blank" rel="noopener">Open the Top 50 stats sheet ↗</a></div>`;
  }

  function renderStats(data) {
    const host = document.getElementById('stats-table');
    if (!host) return;
    const headers = data.cols.map((col, index) => String(col.label || col.id || `Stat ${index + 1}`).trim());
    const rows = data.rows.map(item => (item.c || []).map(cellValue));
    const posIndex = headers.findIndex(header => /^(pos|position|role|player position)$/i.test(header));
    const nameIndex = headers.findIndex(header => /^(player|player name|name|athlete)$/i.test(header));
    let selectedRows = rows.map((row, index) => ({row, index})).filter(({row}) => row.some(value => String(value).trim()));
    if (posIndex >= 0) {
      const aliases = POSITION_ALIASES[selectedPosition] || [selectedPosition];
      selectedRows = selectedRows.filter(({row}) => aliases.some(alias => normalize(alias) === normalize(row[posIndex])));
    }

    const visible = headers.map((header, index) => ({header, index}))
      .filter(({header}) => COMMON_COLUMNS.test(header) || POSITION_TERMS[selectedPosition]?.test(header))
      .map(item => item.index);
    const shownColumns = visible.length ? visible : headers.map((_, index) => index);
    const leaders = selectedRows.slice(0, 10);
    const title = document.getElementById('stats-table-title');
    if (title) title.textContent = `${selectedPosition} · TOP 10 LEADERS`;
    const hint = document.getElementById('position-hint');
    if (!leaders.length) {
      host.innerHTML = `<div class="sheet-message"><strong>No ${escapeHtml(selectedPosition)} leaders found.</strong><p>The sheet is connected, but it has no rows matching this position. Check the Pos/Position column or choose another position.</p></div>`;
      if (hint) hint.textContent = `No ${selectedPosition} player rows are tagged in the connected sheet.`;
      return;
    }
    if (hint) hint.textContent = `Showing ${leaders.length} ${selectedPosition} leader${leaders.length === 1 ? '' : 's'} from the live Google Sheet.`;
    const body = leaders.map(({row}, rank) => {
      const player = nameIndex >= 0 ? row[nameIndex] : `${selectedPosition} leader ${rank + 1}`;
      const key = `${selectedPosition}:${player || rank}`;
      return `<tr>${shownColumns.map(index => `<td>${escapeHtml(row[index] || '—')}</td>`).join('')}<td class="player-emoji-cell"><input class="player-emoji-input" type="text" maxlength="8" placeholder="🏈" aria-label="Emoji for ${escapeHtml(player)}" data-emoji-key="${escapeHtml(key)}"></td></tr>`;
    }).join('');
    host.innerHTML = `<div class="table-scroll"><table><thead><tr>${shownColumns.map(index => `<th>${escapeHtml(headers[index])}</th>`).join('')}<th class="player-emoji-heading">Emoji</th></tr></thead><tbody>${body}</tbody></table></div>`;
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem('had-player-emojis-v1') || '{}') || {}; } catch { /* ignore invalid local data */ }
    host.querySelectorAll('.player-emoji-input').forEach(input => {
      input.value = saved[input.dataset.emojiKey] || '';
      input.addEventListener('input', () => {
        const values = JSON.parse(localStorage.getItem('had-player-emojis-v1') || '{}');
        if (input.value.trim()) values[input.dataset.emojiKey] = input.value.trim();
        else delete values[input.dataset.emojiKey];
        localStorage.setItem('had-player-emojis-v1', JSON.stringify(values));
      });
    });
  }

  async function refreshStats() {
    const id = ++requestNumber;
    const status = document.getElementById('sheet-status');
    if (status) status.textContent = 'Connecting to the live stats sheet…';
    try {
      const result = await loadSheet();
      if (id !== requestNumber) return;
      table = result;
      renderStats(table);
      if (status) status.textContent = `Connected · ${result.rows.length} sheet rows · updated ${new Date().toLocaleTimeString([], {hour:'numeric', minute:'2-digit'})}`;
      document.getElementById('status-dot')?.classList.add('connected');
    } catch (error) {
      showStatsError(error, id);
    }
  }

  document.querySelectorAll('.position-tab').forEach(tab => tab.addEventListener('click', () => {
    selectedPosition = tab.dataset.position || 'QB';
    if (table) renderStats(table);
  }));
  document.getElementById('refresh-stats')?.addEventListener('click', refreshStats);
  refreshStats();
  setInterval(refreshStats, 60000);

  function bracketGame(label) {
    return `<article class="hfl-game"><h4>${escapeHtml(label)}</h4><div class="hfl-contestant"><span>TBD</span><strong>?</strong></div><div class="hfl-contestant"><span>TBD</span><strong>?</strong></div></article>`;
  }

  function renderBracket() {
    const section = document.getElementById('bracket');
    if (!section) return;
    section.innerHTML = `<div class="wrap"><div class="section-head"><div><p class="eyebrow">THE ROAD TO THE TITLE</p><h2>Heavenly Football League Season 2, Playoff Bracket.</h2></div><span class="section-note">12 teams · four rounds · all teams TBD</span></div>
      <div class="hfl-seeds"><h3>Playoff teams</h3><div class="hfl-seed-grid">${Array.from({length:12}, (_, i) => `<div class="hfl-seed"><span class="hfl-seed-icon" aria-label="HFL">HFL</span><span class="hfl-seed-number">${String(i + 1).padStart(2, '0')}</span><strong>TBD</strong></div>`).join('')}</div></div>
      <div class="hfl-round"><h3>Heavenly Gauntlet</h3><p class="hfl-round-note">Seeds 1–4 receive a first-round bye.</p><div class="hfl-game-grid">${['Seed 5 vs. Seed 12','Seed 6 vs. Seed 11','Seed 7 vs. Seed 10','Seed 8 vs. Seed 9'].map(bracketGame).join('')}</div></div>
      <div class="hfl-round"><h3>Elite Eight</h3><div class="hfl-game-grid">${['Seed 1 vs. Gauntlet winner','Seed 4 vs. Gauntlet winner','Seed 2 vs. Gauntlet winner','Seed 3 vs. Gauntlet winner'].map(bracketGame).join('')}</div></div>
      <div class="hfl-round"><h3>Final Four</h3><div class="hfl-game-grid">${['Elite Eight winner','Elite Eight winner'].map(bracketGame).join('')}</div></div>
      <div class="hfl-round hfl-championship"><h3><span aria-hidden="true">🏆</span> Heavenly Bowl 2</h3><div class="hfl-game-grid">${bracketGame('Championship')}</div></div>
      <div class="hfl-upload-notice"><strong>Public emoji uploads</strong><p>To make uploaded emoji images appear for everyone while restricting uploads to you, this site needs authenticated image storage. I’m not enabling an insecure public upload endpoint. Connect an authenticated storage project (for example, Firebase Storage or Supabase Storage) to activate this safely.</p></div>
      </div>`;
    if (!document.getElementById('hfl-enhancement-styles')) {
      const style = document.createElement('style');
      style.id = 'hfl-enhancement-styles';
      style.textContent = `#bracket .hfl-seeds,#bracket .hfl-round{margin:1.75rem 0;padding:1.4rem;border:1px solid rgba(32,42,50,.14);border-radius:12px;background:rgba(255,255,255,.72)}#bracket .hfl-seeds h3,#bracket .hfl-round h3{margin:0 0 1rem;font-family:Oswald,Inter,sans-serif;font-size:1.5rem}#bracket .hfl-seed-grid,#bracket .hfl-game-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:.8rem}#bracket .hfl-seed,#bracket .hfl-game{padding:.9rem 1rem;border:1px solid rgba(32,42,50,.12);border-radius:8px;background:#fff}#bracket .hfl-seed{display:flex;align-items:center;gap:.7rem;min-height:54px}#bracket .hfl-seed-icon{display:inline-grid;place-items:center;width:34px;height:34px;border-radius:50%;background:#102437;color:#fff;font-size:.7rem;font-weight:800}#bracket .hfl-seed-number{color:#697780;font-size:.8rem;font-weight:700}#bracket .hfl-game h4{margin:0 0 .45rem;color:#697780;font-size:.8rem;text-transform:uppercase;letter-spacing:.08em}#bracket .hfl-contestant{display:flex;justify-content:space-between;padding:.55rem 0;border-top:1px solid #e6e9e7}#bracket .hfl-contestant strong{font-family:Oswald,Inter,sans-serif}#bracket .hfl-round-note,#bracket .hfl-upload-notice p{color:#697780}#bracket .hfl-championship{border-color:#b65a32;background:#fff8ec}#bracket .hfl-upload-notice{margin:1.5rem 0;padding:1rem 1.2rem;border-left:4px solid #b65a32;background:#f4f3ef}#bracket .hfl-upload-notice p{margin:.5rem 0 0}`;
      document.head.append(style);
    }
  }

  renderBracket();
})();
