import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';
const read=file=>{const c={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,c);return c.exports};
const {coachTourSteps}=read('lib/coach-tour.ts'),{tourTranslations,tourIntro}=read('lib/tour-translations.ts'),{spokenText}=read('lib/speech.ts');
test('unchanged tour steps use real recordings; revised steps never replay stale text',()=>{
 const manifest=JSON.parse(fs.readFileSync('public/tour-audio/manifest.json','utf8'));let count=0;
 for(const lang of ['nl','en','fa','zh']){
  const copy=[tourIntro[lang],...coachTourSteps.map((s,i)=>lang==='nl'?[s.title,s.body]:lang==='en'?s.en:tourTranslations[lang][i])];
  assert.equal(copy.length,20);
  for(const [index,pair] of copy.entries()){const key=JSON.stringify([lang,'F1',spokenText(pair.join(' '))]);if([1,2,3,19].includes(index)){assert.equal(manifest[key],undefined,'Revised copy must use fresh TTS, never mismatched narration');continue}assert.ok(manifest[key],`Missing ${lang}: ${pair[0]}`);assert.match(manifest[key],/^\/tour-audio\/[a-f0-9]{20}\.mp3$/);assert.ok(fs.statSync('public'+manifest[key]).size>1000);count++}
 }
 assert.equal(Object.keys(manifest).length,80);assert.equal(count,64);
});
test('every original voice has its own pre-encoded reference',()=>{
 for(const profile of ['F1','F2','F3','F4','F5','M1','M2','M3','M4','M5']){const ref=JSON.parse(fs.readFileSync(`public/voice-references/${profile}.json`,'utf8'));assert.ok(ref.refText.includes('personal language coach'));assert.ok(ref.tokens.length>100);assert.equal(ref.tokens.length%8,0);assert.ok(ref.tokens.every(n=>Number.isInteger(n)&&n>=0))}
});
test('whole tour preloads with at most three downloads and playback reuses the same files',async()=>{
 const manifest=JSON.parse(fs.readFileSync('public/tour-audio/manifest.json','utf8'));
 const {TourAudioCache}=read('lib/tour-audio-cache.ts');let calls=0,active=0,peak=0;
 const ctx={exports:{},AbortSignal,DOMException,fetch:async()=>{calls++;active++;peak=Math.max(peak,active);await new Promise(r=>setTimeout(r,1));active--;return{ok:true,blob:async()=>new Blob(['audio'])}},require:name=>name.includes('manifest')?manifest:name.includes('tour-audio-cache')?{TourAudioCache}:{spokenText}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/tour-recordings.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,ctx);
 await ctx.exports.preloadTourRecordings('fa','F1',new AbortController().signal);
 assert.equal(calls,20);assert.ok(peak<=3);
 const [lang,profile,text]=JSON.parse(Object.keys(manifest).find(k=>JSON.parse(k)[0]==='fa'));
 await ctx.exports.prerecordedTourAudio(text,lang,profile);assert.equal(calls,20);
 await ctx.exports.preloadTourRecordings('fa','M1',new AbortController().signal);assert.equal(calls,20);
});
