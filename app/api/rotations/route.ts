import {identity,fail} from '@/lib/server';
import {rotationAreas} from '@/lib/rotation-schema';
import {listRotations,generateRotation} from '@/lib/server-rotations';
import {z} from 'zod';
export const maxDuration=60;
export async function GET(r:Request){const u=await identity(r);if(!u)return fail('Log in om te oefenen.',401);try{return Response.json({groups:await listRotations(u)})}catch{return fail('De oefenplanning kon niet worden geladen.',503)}}
export async function POST(r:Request){const u=await identity(r);if(!u)return fail('Log in om te oefenen.',401);try{const p=z.object({area:z.enum(rotationAreas)}).safeParse(await r.json());if(!p.success)return fail('Onbekend oefenonderdeel.');await generateRotation(u,p.data.area);return Response.json({groups:await listRotations(u,[p.data.area])})}catch{return fail('Vernieuwen lukte nu niet. Je huidige werk blijft bewaard.',503)}}
