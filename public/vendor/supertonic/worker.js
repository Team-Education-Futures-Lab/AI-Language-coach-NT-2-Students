import * as ort from '/vendor/voice/ort.wasm.min.mjs';
import {TextToSpeech,UnicodeProcessor,Style,writeWavFile} from './helper.js';
const BASE='https://huggingface.co/supertone-oss-archive/supertonic-3/resolve/aafc6e32416a594460b32413efc49d7fe4ce6d46/';
ort.env.wasm.wasmPaths='/vendor/voice/';ort.env.wasm.numThreads=1;
let engine=null,completed=0,cacheAvailable=true;const styles=new Map(),TOTAL=16;
function status(id,phase,message,detail=""){postMessage({id,status:{phase,message,detail,completed,total:TOTAL,cached:cacheAvailable}})}
async function asset(path,id){
 const url=BASE+path;let cache;try{cache=await caches.open('taalcoach-supertonic3-v1')}catch{cacheAvailable=false}
 let response;try{response=await cache?.match(url)}catch{cacheAvailable=false}
 if(response){status(id,'loading','Opgeslagen stemmen openen…',`${completed+1}/${TOTAL}`)}else{
  status(id,'downloading','Stemmen eenmalig downloaden…',`${completed+1}/${TOTAL}`);
  response=await fetch(url);if(!response.ok)throw Error('Stem downloaden mislukt. Controleer je verbinding en probeer opnieuw.');
  // Measure network bytes, never label reading the local cache as a download.
  if(response.body){
   let bytes=0,last=0;const total=Number(response.headers.get('content-length'));
   const body=response.body.pipeThrough(new TransformStream({transform(chunk,controller){
    bytes+=chunk.byteLength;const now=Date.now();if(now-last>300){last=now;const size=(bytes/1048576).toFixed(1),of=total?` / ${(total/1048576).toFixed(1)}`:'';status(id,'downloading','Stemmen downloaden…',`${size}${of} MB · ${completed+1}/${TOTAL}`)}controller.enqueue(chunk);
   }}));
   response=new Response(body,{headers:response.headers});
  }
  // Cache the exact pinned model version. A failed write must not prevent speech.
  const saved=cache?cache.put(url,response.clone()).catch(()=>{cacheAvailable=false}):Promise.resolve();
  const data=path.endsWith('.json')?await response.json():await response.arrayBuffer();await saved;completed++;return data;
 }
 const data=path.endsWith('.json')?await response.json():await response.arrayBuffer();completed++;return data;
}
async function initialize(id){
 if(engine)return engine;
 completed=0;cacheAvailable=true;
 const cfg=await asset('onnx/tts.json',id),indexer=await asset('onnx/unicode_indexer.json',id),sessions=[];
 for(const [i,name] of ['duration_predictor','text_encoder','vector_estimator','vocoder'].entries()){
  const bytes=await asset(`onnx/${name}.onnx`,id);
  status(id,'loading','Spraakmotor klaarzetten. Geen nieuwe download…',`${i+1}/4`);
  sessions.push(await ort.InferenceSession.create(bytes,{executionProviders:['wasm'],graphOptimizationLevel:'all'}));
 }
 for(const profile of ['F1','F2','F3','F4','F5','M1','M2','M3','M4','M5'])await styleFor(profile,id);
 engine=new TextToSpeech(cfg,new UnicodeProcessor(indexer),...sessions);
 status(id,'ready',cacheAvailable?'Alle 10 stemprofielen zijn klaar.':'Stemmen klaar voor dit bezoek; opslaan is niet gelukt.');return engine;
}
async function styleFor(profile,id){
 if(styles.has(profile))return styles.get(profile);
 const data=await asset(`voice_styles/${profile}.json`,id);
 const style=new Style(new ort.Tensor('float32',Float32Array.from(data.style_ttl.data.flat(Infinity)),data.style_ttl.dims),new ort.Tensor('float32',Float32Array.from(data.style_dp.data.flat(Infinity)),data.style_dp.dims));
 styles.set(profile,style);return style;
}
self.onmessage=async({data:{id,type,parts,profile,rate}})=>{
 try{
  const tts=await initialize(id);
  if(type==='preload'){postMessage({id,ready:true});return}
  const style=await styleFor(profile,id),clips=[];
  for(const [i,part] of parts.entries()){
   postMessage({id,progress:'Audio maken op je apparaat. De stemmen zijn al geladen…'});
   const {wav}=await tts.call(part.text,part.language,style,16,rate,.15);
   if(!wav.length||wav.some(x=>!Number.isFinite(x))||wav.length>tts.sampleRate*180)throw Error('Ongeldige audio ontvangen. Probeer een korter antwoord.');
   const fade=Math.min(Math.floor(tts.sampleRate*.005),Math.floor(wav.length/2));
   for(let j=0;j<fade;j++){wav[j]*=j/fade;wav[wav.length-1-j]*=j/fade}
   clips.push(wav);
  }
  const gap=Math.round(tts.sampleRate*.15),size=clips.reduce((n,c)=>n+c.length,0)+Math.max(0,clips.length-1)*gap;
  const joined=new Float32Array(size);let offset=0;
  for(const clip of clips){joined.set(clip,offset);offset+=clip.length+gap}
  const wav=writeWavFile(joined,tts.sampleRate);postMessage({id,wav},[wav]);
 }catch(e){postMessage({id,error:e.message||'Stem maken is mislukt.'})}
};
