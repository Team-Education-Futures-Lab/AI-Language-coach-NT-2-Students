import {requireChatGPTUser} from '../chatgpt-auth';
import Home from '@/components/learning/platform';
import {CoachProvider} from '@/components/learning/coach-preferences';
import {AppearanceProvider} from '@/components/learning/appearance';
import {PipHelpProvider} from '@/components/learning/pip-assistant';
import {TranslationProvider} from '@/components/learning/translation';
export const dynamic='force-dynamic';
export default async function Page(){await requireChatGPTUser('/app');return <AppearanceProvider><CoachProvider><PipHelpProvider><TranslationProvider><Home/></TranslationProvider></PipHelpProvider></CoachProvider></AppearanceProvider>;}
