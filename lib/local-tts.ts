import {validVoiceProfile,voiceLanguage,type VoiceProfile} from './voice-profiles';
export type SpeechPart={text:string;language:string};
export type VoiceLoadState={phase:'idle'|'downloading'|'loading'|'ready'|'error';message:string;detail?:string;completed?:number;total?:number;cached?:boolean};
const initialState:VoiceLoadState={phase:'idle',message:'Stemmen worden vooraf klaargezet.'};
let state=initialState,worker:Worker|null=null,queue:Promise<unknown>=Promise.resolve(),serial=0,warmup:Promise<void>|null=null;
const listeners=new Set<()=>void>(),recent=new Map<string,Blob>();
export const getVoiceLoadState=()=>state;
export const getServerVoiceLoadState=()=>initialState;
export function subscribeVoiceLoad(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener)}}
function update(next:VoiceLoadState){state=next;listeners.forEach(listener=>listener())}
function enqueue<T>(task:()=>Promise<T>){const result=queue.then(task,task);queue=result.catch(()=>{});return result}
function request(payload:Record<string,unknown>,onProgress?:(message:string)=>void){
 if(typeof window==='undefined')return Promise.reject(Error('Spraak werkt alleen in de browser.'));
 worker??=new Worker('/vendor/supertonic/worker.js',{type:'module'});const current=worker,id=++serial;
 return new Promise<Blob|undefined>((resolve,reject)=>{
  let done=false;
  function finish(error?:Error,blob?:Blob){
   if(done)return;done=true;clearTimeout(timeout);current.removeEventListener('message',message);current.removeEventListener('error',failed);
   if(error){current.terminate();if(worker===current)worker=null;update({phase:'error',message:error.message});reject(error)}else resolve(blob);
  }
  const failed=()=>finish(Error('De stem kon niet starten. Probeer opnieuw of kies expliciet de browserstem.'));
  const message=(event:MessageEvent)=>{const d=event.data;if(d.id!==id)return;armTimeout();
   if(d.status){update(d.status);onProgress?.(d.status.message)}
   else if(d.progress)onProgress?.(d.progress);
   else if(d.error)finish(Error(d.error));
   else if(d.ready)finish();
   else if(d.wav instanceof ArrayBuffer&&d.wav.byteLength>44)finish(undefined,new Blob([d.wav],{type:'audio/wav'}));
   else failed();
  };
  // Allow slow first downloads, but still recover a stalled worker. Progress resets this timer.
  let timeout:ReturnType<typeof setTimeout>;
  const armTimeout=()=>{clearTimeout(timeout);timeout=setTimeout(()=>finish(Error('Het voorbereiden duurt te lang. Controleer je verbinding en probeer opnieuw.')),180000)};
  armTimeout();current.addEventListener('message',message);current.addEventListener('error',failed);
  current.postMessage({id,...payload});
 });
}
// Cancelling playback must not discard 400 MB of loaded model sessions. The current
// inference finishes silently; the queue keeps the worker single-threaded and reusable.
function abortable<T>(operation:Promise<T>,signal?:AbortSignal){
 if(!signal)return operation;
 return new Promise<T>((resolve,reject)=>{
  const abort=()=>reject(new DOMException('Geannuleerd','AbortError'));
  if(signal.aborted)abort();else signal.addEventListener('abort',abort,{once:true});
  operation.then(resolve,reject).finally(()=>signal.removeEventListener('abort',abort));
 });
}
export function preloadCoachVoice(){
 if(state.phase==='ready')return Promise.resolve();
 if(warmup)return warmup;
 warmup=enqueue(async()=>{if(state.phase==='ready')return;await request({type:'preload'})}).catch(error=>{update({phase:'error',message:error instanceof Error?error.message:'Stemmen voorbereiden is mislukt.'});throw error}).finally(()=>{warmup=null});
 return warmup;
}
export function localCoachSpeech(parts:SpeechPart[],options:{profile:VoiceProfile;rate?:number;signal?:AbortSignal;onProgress?:(message:string)=>void}){
 const task=async()=>{
  if(options.signal?.aborted)throw new DOMException('Geannuleerd','AbortError');
  if(!validVoiceProfile(options.profile))throw Error('Kies een geldig stemprofiel.');
  const normalized=parts.filter(p=>p.text.trim()).map(p=>{const language=voiceLanguage(p.language);if(!language)throw Error('Het vaste stemprofiel ondersteunt deze taal nog niet: '+p.language+'. Je kunt blijven typen of expliciet de browserstem kiezen.');return {...p,language}});
  if(!normalized.length)throw Error('Geen tekst om voor te lezen.');
  if(normalized.reduce((n,p)=>n+p.text.length,0)>5000)throw Error('Dit antwoord is te lang om in één keer voor te lezen.');
  const rate=Math.min(1.2,Math.max(.8,options.rate??.95)),key=JSON.stringify([normalized,options.profile,rate]);
  const cached=recent.get(key);if(cached)return {file:cached};
  const file=(await request({type:'speak',parts:normalized,profile:options.profile,rate},message=>{if(!options.signal?.aborted)options.onProgress?.(message)}))!;
  if(recent.size>=3)recent.delete(recent.keys().next().value!);recent.set(key,file);return {file};
 };
 return abortable(enqueue(task),options.signal);
}
