import {timingSafeEqual} from 'node:crypto';
import {database,fail} from '@/lib/server';
import {nextAssignment,schedulesFor} from '@/lib/server-assignments';
export const maxDuration=60;
export async function POST(r:Request){try{
 const supplied=r.headers.get('authorization')||'';
 const row=await database().prepare("SELECT secret FROM scheduler_secret WHERE id='assignments'").first<{secret:string}>();
 const expected='Bearer '+row?.secret;
 if(!row||Buffer.byteLength(supplied)!==Buffer.byteLength(expected)||!timingSafeEqual(Buffer.from(supplied),Buffer.from(expected)))return fail('Niet toegestaan.',401);
 // One generation per invocation keeps the free function within its time budget.
 const users=await database().prepare("SELECT p.user_id FROM profiles p JOIN users u ON u.id=p.user_id WHERE u.role='student' ORDER BY COALESCE((SELECT max(g.period_start) FROM generated_exercises g WHERE g.user_id=p.user_id AND g.exercise IS NOT NULL),'1970-01-01'::timestamptz) LIMIT 30").all<{user_id:string}>();
 for(const u of users.results)for(const schedule of await schedulesFor(u.user_id))if(await nextAssignment(u.user_id,schedule))return Response.json({generated:1});
 return Response.json({generated:0});
 }catch{return fail('Planning is tijdelijk niet beschikbaar.',503)}}
