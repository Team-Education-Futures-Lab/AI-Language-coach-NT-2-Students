import {database,identity,fail} from '@/lib/server';
import {Profile} from '@/lib/profile';
import {studentProfile} from '@/lib/server-profile';
export async function GET(r:Request){const u=await identity(r);if(!u)return fail('Log in om je profiel te openen.',401);try{return Response.json({profile:await studentProfile(u)})}catch{return fail('Je profiel kon niet worden geladen.',503)}}
export async function POST(r:Request){const u=await identity(r);if(!u)return fail('Log in om je profiel te bewaren.',401);try{
 const b=await r.json() as Record<string,any>;if(!['Mbo','Hbo','Wo','Inburgering'].includes(b.goal)||typeof b.field!=='string'||!b.field.trim()||b.field.length>160)return fail('Vul je leerdoel en vakgebied in.');
 const current=await studentProfile(u);
 const p:Profile={name:String(b.name||'').trim().slice(0,80),level:current.level,goal:b.goal,field:b.field.trim(),interests:String(b.interests||'').slice(0,1000),learningGoals:String(b.learningGoals||'').slice(0,1000),language:String(b.language||'nl').slice(0,80),adaptive:true};
 await database().prepare("INSERT INTO profiles(user_id,data,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET data=(excluded.data::jsonb || jsonb_build_object('coach',profiles.data::jsonb->'coach'))::text,updated_at=excluded.updated_at").bind(u,JSON.stringify(p),new Date().toISOString()).run();return Response.json({profile:{...p,progress:current.progress}});
 }catch{return fail('Opslaan lukte niet. Je invoer blijft staan.',503)}}
