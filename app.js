const SHEET_ID = '157AYRw6wbe7FAcyypG1iCfl2DQQ2O8K16LFyCGWH3Ho';
const SHEET_GID = '1938901917';
const REFRESH_MS = 60_000;
const DEFAULT_CONTENT = { season: 2, bulletins: ['Kansas City keeps its perfect season alive', 'The playoff race is heating up across both divisions', 'Check the live stats sheet for the latest league numbers'], updates: ['Official playoff bracket and matchup reveal', 'Expanded player stats and weekly leaders', 'More league announcements and event coverage'] };
const STORAGE_KEY = 'had-operator-content-v1';
let content;
try { content = { ...DEFAULT_CONTENT, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; } catch { content = { ...DEFAULT_CONTENT }; }
let sheetHeaders = [], sheetRows = [], selectedPosition = 'QB';
const POSITION_TERMS = {
  QB: /quarter\s*back|passing|pass\s*(yd|yard|td|att|comp)|completion|interception|\bqb\b/i,
  WR: /wide\s*receiver|receiv|catch|target|\byac\b|\bwr\b/i,
  DB: /defensive\s*back|corner|safety|tackle|interception|pass\s*def|\bdb\b/i,
  DE: /defensive\s*end|sack|qb\s*hit|pressure|tackle\s*for\s*loss|forced\s*fumble|\bde\b/i
};
const POSITION_ALIASES = { QB: ['QB','QUARTERBACK','QUARTER BACK'], WR: ['WR','WIDE RECEIVER','WIDERECEIVER'], DB: ['DB','DEFENSIVE BACK','CORNERBACK','SAFETY'], DE: ['DE','DEFENSIVE END'] };
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function parseCsv(text) {
  const rows = []; let row = [], cell = '', quoted = false;
  for (let i=0;i<text.length;i++) { const c=text[i];
    if(c==='"'&&quoted&&text[i+1]==='"'){cell+='"';i++;} else if(c==='"') quoted=!quoted;
    else if(c===','&&!quoted){row.push(cell);cell='';}
    else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell='';}
    else cell+=c;
  }
  row.push(cell);if(row.some(v=>v.trim()))rows.push(row);return rows;
}
const normalize = value => String(value || '').trim().toUpperCase().replace(/[^A-Z0-9 ]/g,'');
function renderSeason() {
  const season = Number(content.season) || 2;
  document.getElementById('hero-season').textContent = `SEASON ${season}`;
  document.getElementById('season-footer').textContent = season;
}
function renderBulletins() {
  const icons=['✦','↗','▤'];
  document.getElementById('bulletin-list').innerHTML = (content.bulletins || []).map((text,i)=>`<article class="bulletin-card"><span class="bulletin-icon">${icons[i%icons.length]}</span><div><p class="eyebrow dark">HFL NEWS · ${String(i+1).padStart(2,'0')}</p><h3>${escapeHtml(text)}</h3><small>LEAGUE CENTRAL</small></div></article>`).join('');
  document.getElementById('update-list').innerHTML = (content.updates || []).map((text,i)=>`<article class="update-item"><span class="update-index">${String(i+1).padStart(2,'0')}</span><div><h3>${escapeHtml(text)}</h3><small>IN DEVELOPMENT</small></div><span class="update-status">COMING SOON</span></article>`).join('');
}
function renderPositionStats() {
  const host=document.getElementById('stats-table'), hint=document.getElementById('position-hint');
  if(!host||!sheetHeaders.length)return;
  document.getElementById('stats-table-title').textContent=`${selectedPosition} · PLAYER STATS`;
  const posIndex=sheetHeaders.findIndex(h=>/^(pos|position|role|player position)$/i.test(String(h).trim()));
  const matchingRows=posIndex<0?sheetRows:sheetRows.filter(row=>POSITION_ALIASES[selectedPosition].some(alias=>normalize(alias)===normalize(row[posIndex])));
  const common=/^(team|player|name|pos|position|role|number|#|season|week|game|division|jersey)$/i;
  const columns=sheetHeaders.map((h,i)=>common.test(String(h).trim())||POSITION_TERMS[selectedPosition].test(String(h))?i:-1).filter(i=>i>=0);
  if(posIndex>=0&&matchingRows.length===0){host.innerHTML=`<div class="sheet-message"><strong>No ${selectedPosition} rows found.</strong><p>Add a Pos/Position column with ${selectedPosition} entries in the connected sheet.</p></div>`;hint.textContent=`No spreadsheet rows are tagged ${selectedPosition}.`;return;}
  hint.textContent=posIndex<0?'Add a Pos/Position column to the sheet to filter the player list by position.':`Showing ${matchingRows.length} player row${matchingRows.length===1?'':'s'} tagged ${selectedPosition}.`;
  const visible=columns.length?columns:sheetHeaders.map((_,i)=>i);
  host.innerHTML=`<div class="table-scroll"><table><thead><tr>${visible.map(i=>`<th>${escapeHtml(sheetHeaders[i]||'—')}</th>`).join('')}</tr></thead><tbody>${matchingRows.map(row=>`<tr>${visible.map(i=>`<td>${escapeHtml(row[i]||'—')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
async function loadStats() {
  const status=document.getElementById('sheet-status'), dot=document.getElementById('status-dot'), host=document.getElementById('stats-table');
  if(!status||!dot||!host)return;
  status.textContent='Connecting to Google Sheets…';
  try { const response=await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}&_=${Date.now()}`,{cache:'no-store'});if(!response.ok)throw new Error('Sheet access unavailable');const rows=parseCsv(await response.text());if(!rows.length)throw new Error('No sheet rows');sheetHeaders=rows[0];sheetRows=rows.slice(1).filter(row=>row.some(v=>v.trim()));renderPositionStats();status.textContent=`Connected · updated ${new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}`;dot.classList.add('connected'); }
  catch { host.innerHTML=`<div class="sheet-message"><strong>Stats could not load.</strong><p>Set the spreadsheet access to “Anyone with the link — Viewer,” then refresh.</p><a href="https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?gid=${SHEET_GID}#gid=${SHEET_GID}" target="_blank" rel="noopener">Open Google Sheet ↗</a></div>`;status.textContent='Waiting for spreadsheet access';dot.classList.remove('connected'); }
}
document.querySelectorAll('.position-tab').forEach(tab=>tab.addEventListener('click',()=>{selectedPosition=tab.dataset.position;document.querySelectorAll('.position-tab').forEach(item=>{const active=item===tab;item.classList.toggle('active',active);item.setAttribute('aria-selected',String(active));});renderPositionStats();}));
document.getElementById('refresh-stats').addEventListener('click',loadStats);
loadStats();setInterval(loadStats,REFRESH_MS);renderSeason();renderBulletins();document.getElementById('year').textContent=new Date().getFullYear();
const menu=document.getElementById('main-nav'), menuButton=document.getElementById('menu-toggle');
menuButton.addEventListener('click',()=>{const open=menu.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});
menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{menu.classList.remove('open');menuButton.setAttribute('aria-expanded','false');}));
const operator=document.getElementById('operator-dialog');
document.getElementById('operator-toggle').addEventListener('click',()=>{document.getElementById('season-input').value=content.season;document.getElementById('bulletin-input').value=(content.bulletins||[]).join('\n');document.getElementById('updates-input').value=(content.updates||[]).join('\n');operator.showModal();});
document.querySelector('.close-dialog').addEventListener('click',()=>operator.close());
document.getElementById('save-content').addEventListener('click',()=>{content={season:Math.max(1,Number(document.getElementById('season-input').value)||2),bulletins:document.getElementById('bulletin-input').value.split('\n').map(s=>s.trim()).filter(Boolean),updates:document.getElementById('updates-input').value.split('\n').map(s=>s.trim()).filter(Boolean)};localStorage.setItem(STORAGE_KEY,JSON.stringify(content));renderSeason();renderBulletins();operator.close();});
document.getElementById('reset-content').addEventListener('click',()=>{content={...DEFAULT_CONTENT,bulletins:[...DEFAULT_CONTENT.bulletins],updates:[...DEFAULT_CONTENT.updates]};localStorage.removeItem(STORAGE_KEY);renderSeason();renderBulletins();operator.close();});
(function addFallingLeaves(){const host=document.getElementById('falling-leaves');if(!host||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const colors=['#b94e2c','#d97732','#e9ae42','#9b572f','#d4a044'];for(let i=0;i<18;i++){const leaf=document.createElement('span');leaf.className='fall-leaf';leaf.style.left=`${Math.random()*100}%`;leaf.style.setProperty('--delay',`${Math.random()*18}s`);leaf.style.setProperty('--duration',`${12+Math.random()*15}s`);leaf.style.setProperty('--sway',`${-90+Math.random()*180}px`);leaf.style.setProperty('--leaf-color',colors[i%colors.length]);leaf.style.setProperty('--leaf-scale',`${.55+Math.random()*.75}`);host.appendChild(leaf);}})();
