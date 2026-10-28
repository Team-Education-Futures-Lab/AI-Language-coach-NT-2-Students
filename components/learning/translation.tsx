'use client';
import {createContext,useContext,useEffect,useState,useRef,useCallback,Children,useId,ReactNode} from 'react';
import {languages} from '@/lib/profile';
import {interfaceTranslation} from '@/lib/translation-terms';
import {normalizeLanguage,languageName,languageDirection} from '@/lib/learning-language';
type Context={language:string;cache:Record<string,string>;queue:(s:string)=>void;error:string;choose:(s:string)=>void;retry:()=>void;translating:boolean;revision:number};
const TranslationContext=createContext<Context>({language:'nl',cache:{},queue:()=>{},error:'',choose:()=>{},retry:()=>{},translating:false,revision:0});
const storageKey=(language:string)=>'taalcoach-ui-v3:'+language;
function readCache(language:string){try{return JSON.parse(localStorage.getItem(storageKey(language))||'{}') as Record<string,string>}catch{return {}}}
export function TranslationProvider({children}:{children:ReactNode}){
 const [language,setLanguage]=useState('nl'),[cache,setCache]=useState<Record<string,string>>({}),[error,setError]=useState(''),[translating,setTranslating]=useState(false),[revision,setRevision]=useState(0);
 const pending=useRef(new Set<string>()),requested=useRef(new Set<string>()),timer=useRef<ReturnType<typeof setTimeout>|null>(null),abort=useRef<AbortController|null>(null),generation=useRef(0),languageRef=useRef('nl'),running=useRef(false),autoRetries=useRef(0),paused=useRef(false),cached=useRef<Record<string,string>>({});
 async function flush(){
  timer.current=null;if(running.current||!pending.current.size||paused.current)return;
  running.current=true;setTranslating(true);const g=generation.current,l=languageRef.current;
  const texts:string[]=[];let length=0;for(const text of pending.current){if(texts.length>=20||(texts.length&&length+text.length>5500))break;texts.push(text);length+=text.length;}
  texts.forEach(s=>{pending.current.delete(s);requested.current.add(s)});
  const c=new AbortController();abort.current=c;
  try{const response=await fetch('/api/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({language:l,texts}),signal:c.signal});const j=await response.json() as {error?:string;retryAfter?:number;translations:string[]};
   if(!response.ok){const failure=new Error(j.error||'Vertalen is tijdelijk niet beschikbaar.') as Error&{retryAfter?:number};failure.retryAfter=j.retryAfter;throw failure}
   if(!Array.isArray(j.translations)||j.translations.length!==texts.length||j.translations.some((s:unknown)=>typeof s!=='string'||!s.trim()))throw Error('De vertaling was niet compleet. Probeer opnieuw.');
   if(g===generation.current){const additions=Object.fromEntries(texts.map((s,i)=>[s,j.translations[i]]));cached.current={...cached.current,...additions};setCache(cached.current);try{localStorage.setItem(storageKey(l),JSON.stringify(Object.fromEntries(Object.entries(cached.current).slice(-1500))))}catch{}setError('')}
  }catch(e){if(g===generation.current&&!c.signal.aborted){texts.forEach(s=>{requested.current.delete(s);pending.current.add(s)});paused.current=true;const delay=(e as Error&{retryAfter?:number}).retryAfter;setError((e as Error).message+(delay?' · '+Math.ceil(delay/60)+' min':''));
    // One scheduled retry after the provider's cooldown; no aggressive request loop.
    if(delay&&delay<=300&&autoRetries.current++<1)timer.current=setTimeout(()=>{paused.current=false;void flush()},delay*1000);
   }}finally{if(g===generation.current){running.current=false;if(pending.current.size&&!paused.current)timer.current=setTimeout(()=>void flush(),180);else setTranslating(false)}}
 }
 const queue=useCallback((s:string)=>{if(interfaceTranslation(s,languageRef.current)||languageRef.current==='nl'||requested.current.has(s)||cached.current[s]||!/[\p{L}]/u.test(s))return;pending.current.add(s);if(!paused.current&&!timer.current&&!running.current)timer.current=setTimeout(()=>void flush(),180)},[]);
 const reset=useCallback(()=>{generation.current++;abort.current?.abort();if(timer.current)clearTimeout(timer.current);timer.current=null;running.current=false;paused.current=false;pending.current.clear();requested.current.clear();setError('');autoRetries.current=0;setTranslating(false);setRevision(r=>r+1)},[]);
 const choose=useCallback((value:string)=>{const next=normalizeLanguage(value);if(next===languageRef.current)return;reset();languageRef.current=next;cached.current=readCache(next);setCache(cached.current);setLanguage(next);try{localStorage.setItem('taalcoach-language',next)}catch{}
  if(location.pathname.startsWith('/app'))void fetch('/api/profile/language',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({language:next})}).then(r=>{if(!r.ok)throw Error()}).catch(()=>setError('Je taal is op dit apparaat bewaard. Opslaan in je profiel lukte nog niet.'));
 },[reset]);
 const retry=useCallback(()=>{reset()},[reset]);
 useEffect(()=>{try{const l=localStorage.getItem('taalcoach-language');if(l)choose(l)}catch{}return()=>{generation.current++;abort.current?.abort();if(timer.current)clearTimeout(timer.current)}},[choose]);
 useEffect(()=>{document.documentElement.lang=/^[a-z]{2,3}(-[A-Za-z]+)?$/.test(language)?language:'und';document.documentElement.dir=languageDirection(language)},[language]);
 return <TranslationContext.Provider value={{language,cache,queue,error,choose,retry,translating,revision}}>{children}</TranslationContext.Provider>
}
export function T({text}:{text:string}){const {language,cache,queue,revision}=useContext(TranslationContext);const translated=interfaceTranslation(text,language)||cache[text];useEffect(()=>{if(language!=='nl')queue(text)},[text,language,queue,revision]);if(language==='nl')return <>{text}</>;return <bdi className="ui-copy" lang={translated?language:'nl'} dir="auto">{translated||text}</bdi>}
export function B({children}:{children:ReactNode}){return <>{Children.map(children,c=>typeof c==='string'&&c.trim()?<T text={c}/>:c)}</>}
export function useUIString(text:string){const {language,cache,queue,revision}=useContext(TranslationContext);useEffect(()=>{queue(text)},[text,language,queue,revision]);return interfaceTranslation(text,language)||cache[text]||text}
export function LanguageSwitcher(){const {language,choose,error,retry,translating}=useContext(TranslationContext);const [open,setOpen]=useState(false),[query,setQuery]=useState('');const id=useId(),root=useRef<HTMLDivElement>(null);const candidates=languages.filter(([code,name])=>(name+' '+code).toLowerCase().includes(query.toLowerCase()));
 useEffect(()=>{if(!open)return;const close=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false)};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[open]);
 return <div className="language-switcher" ref={root} onKeyDown={e=>{if(e.key==='Escape')setOpen(false)}}><button type="button" className="language-button" onClick={()=>setOpen(o=>!o)} aria-expanded={open} aria-controls={id} aria-label="Language / Taal">{translating?<span className="translation-spinner" aria-hidden="true"/>:'◎'} <span dir="auto">{languageName(language)}</span></button>{open&&<div id={id} className="language-popover"><label><B>Kies je taal</B><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Language / Taal" autoFocus maxLength={80}/></label><div className="language-options">{candidates.map(([c,name])=><button type="button" key={c} lang={c} dir="auto" onClick={()=>{choose(c);setOpen(false)}} aria-pressed={c===language}>{name}</button>)}</div>{query.trim()&&!candidates.length&&<button type="button" className="primary-button" onClick={()=>{choose(query);setOpen(false)}}>↗ {query}</button>}<p><B>Uitleg in jouw taal. Oefenen in het Nederlands.</B></p>{error&&<p role="status" className="language-warning" dir="auto">{error}<button type="button" onClick={retry}><B>Opnieuw proberen</B></button></p>}<button type="button" className="text-button" onClick={()=>setOpen(false)}><B>Sluiten</B></button></div>}{error&&!open&&<button type="button" className="language-retry" onClick={()=>setOpen(true)} aria-label="Translation status">!</button>}</div>
}
export function useLanguage(){return useContext(TranslationContext)}
