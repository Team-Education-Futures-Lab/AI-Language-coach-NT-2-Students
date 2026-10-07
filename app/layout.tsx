import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'AI Taalcoach · Op jouw tempo',description:'Oefen spelling, lezen, luisteren, schrijven en formuleren. Met taalspellen, persoonlijke voortgang en een AI-coach.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="nl" suppressHydrationWarning><body>{children}</body></html>}
