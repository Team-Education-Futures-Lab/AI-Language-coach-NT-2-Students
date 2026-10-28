// Model files are public; student text and generated speech stay on this device.
const modelBase='https://huggingface.co/rhasspy/piper-voices/resolve/5041a7a49ae5b3a0f30e6837769eb03fdbb231bd/';
const voice='nl_NL-mls-medium';
type Engine={generate:(text:string,voice:string,speaker:number)=>Promise<{file:Blob}>;destroy:()=>void};
type Session={engine:Engine;dispose:()=>void};
let session:Session|null=null,queue:Promise<unknown>=Promise.resolve();
const recent=new Map<string,Blob>();
const aborted=()=>new DOMException('Geannuleerd','AbortError');
async function createSession():Promise<Session>{
 const runtimePath='/vendor/piper/piper-tts-web.js';
 const {PiperWebWorkerEngine,HuggingFaceVoiceProvider,OnnxWebWorkerRuntime}=await import(/* webpackIgnore: true */ runtimePath) as typeof import('piper-tts-web');
 const urls=new Map<string,string>(),downloads=new AbortController();
 const provider={
  async fetch(url:string){
   if(urls.has(url))return urls.get(url);
   let cache:Cache|undefined;try{cache=await caches.open('taalcoach-piper-v1')}catch{/* Private mode/storage limits: network still works. */}
   let response=await cache?.match(url);
   if(!response){response=await fetch(url,{signal:downloads.signal});if(!response.ok)throw Error('Stem downloaden mislukt');try{await cache?.put(url,response.clone())}catch{/* Cache is best effort. */}}
   if(url.endsWith('.json'))return response.json();
   const objectURL=URL.createObjectURL(await response.blob());urls.set(url,objectURL);return objectURL;
  },
  destroy(){downloads.abort();for(const url of urls.values())URL.revokeObjectURL(url);urls.clear()}
 };
 try{
  const engine=new PiperWebWorkerEngine({voiceProvider:new HuggingFaceVoiceProvider({provider,baseUrl:modelBase}),onnxRuntime:new OnnxWebWorkerRuntime({numThreads:1}),expressionRuntime:{destroy(){}}});
  return {engine,dispose(){try{engine.destroy()}finally{provider.destroy()}}};
 }catch(e){provider.destroy();throw e}
}
export function localDutchSpeech(text:string,{signal}:{signal?:AbortSignal}={}){
 const task=async()=>{
  if(typeof window==='undefined')throw Error('Lokale spraak werkt alleen in de browser.');
  if(signal?.aborted)throw aborted();
  const cached=recent.get(text);if(cached)return {file:cached};
  let finished=false;let active:Session|null=null,timer:ReturnType<typeof setTimeout>|undefined;
  let cancel:()=>void=()=>{};
  try{
   const work=(async()=>{
    active=session||await createSession();
    if(finished||signal?.aborted){active.dispose();throw aborted()}
    session=active;
    const result=await active.engine.generate(text,voice,0);
    if(!(result.file instanceof Blob)||result.file.size<44)throw Error('Geen geldige spraakaudio');
    return result;
   })();
   const result=await Promise.race([work,new Promise<never>((_,reject)=>{
    cancel=()=>reject(aborted());signal?.addEventListener('abort',cancel,{once:true});
    timer=setTimeout(()=>reject(Error('De lokale stem laden duurt te lang')),90000);
   })]);
   if(signal?.aborted)throw aborted();
   if(recent.size>=3)recent.delete(recent.keys().next().value!);recent.set(text,result.file);
   return result;
  }catch(e){
   // Piper leaves its internal queue busy after failures. Recreate it on retry.
   if(active){try{(active as Session).dispose()}catch{}if(session===active)session=null}
   throw e;
  }finally{finished=true;clearTimeout(timer);signal?.removeEventListener('abort',cancel)}
 };
 const result=queue.then(task,task);queue=result.catch(()=>{});return result;
}
