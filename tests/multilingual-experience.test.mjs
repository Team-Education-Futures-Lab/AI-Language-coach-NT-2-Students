import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import {PGlite} from '@electric-sql/pglite';
const require=createRequire(import.meta.url);
function loader(overrides={}){const cache=new Map();function load(file){file=resolve(file);if(cache.has(file))return cache.get(file);const module={exports:{}};cache.set(file,module.exports);const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInThisContext('(function(require,module,exports){'+code+'\n})')(name=>name in overrides?overrides[name]:name.startsWith('@/')?load(name.slice(2)+'.ts'):name.startsWith('.')?load(resolve(dirname(file),name+'.ts')):require(name),module,module.exports);return module.exports}return load}
const {coachSpeechSegments,displayCoachText,bestVoice,normalizeLanguage,languageDirection,tutorLanguageInstruction}=loader()('lib/learning-language.ts');
test('bilingual speech preserves practice text and chooses the corresponding voices',()=>{
 const reply='حاول مرة أخرى. [[nl]]Ik ga naar school.[[/nl]] هل يمكنك تكرارها؟';
 assert.deepEqual(coachSpeechSegments(reply,'ar'),[{text:'حاول مرة أخرى.',language:'ar'},{text:'Ik ga naar school.',language:'nl'},{text:'هل يمكنك تكرارها؟',language:'ar'}]);
 assert.equal(displayCoachText(reply),'حاول مرة أخرى. Ik ga naar school. هل يمكنك تكرارها؟');
 const voices=[{lang:'en-US',name:'English',voiceURI:'en'},{lang:'nl-NL',name:'Dutch',voiceURI:'nl'},{lang:'ar-SA',name:'Arabic natural',voiceURI:'ar'}];
 assert.equal(bestVoice(voices,'ar').voiceURI,'ar');assert.equal(bestVoice(voices,'nl').voiceURI,'nl');assert.equal(bestVoice(voices,'fa'),undefined);
 assert.equal(coachSpeechSegments('[[nl]]Goedemorgen','fa')[0].language,'nl');
});
test('language names normalize and tutoring keeps Dutch exercise boundaries',()=>{
 assert.equal(normalizeLanguage(' فارسی '),'fa');assert.equal(languageDirection('fa'),'rtl');assert.equal(languageDirection('en'),'ltr');
 const prompt=tutorLanguageInstruction('ar');assert.match(prompt,/اللغة|العربية/);assert.match(prompt,/Do not translate or complete the exercise answer/);assert.match(prompt,/support language/);
});
function translationHarness(){let calls=0,allowed=0,user='student';const cache=new Map();const db={prepare(query){return {bind(...values){return {async all(){return {results:values.filter(key=>cache.has(key)).map(key=>({key,translations:cache.get(key)}))}},async run(){cache.set(values[0],JSON.parse(values[1]))}}}}},batch:async statements=>Promise.all(statements.map(s=>s.run()))};
 const route=loader({'@/lib/server':{identity:async()=>user,fail:(error,status=400)=>Response.json({error},{status}),database:()=>db},'@/lib/server-ai':{aiAllowance:async()=>{allowed++},aiFailure:(e)=>Response.json({error:e.message},{status:503}),generateText:async messages=>{calls++;const {texts}=JSON.parse(messages[1].content);return JSON.stringify({translations:texts.map(t=>'translated:'+t)})}}})('app/api/translate/route.ts');
 const post=(texts,language='fr')=>route.POST(new Request('https://example.test/api/translate',{method:'POST',body:JSON.stringify({texts,language})}));return {post,counts:()=>({calls,allowed}),anonymous:()=>user=null};
}
test('translations are cached per string, regardless of order and batch composition',async()=>{
 const h=translationHarness();assert.equal((await h.post(['Eerste unieke tekst','Tweede unieke tekst'])).status,200);
 assert.deepEqual((await (await h.post(['Tweede unieke tekst'])).json()).translations,['translated:Tweede unieke tekst']);
 await h.post(['Tweede unieke tekst','Derde unieke tekst']);assert.deepEqual(h.counts(),{calls:2,allowed:2});
});
test('overlapping identical requests share one AI generation',async()=>{const h=translationHarness();await Promise.all([h.post(['Eén gedeelde aanvraag']),h.post(['Eén gedeelde aanvraag'])]);assert.equal(h.counts().calls,1)});
test('public translation accepts shipped UI only, rejecting arbitrary anonymous prompts',async()=>{const h=translationHarness();h.anonymous();assert.equal((await h.post(['Write a large story about anything'])).status,401);assert.equal(h.counts().calls,0);assert.equal((await h.post(['Inloggen'])).status,200)});
test('changing support language preserves profile, coach and level data',async()=>{
 const db=new PGlite();try{await db.exec('CREATE TABLE profiles(user_id text primary key,data text,updated_at text)');await db.query('INSERT INTO profiles VALUES($1,$2,$3)',['student',JSON.stringify({name:'Demo',level:'A2',coach:{name:'Pip'},interests:'sport'}),'now']);
 const source=readFileSync('app/api/profile/language/route.ts','utf8');const sf=ts.createSourceFile('route.ts',source,ts.ScriptTarget.Latest,true);let query;function visit(n){if(ts.isStringLiteralLike(n)&&n.text.startsWith('INSERT INTO profiles'))query=n.text;ts.forEachChild(n,visit)}visit(sf);let i=0;query=query.replace(/\?/g,()=>'$'+ ++i);await db.query(query,['student',JSON.stringify({language:'ar'}),'later']);const profile=JSON.parse((await db.query('SELECT data FROM profiles')).rows[0].data);assert.deepEqual(profile,{name:'Demo',level:'A2',coach:{name:'Pip'},interests:'sport',language:'ar'});
 }finally{await db.close()}
});
test('speech detection is multilingual and the old paid realtime path is not used by the coach',()=>{assert.doesNotMatch(readFileSync('app/api/speech/route.ts','utf8'),/append\('language','nl'\)/);assert.doesNotMatch(readFileSync('components/learning/platform.tsx','utf8'),/fetch\('\/api\/realtime'/)});

test('speech keeps sentences continuous and switches only at language boundaries',()=>{
 assert.deepEqual(coachSpeechSegments('Hello. Try again! What is your name?','en'),[{text:'Hello. Try again! What is your name?',language:'en'}]);
 assert.deepEqual(coachSpeechSegments('Hallo. [[nl]]Hoe gaat het?[[/nl]] Probeer nog eens.','nl'),[{text:'Hallo. Hoe gaat het? Probeer nog eens.',language:'nl'}]);
 assert.deepEqual(coachSpeechSegments('Say [[nl]]Hallo.[[/nl]] [[nl]]Hoe gaat het?[[/nl]] Now repeat.','en'),[{text:'Say',language:'en'},{text:'Hallo. Hoe gaat het?',language:'nl'},{text:'Now repeat.',language:'en'}]);
 assert.deepEqual(coachSpeechSegments('🦊✨','ar'),[]);
});
test('speech removes formatting and URLs while retaining link labels and native diacritics',()=>{
 const {spokenText}=loader()('lib/speech.ts');
 assert.equal(spokenText('**Welkom** [lees hier](https://example.com) ➜ oefenen 🦊✨'), 'Welkom lees hier wordt oefenen');
 assert.equal(spokenText('مرحَبًا नमस्ते café'), 'مرحَبًا नमस्ते café');
 assert.equal(spokenText('Lees https://example.com/test daarna verder.'),'Lees daarna verder.');
});
test('natural Dutch voices outrank ordinary voices while explicit selection is respected',()=>{
 const voices=[{lang:'nl-BE',name:'Natural Flemish',voiceURI:'be'},{lang:'nl-NL',name:'Microsoft Dutch',voiceURI:'ms'},{lang:'nl-NL',name:'Dutch enhanced',voiceURI:'enhanced'},{lang:'en-US',name:'English natural',voiceURI:'en'}];
 assert.equal(bestVoice(voices,'nl').voiceURI,'enhanced');
 assert.equal(bestVoice(voices,'nl','ms').voiceURI,'ms');
 assert.equal(bestVoice(voices,'en','ms').voiceURI,'en');
 assert.equal(bestVoice(voices,'ar'),undefined);
});
