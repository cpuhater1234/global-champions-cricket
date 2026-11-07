from pathlib import Path
p=Path('source/v8/ui/controller.js');s=p.read_text();Path('source/qa/cold-start-20261108/controller.js.before').write_text(s)
a="bind('fresh',['home'],()=>{assert(ui.modal==='fresh','Open the new dynasty prompt first.');closeDialog();ui.newCareer=true;setView('story');});"
b="bind('fresh',['home','story'],()=>{assert(ui.modal==='fresh','Open the new dynasty prompt first.');const fromIntro=ui.view==='story';closeDialog();ui.newCareer=true;if(fromIntro)commands.world();else setView('story');});\n bind('continueSaved',['story'],()=>{assert(ui.modal==='fresh','Open the career choice first.');closeDialog();ui.newCareer=false;setView('home');commands.continue();});"
assert s.count(a)==1;s=s.replace(a,b)
a="assert(ui.newCareer||!X.hasStoredSave(),'Another open game has started a career. Return home and choose Continue, or confirm Start again.');"
b="if(!ui.newCareer&&X.hasStoredSave()){modal('Choose your career','<p>A saved career is available. Open it, or start again with a new club.</p><p>Starting again replaces the saved career.</p><div class=\"g8actions\">'+btn('Open saved career','continueSaved',[],'g8ghost')+btn('Start again','fresh',[],'g8primary')+'</div>','fresh');return;}"
assert s.count(a)==1;s=s.replace(a,b)
a='function save(){if(s.dynasty)';b="function save(){if(ui.view==='story')return;if(s.dynasty)"
assert s.count(a)==1;s=s.replace(a,b)
p.write_text(s)
