import 'server-only';
import {database} from './database';
import {exercises} from './exercises';
import {rotatedExercise} from './server-rotations';
export type PortfolioSource={key:string;title:string;kind:string;date:string;snapshot:Record<string,any>};
const parse=(raw:unknown)=>{try{return typeof raw==='string'?JSON.parse(raw):raw}catch{return null}};
export async function portfolioSources(userId:string):Promise<PortfolioSource[]>{
 const db=database();const [work,entries,activities]=await Promise.all([
 db.prepare('SELECT w.exercise_id,w.data,w.completed,w.updated_at,g.exercise FROM exercise_work w LEFT JOIN generated_exercises g ON g.id=w.exercise_id AND g.user_id=w.user_id WHERE w.user_id=? ORDER BY w.updated_at DESC LIMIT 100').bind(userId).all<any>(),
 db.prepare('SELECT id,data,updated_at FROM learning_entries WHERE user_id=? ORDER BY updated_at DESC LIMIT 100').bind(userId).all<any>(),
 db.prepare("SELECT id,kind,skill,date,detail FROM activities WHERE user_id=? AND kind IN ('mission','sentence','editor','register','arcade-catcher','arcade-memory','arcade-spelling') ORDER BY date DESC LIMIT 100").bind(userId).all<any>()]);
 const sources:PortfolioSource[]=[];
 for(const w of work.results){const ex=w.exercise||exercises.find(x=>x.id===w.exercise_id)||await rotatedExercise(userId,w.exercise_id);if(!ex)continue;const data=parse(w.data)||{};sources.push({key:'exercise:'+w.exercise_id,title:ex.title,kind:ex.category,date:w.updated_at,snapshot:{prompt:ex.writing?.prompt||ex.description,level:ex.level,passage:ex.passage||'',text:data.text||'',answers:ex.questions.map((q:any,i:number)=>({question:q.prompt,answer:data.answers?.[i]?q.options?q.options[Number(data.answers[i])]||'':data.answers[i]:''})),completed:!!w.completed,assisted:!!data.assisted}})}
 for(const e of entries.results){const data=parse(e.data);if(data)sources.push({key:'atelier:'+data.id,title:data.title,kind:'atelier',date:e.updated_at,snapshot:{...data,prompt:data.task?.prompt||'',level:''}})}
 for(const a of activities.results){const d=parse(a.detail);sources.push({key:'activity:'+a.id,title:d?.title||(a.kind==='mission'?'Gesprek met mijn coach':a.skill+' · taalspel'),kind:a.kind==='mission'?'gesprek':'spel',date:a.date,snapshot:{text:d?undefined:String(a.detail),messages:d?.messages||[],feedback:d?.feedback||'',completed:true}})}
 return sources.sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime());
}
export async function readPortfolio(userId:string){const [items,sources]=await Promise.all([database().prepare('SELECT id,source_key,title,kind,snapshot,reflection,next_step,featured,created_at,updated_at FROM portfolio_items WHERE user_id=? ORDER BY featured DESC,updated_at DESC').bind(userId).all(),portfolioSources(userId)]);return {items:items.results,sources}}
