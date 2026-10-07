import {getChatGPTUser,chatGPTSignInPath} from '../chatgpt-auth';
import {LandingPage} from '@/components/landing/landing-page';
export const dynamic='force-dynamic';
export default async function Page(){const user=await getChatGPTUser();return <LandingPage signedIn={!!user} signInUrl={chatGPTSignInPath('/app')}/>;}
