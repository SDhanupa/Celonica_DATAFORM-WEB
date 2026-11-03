import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, Kind } from 'graphql';
const docs = [], fragments = new Map();
function scan(dir) {
 for (const f of readdirSync(dir, {withFileTypes: true})) {
  const path = join(dir, f.name);
  if(f.isDirectory()) scan(path);
  else if(/\.(tsx?|jsx?)$/.test(f.name)) {
   const text = readFileSync(path,'utf8');
   for(const m of text.matchAll(/gql\s*`([\s\S]*?)`/g)) {
    const source=m[1].replace(/\$\{[^}]+\}/g,'');
    const doc=parse(source); docs.push({path,doc,bytes:Buffer.byteLength(source)});
    for(const def of doc.definitions) if(def.kind===Kind.FRAGMENT_DEFINITION) fragments.set(def.name.value,def);
   }
  }
 }
}
scan(fileURLToPath(new URL('../src', import.meta.url)));
function measure(set,depth=0,seen=new Set()) {
 let fields=0,max=depth;
 for(const s of set?.selections||[]) {
  if(s.kind===Kind.FIELD) { fields++; const v=measure(s.selectionSet,depth+1,seen); fields+=v.fields; max=Math.max(max,v.depth); }
  else if(s.kind===Kind.INLINE_FRAGMENT) { const v=measure(s.selectionSet,depth,seen); fields+=v.fields;max=Math.max(max,v.depth); }
  else { const name=s.name.value;if(seen.has(name)||!fragments.has(name)) throw new Error('Unresolved/cyclic fragment '+name);const v=measure(fragments.get(name).selectionSet,depth,new Set([...seen,name]));fields+=v.fields;max=Math.max(max,v.depth); }
 }
 return {fields,depth:max};
}
let maxFields=0,maxDepth=0;
for(const {path,doc,bytes} of docs) for(const d of doc.definitions) if(d.kind===Kind.OPERATION_DEFINITION){const m=measure(d.selectionSet);maxFields=Math.max(maxFields,m.fields);maxDepth=Math.max(maxDepth,m.depth);if(m.fields>5000||m.depth>15||bytes>60000)throw new Error('Budget exceeded: '+path);}
console.log(`PASS: ${docs.length} frontend GraphQL documents fit query budgets; maximum ${maxFields} fields and depth ${maxDepth}.`);
