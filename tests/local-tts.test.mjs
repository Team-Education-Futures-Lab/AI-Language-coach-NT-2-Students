import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function setup(run){
 let created=0,terminated=0;const calls=[];
 class Worker extends EventTarget{constructor(){super();created++}postMessage(data){calls.push(data);Promise.resolve().then(()=>run(data,calls.length)).then(result=>{if(result)this.dispatchEvent(new MessageEvent('message',{data:{id:data.id,...result}}))})}terminate(){terminated++}}
 const context={window:{},Blob,DOMException,AbortController,ArrayBuffer,setTimeout,clearTimeout,Worker,exports:{},require:()=>profiles};
 const compile=file=>ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const m={exports:{}};vm.runInNewContext(compile('lib/voice-profiles.ts'),m);const profiles=m.exports;
 vm.runInNewContext(compile('lib/local-tts.ts'),context);return {speak:context.exports.localCoachSpeech,counts:()=>({created,terminated}),calls};
}
const wav=()=>({wav:new ArrayBuffer(100)}),parts=[{text:'Goedemorgen. Mijn fiets staat naast de school.',language:'nl'}];
test('one selected profile is used for every language in a single continuous audio request',async()=>{
 const h=setup(wav);const mixed=[{text:'Say this:',language:'en'},...parts];await h.speak(mixed,{profile:'F1'});
 assert.equal(h.calls.length,1);assert.deepEqual(JSON.parse(JSON.stringify(h.calls[0].parts)),mixed);assert.equal(h.calls[0].profile,'F1');
});
test('unsupported language is rejected before any model generation instead of wrong pronunciation',async()=>{
 const h=setup(wav);await assert.rejects(h.speak([{text:'سلام',language:'fa'}],{profile:'M1'}),/ondersteunt deze taal nog niet/);assert.equal(h.calls.length,0);
});
test('worker failures and cancellation release the queue for a fresh retry',async()=>{
 const h=setup((d,n)=>n===1?{error:'Download mislukt'}:n===2?null:wav());
 await assert.rejects(h.speak(parts,{profile:'F1'}),/Download mislukt/);
 const c=new AbortController();const waiting=h.speak(parts,{profile:'F1',signal:c.signal});await new Promise(r=>setTimeout(r,10));c.abort();await assert.rejects(waiting,{name:'AbortError'});
 assert.equal((await h.speak(parts,{profile:'M1'})).file.size,100);assert.deepEqual(h.counts(),{created:3,terminated:2});
});
test('cache separates voice profiles and tempo and respects cancellation even for cached audio',async()=>{
 const h=setup(wav);await h.speak(parts,{profile:'F1'});await h.speak(parts,{profile:'F1'});assert.equal(h.calls.length,1);
 await h.speak(parts,{profile:'M1'});await h.speak(parts,{profile:'F1',rate:.85});assert.equal(h.calls.length,3);
 const c=new AbortController();c.abort();await assert.rejects(h.speak(parts,{profile:'F1',signal:c.signal}),{name:'AbortError'});
});
