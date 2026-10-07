// Compatibility names for existing pages; identity now comes only from Supabase.
import {redirect} from 'next/navigation';
import {authenticatedUser,safeReturnPath} from '@/lib/auth';
export async function getChatGPTUser(){const u=await authenticatedUser();if(!u)return null;const fullName=typeof u.user_metadata?.full_name==='string'?u.user_metadata.full_name:null;return {userId:u.id,email:u.email||'',fullName,displayName:fullName||u.email||'Demoleerling'};}
export async function requireChatGPTUser(returnTo:string){const u=await getChatGPTUser();if(u)return u;redirect(chatGPTSignInPath(returnTo));}
export function chatGPTSignInPath(returnTo:string){return '/login?next='+encodeURIComponent(safeReturnPath(returnTo));}
export function chatGPTSignOutPath(){return '/auth/signout';}
