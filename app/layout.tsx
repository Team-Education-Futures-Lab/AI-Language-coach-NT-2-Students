import type {Metadata} from 'next';
import './globals.css';
import {TranslationProvider} from '@/components/learning/translation';
import './language-experience.css';
export const metadata:Metadata={title:'AI Taalcoach · Op jouw tempo',description:'Oefen spelling, lezen, luisteren, schrijven en formuleren. Met taalspellen, persoonlijke voortgang en een AI-coach.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="nl" suppressHydrationWarning><body><TranslationProvider>{children}</TranslationProvider></body></html>}
