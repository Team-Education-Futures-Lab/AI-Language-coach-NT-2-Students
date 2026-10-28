import {validVoiceProfile,voiceLanguage,type VoiceProfile} from './voice-profiles';
export type SpeechPart={text:string;language:string};
let worker:Worker|null=null,queue:Promise<unknown>=Promise.resolve(),serial=0;
const recent=new Map<string,Blob>();
export function localCoachSpeech(parts:SpeechPart[],options:{profile:VoiceProfile;rate?:number;signal?:AbortSignal;onProgress?:(message:string)=>void}){
 const task=async()=>{
  if(typeof window==='undefined')throw Error('Spraak werkt alleen in de browser.');
  if(options.signal?.aborted)throw new DOMException('Geannuleerd','AbortError');
  if(!validVoiceProfile(options.profile))throw Error('Kies een geldig stemprofiel.');
  const normalized=parts.filter(p=>p.text.trim()).map(p=>{const language=voiceLanguage(p.language);if(!language)throw Error('Het vaste stemprofiel ondersteunt deze taal nog niet: '+p.language+'. Je kunt blijven typen of expliciet de browserstem kiezen.');return {...p,language}});
  if(!normalized.length)throw Error('Geen tekst om voor te lezen.');
  if(normalized.reduce((n,p)=>n+p.text.length,0)>5000)throw Error('Dit antwoord is te lang om in één keer voor te lezen.');
  const rate=Math.min(1.2,Math.max(.8,options.rate??.95)),key=JSON.stringify([normalized,options.profile,rate]);
  const cached=recent.get(key);if(cached)return {file:cached};
  worker??=new Worker('/vendor/supertonic/worker.js',{type:'module'});const current=worker,id=++serial;
  const file=await new Promise<Blob>((resolve,reject)=>{
   let done=false;
   function finish(error?:Error,blob?:Blob){if(done)return;done=true;clearTimeout(timeout);current.removeEventListener('message',message);current.removeEventListener('error',failed);options.signal?.removeEventListener('abort',abort);if(error){current.terminate();if(worker===current)worker=null;reject(error)}else resolve(blob!)}
   const abort=()=>finish(new DOMException('Geannuleerd','AbortError'));
   const failed=()=>finish(Error('De stem kon niet starten. Probeer opnieuw of kies expliciet de browserstem.'));
   const message=(event:MessageEvent)=>{const d=event.data;if(d.id!==id)return;if(d.progress)options.onProgress?.(d.progress);else if(d.error)finish(Error(d.error));else if(d.wav instanceof ArrayBuffer&&d.wav.byteLength>44)finish(undefined,new Blob([d.wav],{type:'audio/wav'}));else failed()};
   const timeout=setTimeout(()=>finish(Error('Het voorbereiden duurt te lang. Controleer je verbinding en probeer opnieuw.')),180000);
   current.addEventListener('message',message);current.addEventListener('error',failed);options.signal?.addEventListener('abort',abort,{once:true});
   if(options.signal?.aborted){abort();return}current.postMessage({id,parts:normalized,profile:options.profile,rate});
  });
  if(recent.size>=3)recent.delete(recent.keys().next().value!);recent.set(key,file);return {file};
 };
 const result=queue.then(task,task);queue=result.catch(()=>{});return result;
}
