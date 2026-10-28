import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function setup(run){
 let created=0,terminated=0;const calls=[];
 class Worker extends EventTarget{constructor(){super();created++}postMessage(data){if(data.type==='cancel')return;calls.push(data);Promise.resolve().then(()=>run(data,calls.length)).then(result=>{if(result)this.dispatchEvent(new MessageEvent('message',{data:{id:data.id,...result}}))})}terminate(){terminated++}}
 const context={window:{},Blob,DOMException,AbortController,ArrayBuffer,setTimeout,clearTimeout,Worker,exports:{},require:()=>profiles};
 const compile=file=>ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const m={exports:{}};vm.runInNewContext(compile('lib/voice-profiles.ts'),m);const profiles=m.exports;
 vm.runInNewContext(compile('lib/local-tts.ts'),context);return {speak:context.exports.localCoachSpeech,preload:context.exports.preloadCoachVoice,state:context.exports.getVoiceLoadState,counts:()=>({created,terminated}),calls};
}
const wav=()=>({wav:new ArrayBuffer(100)}),parts=[{text:'Goedemorgen. Mijn fiets staat naast de school.',language:'nl'}];
test('one selected profile is used for every language in a single continuous audio request',async()=>{
 const h=setup(wav);const mixed=[{text:'Say this:',language:'en'},...parts];await h.speak(mixed,{profile:'F1'});
 assert.equal(h.calls.length,1);assert.deepEqual(JSON.parse(JSON.stringify(h.calls[0].parts)),mixed);assert.equal(h.calls[0].profile,'F1');
});
test('unsupported language is rejected before any model generation instead of wrong pronunciation',async()=>{
 const h=setup(wav);await assert.rejects(h.speak([{text:'سلام',language:'fa'}],{profile:'M1'}),/ondersteunt deze taal nog niet/);assert.equal(h.calls.length,0);
});
test('worker failure releases the queue for a fresh retry',async()=>{
 const h=setup((d,n)=>n===1?{error:'Download mislukt'}:wav());
 await assert.rejects(h.speak(parts,{profile:'F1'}),/Download mislukt/);
 assert.equal((await h.speak(parts,{profile:'M1'})).file.size,100);assert.deepEqual(h.counts(),{created:2,terminated:1});
});
test('cancel returns immediately but keeps the loaded worker and serializes the next generation',async()=>{
 let complete;const h=setup((d,n)=>n===1?new Promise(resolve=>{complete=resolve}):wav());
 const c=new AbortController();const waiting=h.speak(parts,{profile:'F1',signal:c.signal});await new Promise(r=>setTimeout(r,10));
 c.abort();await assert.rejects(waiting,{name:'AbortError'});assert.equal(h.counts().terminated,0);
 const next=h.speak(parts,{profile:'M1'});await new Promise(r=>setTimeout(r,10));assert.equal(h.calls.length,1);
 complete(wav());await next;assert.deepEqual(h.counts(),{created:1,terminated:0});
});
test('concurrent preload requests are shared and speech reuses the warmed worker',async()=>{
 const h=setup(d=>d.type==='preload'?{ready:true}:wav());
 await Promise.all([h.preload(),h.preload(),h.preload()]);assert.equal(h.calls.length,1);
 await h.speak(parts,{profile:'M5'});assert.equal(h.calls[1].type,'speak');assert.deepEqual(h.counts(),{created:1,terminated:0});
});
test('cache separates voice profiles and tempo and respects cancellation even for cached audio',async()=>{
 const h=setup(wav);await h.speak(parts,{profile:'F1'});await h.speak(parts,{profile:'F1'});assert.equal(h.calls.length,1);
 await h.speak(parts,{profile:'M1'});await h.speak(parts,{profile:'F1',rate:.85});assert.equal(h.calls.length,3);
 const c=new AbortController();c.abort();await assert.rejects(h.speak(parts,{profile:'F1',signal:c.signal}),{name:'AbortError'});
});

