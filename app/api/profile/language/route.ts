import {z} from 'zod';
import {identity,database,fail} from '@/lib/server';
import {normalizeLanguage} from '@/lib/learning-language';
export async function POST(r:Request){const user=await identity(r);if(!user)return fail('Log in om je taal te bewaren.',401);try{
 const parsed=z.object({language:z.string().min(1).max(80)}).safeParse(await r.json());if(!parsed.success)return fail('Kies een taal.');
 const language=normalizeLanguage(parsed.data.language);
 await database().prepare("INSERT INTO profiles(user_id,data,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET data=(profiles.data::jsonb || excluded.data::jsonb)::text,updated_at=excluded.updated_at").bind(user,JSON.stringify({language}),new Date().toISOString()).run();return Response.json({language});
 }catch{return fail('Je taal kon niet worden opgeslagen.',503)}}
