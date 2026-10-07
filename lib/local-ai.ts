import type {MLCEngineInterface} from '@mlc-ai/web-llm';
export type AIMessage={role:'system'|'user'|'assistant';content:string};
export type AIState={status:'idle'|'loading'|'ready'|'error';progress:number;error:string;busy:boolean};
const initial:AIState={status:'idle',progress:0,error:'',busy:false};
let state=initial,engine:MLCEngineInterface|null=null,worker:Worker|null=null,loading:Promise<void>|null=null;
const listeners=new Set<()=>void>();
export const subscribeAI=(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener)}};
export const getAIState=()=>state;
export const getServerAIState=()=>initial;
function update(next:Partial<AIState>){state={...state,...next};listeners.forEach(f=>f())}
export function startLocalAI(){
 if(engine)return Promise.resolve();if(loading)return loading;
 update({status:'loading',error:'',progress:0});
 loading=(async()=>{
  const gpu=(navigator as Navigator&{gpu?:{requestAdapter:()=>Promise<any>}}).gpu;
  if(!gpu||!await gpu.requestAdapter())throw Error('Deze browser kan lokale AI niet uitvoeren. Open de site in een recente Chrome of Edge op een computer met grafische versnelling. De vaste oefenhints blijven beschikbaar.');
  const {CreateWebWorkerMLCEngine}=await import('@mlc-ai/web-llm');
  const {default:AIWorker}=await import('./ai-worker.ts?worker');
  worker=new AIWorker();
  engine=await CreateWebWorkerMLCEngine(worker,'Qwen3.5-4B-q4f16_1-MLC',{initProgressCallback:p=>update({progress:Math.max(0,Math.min(1,p.progress))})},{context_window_size:4096});
  update({status:'ready',progress:1});
 })().catch(e=>{console.error('De AI-coach model load failed:',e);worker?.terminate();worker=null;engine=null;update({status:'error',error:e instanceof Error&&e.message.startsWith('Deze browser')?e.message:'De AI-coach kon het taalmodel niet laden. Controleer je verbinding en beschikbare opslag, en probeer opnieuw in Chrome of Edge.'});throw e}).finally(()=>{loading=null});
 return loading;
}
let sequence:Promise<unknown>=Promise.resolve();
export function localCompletion(messages:AIMessage[],options:{maxTokens?:number;json?:boolean;signal?:AbortSignal}={}){
 const task=async()=>{
  if(options.signal?.aborted)throw new DOMException('Geannuleerd','AbortError');
  if(!engine)throw Error('Start de AI-coach op dit apparaat om AI en vertaling te gebruiken.');
  update({busy:true});let timedOut=false;
  const cancel=()=>engine?.interruptGenerate();options.signal?.addEventListener('abort',cancel,{once:true});
  const timeout=setTimeout(()=>{timedOut=true;engine?.interruptGenerate()},90000);
  try{
   const system=messages.filter(m=>m.role==='system').slice(0,1);const history:AIMessage[]=[];let chars=0;for(const m of messages.filter(m=>m.role!=='system').reverse()){if(chars+m.content.length>6500&&history.length)break;const content=m.content.slice(-3500);history.unshift({role:m.role,content});chars+=content.length;}while(history[0]?.role==='assistant')history.shift();
   // Streaming requests reset WebLLM's interruption state between requests.
   // A non-streaming request after interruptGenerate can otherwise remain stopped.
   const stream=await engine.chat.completions.create({messages:[...system,...history],stream:true,temperature:options.json?0:0.45,max_tokens:options.maxTokens||320,extra_body:{enable_thinking:false}});
   let output='';for await(const chunk of stream){output+=chunk.choices[0]?.delta?.content||'';}
   if(options.signal?.aborted)throw new DOMException('Geannuleerd','AbortError');
   if(timedOut)throw Error('De AI-coach deed er te lang over. Stel je vraag korter en probeer opnieuw.');
   const content=output.replace(/<think>[\s\S]*?(<\/think>|$)/g,'').trim();
   if(!content)throw Error('Er kwam geen tekst terug. Probeer je vraag opnieuw.');
   return content;
  }catch(e){console.error('De AI-coach generation failed:',e);throw e instanceof Error?e:Error(typeof e==='string'?e:'De AI-coach kon geen antwoord maken. Probeer opnieuw.')}finally{clearTimeout(timeout);options.signal?.removeEventListener('abort',cancel);update({busy:false})}
 };
 const result=sequence.then(task,task);sequence=result.catch(()=>{});return result;
}

if(import.meta.hot)import.meta.hot.dispose(()=>{worker?.terminate();worker=null;engine=null});
