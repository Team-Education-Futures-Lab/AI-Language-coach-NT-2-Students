import {ProfileAvatarProvider} from '@/components/learning/profile-avatar';
import {requireChatGPTUser} from '../chatgpt-auth';
import Home from '@/components/learning/platform';
import {CoachProvider} from '@/components/learning/coach-preferences';
import {AppearanceProvider} from '@/components/learning/appearance';
import {PipHelpProvider} from '@/components/learning/pip-assistant';
export const dynamic='force-dynamic';
export default async function Page(){await requireChatGPTUser('/app');return <ProfileAvatarProvider><AppearanceProvider><CoachProvider><PipHelpProvider><Home/></PipHelpProvider></CoachProvider></AppearanceProvider></ProfileAvatarProvider>;}
