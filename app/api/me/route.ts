import {currentUser,fail,identity} from '@/lib/server';
export async function GET(r:Request){
  if(!await identity(r))return fail('Log in om je account te openen.',401);
  try{const user=await currentUser(r);return Response.json({user});}catch{return fail('Je account kon niet worden geladen.',503)}
}
