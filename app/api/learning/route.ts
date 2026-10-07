import {z} from 'zod';
import {database,identity,fail} from '@/lib/server';
import {focuses, type LearningState} from '@/lib/learning';
import {assess,adaptiveAdvice,validateAnswers,parseWritingReview,type Assessment,type Evidence} from '@/lib/assessment';
const id=z.string().uuid();
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s=>{const d=new Date(s+'T12:00:00Z');return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===s});
const planSchema=z.object({goal:z.string().trim().min(5).max(1000),focus:z.enum(focuses),aiReason:z.string().max(1000),tasks:z.array(z.object({id,title:z.string().trim().min(3).max(160),date,minutes:z.number().int().min(5).max(120),done:z.boolean(),destination:z.enum(['grammar','atelier','content','missions']),focus:z.enum(focuses)})).min(1).max(14)}).refine(p=>new Set(p.tasks.map(t=>t.id)).size===p.tasks.length);
const entrySchema=z.object({id,kind:z.enum(['beeldverhaal','leesclub','samen','tijdreis']),title:z.string().trim().min(1).max(120),topic:z.string().max(300),source:z.string().max(1000),text:z.string().max(8000),reflection:z.string().max(2000),nextStep:z.string().max(1000),drawing:z.array(z.object({color:z.enum(['#98492f','#34382f','#477b55','#566fc5']),points:z.array(z.tuple([z.number().min(0).max(600),z.number().min(0).max(260)])).min(1).max(300)})).max(80),aiHint:z.string().max(2000),completed:z.boolean()});
async function readState(u:string):Promise<LearningState>{
 const db=database();const [state,entries,checks,evidence]=await Promise.all([
 db.prepare('SELECT plan,draft FROM learning_state WHERE user_id=?').bind(u).first<{plan:string|null;draft:string|null}>(),
 db.prepare('SELECT data,updated_at FROM learning_entries WHERE user_id=? ORDER BY updated_at DESC LIMIT 100').bind(u).all<{data:string;updated_at:string}>(),
 db.prepare('SELECT data FROM learning_assessments WHERE user_id=? ORDER BY created_at DESC LIMIT 1').bind(u).first<{data:string}>(),
 db.prepare('SELECT data FROM learning_evidence WHERE user_id=? ORDER BY created_at DESC LIMIT 60').bind(u).all<{data:string}>()]);
 const assessment:Assessment|null=checks?JSON.parse(checks.data):null,ev:Evidence[]=evidence.results.map(e=>JSON.parse(e.data));
 return{plan:state?.plan?JSON.parse(state.plan):null,draft:state?.draft?JSON.parse(state.draft):null,entries:entries.results.map(e=>({...JSON.parse(e.data),updatedAt:e.updated_at})),assessment,evidence:ev,advice:adaptiveAdvice(assessment,ev)};
}
export async function GET(r:Request){const u=await identity(r);if(!u)return fail('Log in om je leerroute te bekijken.',401);try{return Response.json(await readState(u))}catch(e){console.error('learning-read',e);return fail('Je leerroute kon niet worden geladen. Probeer opnieuw.',503)}}
export async function POST(r:Request){
 const u=await identity(r);if(!u)return fail('Log in om je leerwerk te bewaren.',401);
 let b:any;try{const body=await r.text();if(body.length>300000)return fail('Je werk is te groot om op te slaan.');b=JSON.parse(body)}catch{return fail('Ongeldige invoer.')}
 if(!b||typeof b!=='object'||Array.isArray(b))return fail('Ongeldige invoer.');
 const now=new Date().toISOString();
 try{
 const db=database();
 if(b.action==='plan'){
  const parsed=planSchema.safeParse(b.plan);if(!parsed.success)return fail('Controleer je leerdoel, datums en oefentijd (5–120 minuten).');
  await db.prepare('INSERT INTO learning_state(user_id,plan,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET plan=excluded.plan,updated_at=excluded.updated_at').bind(u,JSON.stringify(parsed.data),now).run();
 }else if(b.action==='entry'){
  const p=entrySchema.safeParse(b.entry);if(!p.success)return fail('Controleer je tekst en tekening. Je invoer blijft staan.');const entry=p.data;
  if(entry.completed&&(entry.text.trim().split(/\s+/).length<15||entry.reflection.trim().length<10||entry.nextStep.trim().length<5))return fail('Schrijf minstens 15 woorden, een korte terugblik en je volgende stap.');
  const statements=[db.prepare('INSERT INTO learning_entries(id,user_id,data,updated_at) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at WHERE learning_entries.user_id=excluded.user_id').bind(u+':'+entry.id,u,JSON.stringify(entry),now)];
  if(entry.completed)statements.push(db.prepare('INSERT INTO activities(id,user_id,kind,skill,xp,date,detail) VALUES(?,?,?,?,?,?,?) ON CONFLICT DO NOTHING').bind(u+':atelier:'+entry.id,u,'atelier','Schrijven',20,now,JSON.stringify({title:entry.title})));
  await db.batch(statements);
 }else if(b.action==='draft'||b.action==='assessment'){
  const finished=b.action==='assessment',p=b.input,answers=validateAnswers(p?.answers,finished);
  if(!id.safeParse(b.id).success||!answers||typeof p?.writing!=='string'||p.writing.length>4000||typeof p.assisted!=='boolean')return fail('Controleer de invoer van je niveaucheck.');
  if(finished&&p.writing.trim().split(/\s+/).length<20)return fail('Schrijf minstens 20 woorden, zodat er een eigen schrijfvoorbeeld is.');
  const input={answers,writing:p.writing,assisted:p.assisted,review:parseWritingReview(p.review,p.writing)};
  if(!finished){await db.prepare('INSERT INTO learning_state(user_id,draft,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET draft=excluded.draft,updated_at=excluded.updated_at').bind(u,JSON.stringify({id:b.id,input}),now).run();}
  else{
   const assessment:Assessment={id:b.id,createdAt:now,input,result:assess(input)};
   await db.batch([
    db.prepare('INSERT INTO learning_assessments(id,user_id,data,created_at) VALUES(?,?,?,?) ON CONFLICT DO NOTHING').bind(u+':'+b.id,u,JSON.stringify(assessment),now),
    db.prepare('INSERT INTO learning_state(user_id,draft,updated_at) VALUES(?,NULL,?) ON CONFLICT(user_id) DO UPDATE SET draft=NULL,updated_at=excluded.updated_at').bind(u,now)
   ]);
  }
 }else{return fail('Onbekende actie.')}
 return Response.json(await readState(u));
 }catch(e){console.error('learning-save',e);return fail('Opslaan lukte niet. Je invoer blijft staan. Probeer opnieuw.',503)}
}
