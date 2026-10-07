import {database,identity,fail} from '@/lib/server';
import {exercises,canComplete,isCorrect,skillFor,type ExerciseData} from '@/lib/exercises';
export async function GET(r:Request){
 const u=await identity(r);if(!u)return fail('Log in om je oefeningen te bewaren.',401);
 try{const result=await database().prepare('SELECT exercise_id,data,completed,updated_at FROM exercise_work WHERE user_id = ?').bind(u).all();return Response.json({work:result.results.map(row=>({...row,data:JSON.parse(String(row.data))}))});}
 catch{return fail('Je oefeningen kunnen niet worden geladen. Probeer opnieuw.',503)}
}
export async function POST(r:Request){
 const u=await identity(r);if(!u)return fail('Log in om op te slaan.',401);
 let body:any;try{body=await r.json()}catch{return fail('Ongeldige invoer.')}
 const ex=exercises.find(e=>e.id===body?.exerciseId),raw=body?.data;
 if(!ex||!raw||typeof body.complete!=='boolean'||!Array.isArray(raw.answers)||!Array.isArray(raw.checks)||typeof raw.text!=='string'||raw.text.length>10000||raw.answers.length>ex.questions.length||raw.checks.length>(ex.writing?.checklist.length||0))return fail('Ongeldige oefening of invoer.');
 if(raw.answers.some((a:unknown,i:number)=>typeof a!=='string'||a.length>250||(a!==''&&ex.questions[i].options&&!ex.questions[i].options?.some((_,n)=>a===String(n))))||raw.checks.some((c:unknown)=>typeof c!=='boolean'))return fail('Controleer je antwoorden.');
 const data:ExerciseData={answers:ex.questions.map((_,i)=>raw.answers[i]||''),text:raw.text,checks:(ex.writing?.checklist||[]).map((_,i)=>raw.checks[i]===true),assisted:raw.assisted===true};
 if(body.complete&&!canComplete(ex,data))return fail(ex.writing?'Houd je aan het aantal woorden en loop alle controlepunten na.':'Beantwoord eerst alle vragen.');
 const correct=ex.questions.map((q,i)=>isCorrect(q,data.answers[i])),score=correct.filter(Boolean).length;
 try{
  const db=database(),now=new Date().toISOString();
  const prior=body.complete?await db.prepare('SELECT completed FROM exercise_work WHERE id=? AND user_id=?').bind(u+':'+ex.id,u).first<{completed:number}>():null;
  const statements=[db.prepare('INSERT INTO exercise_work (id,user_id,exercise_id,data,completed,updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,completed=GREATEST(exercise_work.completed,excluded.completed),updated_at=excluded.updated_at').bind(u+':'+ex.id,u,ex.id,JSON.stringify(data),body.complete?1:0,now)];
  if(body.complete)statements.push(db.prepare('INSERT INTO activities (id,user_id,kind,skill,xp,date,detail) VALUES (?,?,?,?,?,?,?) ON CONFLICT DO NOTHING').bind(u+':exercise:'+ex.id,u,'exercise',skillFor(ex.category),20,now,JSON.stringify({title:ex.title,exerciseId:ex.id,score,total:ex.questions.length,selfAssessed:!!ex.writing})));
  if(body.complete&&!ex.writing&&!prior?.completed){const evidence={exerciseId:ex.id,level:ex.level,skill:ex.category==='grammatica'?ex.focus||'Taalvormen':skillFor(ex.category),score,total:ex.questions.length,assisted:data.assisted===true,date:now};statements.push(db.prepare('INSERT INTO learning_evidence(id,user_id,data,created_at) VALUES(?,?,?,?) ON CONFLICT DO NOTHING').bind(u+':'+ex.id,u,JSON.stringify(evidence),now));}
  const result=await db.batch(statements);
  return Response.json({ok:true,updatedAt:now,...(body.complete?{correct,score,total:ex.questions.length,xp:result[1].meta.changes?20:0}:{})});
 }catch{return fail('Opslaan is niet gelukt. Je antwoorden blijven staan; probeer opnieuw.',503)}
}
