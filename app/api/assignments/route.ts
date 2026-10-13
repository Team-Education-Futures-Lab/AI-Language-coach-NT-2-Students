import {identity,fail} from '@/lib/server';
import {listAssignments,nextAssignment,schedulesFor} from '@/lib/server-assignments';
export const maxDuration=60;
export async function GET(r:Request){const u=await identity(r);if(!u)return fail('Log in om jouw opdrachten te zien.',401);try{return Response.json({assignments:await listAssignments(u)})}catch{return fail('Opdrachten kunnen niet worden geladen.',503)}}
export async function POST(r:Request){const u=await identity(r);if(!u)return fail('Log in om jouw opdrachten te verversen.',401);try{for(const s of await schedulesFor(u)){if(await nextAssignment(u,s))break}return Response.json({assignments:await listAssignments(u)})}catch{return fail('Verversen lukt nu niet; je eerdere werk blijft bewaard.',503)}}