function workerHarness(cache=new Map(),failWrite=false){
 const events=[],fetched=[],inferences=[];let sessions=0;
 const response=url=>new Response(url.endsWith('.onnx')?new Uint8Array(32):JSON.stringify(url.includes('voice_styles')?{style_ttl:{data:[1],dims:[1]},style_dp:{data:[1],dims:[1]}}:{}));
 const context={Response,TransformStream,Float32Array,Date,Number,Math,Map,Error,DOMException,Intl,self:{},postMessage:event=>events.push(event),
  caches:{open:async()=>({match:async url=>cache.get(url)?.clone(),put:async(url,res)=>{if(failWrite)throw Error('quota');cache.set(url,res)}})},
  fetch:async url=>{fetched.push(url);return response(url)},
  ort:{env:{wasm:{}},InferenceSession:{create:async()=>{sessions++;return {}}},Tensor:class{}},
  UnicodeProcessor:class{},Style:class{},TextToSpeech:class{sampleRate=24000;async call(text,language,style,steps,rate,silence,check){check?.();inferences.push({text,language,steps});return {wav:new Float32Array([.1,.2,.1])}}},writeWavFile:()=>new ArrayBuffer(100)};
 const code=readFileSync('public/vendor/supertonic/worker.js','utf8').replace(/^import .*;\n/gm,'');vm.runInNewContext(code,context);
 return {events,fetched,inferences,cache,sessions:()=>sessions,send:async data=>context.self.onmessage({data:{id:1,...data}})};
}
test('warmup downloads all profiles once; new messages and profile switches do not download again',async()=>{
 const h=workerHarness();await h.send({type:'preload'});assert.equal(h.fetched.length,16);assert.equal(h.sessions(),4);
 assert.equal(h.events.at(-2).status.phase,'ready');assert.equal(h.events.at(-2).status.cached,true);
 await h.send({type:'speak',profile:'M5',parts,rate:.95});await h.send({type:'speak',profile:'F4',parts,rate:.95});
 assert.equal(h.fetched.length,16);assert.equal(h.sessions(),4);assert.equal(h.events.at(-1).wav.byteLength,100);
});
test('a new page rebuilds sessions from persisted files without any download',async()=>{
 const first=workerHarness();await first.send({type:'preload'});
 const reload=workerHarness(first.cache);await reload.send({type:'preload'});
 assert.equal(reload.fetched.length,0);assert.equal(reload.sessions(),4);assert.equal(reload.events.some(e=>e.status?.phase==='downloading'),false);
 assert.equal(reload.events.at(-2).status.phase,'ready');
});
test('cache quota errors preserve speech and disclose that downloads cannot be retained',async()=>{
 const h=workerHarness(new Map(),true);await h.send({type:'preload'});
 assert.equal(h.events.at(-2).status.cached,false);assert.equal(h.events.at(-1).ready,true);
});

test('speech streams a short first sentence before the final WAV, preserving every word and language',async()=>{
 const h=workerHarness();const mixed=[{text:'Hello! Listen carefully. Now try this sentence.',language:'en'},{text:'Ik ga morgen naar school.',language:'nl'}];
 await h.send({type:'speak',profile:'F1',parts:mixed,rate:.95});
 assert.equal(h.inferences[0].text,'Hello!');assert.equal(h.inferences[0].steps,8);
 assert.equal(h.inferences.filter(p=>p.language==='en').map(p=>p.text).join(' '),mixed[0].text);
 assert.equal(h.inferences.at(-1).language,'nl');
 const firstChunk=h.events.findIndex(e=>e.chunk),final=h.events.findIndex(e=>e.wav);assert.ok(firstChunk>=0&&firstChunk<final);
});
test('cancelling between inference steps retains model sessions for another request',async()=>{
 const h=workerHarness();await h.send({type:'preload'});await h.send({type:'cancel'});await h.send({type:'speak',profile:'F1',parts,rate:.95});
 assert.equal(h.events.at(-1).cancelled,true);assert.equal(h.sessions(),4);
 await h.send({type:'speak',profile:'M1',parts,rate:.95});assert.equal(h.sessions(),4);assert.equal(h.events.at(-1).wav.byteLength,100);
});
