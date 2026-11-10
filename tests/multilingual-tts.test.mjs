import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';import ts from 'typescript';
const compile=f=>ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function setup({gpu=true,hold=false}={}){
 const calls=[],downloads=[];let created=0,terminated=0;
 class Worker extends EventTarget{
  constructor(){super();created++}
  postMessage(data){calls.push(data);queueMicrotask(()=>{let response;
   if(data.type==='init')response={type:'ready'};
   if(data.type==='synthesize'&&!hold)response={type:'audio',jobId:data.jobId,pcm:new Float32Array([.1,-.1,.2]),sampleRate:24000};
   if(data.type==='cancel')response={type:'cancelled',jobId:data.jobId};
   if(response)this.dispatchEvent(new MessageEvent('message',{data:response}));
  })}terminate(){terminated++}
 }
 const ctx={exports:{},navigator:{gpu:gpu?{requestAdapter:async()=>({features:new Set(['shader-f16'])})}:undefined},Worker,Float32Array,Int32Array,ArrayBuffer,DataView,Blob,DOMException,AbortController,setTimeout,clearTimeout,fetch:async(url)=>{downloads.push(url);return{ok:true,json:async()=>({tokens:[1,2,3],refText:'A consistent reference.'})}}};
 vm.runInNewContext(compile('lib/multilingual-tts.ts'),ctx);return{...ctx.exports,calls,downloads,counts:()=>({created,terminated})};
}
test('fa and zh reuse one model and the same selected reference; no encoder download',async()=>{
 const h=setup();for(const language of ['fa','zh'])await h.multilingualSpeech('Test',language,{profile:'M2',rate:.95});
 assert.equal(h.calls.filter(c=>c.type==='init').length,1);assert.deepEqual(h.downloads,['/voice-references/M2.json']);
 const requests=h.calls.filter(c=>c.type==='synthesize');assert.equal(requests.length,2);for(const r of requests){assert.equal(r.refText,'A consistent reference.');assert.deepEqual([...r.refTokens],[1,2,3]);assert.equal(r.autoGender,false);assert.equal(r.numStep,40)}
 assert.equal(h.calls[0].lowMemory,true);
});
test('unsupported GPU does not start or download a fallback model',async()=>{
 const h=setup({gpu:false});await assert.rejects(h.multilingualSpeech('Test','fa',{profile:'F1',rate:.95}),/WebGPU/);assert.equal(h.calls.length,0);assert.equal(h.downloads.length,0);
});
test('cancellation stops inference but preserves an initialized model',async()=>{
 const h=setup({hold:true}),controller=new AbortController();const pending=h.multilingualSpeech('Test','zh',{profile:'F1',rate:.95,signal:controller.signal});
 await new Promise(r=>setTimeout(r,5));controller.abort();await assert.rejects(pending,{name:'AbortError'});assert.deepEqual(h.counts(),{created:1,terminated:0});assert.equal(h.calls.at(-1).type,'cancel');
});
test('already cancelled synthesis does not start a worker',async()=>{
 const h=setup(),c=new AbortController();c.abort();await assert.rejects(h.multilingualSpeech('Test','fa',{profile:'F1',rate:.95,signal:c.signal}),{name:'AbortError'});assert.equal(h.calls.length,0);
});
test('WAV output has a consistent PCM header and clamps samples',async()=>{
 const h=setup();const b=await h.wavAudio(new Float32Array([2,-2,0]),24000).arrayBuffer(),v=new DataView(b);assert.equal(v.getUint32(24,true),24000);assert.equal(v.getUint32(40,true),6);assert.equal(v.getInt16(44,true),32767);assert.equal(v.getInt16(46,true),-32767);
});
test('only validated additional languages are automatically enabled',()=>{
 const m={exports:{}};vm.runInNewContext(compile('lib/voice-profiles.ts'),m);assert.equal(m.exports.coachVoiceLanguage('fa-IR'),'fa');assert.equal(m.exports.coachVoiceLanguage('zh-CN'),'zh');assert.equal(m.exports.coachVoiceLanguage('he'),null);assert.equal(m.exports.voiceLanguage('nl'),'nl');assert.equal(m.exports.voiceLanguage('fa'),null);
});
test('long passages are bounded before the decoder duration cap without losing words',()=>{
 const h=setup();for(const [lang,text,max] of [['zh','你好，我是你的语言教练。今天我们一起学习荷兰语。'.repeat(30),70],['fa','سلام. امروز با هم هلندی یاد می‌گیریم. '.repeat(30),180]]){
  const parts=h.multilingualChunks(text,lang);assert.ok(parts.length>1);assert.ok(parts.every(p=>[...p].length<=max));assert.equal(parts.join('').replace(/\s/g,''),text.replace(/\s/g,''));
 }
});
