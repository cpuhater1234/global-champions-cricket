import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
/* DOM tree model, not a browser or a layout engine. Exercises identity and keyed updates. */
class Node {
 constructor(tag,attrs={},children=[],type=1){this.nodeType=type;this.nodeName=type===3?'#text':tag.toUpperCase();this.tagName=type===1?this.nodeName:undefined;this.attrs={...attrs};this.childNodes=[];this.parentNode=null;this.nodeValue=type===3?tag:null;this.value=attrs.value||'';for(const c of children)this.appendChild(c);}
 get id(){return this.attrs.id||'';}get attributes(){return Object.entries(this.attrs).map(([name,value])=>({name,value}));}get firstChild(){return this.childNodes[0]||null;}get nextSibling(){const a=this.parentNode?.childNodes;return a?a[a.indexOf(this)+1]||null:null;}
 getAttribute(k){return this.attrs[k]??null;}hasAttribute(k){return k in this.attrs;}setAttribute(k,v){this.attrs[k]=String(v);}removeAttribute(k){delete this.attrs[k];}
 get open(){return this.hasAttribute('open');}set open(v){if(v)this.setAttribute('open','');else this.removeAttribute('open');}
 appendChild(n){if(n.nodeType===11){for(const c of [...n.childNodes])this.appendChild(c);return n;}return this.insertBefore(n,null);}
 insertBefore(n,before){n.remove();const at=before?this.childNodes.indexOf(before):this.childNodes.length;assert.ok(at>=0);this.childNodes.splice(at,0,n);n.parentNode=this;return n;}
 remove(){if(this.parentNode){const a=this.parentNode.childNodes;a.splice(a.indexOf(this),1);this.parentNode=null;}}
 replaceWith(n){const p=this.parentNode;p.insertBefore(n,this);this.remove();}
 cloneNode(deep){return new Node(this.nodeType===3?this.nodeValue:this.nodeName,{...this.attrs},deep?this.childNodes.map(n=>n.cloneNode(true)):[],this.nodeType);}
 serial(){return JSON.stringify([this.nodeName,this.attrs,this.nodeValue,this.childNodes.map(n=>n.serial())]);}isEqualNode(n){return this.serial()===n.serial();}
}
const text=s=>new Node(s,{},[],3),el=(tag,key,children=[])=>new Node(tag,key?{'data-key':key}:{},children),templates=new Map();
const document={activeElement:null,createElement:tag=>tag==='template'?{content:new Node('fragment',{},[],11),set innerHTML(markup){this.content=templates.get(markup).cloneNode(true);}}:el(tag)};
const X={},ctx={window:{GCC8:X},document};vm.runInNewContext(fs.readFileSync('v8/ui/dom.js','utf8'),ctx);
const host=new Node('main',{id:'stage'}),patch=(name,nodes)=>{templates.set(name,new Node('fragment',{},nodes,11));X.patch(host,name);};
patch('initial',[el('div','club-0',[text('Sealed')]),el('button','continue',[text('Continue')]),new Node('input',{id:'search',value:'Smith'})]);
const keepButton=host.childNodes[1],keepInput=host.childNodes[2];document.activeElement=keepInput;keepInput.value='Smith, typing';
patch('reveal',[el('article','club-0',[text('Chennai')]),el('button','continue',[text('Enter room')]),new Node('input',{id:'search',value:'Smith'})]);
assert.equal(host.childNodes.length,3);assert.equal(host.childNodes[0].tagName,'ARTICLE');assert.equal(host.childNodes[1],keepButton);assert.equal(host.childNodes[2],keepInput);assert.equal(keepInput.value,'Smith, typing');
patch('reorder',[el('article','club-1',[text('Mumbai')]),el('article','club-0',[text('Chennai')]),el('button','continue',[text('Enter room')]),new Node('input',{id:'search',value:'Smith'})]);
assert.equal(host.childNodes[2],keepButton);assert.equal(host.childNodes[3],keepInput);const keptClub=host.childNodes[1];
patch('remove',[el('article','club-0',[text('Chennai selected')]),el('button','continue',[text('Enter room')]),new Node('input',{id:'search',value:'Smith'})]);
assert.equal(host.childNodes.length,3);assert.equal(host.childNodes[0],keptClub);assert.equal(host.childNodes[1],keepButton);assert.equal(host.childNodes[2],keepInput);
patch('details',[el('details','stats',[el('summary',null,[text('More stats')])])]);const details=host.firstChild;details.open=true;
patch('details2',[el('details','stats',[el('summary',null,[text('Full stats')])])]);assert.equal(host.firstChild,details);assert.ok(details.open);
X.patch(host,'details2');assert.equal(host.firstChild,details);
// Exercise removal and arbitrary keyed reorderings, retaining the identity of surviving controls.
const permutations=a=>a.length?a.flatMap((x,i)=>permutations(a.filter((_,n)=>n!==i)).map(rest=>[x,...rest])):[[]];let permutationsChecked=0;
for(const order of permutations(['a','b','c','d'])){
 patch('reset-'+order.join(''),['a','b','c','d'].map(k=>el('button',k,[text(k)])));
 const originals=new Map(host.childNodes.map(n=>[n.getAttribute('data-key'),n]));
 const wanted=order.filter((_,i)=>i!==1);wanted.splice(1,0,'new');patch('permutation-'+order.join(''),wanted.map(k=>el('button',k,[text(k+' changed')])));
 assert.deepEqual(host.childNodes.map(n=>n.getAttribute('data-key')),wanted);for(const k of wanted.filter(k=>k!=='new'))assert.equal(host.childNodes.find(n=>n.getAttribute('data-key')===k),originals.get(k));permutationsChecked++;
}
const result={scope:'DOM tree model checks for keyed identity, replacement, insertion, removal, typing and details state. Does not certify native focus, scroll, geometry or appearance.',checks:18,keyedPermutations:permutationsChecked,errors:[]};fs.writeFileSync('qa/v8_dom_patch_results.json',JSON.stringify(result,null,2)+'\n');console.log(result);
