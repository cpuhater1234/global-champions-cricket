from pathlib import Path
import re,subprocess
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parent
source=(root.parent.parent/'deliver/GCC_v8_Playtest_42.html').read_text()
symbol=re.search(r'<symbol[^>]*id="g8icon-cricket".*?</symbol>',source,re.S).group(0)
body=re.sub(r'^<symbol[^>]*>|</symbol>$','',symbol)
for weight in (10,24,32):
 b=body.replace('stroke-width="10"',f'stroke-width="{weight}"').replace('currentColor','#e2b368')
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><rect width="24" height="24" fill="#222222"/>{b}</svg>'
 p=root/f'bat-weight-{weight}.svg';p.write_text(svg)
 subprocess.run(['inkscape',str(p),'--export-type=png',f'--export-filename={root/f"bat-weight-{weight}.png"}'],check=True,capture_output=True)
canvas=Image.new('RGB',(720,400),'#222222');d=ImageDraw.Draw(canvas)
for i,w in enumerate((10,24,32)):
 x=30+i*240
 d.text((x,15),f'Existing symbol / weight {w}',fill='#eeeeee')
 im=Image.open(root/f'bat-weight-{w}.png').convert('RGB')
 canvas.paste(im,(x,55));d.text((x+32,60),'22px actual',fill='#cccccc')
 canvas.paste(im.resize((220,220),Image.Resampling.NEAREST),(x,120))
 d.text((x,355),'10x nearest-neighbour enlargement',fill='#cccccc')
canvas.save(root/'bat-weight-comparison.png')
