import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import ts from 'typescript';
const db=new PGlite();
const migration=await readFile(new URL('../supabase/migrations/202610070001_platform.sql',import.meta.url),'utf8');
before(async()=>{await db.exec('CREATE ROLE anon; CREATE ROLE authenticated;');await db.exec(migration)});
after(()=>db.close());
async function queryFrom(file,contains){
 const text=await readFile(new URL('../'+file,import.meta.url),'utf8'),sf=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true);let found;
 function visit(n){if(ts.isCallExpression(n)&&ts.isPropertyAccessExpression(n.expression)&&n.expression.name.text==='prepare'&&n.arguments[0]&&ts.isStringLiteralLike(n.arguments[0])&&n.arguments[0].text.includes(contains))found=n.arguments[0].text;ts.forEachChild(n,visit)}visit(sf);assert.ok(found,`${file}: ${contains}`);let i=0;return found.replace(/\?/g,()=>`$${++i}`);
}
test('schema can be applied again and all 12 app tables have RLS',async()=>{await db.exec(migration);const {rows}=await db.query("SELECT count(*)::int AS n FROM pg_tables WHERE schemaname='public' AND rowsecurity");assert.equal(rows[0].n,12)});
test('profile and coach saves preserve each other',async()=>{
 const profile=await queryFrom('app/api/profile/route.ts','INSERT INTO profiles'),coach=await queryFrom('app/api/coach-preferences/route.ts','INSERT INTO profiles');
 await db.query(profile,['alice',JSON.stringify({name:'Alice',level:'A1'}),'2026-10-07']);
 await db.query(coach,['alice',JSON.stringify({name:'Default',coach:{name:'Nova',character:'owl'}}),'2026-10-07']);
 await db.query(profile,['alice',JSON.stringify({name:'Alice',level:'A2'}),'2026-10-07']);
 const {rows}=await db.query('SELECT data FROM profiles WHERE user_id=$1',['alice']);const data=JSON.parse(rows[0].data);assert.equal(data.name,'Alice');assert.equal(data.level,'A2');assert.equal(data.coach.name,'Nova');
});
test('repeated exercise completion awards XP only once and stays complete',async()=>{
 const activity=await queryFrom('app/api/exercises/route.ts','INSERT INTO activities');
 const values=['alice:exercise:1','alice','exercise','Spelling',20,'2026-10-07','{}'];
 assert.equal((await db.query(activity,values)).affectedRows,1);assert.equal((await db.query(activity,values)).affectedRows,0);
 const work=await queryFrom('app/api/exercises/route.ts','INSERT INTO exercise_work');
 await db.query(work,['alice:1','alice','1','{}',1,'2026-10-07']);await db.query(work,['alice:1','alice','1','{}',0,'2026-10-07']);
 assert.equal((await db.query('SELECT completed FROM exercise_work WHERE id=$1',['alice:1'])).rows[0].completed,1);
});
test('another owner cannot replace a lesson with the same ID',async()=>{
 const lesson=await queryFrom('app/api/state/route.ts','INSERT INTO lessons');
 await db.query(lesson,['lesson-1','teacher-a','Origineel','A1','Inhoud','draft']);
 await db.query(lesson,['lesson-1','teacher-b','Overschreven','A1','Inhoud','draft']);
 assert.equal((await db.query('SELECT title FROM lessons WHERE id=$1',['lesson-1'])).rows[0].title,'Origineel');
});
test('Supabase anon and authenticated REST roles cannot read profiles',async()=>{
 for(const role of ['anon','authenticated']){await db.exec(`SET ROLE ${role}`);await assert.rejects(db.query('SELECT * FROM profiles'),/permission denied/);await db.exec('RESET ROLE')}
});
