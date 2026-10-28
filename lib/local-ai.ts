// Compatibility facade: all inference runs on the server, never in a downloaded browser model.
export type AIMessage={role:'system'|'user'|'assistant';content:string};
export type AIState={status:'idle'|'loading'|'ready'|'error';progress:number;error:string;busy:boolean};
const initial:AIState={status:'idle',progress:0,error:'',busy:false};
let state=initial,loading:Promise<void>|null=null,active=0;
const listeners=new Set<()=>void>();
export const subscribeAI=(f:()=>void)=>{listeners.add(f);return()=>{listeners.delete(f)}};
export const getAIState=()=>state;
export const getServerAIState=()=>initial;
function update(next:Partial<AIState>){state={...state,...next};listeners.forEach(f=>f())}
export function startLocalAI(){
 if(state.status==='ready')return Promise.resolve();if(loading)return loading;
 update({status:'loading',error:''});
 loading=fetch('/api/ai').then(async r=>{const j=await r.json() as any;if(!r.ok||!j.ready)throw Error(j.error||'De gratis AI-verbinding wordt nog ingesteld. Je kunt wel blijven oefenen.');update({status:'ready',progress:1})}).catch(e=>{update({status:'error',error:e.message});throw e}).finally(()=>{loading=null});return loading;
}
export async function localCompletion(messages:AIMessage[],options:{maxTokens?:number;json?:boolean;tutor?:boolean;language?:string;signal?:AbortSignal}={}){
 if(options.signal?.aborted)throw new DOMException('Geannuleerd','AbortError');
 active++;update({busy:true});
 try{const r=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages,maxTokens:options.maxTokens,json:options.json,tutor:options.tutor,language:options.language}),signal:options.signal});const j=await r.json() as any;if(!r.ok)throw Error((j.error||'De AI is tijdelijk niet beschikbaar.')+(j.retryAfter?' Probeer over '+Math.ceil(j.retryAfter/60)+' minuten opnieuw.':''));update({status:'ready',error:''});return String(j.text)}finally{active--;update({busy:active>0})}
}
