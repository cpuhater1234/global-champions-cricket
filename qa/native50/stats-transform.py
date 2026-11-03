"""Season table context, row headers and player report navigation."""
def once(s,a,b):
 n=s.count(a)
 if n!=1: raise ValueError(f'Expected one marker {a[:70]!r}, got {n}')
 return s.replace(a,b,1)
def transform(reads,screens):
 reads=once(reads,' X.installDetailedAverages=', ''' X.statsPlayer=p=>X.btn(p.name,'inspect',[p.id],'gccuiStatPlayer').replace('type="button"',`type="button" aria-label="View ${X.esc(p.name)} player report"`);
 X.installDetailedAverages=''')
 reads=once(reads,'<section class="g8sheet g8seasonread g8tablewrap"><span class="g8eyebrow">THE FULL PLAYER RECORD</span><table class="g8table">','<section class="g8sheet g8seasonread g8tablewrap gccuiPlayerStatsTable"><h2 class="gccuiStatsSubheading">Season detail</h2><table class="g8table"><caption>${s.year} · ${esc(s.userClub.name)} season detail, including finals</caption>')
 reads=once(reads,'<tr><td>${esc(p.name)}</td><td>${t.bestRuns||0}', '<tr><th scope="row">${X.statsPlayer(p)}</th><td>${t.bestRuns||0}')
 screens=once(screens,'<section class="g8sheet g8tablewrap"><table class="g8table"><caption>For your club this season', '<section class="g8sheet g8tablewrap gccuiPlayerStatsTable"><table class="g8table"><caption>For your club this season')
 screens=once(screens,'<tr><td>${esc(p.name)}</td><td>${t.matches||0}', '<tr><th scope="row">${X.statsPlayer(p)}</th><td>${t.matches||0}')
 for text in ['<th>Player</th><th>M</th><th>Runs</th><th>Avg</th><th>SR</th><th>Wkts</th><th>Econ</th>']:
  screens=once(screens,text,text.replace('<th>','<th scope="col">'))
 text='<th>Player</th><th>High score</th><th>4s</th><th>6s</th><th>Bowling avg</th><th>Best bowling</th>'
 reads=once(reads,text,text.replace('<th>','<th scope="col">'))
 return reads,screens
