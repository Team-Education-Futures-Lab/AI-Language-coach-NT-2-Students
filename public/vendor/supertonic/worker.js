import * as ort from '/vendor/voice/ort.wasm.min.mjs';
import {TextToSpeech,UnicodeProcessor,Style,writeWavFile} from './helper.js';
const BASE='https://huggingface.co/supertone-oss-archive/supertonic-3/resolve/aafc6e32416a594460b32413efc49d7fe4ce6d46/';
ort.env.wasm.wasmPaths='/vendor/voice/';ort.env.wasm.numThreads=1;
let engine=null;const styles=new Map();
async function asset(path,id){
 const url=BASE+path;let cache;try{cache=await caches.open('taalcoach-supertonic3-v1')}catch{}
 let response;try{response=await cache?.match(url)}catch{}
 if(!response){
  response=await fetch(url);if(!response.ok)throw Error('Stem downloaden mislukt. Controleer je verbinding.');
  try{await cache?.put(url,response.clone())}catch{}
 }
 return path.endsWith('.json')?response.json():response.arrayBuffer();
}
async function initialize(id){
 if(engine)return engine;
 const cfg=await asset('onnx/tts.json',id),indexer=await asset('onnx/unicode_indexer.json',id),sessions=[];
 for(const [i,name] of ['duration_predictor','text_encoder','vector_estimator','vocoder'].entries()){
  postMessage({id,progress:`Stem laden (${i+1}/4). Eerste download: circa 400 MB.`});
  sessions.push(await ort.InferenceSession.create(await asset(`onnx/${name}.onnx`,id),{executionProviders:['wasm'],graphOptimizationLevel:'all'}));
 }
 engine=new TextToSpeech(cfg,new UnicodeProcessor(indexer),...sessions);return engine;
}
async function styleFor(profile,id){
 if(styles.has(profile))return styles.get(profile);
 const data=await asset(`voice_styles/${profile}.json`,id);
 const style=new Style(new ort.Tensor('float32',Float32Array.from(data.style_ttl.data.flat(Infinity)),data.style_ttl.dims),new ort.Tensor('float32',Float32Array.from(data.style_dp.data.flat(Infinity)),data.style_dp.dims));
 styles.set(profile,style);return style;
}
self.onmessage=async({data:{id,parts,profile,rate}})=>{
 try{
  const tts=await initialize(id),style=await styleFor(profile,id),clips=[];
  for(const [i,part] of parts.entries()){
   postMessage({id,progress:`Audio voorbereiden (${i+1}/${parts.length})…`});
   const {wav}=await tts.call(part.text,part.language,style,16,rate,.15);
   if(!wav.length||wav.some(x=>!Number.isFinite(x))||wav.length>tts.sampleRate*180)throw Error('Ongeldige audio ontvangen. Probeer een korter antwoord.');
   // Fade only the edges of language passages to avoid discontinuity clicks.
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
