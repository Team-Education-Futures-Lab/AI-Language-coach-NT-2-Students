import 'server-only';
import {authenticatedUser} from './auth';
import {database} from './database';
export {database};
export async function identity(r:Request){
 if(!['GET','HEAD','OPTIONS'].includes(r.method)){
  const origin=r.headers.get('origin');
  if(origin&&origin!==new URL(r.url).origin)return null;
 }
 return (await authenticatedUser())?.id??null;
}
export type UserRole='teacher_admin'|'student';
export async function currentUser(r:Request){
 const id=await identity(r);if(!id)return null;
 const auth=await authenticatedUser();if(!auth)return null;
 const email=(auth.email||`${id}@demo.invalid`).toLowerCase(),name=String(auth.user_metadata?.full_name||auth.email||'Demoleerling').slice(0,160),now=new Date().toISOString(),db=database();
 const configured=(process.env.TEACHER_ADMIN_EMAILS||'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean);
 // Never trust a client-provided role or unverified email.
 const role:UserRole=!auth.is_anonymous&&!!auth.email_confirmed_at&&configured.includes(email)?'teacher_admin':'student';
 await db.prepare('INSERT INTO users (id,email,display_name,role,created_at,updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET email=excluded.email,display_name=excluded.display_name,role=excluded.role,updated_at=excluded.updated_at').bind(id,email,name,role,now,now).run();
 return {id,email,display_name:name,role};
}
export async function requireTeacher(r:Request){const user=await currentUser(r);if(!user)return {error:fail('Log in om het docentbeheer te openen.',401)};if(user.role!=='teacher_admin')return {error:fail('Dit onderdeel is alleen beschikbaar voor docenten.',403)};return {user};}
// This free demo never enables billable model requests, even if a key is present.
export function apiKey():string|undefined{return undefined;}
export function fail(message:string,status=400){return Response.json({error:message},{status});}
