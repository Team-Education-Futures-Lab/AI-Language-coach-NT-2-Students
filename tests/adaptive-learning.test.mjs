import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import ts from 'typescript';
import {calculateProgress} from '../lib/progression.ts';
import {assignmentPeriod,assignmentView,generatedSchema,parseGeneratedExercise} from '../lib/assignment-schema.ts';
import {avoidsAnswer} from '../lib/tutor-guard.ts';
const db=new PGlite();
before(async()=>{await db.exec('CREATE ROLE anon; CREATE ROLE authenticated;');for(const f of ['202610070001_platform.sql','202610130001_adaptive_learning.sql','202610130003_json_payloads.sql'])await db.exec(await readFile(new URL('../supabase/migrations/'+f,import.meta.url),'utf8'))});
after(()=>db.close());
async function queryFrom(file,contains){const source=await readFile(new URL('../'+file,import.meta.url),'utf8');const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);let found;function visit(n){if(ts.isCallExpression(n)&&ts.isPropertyAccessExpression(n.expression)&&n.expression.name.text==='prepare'&&ts.isStringLiteralLike(n.arguments[0])&&n.arguments[0].text.includes(contains))found=n.arguments[0].text;ts.forEachChild(n,visit)}visit(ast);assert.ok(found);let i=0;return found.replace(/\?/g,()=>`$${++i}`)}
test('monthly deadlines preserve end-of-month and daily periods are stable',()=>{
 assert.deepEqual(assignmentPeriod('2026-01-31T09:00:00Z',30,new Date('2026-02-28T12:00:00Z')),{start:'2026-02-28T09:00:00.000Z',due:'2026-03-31T09:00:00.000Z'});
 assert.deepEqual(assignmentPeriod('2026-10-01T08:00:00Z',2,new Date('2026-10-13T07:59:59Z')),{start:'2026-10-11T08:00:00.000Z',due:'2026-10-13T08:00:00.000Z'});
});
test('XP alone cannot unlock a level; progress requires streaks and never exceeds C2',()=>{
 assert.equal(calculateProgress(Array.from({length:300},()=>({xp:20,date:'2026-10-12'}))).level,'A1');
 const rows=Array.from({length:30},(_,i)=>Array.from({length:10},()=>({xp:20,date:new Date(Date.UTC(2026,8,i+1)).toISOString()}))).flat();
 assert.equal(calculateProgress(rows).level,'C2');assert.equal(calculateProgress(rows,'A2').level,'A2');assert.equal(calculateProgress([]).level,'A1');
});
test('changing an interval updates the countdown and requires the correct current period',()=>{
 const row={exercise:{title:'Bestaande opdracht'},period_start:'2026-10-12T09:00:00Z',due_at:'2026-10-19T09:00:00Z',last_error:null};
 const now=new Date('2026-10-15T10:00:00Z');
 const longer=assignmentView([row],assignmentPeriod(row.period_start,14,now));
 assert.equal(longer.pending,false);assert.equal(longer.dueAt,'2026-10-26T09:00:00.000Z');
 const shorter=assignmentView([row],assignmentPeriod(row.period_start,1,now));
 assert.equal(shorter.pending,true);assert.equal(shorter.exercise.title,'Bestaande opdracht');
 const backdated={...row,period_start:'2026-10-01T09:00:00Z'};
 assert.equal(assignmentView([row,backdated],{start:backdated.period_start,due:'2026-11-01T09:00:00Z'}).pending,false);
});
test('generated questions reject invalid answer indices and incomplete reading tasks',()=>{
 const sample={category:'lezen',level:'A1',title:'Een korte tekst',description:'Lees de tekst en kies het antwoord.',minutes:5,passage:'Sam gaat naar school.',questions:Array.from({length:3},()=>({prompt:'Waar gaat Sam heen?',options:['School','Huis'],correct:0,explanation:'Sam gaat naar school.'}))};
 assert.equal(generatedSchema.safeParse(sample).success,true);assert.equal(generatedSchema.safeParse({...sample,passage:undefined}).success,false);
 assert.deepEqual(parseGeneratedExercise(JSON.stringify({level:'A1',exercise:sample})),sample);
 assert.throws(()=>parseGeneratedExercise(JSON.stringify({exercise:{...sample,passage:undefined}})));
 assert.equal(generatedSchema.safeParse({...sample,questions:sample.questions.map(q=>({...q,correct:3}))}).success,false);
 const writing={category:'schrijven',level:'A1',title:'Een kort bericht',description:'Schrijf een bericht aan een collega.',minutes:5,writing:{prompt:'Vertel je collega wanneer je naar het laboratorium komt.',minWords:10,maxWords:30,checklist:['Ik noem een dag.','Ik noem een tijd.'],example:'Hallo Sam, ik kom morgen om negen uur. Tot morgen!'}};
 assert.deepEqual(generatedSchema.parse(writing).questions,[]);
 assert.equal(generatedSchema.safeParse({...writing,writing:{...writing.writing,example:'Dit is te kort.'}}).success,false);
 assert.equal(generatedSchema.safeParse({...sample,questions:undefined}).success,false);
});
test('tutor output guard catches solved answers without blocking ordinary Dutch articles',()=>{
 assert.equal(avoidsAnswer('Bij ik hoort: ik leer.',['leer']),false);
 assert.equal(avoidsAnswer('Je zegt: ik ga.',['ga']),false);
 assert.equal(avoidsAnswer('Het goede antwoord is de.',['de']),false);
 assert.equal(avoidsAnswer('Kies optie B.',['een']),false);
 assert.equal(avoidsAnswer('Zoek het onderwerp. Vergelijk: ik fiets en hij fietst. Wat verandert er?',['leer']),true);
 assert.equal(avoidsAnswer('Is het woord in de vraag een meervoud?',['de','het']),true);
});
test('generation lease prevents duplicate calls, retry preserves previous version and owner isolation',async()=>{
 const claim=await queryFrom('lib/server-assignments.ts','INSERT INTO generated_exercises');
 const values=['task-1','student-1','weekly','2026-10-12','2026-10-19'];
 assert.equal((await db.query(claim,values)).rows.length,1);assert.equal((await db.query(claim,['task-2',...values.slice(1)])).rows.length,0);
 await db.query("UPDATE generated_exercises SET exercise=$1::jsonb,lease_until=NULL WHERE id='task-1'",[JSON.stringify({id:'task-1',title:'Eerste opdracht'})]);
 assert.equal((await db.query(claim,['task-3',...values.slice(1)])).rows.length,0);
 assert.equal((await db.query(claim,['task-next','student-1','weekly','2026-10-19','2026-10-26'])).rows.length,1);
 const lookup=await queryFrom('app/api/exercises/route.ts','SELECT exercise FROM generated_exercises');assert.equal((await db.query(lookup,['task-1','other-student'])).rows.length,0);assert.equal((await db.query(lookup,['task-1','student-1'])).rows.length,1);
});
test('AI quota is atomic and denies calls once free cap is reached',async()=>{
 const query=await queryFrom('lib/server-ai.ts','WITH allowance');for(let i=0;i<3;i++)assert.equal((await db.query(query,['test',3])).rows.length,1);assert.equal((await db.query(query,['test',3])).rows.length,0);
});
test('JSON cache and generated exercises reject double-encoded payloads',async()=>{
 const insert=await queryFrom('app/api/translate/route.ts','INSERT INTO translation_cache');
 await db.query(insert,['translation-test',JSON.stringify(['Hello','Your exercise'])]);
 assert.deepEqual((await db.query("SELECT translations FROM translation_cache WHERE key='translation-test'")).rows[0].translations,['Hello','Your exercise']);
 await assert.rejects(db.query("INSERT INTO translation_cache(key,translations) VALUES('bad',$1::jsonb)",[JSON.stringify(JSON.stringify(['Hello']))]),/translation_cache_array/);
 await assert.rejects(db.query("UPDATE generated_exercises SET exercise=$1::jsonb WHERE id='task-1'",[JSON.stringify(JSON.stringify({title:'bad'}))]),/generated_exercise_object/);
});
test('all adaptive tables and scheduler credential deny public REST access',async()=>{
 for(const role of ['anon','authenticated'])for(const table of ['ai_usage','translation_cache','student_levels','assignment_schedules','generated_exercises','scheduler_secret']){await db.exec(`SET ROLE ${role}`);await assert.rejects(db.query('SELECT * FROM '+table),/permission denied/);await db.exec('RESET ROLE')}
});
test('teacher level lookup cannot reach students in another teacher classroom',async()=>{
 await db.query("INSERT INTO classrooms(id,teacher_id,name,created_at,updated_at) VALUES('a','teacher-a','A','2026-10-13','2026-10-13'),('b','teacher-b','B','2026-10-13','2026-10-13')");
 await db.query("INSERT INTO classroom_members(classroom_id,student_id,joined_at) VALUES('a','s-a','2026-10-13'),('b','s-b','2026-10-13')");
 const query=await queryFrom('app/api/teacher/route.ts','SELECT cm.student_id FROM classroom_members');assert.equal((await db.query(query,['s-a','teacher-a'])).rows.length,1);assert.equal((await db.query(query,['s-b','teacher-a'])).rows.length,0);
});
