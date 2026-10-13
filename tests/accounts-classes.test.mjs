import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import ts from 'typescript';
const db=new PGlite();
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const migration=await read('supabase/migrations/202610130006_accounts_classes.sql');
async function queryFrom(file,contains){let found;const sf=ts.createSourceFile(file,await read(file),ts.ScriptTarget.Latest,true);function visit(n){if(ts.isCallExpression(n)&&ts.isPropertyAccessExpression(n.expression)&&n.expression.name.text==='prepare'&&n.arguments[0]&&ts.isStringLiteralLike(n.arguments[0])&&n.arguments[0].text.includes(contains))found=n.arguments[0].text;ts.forEachChild(n,visit)}visit(sf);assert.ok(found);let i=0;return found.replace(/\?/g,()=>`$${++i}`)}
before(async()=>{await db.exec("CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY,raw_user_meta_data jsonb,is_anonymous boolean);");await db.exec(await read('supabase/migrations/202610070001_platform.sql'));await db.exec(migration)});
after(()=>db.close());
test('registration choice is captured once and anonymous users stay students',async()=>{
 const teacher='00000000-0000-4000-8000-000000000001',guest='00000000-0000-4000-8000-000000000002';
 await db.query('INSERT INTO auth.users VALUES($1,$2,false),($3,$2,true)',[teacher,{account_type:'teacher'},guest]);
 await db.query("UPDATE auth.users SET raw_user_meta_data='{}' WHERE id=$1",[teacher]);
 assert.equal((await db.query('SELECT account_type FROM account_registrations WHERE user_id=$1',[teacher])).rows[0].account_type,'teacher');
 assert.equal((await db.query('SELECT account_type FROM account_registrations WHERE user_id=$1',[guest])).rows[0].account_type,'student');
 await db.exec(migration);
 assert.equal((await db.query('SELECT account_type FROM account_registrations WHERE user_id=$1',[teacher])).rows[0].account_type,'teacher');
});
test('invitation acceptance is email-scoped, atomic, expires and keeps cohort visible only to members',async()=>{
 await db.exec("INSERT INTO users VALUES('teacher','teacher@example.com','Docent','teacher_admin','now','now'); INSERT INTO classrooms(id,teacher_id,name,description,cohort,created_at,updated_at) VALUES('class','teacher','NT2','Ochtend','2026–2027','now','now');");
 const insert=await queryFrom('app/api/teacher/route.ts','INSERT INTO classroom_invitations'),accept=await queryFrom('app/api/classes/route.ts','WITH invitation AS');
 await db.query(insert,['class','student@example.com']);
 const id=(await db.query('SELECT id FROM classroom_invitations')).rows[0].id;
 assert.equal((await db.query(accept,[id,'other@example.com','other','now'])).rows.length,0);
 assert.equal((await db.query(accept,[id,'student@example.com','student','now'])).rows.length,1);
 assert.equal((await db.query(accept,[id,'student@example.com','student','now'])).rows.length,0);
 const classes=await queryFrom('app/api/classes/route.ts','WHERE cm.student_id=?');
 assert.equal((await db.query(classes,['student'])).rows[0].cohort,'2026–2027');assert.equal((await db.query(classes,['other'])).rows.length,0);
 await db.query(insert,['class','late@example.com']);await db.exec("UPDATE classroom_invitations SET expires_at=now()-interval '1 day'");const late=(await db.query('SELECT id FROM classroom_invitations')).rows[0].id;
 assert.equal((await db.query(accept,[late,'late@example.com','late','now'])).rows.length,0);
});
test('registration choices and invitations are not exposed through public database roles',async()=>{for(const role of ['anon','authenticated']){await db.exec('SET ROLE '+role);for(const table of ['account_registrations','classroom_invitations'])await assert.rejects(db.query('SELECT * FROM '+table),/permission denied/);await db.exec('RESET ROLE')}});
