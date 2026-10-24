import unittest,importlib.util
from pathlib import Path
spec=importlib.util.spec_from_file_location('ingest',Path(__file__).with_name('ingest.py'));M=importlib.util.module_from_spec(spec)
if spec.loader and Path(spec.origin).exists():spec.loader.exec_module(M)
class Pipeline(unittest.TestCase):
 def test_delivery_attribution(self):
  self.assertTrue(hasattr(M,'delivery_stats'),'normalised delivery contract missing')
  d={'batter':'a','non_striker':'b','bowler':'q','runs':{'batter':0,'total':1},'extras':{'wides':1},'wickets':[{'kind':'run out','player_out':'b'}]}
  x=M.delivery_stats(d);self.assertEqual((x['legal'],x['faced'],x['charged'],x['credited']),(0,0,1,0));self.assertEqual(x['dismissed'],['b'])
  d.update(extras={'noballs':1},runs={'batter':4,'total':5},wickets=[]);x=M.delivery_stats(d);self.assertEqual((x['legal'],x['faced'],x['bat_runs'],x['charged']),(0,1,4,5))
  d.update(extras={'byes':2},runs={'batter':0,'total':2},wickets=[{'kind':'retired hurt','player_out':'a'}]);x=M.delivery_stats(d);self.assertEqual((x['legal'],x['faced'],x['charged'],x['credited']),(1,1,0,0));self.assertEqual(x['dismissed'],[])
  for kind in ['bowled','caught','caught and bowled','lbw','stumped','hit wicket']:
   d['wickets']=[{'kind':kind,'player_out':'a'}];self.assertEqual(M.delivery_stats(d)['credited'],1,kind)
  for kind in ['run out','retired out','obstructing the field']:
   d['wickets']=[{'kind':kind,'player_out':'a'}];self.assertEqual(M.delivery_stats(d)['credited'],0,kind)
 def test_penalty_and_non_boundary(self):
  d={'batter':'a','bowler':'q','runs':{'batter':4,'total':9,'non_boundary':True},'extras':{'penalty':5}}
  x=M.delivery_stats(d);self.assertEqual(x['charged'],4);self.assertEqual(x['four'],0)
  self.assertFalse(M.eligible({'gender':'male','match_type':'T20','overs':20,'dates':['2025-01-01'],'outcome':{'result':'no result'}}))
 def test_opposing_id_collision(self):
  self.assertTrue(hasattr(M,'valid_rosters'),'roster identity guard missing')
  info={'players':{'A':['a'],'B':['b']},'registry':{'people':{'a':'id1','b':'id1'}}};self.assertFalse(M.valid_rosters(info));info['registry']['people']['b']='id2';self.assertTrue(M.valid_rosters(info))
 def test_unidentified_fielder_not_invented(self):
  self.assertTrue(hasattr(M,'fielder_ids'),'unknown-fielder contract missing')
  self.assertEqual(M.fielder_ids({'fielders':[{'name':'a'},{'substitute':True}]},{'a':'id1'}),(['id1'],1))
 def test_single_writer_guard(self):
  import tempfile
  self.assertTrue(hasattr(M,'dataset_lock'),'single-writer guard missing')
  with tempfile.TemporaryDirectory()as d:
   with M.dataset_lock(Path(d)/'out.sqlite'):
    with self.assertRaises(BlockingIOError):
     with M.dataset_lock(Path(d)/'out.sqlite'):pass
 def test_phase_and_cutoff(self):
  self.assertTrue(hasattr(M,'phase'),'phase contract missing');self.assertEqual([M.phase(o)for o in [0,3,4,14,15,19]],[0,0,1,1,2,2])
  self.assertTrue(hasattr(M,'eligible'),'eligibility contract missing');base={'gender':'male','match_type':'T20','overs':20,'dates':['2025-01-01']};self.assertTrue(M.eligible(base));self.assertFalse(M.eligible({**base,'dates':['2027-01-01']}));self.assertFalse(M.eligible({**base,'overs':10}));self.assertFalse(M.eligible({**base,'outcome':{'method':'D/L'}}));self.assertFalse(M.eligible({**base,'gender':'female'}))
if __name__=='__main__':unittest.main()
