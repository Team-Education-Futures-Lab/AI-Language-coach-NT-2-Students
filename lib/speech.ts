let worker:Worker|null=null,serial:Promise<unknown>=Promise.resolve(),nextId=0;
export function transcribeAudio(audio:Float32Array,options:{signal?:AbortSignal;onProgress?:(progress:number|null)=>void}={}){
 const task=async()=>{
  if(options.signal?.aborted)throw new DOMException('Geannuleerd','AbortError');
  if(!worker)worker=new Worker('/vendor/speech/worker.js',{type:'module'});
  const current=worker,id=++nextId;
  return new Promise<string>((resolve,reject)=>{
   let settled=false;
   function finish(error?:Error,text=''){if(settled)return;settled=true;clearTimeout(timeout);current.removeEventListener('message',onMessage);current.removeEventListener('error',onError);options.signal?.removeEventListener('abort',abort);error?reject(error):resolve(text)}
   function stop(){current.terminate();if(worker===current)worker=null}
   function abort(){stop();finish(new DOMException('Geannuleerd','AbortError'))}
   function onError(){stop();finish(Error('Spraak kon niet worden gestart in deze browser. Probeer opnieuw in Chrome of Edge.'))}
   function onMessage(e:MessageEvent){const d=e.data;if(d.id!==id)return;if(d.type==='progress')options.onProgress?.(d.progress);else if(d.type==='transcribing')options.onProgress?.(null);else if(d.type==='result'){if(!d.text||/^\s*[[(].*[)\]]\s*$/.test(d.text))finish(Error('Ik hoorde geen duidelijke woorden. Spreek iets dichter bij je microfoon en probeer opnieuw.'));else finish(undefined,d.text)}else if(d.type==='error'){stop();finish(Error(d.message))}}
   const timeout=setTimeout(()=>{stop();finish(Error('Het laden of herkennen duurt te lang. Probeer een kortere opname.'))},180000);
   current.addEventListener('message',onMessage);current.addEventListener('error',onError);options.signal?.addEventListener('abort',abort,{once:true});
   if(options.signal?.aborted){abort();return}
   current.postMessage({id,audio},[audio.buffer]);
  });
 };
 const result=serial.then(task,task);serial=result.catch(()=>{});return result;
}
export async function audioSamples(blob:Blob){
 const context=new AudioContext();
 try{
  const decoded=await context.decodeAudioData(await blob.arrayBuffer());
  if(decoded.duration<.4)throw Error('Je opname is nog erg kort. Spreek minstens één korte zin.');
  if(decoded.duration>35)throw Error('Gebruik een opname van maximaal 30 seconden.');
  const offline=new OfflineAudioContext(1,Math.ceil(decoded.duration*16000),16000),source=offline.createBufferSource();source.buffer=decoded;source.connect(offline.destination);source.start();
  const rendered=await offline.startRendering(),samples=new Float32Array(rendered.getChannelData(0));
  const energy=Math.sqrt(samples.reduce((sum,s)=>sum+s*s,0)/samples.length);
  if(energy<.002)throw Error('Ik hoorde alleen stilte. Controleer je microfoon en probeer opnieuw.');
  return samples;
 }finally{await context.close()}
}
export const spokenText=(text:string)=>text.replace(/[*#_`]/g,'').replace(/→/g,' wordt ').replace(/https?:\/\/\S+/g,'').trim();
