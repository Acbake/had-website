/* Remove public editing controls and load the public site features. */
(() => {
  const removePublicEditors = () => {
    document.getElementById('operator-toggle')?.remove();
    document.getElementById('operator-dialog')?.remove();
    document.getElementById('season-banner-panel')?.remove();
    document.querySelectorAll('.user-season-banner').forEach(element => element.remove());
    document.querySelector('.hero')?.classList.remove('has-user-season-banner');
  };
  removePublicEditors();

  const key = 'had-operator-content-v3';
  const data = {
    season: 2,
    bulletins: [
      'Kansas City’s undefeated season is over: the Firebirds fell from 8-0 to 8-1 in Week 9, but remain atop the Crown Division.',
      'Denver leads the Ascended Division at 8-1 with a +132 point differential.',
      'Week 9 standings are updated across both divisions.'
    ],
    standings: {
      crown: [
        {team:'Kansas City Firebirds',emoji:':KansasCityFirebirds:1553870442555506738:',rank:1,record:'8-1',pd:'+68'},
        {team:'Pittsburgh Bullets',emoji:':PittsburghBullets:1553869109895102577:',rank:2,record:'6-3',pd:'+85'},
        {team:'San Francisco Reapers',emoji:':SanFranReapers:1553869396387041460:',rank:3,record:'6-3',pd:'+29'},
        {team:'Boston Knights',emoji:':BostonKnights:1553868543278456925:',rank:4,record:'5-4',pd:'+38'},
        {team:'Cleveland Pirates',emoji:':ClevelandPirates:1553982398671224902:',rank:5,record:'5-4',pd:'-3'},
        {team:'Oklahoma City Monarchs',emoji:':OklahomaCityMonarchs:1553870525317652530:',rank:6,record:'4-5',pd:'-41'},
        {team:'New Orleans Dragons',emoji:':NewOrleansDragons:1553869284994846822:',rank:7,record:'4-5',pd:'-37'},
        {team:'Tampa Bay Ravens',emoji:':TampaBayRavens:1553869448253808680:',rank:8,record:'4-5',pd:'-91'}
      ],
      ascended: [
        {team:'Denver Lightning',emoji:':DenverLightning:1553982475276128258:',rank:1,record:'8-1',pd:'+132'},
        {team:'Portland Huskies',emoji:':PortlandHuskies:1553869039242186862:',rank:2,record:'6-3',pd:'+87'},
        {team:'Las Vegas Bulls',emoji:':LasVegasBulls:1553970835134480536:',rank:3,record:'5-4',pd:'+50'},
        {team:'Salt Lake City Bugles',emoji:':SaltLakeCityBugles:1553869126244499542:',rank:4,record:'4-5',pd:'-30'},
        {team:'Seattle Mustangs',emoji:':SeattleMustangs:1553869425067692063:',rank:5,record:'4-5',pd:'-32'},
        {team:'Minnesota Tarpedos',emoji:':MinnesotaTarpedos:1553869474078396518:',rank:6,record:'3-6',pd:'-57'},
        {team:'San Antonio Aztecs',emoji:':SanAntonioAztecs:1553869159493009408:',rank:7,record:'2-7',pd:'-82'},
        {team:'Phoenix Dolphins',emoji:':PhoenixDolphins:1553869071156645990:',rank:8,record:'1-8',pd:'-163'}
      ]
    }
  };
  try { localStorage.setItem(key, JSON.stringify(data)); } catch (error) { console.warn('Week 9 standings could not be cached locally.', error); }

  function loadScript(src, onload) {
    const script = document.createElement('script');
    script.src = src;
    if (onload) script.onload = onload;
    script.onerror = () => {
      const status = document.getElementById('sheet-status');
      if (status) status.textContent = 'A site feature could not load. Please refresh the page.';
    };
    document.body.append(script);
  }

  // Disable the obsolete stats-sheet poll while site-enhancements initializes;
  // stats-sheets.js below is the active stats-table implementation.
  const nativeSetInterval = window.setInterval.bind(window);
  const nativeFetch = window.fetch.bind(window);
  window.setInterval = (callback, delay, ...args) => delay === 60_000 ? 0 : nativeSetInterval(callback, delay, ...args);
  window.fetch = (input, ...args) => String(input).includes('gid=1438388237')
    ? Promise.reject(new Error('Legacy stats sheet disabled'))
    : nativeFetch(input, ...args);

  loadScript('site-enhancements.js?v=seasonal-effects-fix', () => {
    window.setInterval = nativeSetInterval;
    window.fetch = nativeFetch;
    removePublicEditors();
    loadScript('stats-sheets.js?v=stats-sheet-restored-1', () => {
      loadScript('seasonal-effects.js?v=scroll-themes', () => {
        loadScript('awards.js?v=season2-awards', () => {
          loadScript('week9-standings.js?v=week9');
        });
      });
    });
  });
})();
