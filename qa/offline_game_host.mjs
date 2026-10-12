/** Executes unchanged game scripts. DOM is a render stub, not a browser.
 * No claims about layout, DOM validity, events, animation, focus or geometry.
 * Timers are queued and only run when explicitly flushed. */
import vm from 'node:vm';
import fs from 'node:fs';
export function loadGame(file, seed=101, storage=new Map(), options={}) {
 const html=fs.readFileSync(file,'utf8'),elements=new Map(),errors=[],timers=new Map();let timerId=0;
 class Element {
  constructor(id=''){Object.assign(this,{id,dataset:{},children:[],attributes:{},hidden:false,disabled:false,value:'',_html:'',textContent:'',className:'',style:{setProperty(){},removeProperty(){}}});this.classList={contains:c=>this.className.split(/\s+/).includes(c),add:(...cs)=>{this.className=[...new Set([...this.className.split(/\s+/).filter(Boolean),...cs])].join(' ')},remove:(...cs)=>{this.className=this.className.split(/\s+/).filter(c=>!cs.includes(c)).join(' ')},toggle:(c,force)=>{const on=force??!this.classList.contains(c);this.classList[on?'add':'remove'](c);return on}};}
  set innerHTML(v){this._html=String(v);register(this._html);const first=this._html.match(/<option\b[^>]*value=["']([^"']*)/i);if(first)this.value=first[1];}get innerHTML(){return this._html;}
  setAttribute(k,v){this.attributes[k]=String(v);if(k==='class')this.className=String(v);}getAttribute(k){return this.attributes[k]??null;}
  addEventListener(){}removeEventListener(){}appendChild(e){this.children.push(e);e.parentNode=this;if(e.id)elements.set(e.id,e);return e;}append(e){return this.appendChild(e);}remove(){}replaceWith(){}click(){}contains(){return false;}focus(){}scrollIntoView(){}
  insertAdjacentHTML(_,v){this.innerHTML+=v;}insertAdjacentElement(_,e){return this.appendChild(e);}querySelector(s){return s.startsWith('#')?get(s.slice(1)):s.startsWith('.')&&this._html.includes(s.slice(1))?get(this.id+':'+s):null;}querySelectorAll(){return [];}getBoundingClientRect(){return {width:100,height:100,top:0,left:0,right:100,bottom:100};}
 }
 const get=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id);};
 function register(markup){for(const m of markup.matchAll(/\bid=["']([^"']+)["']/g))get(m[1]);}

 register(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,''));
 // Track only screen classes needed by the real navigation wrappers.
 // Other DOM selectors remain render stubs, as documented above.
 for(const m of html.matchAll(/<(?:section|main|div)\b([^>]*)>/g)){const id=m[1].match(/\bid=["']([^"']+)["']/),cls=m[1].match(/\bclass=["']([^"']*)["']/);if(id&&cls&&cls[1].split(/\s+/).includes('screen'))get(id[1]).className=cls[1];}

 const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),clear:()=>storage.clear(),key:i=>[...storage.keys()][i]??null,get length(){return storage.size;}};
 const document={body:new Element('body'),documentElement:new Element('html'),getElementById:options.strictIds?(id=>elements.get(id)??null):get,createElement:()=>new Element(),createElementNS:()=>new Element(),querySelector:s=>/^#[\w-]+$/.test(s)?(options.strictIds?elements.get(s.slice(1))??null:get(s.slice(1))):s==='.screen.active'?[...elements.values()].find(e=>e.classList.contains('screen')&&e.classList.contains('active'))??null:null,querySelectorAll:()=>[],addEventListener(){}};
 class FixedDate extends Date {static now(){return seed;}}
 const queue=(fn,delay=0)=>{const id=++timerId;timers.set(id,{fn,delay});return id;};
 const ctx={document,localStorage,Date:FixedDate,console:{log(){},warn(){},error:(...a)=>errors.push(a.map(x=>x?.stack||String(x)).join(' '))},setTimeout:queue,setInterval:queue,clearTimeout:id=>timers.delete(id),clearInterval:id=>timers.delete(id),requestAnimationFrame:fn=>queue(fn,16),cancelAnimationFrame:id=>timers.delete(id),MutationObserver:class {observe(){}disconnect(){}},matchMedia:()=>({matches:true,addEventListener(){},removeEventListener(){}}),scrollTo(){},getComputedStyle:()=>({fontSize:'16px',getPropertyValue:()=>''}),performance:{now:()=>seed},location:{reload(){}},URL,Blob,confirm:()=>true,alert(){},navigator:{},innerWidth:1440,innerHeight:900,addEventListener(){}};
 ctx.window=ctx;ctx.self=ctx;ctx.globalThis=ctx;const context=vm.createContext(ctx);let blocks=0;
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(/\bsrc=|application\/json/i.test(m[1]))continue;vm.runInContext(m[2],context,{filename:`inline-${++blocks}.js`,timeout:30000});}
 return {G:ctx.GCC,context,document,get,storage,errors,blocks,timers,elements,flush(max=100){let n=0;while(timers.size&&n<max){const [id,t]=timers.entries().next().value;timers.delete(id);t.fn();n++;}return n;}};
}
