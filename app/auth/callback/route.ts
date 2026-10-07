import {NextResponse} from 'next/server';
import {supabaseServer} from '@/lib/supabase/server';
import {safeReturnPath} from '@/lib/auth';
export async function GET(request:Request){
 const url=new URL(request.url),code=url.searchParams.get('code');
 if(code){const client=await supabaseServer();const {error}=await client.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL(safeReturnPath(url.searchParams.get('next')),url.origin));}
 return NextResponse.redirect(new URL('/login?error=confirmation',url.origin));
}
