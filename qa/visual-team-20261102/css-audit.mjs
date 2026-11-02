import fs from 'node:fs';
const {parse,walk}=await import(process.env.GCC_CSS_MODULE||'css-tree');
const report=[];
for(const file of ['v8/ui/arcade-charcoal.css','v8/ui/decision-ui.css']){
 const errors=[],ast=parse(fs.readFileSync(file,'utf8'),{positions:true,onParseError:e=>errors.push(e.message)});let declarations=0;
 walk(ast,n=>{if(n.type==='Declaration')declarations++;});report.push({file,parseErrors:errors,declarations});
}
fs.writeFileSync('qa/visual-team-20261102/css-parse.json',JSON.stringify(report,null,2));console.log(report);
if(report.some(r=>r.parseErrors.length))process.exitCode=1;
