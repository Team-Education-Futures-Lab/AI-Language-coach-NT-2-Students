import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function setup(generate){
 let created=0,destroyed=0;
 class Engine{constructor(){created++}generate(...args){return generate(...args)}destroy(){destroyed++}}
 const context={window:{},Blob,DOMException,AbortController,setTimeout,clearTimeout,URL,console,exports:{},require:()=>({PiperWebWorkerEngine:Engine,HuggingFaceVoiceProvider:class{},OnnxWebWorkerRuntime:class{}})};
 const code=ts.transpileModule(readFileSync('lib/local-tts.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,context);return {speak:context.exports.localDutchSpeech,counts:()=>({created,destroyed})};
}
const wav=()=>({file:new Blob([new Uint8Array(100)],{type:'audio/wav'})});
test('failed local speech is disposed and the next request retries successfully',async()=>{
 let calls=0;const h=setup(async()=>{if(++calls===1)throw Error('download failed');return wav()});
 await assert.rejects(h.speak('Hallo'),/download failed/);assert.equal((await h.speak('Hallo')).file.size,100);
 assert.deepEqual(h.counts(),{created:2,destroyed:1});
});
test('aborting a stuck worker releases the queue and does not reuse a broken engine',async()=>{
 let calls=0;const h=setup(()=>++calls===1?new Promise(()=>{}):Promise.resolve(wav()));const c=new AbortController();
 const first=h.speak('Eerste',{signal:c.signal});await new Promise(resolve=>setTimeout(resolve,10));c.abort();
 await assert.rejects(first,{name:'AbortError'});assert.equal((await h.speak('Tweede')).file.size,100);assert.deepEqual(h.counts(),{created:2,destroyed:1});
});
test('repeated speech reuses generated audio and preserves the Dutch voice id',async()=>{
 let calls=0;const h=setup(async(text,voice,speaker)=>{calls++;assert.equal(voice,'nl_NL-mls-medium');assert.equal(speaker,0);return wav()});
 await h.speak('Hallo');await h.speak('Hallo');assert.equal(calls,1);
 const c=new AbortController();c.abort();await assert.rejects(h.speak('Hallo',{signal:c.signal}),{name:'AbortError'});
});
