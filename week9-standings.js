(() => {
  'use strict';
  const emojiIds = {
    'Kansas City Firebirds':'1553870442555506738',
    'Pittsburgh Bullets':'1553869109895102577',
    'San Francisco Reapers':'1553869396387041460',
    'Boston Knights':'1553868543278456925',
    'Cleveland Pirates':'1553982398671224902',
    'Oklahoma City Monarchs':'1553870525317652530',
    'New Orleans Dragons':'1553869284994846822',
    'Tampa Bay Ravens':'1553869448253808680',
    'Denver Lightning':'1553982475276128258',
    'Portland Huskies':'1553869039242186862',
    'Las Vegas Bulls':'1553970835134480536',
    'Salt Lake City Bugles':'1553869126244499542',
    'Seattle Mustangs':'1553869425067692063',
    'Minnesota Tarpedos':'1553869474078396518',
    'San Antonio Aztecs':'1553869159493009408',
    'Phoenix Dolphins':'1553869071156645990'
  };
  const cdn = id => `https://cdn.discordapp.com/emojis/${id}.webp?size=64&quality=lossless`;

  function updateWeekHeading() {
    const bracket = document.getElementById('standings');
    const heading = bracket?.querySelector('.section-head h2');
    if (heading) heading.textContent = 'Week 9 divisional standings.';
    if (bracket && !bracket.querySelector('.week9-caption')) {
      const caption = document.createElement('p');
      caption.className = 'week9-caption';
      caption.textContent = 'Heavenly Football League Season 2 · Week 9';
      bracket.querySelector('.section-head')?.append(caption);
    }
  }

  function replaceWithDiscordEmoji(container, team) {
    const id = emojiIds[team];
    if (!container || !id || container.querySelector('img')) return;
    const img = document.createElement('img');
    img.src = cdn(id);
    img.alt = team;
    img.title = team;
    img.width = 26;
    img.height = 26;
    img.loading = 'lazy';
    img.onerror = () => { img.replaceWith(document.createTextNode('🏈')); };
    container.replaceChildren(img);
  }

  function renderEmojis() {
    document.querySelectorAll('.standing-row').forEach(row => {
      const team = row.querySelector('.standing-team')?.textContent.trim();
      replaceWithDiscordEmoji(row.querySelector('.standing-emoji'), team);
    });
    document.querySelectorAll('.team-card').forEach(card => {
      const team = card.querySelector('b')?.textContent.trim();
      replaceWithDiscordEmoji(card.querySelector('span'), team);
    });
  }

  function addStyles() {
    if (document.getElementById('week9-standings-style')) return;
    const style = document.createElement('style');
    style.id = 'week9-standings-style';
    style.textContent = `#standings .week9-caption{flex-basis:100%;margin:-.5rem 0 0;color:#d9a64a;font-weight:700;letter-spacing:.04em}#standings .standing-emoji img,#standings .team-card span img{display:block;width:26px;height:26px;object-fit:contain}#standings .standing-emoji{display:inline-flex;align-items:center;justify-content:center}`;
    document.head.append(style);
  }

  updateWeekHeading();
  addStyles();
  renderEmojis();
  const standings = document.getElementById('standings');
  if (standings) new MutationObserver(() => { updateWeekHeading(); renderEmojis(); }).observe(standings, {childList:true,subtree:true});
})();
