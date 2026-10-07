import {NextResponse} from 'next/server';
import {supabaseServer} from '@/lib/supabase/server';
export async function POST(request:Request){const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return new Response('Forbidden',{status:403});const client=await supabaseServer();await client.auth.signOut();return NextResponse.redirect(new URL('/',request.url),303);}
