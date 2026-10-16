/* Lossless, versioned storage blocks. Clear legacy JSON remains readable. */
window.GCC8_SAVE_CODEC=(()=>{
 const fields=new Set(['careerStore','pool','results','finals','history','developmentByYear']),cache=new Map();
 function checksum(text){let n=2166136261;for(let i=0;i<text.length;i++)n=Math.imul(n^text.charCodeAt(i),16777619);return (n>>>0).toString(16);}
 function stringify(value){return JSON.stringify(value,(key,v)=>{
  // The pool changes on every pick. Keep it plain so drafting never repeatedly
  // compresses the whole universe; bulky history/outcomes/results still pack.
  // Decode also accepts pool blocks written by the earlier codec candidate.
  if(key==='pool'||!fields.has(key)||!v||typeof v!=='object')return v;
  const plain=JSON.stringify(v);if(plain.length<8192)return v;
  const old=cache.get(key);if(old?.plain===plain)return old.packed;
  const packed={gccPacked:1,length:plain.length,checksum:checksum(plain),data:LZString.compressToUTF16(plain)};
  cache.set(key,{plain,packed});return packed;
 });}
 function parse(raw){return JSON.parse(raw,(key,v)=>{
  if(!fields.has(key)||!v||typeof v!=='object'||v.gccPacked===undefined)return v;
  if(v.gccPacked!==1||!Number.isInteger(v.length)||v.length<0||v.length>20000000||typeof v.data!=='string'||v.data.length>10000000||typeof v.checksum!=='string')throw Error('Invalid packed save block');
  const plain=LZString.decompressFromUTF16(v.data);
  if(typeof plain!=='string'||plain.length!==v.length||checksum(plain)!==v.checksum)throw Error('Damaged packed save block');
  return JSON.parse(plain);
 });}
 return Object.freeze({stringify,parse});
})();
