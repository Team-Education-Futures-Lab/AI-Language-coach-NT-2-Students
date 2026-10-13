import {identity,fail} from '@/lib/server';
import {aiProvider,generateText,aiAllowance,AIError} from '@/lib/server-ai';
import {z} from 'zod';
export const maxDuration=60;
const input=z.object({messages:z.array(z.object({role:z.enum(['system','user','assistant']),content:z.string().min(1).max(14000)})).min(1).max(16),json:z.boolean().optional(),maxTokens:z.number().int().min(1).max(6000).optional()}).refine(v=>v.messages.reduce((n,m)=>n+m.content.length,0)<=30000);
export async function GET(r:Request){if(!await identity(r))return fail('Log in om AI te gebruiken.',401);return Response.json({ready:!!aiProvider(),voice:aiProvider()==='groq'})}
export async function POST(r:Request){const u=await identity(r);if(!u)return fail('Log in om AI te gebruiken.',401);try{if(Number(r.headers.get('content-length'))>100000)return fail('Je bericht is te lang.',413);const parsed=input.safeParse(await r.json());if(!parsed.success)return fail('Je bericht is te lang of onvolledig.');await aiAllowance(u);return Response.json({text:await generateText(parsed.data.messages,parsed.data)})}catch(e){return fail(e instanceof AIError?e.message:'Het antwoord kon niet worden gemaakt.',e instanceof AIError?e.status:503)}}
