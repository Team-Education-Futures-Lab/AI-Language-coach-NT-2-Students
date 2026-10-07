import {redirect} from 'next/navigation';
import {authenticatedUser,safeReturnPath} from '@/lib/auth';
import {LoginForm} from '@/components/auth/login-form';
export const dynamic='force-dynamic';
export default async function Login({searchParams}:{searchParams:Promise<{next?:string;error?:string}>}){const query=await searchParams,next=safeReturnPath(query.next||null);if(await authenticatedUser())redirect(next);return <LoginForm next={next} confirmationError={!!query.error} configured={!!process.env.NEXT_PUBLIC_SUPABASE_URL&&!!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY} demo={process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH==='true'}/>}
