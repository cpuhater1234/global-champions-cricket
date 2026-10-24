import importlib.util,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('model',Path(__file__).with_name('model.py'));M=importlib.util.module_from_spec(spec)
if Path(spec.origin).exists():spec.loader.exec_module(M)
class Model(unittest.TestCase):
 def test_no_future_leakage(self):
  self.assertTrue(hasattr(M,'training_rows'),'chronological training filter missing')
  rows=[{'year':y,'token':y}for y in range(2010,2027)];self.assertEqual([r['year']for r in M.training_rows(rows,2020)],[2018,2019,2020]);self.assertEqual(M.training_rows(rows+[{'year':2026,'bad':True}],2020),M.training_rows(rows,2020))
 def test_actual_fit_ignores_future_and_recovers_opponent_sign(self):
  rows=[]
  for y in [2018,2019,2020]:
   for i,bat in enumerate(['a','b','c']):
    for j,bowl in enumerate(['q','r','s']):
     n=60;runs=round(n*(1.4+[.5,0,-.5][i]-[.4,0,-.4][j]));rows.append({'year':y,'phase':0,'comp':'L','venue':'G','innings':0,'slot':2,'bat':bat,'bowl':bowl,'faced':n,'legal':n,'bat_runs':runs,'charged':runs,'credited':0})
  a=M.fit(rows,2020,180,[20,15,8]);b=M.fit(rows+[{**rows[0],'year':2026,'bat_runs':999999}],2020,180,[20,15,8]);self.assertEqual(a['coefs'],b['coefs']);self.assertGreater(a['coefs']['bat']['B:a:0'],a['coefs']['bat']['B:c:0']);self.assertGreater(a['coefs']['bowl']['Q:q:0'],a['coefs']['bowl']['Q:s:0'])
 def test_phase_identity_features(self):
  self.assertTrue(hasattr(M,'features'),'opponent features missing')
  r={'bat':'a','bowl':'q','phase':0,'comp':'IPL','venue':'G','year':2019,'innings':0,'slot':2};x=M.features(r);self.assertEqual(x['B:a:0'],1);self.assertEqual(x['Q:q:0'],-1);self.assertNotIn('bat_runs',x);self.assertNotIn('credited',x)
 def test_cluster_uncertainty(self):
  self.assertTrue(hasattr(M,'cluster_interval'),'player-cluster interval missing')
  rs=[{'id':str(i),'year':y,'prediction':i,'legacy':9-i,'actual':i}for i in range(10)for y in [2023,2024]];a=M.cluster_interval(rs,100);self.assertGreater(a['gainInterval975'][0],1.9)
if __name__=='__main__':unittest.main()
