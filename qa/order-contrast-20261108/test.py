from pathlib import Path
import re,unittest
css=Path('source/v8/ui/workspace.css').read_text()
def lum(h):
 a=[int(h[i:i+2],16)/255 for i in (1,3,5)];a=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in a];return sum(x*w for x,w in zip(a,[.2126,.7152,.0722]))
def ratio(a,b):
 x,y=sorted([lum(a),lum(b)]);return (y+.05)/(x+.05)
class OrderText(unittest.TestCase):
 def test_draft_order_text_on_actual_navy_fill_is_readable_for_light_and_dark_clubs(self):
  selector='.g8ordergrid .g8club.g8ordercard .g8orderrank,.g8ordergrid .g8club.g8ordercard .g8orderidentity h3,.g8ordergrid .g8club.g8ordercard .g8orderstatus'
  rule=re.search(re.escape(selector)+r'\{([^}]+)\}',css).group(1)
  color=re.search(r'(?:^|;)color:([^;]+)',rule).group(1)
  for clubink in ['#102b34','#ffffff','#171717']:
   resolved=color.replace('var(--order-ink)',clubink).replace('var(--gcc-text,#eef5fa)','#eef5fa')
   self.assertGreaterEqual(ratio(resolved,'#132840'),4.5,(clubink,resolved))
if __name__=='__main__':unittest.main()
