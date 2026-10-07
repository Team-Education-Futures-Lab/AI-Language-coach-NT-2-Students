import {getChatGPTUser,chatGPTSignInPath} from './chatgpt-auth';
import {redirect} from 'next/navigation';
import {LandingPage} from '@/components/landing/landing-page';
export const dynamic='force-dynamic';
export default async function Page(){const user=await getChatGPTUser();if(user)redirect('/app');return <LandingPage signInUrl={chatGPTSignInPath('/app')}/>;}
