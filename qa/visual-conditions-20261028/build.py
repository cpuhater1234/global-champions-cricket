from pathlib import Path
import hashlib,subprocess,argparse
R=Path(__file__).resolve().parents[2]
Q=Path(__file__).resolve().parent
BASE_COMMIT='2bf294306fdac36ec6888f1ff154f27c734e19cd'
BASE_SHA='9a253947041974e26a91729e06a9a93e1812d518b04519a6f533e9793a7cc5ca'
EXPECTED='878fa040e4adf0b32eae7479c3c19b582b7bfb79cef8c3b0afa9f9f08a4a09f7'
def build(promote=False):
    old=subprocess.check_output(['git','show',BASE_COMMIT+':game/gcc_v8_product_candidate.html'],cwd=R)
    assert hashlib.sha256(old).hexdigest()==BASE_SHA
    patch=(Q/'patch.css').read_bytes()
    assert old.count(b'</style>')==4
    new=old.replace(b'</style>',patch+b'</style>',1)
    assert hashlib.sha256(new).hexdigest()==EXPECTED
    assert (R/'v8/ui/workspace.css').read_text().strip() in new.decode()
    (Q/'candidate.html').write_bytes(new)
    if promote:
        for n in ('gcc_v8_product_candidate.html','gcc_v8_quiet_arcade.html'):
            (R/'game'/n).write_bytes(new)
    print('GCC v85',EXPECTED,'bytes',len(new))
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--promote',action='store_true');build(p.parse_args().promote)
