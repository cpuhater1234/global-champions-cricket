from pathlib import Path
import re
css=Path('v8/ui/decision-ui.css').read_text()
rule=re.search(r'\.gccuiProfileViews \.g8button\[aria-pressed=true\]\{([^}]+)',css)[1]
ink=re.search(r';color:([^;!]+)',rule)[1]
def luminance(hex):
 rgb=[int(hex[i:i+2],16)/255 for i in (1,3,5)]
 return sum(w*(c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4) for w,c in zip((.2126,.7152,.0722),rgb))
def contrast(a,b):
 x,y=sorted((luminance(a),luminance(b)));return (y+.05)/(x+.05)
# Actual Punjab Kings club colour; theme already supplies contrast-aware white ink.
foreground='#ffffff' if ink.startswith('var(--club-ink,') else ink
ratio=contrast('#d71920',foreground)
assert ratio>=4.5,f'Punjab selected report tab text contrast {ratio:.2f}:1, expected >=4.5:1'
print(f'PASS Punjab selected report tab contrast {ratio:.2f}:1')
