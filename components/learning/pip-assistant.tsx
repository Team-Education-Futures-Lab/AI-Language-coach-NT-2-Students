'use client';
import {useCoach} from '@/components/learning/coach-preferences';
import {createContext,useContext,useState,useEffect,useRef,useCallback,type ReactNode} from 'react';
import {Send,X,Lightbulb,RotateCcw,Palette} from 'lucide-react';
import {PipMascot,type PipMood} from './pip-mascot';
import {VoiceControls} from './voice-controls';
import {LocalAISetup,useLocalAI} from './local-ai-setup';
import {localCompletion,type AIMessage} from '@/lib/local-ai';
import {helpPrompt,studyHint,avoidsAnswer,tutoringChoices,hintSelectionPrompt,selectedHint,type HelpContext} from '@/lib/pip-help';
const fallback:HelpContext={id:'home',title:'Mijn leerplek',level:'B1',description:'Een leeromgeving voor spelling, lezen, luisteren, schrijven en formuleren.'};
type HelpMessage=AIMessage&{kind?:'hint'|'selected'};
type Help={context:HelpContext;setPage:(c:HelpContext)=>void};
const Help=createContext<Help>({context:fallback,setPage:()=>{}});
export function PipHelpProvider({children}:{children:ReactNode}){const [context,setPage]=useState(fallback);return <Help.Provider value={{context,setPage}}>{children}<PipAssistant/></Help.Provider>}
export function usePipPage(context:HelpContext){const {setPage}=useContext(Help);const serialized=JSON.stringify(context);useEffect(()=>{setPage(JSON.parse(serialized))},[serialized,setPage])}
export function PipAssistant({context:provided,answers=[],embedded=false,onHelpUsed}:{context?:HelpContext;answers?:string[];embedded?:boolean;onHelpUsed?:()=>void}){const {text:coachText,coach,personalize}=useCoach();
 const shared=useContext(Help),context=provided||shared.context,ai=useLocalAI();
 const [voiceMood,setVoiceMood]=useState<PipMood>('idle');
 const [open,setOpen]=useState(false),[messages,setMessages]=useState<HelpMessage[]>([]),[input,setInput]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[hints,setHints]=useState(0);
 const abort=useRef<AbortController|null>(null),end=useRef<HTMLDivElement|null>(null),launcher=useRef<HTMLButtonElement|null>(null),field=useRef<HTMLTextAreaElement|null>(null),generation=useRef(0);
 const clear=useCallback(()=>{generation.current++;abort.current?.abort();setMessages([]);setBusy(false);setError('');setHints(0)},[]);
 useEffect(()=>{clear();setInput('')},[context.id,coach.name,coach.character,clear]);
 useEffect(()=>()=>{generation.current++;abort.current?.abort()},[]);
 useEffect(()=>{if(open)field.current?.focus()},[open]);
 useEffect(()=>{if(embedded||!open)return;const check=()=>{if(document.querySelector('[data-slot="dialog-content"]'))setOpen(false)};const observer=new MutationObserver(check);observer.observe(document.body,{childList:true,subtree:true});check();return()=>observer.disconnect()},[embedded,open]);
 useEffect(()=>{if(open)end.current?.scrollIntoView({block:'nearest'})},[messages,busy,open]);
 function hint(){onHelpUsed?.();const h=studyHint(context,hints);setHints(hints+1);setMessages(m=>[...m,{role:'assistant',content:h,kind:'hint'}]);setError('')}
 function close(){setOpen(false);launcher.current?.focus()}
 async function send(spoken?:string){
  const question=(spoken??input).trim().slice(0,1000);if(!question||busy||ai.status!=='ready')return;onHelpUsed?.();const next:HelpMessage[]=[...messages,{role:'user',content:question}],g=generation.current;
  const c=new AbortController();abort.current=c;setInput('');setMessages(next);setBusy(true);setError('');
  try{
   const choices=tutoringChoices(context);let kind:'hint'|'selected'|undefined;
   const raw=await localCompletion([{role:'system',content:choices?hintSelectionPrompt(context,choices):helpPrompt(context,coach)},...next.slice(-6).map(({role,content})=>({role,content}))],{signal:c.signal,maxTokens:choices?40:260,json:!!choices});
   let reply=raw;
   if(choices){const selected=selectedHint(raw,choices);reply=selected||studyHint(context,hints);kind=selected?'selected':'hint'}
   if(!avoidsAnswer(reply,answers)){reply=studyHint(context,hints);kind='hint'}
   if(g===generation.current){setMessages([...next,{role:'assistant',content:reply,kind}]);setHints(h=>h+1)}
  }
  catch(e){if(g===generation.current){setInput(question);setMessages(messages);setError((e as Error).message)}}finally{if(g===generation.current)setBusy(false)}
 }
 return <div className={`pip-dock ${embedded?'pip-embedded':'pip-global'}`} data-pip-dock onKeyDown={e=>{if(e.key==='Escape'&&open){e.preventDefault();e.stopPropagation();close()}}}>
 {open&&<section className="pip-help-panel" role="region" aria-label={coachText("Hulp van Pip")}><header><PipMascot size="small" mood={busy?'thinking':voiceMood} decorative/><div><b>Samen uitzoeken</b><small>{coachText("Pip helpt je zelf verder")}</small></div><button type="button" aria-label="Personaliseer mijn coach" onClick={personalize}><Palette size={17}/></button><button aria-label={coachText("Pip verkleinen")} onClick={close}><X size={19}/></button></header><div className="pip-context"><b>{context.title}{context.questionNumber?` · vraag ${context.questionNumber}`:''}</b><span>{provided?'Ik kijk mee met deze opdracht en jouw poging.':'Vertel welke stap je lastig vindt.'}</span></div><div className="pip-help-scroll"><LocalAISetup/>{!messages.length&&<p className="pip-help-welcome">Waar loop je vast? Ik geef je een zetje, en jij houdt het denkwerk.</p>}<div role="log" aria-live="polite" aria-relevant="additions text">{messages.map((m,i)=><div className={`pip-help-message pip-message-${m.role}`} key={i}><small>{m.role==='user'?'Jij':m.kind==='hint'?coachText('Pip · oefenhint'):m.kind==='selected'?coachText('Pip · AI kiest een denkstap'):coachText('Pip · AI')}</small><p>{m.content}</p></div>)}</div>{busy&&<p role="status">{coachText("Pip denkt mee…")}</p>}{error&&<p role="alert" className="pip-help-error">{error}</p>}<div ref={end}/></div><div className="pip-help-tools"><button disabled={busy} onClick={hint}><Lightbulb size={15}/>{hints?'Nog een oefenhint':'Geef een oefenhint'}</button>{messages.length>0&&<button disabled={busy} onClick={clear} aria-label="Nieuw hulpgesprek"><RotateCcw size={15}/></button>}</div><form onSubmit={e=>{e.preventDefault();void send()}}><label className="sr-only" htmlFor={embedded?'pip-exercise-question':'pip-page-question'}>{coachText("Jouw vraag aan Pip")}</label><textarea ref={field} id={embedded?'pip-exercise-question':'pip-page-question'} value={input} onChange={e=>setInput(e.target.value)} placeholder={ai.status==='ready'?'Wat snap je nog niet?':coachText('Start Pip voor je eigen vragen')} rows={2} maxLength={1000} disabled={busy||ai.status!=='ready'} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void send()}}}/><button type="submit" aria-label={coachText("Vraag aan Pip versturen")} disabled={!input.trim()||busy||ai.status!=='ready'}><Send size={18}/></button></form><VoiceControls resetKey={`${context.id}:${generation.current}`} reply={[...messages].reverse().find(m=>m.role==='assistant')?.content||''} disabled={busy||ai.status!=='ready'} onTranscript={text=>void send(text)} onMood={setVoiceMood}/><p className="pip-help-note">{provided?coachText('Pip kiest met AI uit gecontroleerde oefenhints. Jij maakt de opdracht.'):'AI kan fouten maken. Oefenhints werken ook zonder AI.'}</p></section>}
 <button ref={launcher} className="pip-launcher" aria-expanded={open} aria-label={open?coachText('Pip verkleinen'):coachText('Vraag hulp aan Pip')} onClick={()=>open?close():setOpen(true)}><PipMascot size="small" mood={busy?'thinking':voiceMood} decorative/><span>{open?'Verkleinen':'Hulp nodig?'}</span></button>
 </div>
}
