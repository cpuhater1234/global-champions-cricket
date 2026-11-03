"""Phone standings retain points, net run rate and exact club record."""
def transform(s):
 a='X.ladder=()=>`<section class="g8sheet g8tablewrap"><table class="g8table g8ladder">'
 b='X.ladder=()=>`<section class="g8sheet g8tablewrap gccuiLadderTable"><table class="g8table g8ladder">'
 assert s.count(a)==1;s=s.replace(a,b,1)
 a='<td>${X.teamLabel(t.club)}</td><td>${t.p}</td><td>${t.w}</td><td>${t.l}</td><td>${t.pts}</td><td>${t.nrr.toFixed(2)}</td>'
 b='<th scope="row">${X.teamLabel(t.club)}<span class="gccuiLadderRecord" aria-label="Played ${t.p}, won ${t.w}, lost ${t.l}">${t.p} P · ${t.w} W · ${t.l} L</span></th><td>${t.p}</td><td>${t.w}</td><td>${t.l}</td><td>${t.pts}</td><td>${t.nrr.toFixed(2)}</td>'
 assert s.count(a)==1;s=s.replace(a,b,1)
 a='<th>Pos</th><th>Club</th><th>P</th><th>W</th><th>L</th><th>Pts</th><th>NRR</th>'
 assert s.count(a)==1;s=s.replace(a,a.replace('<th>','<th scope="col">'),1)
 return s
