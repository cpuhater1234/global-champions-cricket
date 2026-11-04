"""Presentation-only reorder of the generated career management view."""
def transform(source: str) -> str:
    start = source.index(' X.managementPlayer=p=>')
    end = source.index('\n X.managementFixture=', start)
    old = source[start:end]
    if 'gccuiManagementContext' in old:
        return source.replace("!['team','season','dynasty','finals'].includes(X.ui.view)", "!['team','season','dynasty','finals','result'].includes(X.ui.view)")
    def between(a, b):
        return old[old.index(a):old.index(b)]
    intro = between('<p>${q.regular?', '${reasons(q)}')
    context = between('${reasons(q)}', '${q.promise?').replace('${reasons(q)}', '', 1)
    commitment = between('${q.promise?', '${!active?')
    options = between('${!active?', '${q.omitted>=')
    rotation = between('${q.omitted>=', '<div class="g8managementactions">')
    actions = between('<div class="g8managementactions">', '${q.seekingMove&&closed?')
    closed = between('${q.seekingMove&&closed?', '<p class="g8managementnote">Use these commitments')
    note = between('<p class="g8managementnote">Use these commitments', '</section>`;};')
    prefix = old[:old.index('<p>${q.regular?')]
    # Medical context and its replacement control lead the action group; all guards survive.
    rest = "${injury&&s.xi.includes(p.id)&&X.ui.view==='team'?btn('Rest and choose replacement','manageRest',[p.id],'g8ghost',!!s.pendingSwapIn):''}"
    assert actions.count(rest) == 1
    actions = actions.replace(rest, '').replace('<div class="g8managementactions">', '<div class="g8managementactions">'+rest)
    options = options.replace('<section class="g8commitmentoptions" aria-label="Make a commitment"><h4>Make a commitment</h4>', '<details class="g8commitmentoptions gccuiOptionalPromises"><summary>Make an optional commitment</summary><div class="gccuiOptionalPromiseBody">')
    assert '</div></section>`' in options
    options = options.replace('</div></section>`', '</div></div></details>`')
    prefix = prefix.replace('class="g8relationship"', 'class="g8relationship gccuiManagementFocus"').replace('<span class="g8eyebrow">YOUR RELATIONSHIP</span>', '').replace("concern(q)||'Know your player'", "concern(q)||(injury?'Medical attention':active?'Current commitment':'Settled in the squad')")
    medical = '${injury?`<p class="gccuiManagementMedical">${esc(medical(injury))}${s.xi.includes(p.id)?\' · Currently selected\':\'\'}</p>`:\'\'}'
    new = prefix + medical + '${reasons(q)}' + commitment + actions + closed + rotation + '<details class="gccuiManagementContext"><summary>Role, form &amp; relationship context</summary>' + intro + context + note + '</details>' + options + '</section>`;};'
    return (source[:start] + new + source[end:]).replace("!['team','season','dynasty','finals'].includes(X.ui.view)", "!['team','season','dynasty','finals','result'].includes(X.ui.view)")
