import 'server-only';
import {cache} from 'react';
import {supabaseServer} from './supabase/server';
export const authenticatedUser=cache(async()=>{
 if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)return null;
 const client=await supabaseServer();
 const {data:{user},error}=await client.auth.getUser();
 return error?null:user;
});
export function safeReturnPath(value:string|null){
 if(!value||!value.startsWith('/')||value.startsWith('//')||value.includes('\\'))return '/app';
 const url=new URL(value,'https://app.local');
 return url.origin==='https://app.local'&&!url.pathname.startsWith('/auth/')&&!url.pathname.startsWith('/login')?url.pathname+url.search:'/app';
}
