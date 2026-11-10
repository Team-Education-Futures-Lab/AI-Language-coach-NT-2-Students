import type {SpeechAudioChunk} from './speech-playback';
import type {VoiceProfile} from './voice-profiles';

// We enable only the additional languages exercised in the browser validation.
export const multilingualLanguages=['fa','zh'];
export const multilingualLanguage=(value:string)=>multilingualLanguages.includes(value.toLowerCase().split('-')[0]);
// The upstream decoder caps one passage at 28 seconds. Bound text before that
// cap can silently cut off a long reply; keep whole words where possible.
export function multilingualChunks(text:string,language:string){
 const limit=language==='zh'?70:180,parts:string[]=[];let current='';
 const words=Array.from(new Intl.Segmenter(language,{granularity:'word'}).segment(text),s=>s.segment);
 for(const word of words){
  if(Array.from(current+word).length>limit&&current.trim()){parts.push(current.trim());current=''}
  const chars=Array.from(word);while(chars.length>limit){if(current.trim()){parts.push(current.trim());current=''}parts.push(chars.splice(0,limit).join(''))}
  current+=chars.join('');
 }
 if(current.trim())parts.push(current.trim());return parts;
}
const modelBaseUrl='https://huggingface.co/Gigsu/vocoloco-onnx/resolve/2c301ff95a826f76ec9ff3d93233318f91362bf5';
let worker:Worker|null=null,ready=false,serial=0;
const references=new Map<string,{tokens:number[];refText:string}>();
type Options={profile:VoiceProfile;rate:number;signal?:AbortSignal;onProgress?:(message:string)=>void};
function request(payload:Record<string,unknown>,done:(d:any)=>boolean,options:Options):Promise<any>{
 const current=worker!;
 return new Promise((resolve,reject)=>{
  let timer:ReturnType<typeof setTimeout>,settled=false;
  const finish=(error?:Error,data?:unknown)=>{if(settled)return;settled=true;clearTimeout(timer);current.removeEventListener('message',message);current.removeEventListener('error',failed);options.signal?.removeEventListener('abort',abort);if(error){if(error.name!=='AbortError'){current.terminate();worker=null;ready=false}reject(error)}else resolve(data)};
  const arm=()=>{clearTimeout(timer);timer=setTimeout(()=>finish(Error('De stem reageert niet. Probeer opnieuw.')),180000)};
  const failed=()=>finish(Error('De meertalige stem kon niet starten. Probeer een browser met WebGPU, zoals een recente Chrome of Edge.'));
  const abort=()=>{if(payload.type==='init'){current.terminate();worker=null;ready=false;finish(new DOMException('Geannuleerd','AbortError'))}else current.postMessage({type:'cancel',jobId:payload.jobId})};
  const message=({data:d}:MessageEvent)=>{
   if(d.jobId&&d.jobId!==payload.jobId)return;arm();
   if(d.type==='progress')options.onProgress?.(payload.type==='synthesize'?'Audio maken op je apparaat…':d.stage==='downloading'?'Extra talen laden (circa 1,3 GB, één keer per browser)…':'Opgeslagen meertalige stem openen…');
   if(d.type==='error')finish(Error('Meertalige spraak is niet gelukt. Controleer je verbinding en probeer opnieuw.'));
   else if(d.type==='cancelled'||options.signal?.aborted&&done(d))finish(new DOMException('Geannuleerd','AbortError'));
   else if(done(d))finish(undefined,d);
  };
  current.addEventListener('message',message);current.addEventListener('error',failed);options.signal?.addEventListener('abort',abort,{once:true});arm();
  if(options.signal?.aborted){finish(new DOMException('Geannuleerd','AbortError'));return}current.postMessage(payload);
 });
}
// Called only from localCoachSpeech's shared queue, including mixed Dutch replies.
export async function multilingualSpeech(text:string,language:string,options:Options):Promise<SpeechAudioChunk>{
 if(options.signal?.aborted)throw new DOMException('Geannuleerd','AbortError');
 if(!ready){
  // Do not silently download the much larger ONNX/CPU fallback on unsupported devices.
  const gpu=(navigator as Navigator&{gpu?:{requestAdapter():Promise<{features:Set<string>;destroy?():void}|null>}}).gpu;
  const adapter=await gpu?.requestAdapter();const supported=adapter?.features.has('shader-f16');
  if(!supported)throw Error('Deze meertalige stem heeft WebGPU nodig. De opgenomen rondleiding werkt wel. Gebruik voor nieuwe antwoorden een recente Chrome of Edge met grafische versnelling.');
  options.onProgress?.('Extra talen laden (circa 1,3 GB, één keer per browser)…');
  worker??=new Worker('/vendor/omnivoice/workers/tts-worker.js',{type:'module'});
  await request({type:'init',modelBaseUrl,lowMemory:true},d=>d.type==='ready',options);ready=true;
 }
 let reference=references.get(options.profile);
 if(!reference){const response=await fetch('/voice-references/'+options.profile+'.json',{signal:options.signal});if(!response.ok)throw Error('Stemprofiel laden lukte niet. Probeer opnieuw.');reference=await response.json();if(!reference?.tokens?.length||!reference.refText)throw Error('Stemprofiel is niet compleet.');references.set(options.profile,reference)}
 options.onProgress?.('Audio maken op je apparaat…');
 const result=await request({type:'synthesize',jobId:String(++serial),text,lang:language,refTokens:new Int32Array(reference.tokens),refText:reference.refText,numStep:40,denoise:false,autoGender:false,speed:options.rate/.95},d=>d.type==='audio',options);
 if(!(result.pcm instanceof Float32Array)||!result.pcm.length||!result.pcm.every(Number.isFinite))throw Error('De audio is niet goed gemaakt. Probeer opnieuw.');
 return {samples:result.pcm,sampleRate:result.sampleRate};
}
export function wavAudio(samples:Float32Array,sampleRate:number){
 const buffer=new ArrayBuffer(44+samples.length*2),view=new DataView(buffer);
 const str=(offset:number,text:string)=>{for(let i=0;i<text.length;i++)view.setUint8(offset+i,text.charCodeAt(i))};
 str(0,'RIFF');view.setUint32(4,buffer.byteLength-8,true);str(8,'WAVEfmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);str(36,'data');view.setUint32(40,samples.length*2,true);
 samples.forEach((n,i)=>view.setInt16(44+i*2,Math.max(-1,Math.min(1,n))*32767,true));return new Blob([buffer],{type:'audio/wav'});
}
