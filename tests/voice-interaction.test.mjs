import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function load(file,context={}){const exports={};const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(code,{exports,Float32Array,DOMException,setTimeout,clearTimeout,...context});return exports}
const {createVoiceActivity}=load('lib/voice-activity.ts');
test('quiet speech is detected and a natural pause finishes the turn',()=>{
 const vad=createVoiceActivity(0);for(let t=100;t<=1000;t+=100)assert.equal(vad.sample(.001,t).heard,false);
 let result;for(let t=1100;t<=2000;t+=100)result=vad.sample(.008,t);assert.equal(result.heard,true);
 for(let t=2100;t<=3700;t+=100)assert.equal(vad.sample(.001,t).finished,false);
 assert.equal(vad.sample(.001,3900).finished,true);
});
test('silence does not become a hallucinated voice turn and one click is not speech',()=>{
 const vad=createVoiceActivity(0);vad.sample(.05,100);for(let t=200;t<=12000;t+=100){const result=vad.sample(.0003,t);assert.equal(result.heard,false);assert.equal(result.finished,false)}
 assert.equal(vad.sample(.0003,12100).quiet,true);
});
test('PCM passages share one clock, are ordered without overlap and stopping clears every source',async()=>{
 const nodes=[],starts=[];let contexts=0;
 class AudioContext{currentTime=10;state='running';destination={};constructor(){contexts++}async resume(){}createBuffer(c,n,rate){return {duration:n/rate,getChannelData:()=>new Float32Array(n)}}createBufferSource(){const n={connect(){},disconnect(){},start(t){starts.push(t)},stop(){n.stopped=true},onended:null};nodes.push(n);return n}}
 const {SpeechPlayback}=load('lib/speech-playback.ts',{AudioContext});let began=0;const p=new SpeechPlayback(()=>began++);await p.unlock();
 p.add({samples:new Float32Array(24000),sampleRate:24000});p.add({samples:new Float32Array(48000),sampleRate:24000});
 assert.equal(began,1);assert.equal(starts[1],starts[0]+1);
 let finished=false;const done=p.finish().then(()=>finished=true);nodes[0].onended();await Promise.resolve();assert.equal(finished,false);nodes[1].onended();await done;
 const next=new SpeechPlayback(()=>{});next.add({samples:new Float32Array(100),sampleRate:24000});const pending=next.finish();next.stop();await assert.rejects(pending,{name:'AbortError'});assert.equal(nodes.at(-1).stopped,true);assert.equal(contexts,1);
});
