import type {AutomaticSpeechRecognitionPipeline} from '@huggingface/transformers';
let recognizer:AutomaticSpeechRecognitionPipeline|null=null;
self.onmessage=async(event:MessageEvent<{id:number;audio:Float32Array}>)=>{
 const {id,audio}=event.data;
 try{
  if(!recognizer){
   const runtimeURL=new URL('/vendor/speech/transformers.min.js',self.location.origin).href;
   const {env,pipeline}=await import(/* @vite-ignore */ runtimeURL) as typeof import('@huggingface/transformers');
   env.allowLocalModels=false;
   if(env.backends.onnx.wasm){env.backends.onnx.wasm.numThreads=1;env.backends.onnx.wasm.wasmPaths=new URL('/vendor/speech/',self.location.origin).href}
   const createRecognizer=pipeline as unknown as (task:'automatic-speech-recognition',model:string,options:Record<string,unknown>)=>Promise<AutomaticSpeechRecognitionPipeline>;
   const files=new Map<string,{loaded:number;total:number}>();
   recognizer=await createRecognizer('automatic-speech-recognition','onnx-community/whisper-base',{device:'wasm',dtype:'q8',progress_callback:(p:any)=>{if(p.status==='progress'&&p.total){files.set(p.file,{loaded:p.loaded,total:p.total});const all=[...files.values()];self.postMessage({id,type:'progress',progress:all.reduce((n,f)=>n+f.loaded,0)/all.reduce((n,f)=>n+f.total,0)})}}});
  }
  self.postMessage({id,type:'transcribing'});
  const result=await recognizer(audio,{language:'dutch',task:'transcribe',chunk_length_s:30,stride_length_s:5,max_new_tokens:256});
  const output=Array.isArray(result)?result[0].text:result.text;
  self.postMessage({id,type:'result',text:output.trim()});
 }catch(error){console.error('Speech recognition failed',error);self.postMessage({id,type:'error',message:'Spraakherkenning is niet gelukt. Controleer je internetverbinding bij de eerste download en probeer opnieuw.'})}
};
