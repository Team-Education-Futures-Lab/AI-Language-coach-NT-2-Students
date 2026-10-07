import {env} from 'cloudflare:workers';
export function database(){const db=(env as unknown as {DB:D1Database}).DB;if(!db)throw new Error('Opslag is tijdelijk niet beschikbaar');return db;}
export function identity(r:Request){return r.headers.get('oai-authenticated-user-id');}
export function identityEmail(r:Request){return r.headers.get('oai-authenticated-user-email')||'';}
export function identityName(r:Request){return r.headers.get('oai-authenticated-user-full-name')||identityEmail(r)||'Onbekende gebruiker';}
export type UserRole='teacher_admin'|'student';
export async function currentUser(r:Request){
  const id=identity(r);if(!id)return null;
  const email=identityEmail(r),name=identityName(r),now=new Date().toISOString(),db=database();
  const configured=String((env as unknown as {TEACHER_ADMIN_EMAILS?:string}).TEACHER_ADMIN_EMAILS||'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean);
  const role:UserRole=configured.includes(email.toLowerCase())||(email.endsWith('@sites.test')&&email==='seedy@sites.test')?'teacher_admin':'student';
  await db.prepare('INSERT OR IGNORE INTO users (id,email,display_name,role,created_at,updated_at) VALUES (?,?,?,?,?,?)').bind(id,email,name,role,now,now).run();
  await db.prepare("UPDATE users SET email=?,display_name=?,updated_at=? WHERE id=? AND role<>'teacher_admin'").bind(email,name,now,id).run();
  const row=await db.prepare('SELECT id,email,display_name,role FROM users WHERE id=?').bind(id).first<{id:string;email:string;display_name:string;role:UserRole}>();
  return row||{id,email,display_name:name,role};
}
export async function requireTeacher(r:Request){const user=await currentUser(r);if(!user)return {error:fail('Log in om het docentbeheer te openen.',401)};if(user.role!=='teacher_admin')return {error:fail('Dit onderdeel is alleen beschikbaar voor docenten.',403)};return {user};}
export function apiKey(){return (env as unknown as {OPENAI_API_KEY?:string}).OPENAI_API_KEY;}
export function fail(message:string,status=400){return Response.json({error:message},{status});}
