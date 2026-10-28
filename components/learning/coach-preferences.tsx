'use client';
import {B,useLanguage} from '@/components/learning/translation';
import {createContext,useCallback,useContext,useEffect,useState,type ReactNode} from 'react';
import {languages} from '@/lib/profile';
import {normalizeLanguage,languageName} from '@/lib/learning-language';
import {languageSearchTerms} from '@/lib/language-catalog';
import {Check,Palette} from 'lucide-react';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {coachCharacters,coachCharacter,coachCopy,defaultCoach,normalizeCoach,validateCoach,type CoachPreferences} from '@/lib/coach-preferences';
type CoachContext={coach:CoachPreferences;text:(s:string)=>string;personalize:()=>void;supportLanguage:string;chooseSupportLanguage:(value:string)=>void};
const Context=createContext<CoachContext>({coach:defaultCoach,text:s=>s,personalize:()=>{},supportLanguage:'nl',chooseSupportLanguage:()=>{}});
export function useCoach(){return useContext(Context)}
export function CoachProvider({children}:{children:ReactNode}){
 const {language}=useLanguage();const [supportOverride,setSupportOverride]=useState('');
 useEffect(()=>{try{setSupportOverride(localStorage.getItem('taalcoach-support-language-v1')||'')}catch{}},[]);
 const chooseSupportLanguage=useCallback((value:string)=>{const next=value?normalizeLanguage(value):'';setSupportOverride(next);try{localStorage.setItem('taalcoach-support-language-v1',next)}catch{}},[]);
 const supportLanguage=supportOverride||language;
 const [coach,setCoach]=useState(defaultCoach),[open,setOpen]=useState(false),[loaded,setLoaded]=useState(false),[loadError,setLoadError]=useState(''),[saving,setSaving]=useState(false);
 const load=useCallback(async()=>{setLoadError('');try{const r=await fetch('/api/coach-preferences');const d=await r.json() as {coach?:unknown;error?:string};if(!r.ok)throw Error(d.error||'Probeer opnieuw.');setCoach(normalizeCoach(d.coach));setLoaded(true)}catch(e){setLoadError((e as Error).message)}},[]);
 useEffect(()=>{void load()},[load]);
 const text=useCallback((s:string)=>coachCopy(s,coach),[coach]);
 return <Context.Provider value={{coach,text,personalize:()=>setOpen(true),supportLanguage,chooseSupportLanguage}}>{children}<Dialog open={open} onOpenChange={v=>{if(!saving)setOpen(v)}}><DialogContent className="coach-custom-dialog"><DialogHeader><DialogTitle><B>Jouw coach, jouw stijl</B></DialogTitle><DialogDescription><B>Kies een taalmaatje en geef het een eigen naam.</B></DialogDescription></DialogHeader>{loaded?<CoachEditor onBusy={setSaving} initial={coach} onSaved={setCoach} onClose={()=>setOpen(false)}/>:<div role="status"><p>{loadError||'Je coach ophalen…'}</p>{loadError&&<button className="outline-button" onClick={()=>void load()}><B>Opnieuw proberen</B></button>}</div>}</DialogContent></Dialog></Context.Provider>
}
function CoachEditor({initial,onSaved,onClose,onBusy}:{onBusy:(b:boolean)=>void;initial:CoachPreferences;onSaved:(c:CoachPreferences)=>void;onClose:()=>void}){
 const [draft,setDraft]=useState(initial),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(false);
 const character=coachCharacter(draft),valid=validateCoach(draft),changed=JSON.stringify(valid)!==JSON.stringify(initial);
 return <form className="coach-custom-form" onSubmit={async e=>{e.preventDefault();if(!valid||busy)return;setBusy(true);onBusy(true);setError('');try{const r=await fetch('/api/coach-preferences',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(valid)});const d=await r.json() as {coach?:unknown;error?:string};if(!r.ok)throw Error(d.error||'Probeer opnieuw.');const result=normalizeCoach(d.coach);setDraft(result);onSaved(result);setSaved(true)}catch(e){setError((e as Error).message)}finally{setBusy(false);onBusy(false)}}}>
  <fieldset className="coach-character-options" disabled={busy}><legend><B>Kies je personage</B></legend><div className="coach-character-grid">{coachCharacters.map(c=><label key={c.id} className={draft.character===c.id?'coach-choice selected':'coach-choice'}><input type="radio" name="coach-character" value={c.id} checked={draft.character===c.id} onChange={()=>{setDraft(p=>({...p,character:c.id}));setSaved(false)}}/><img src={c.image} width={120} height={120} alt=""/><span>{c.label}</span>{draft.character===c.id&&<Check size={17} className="coach-selected-mark" aria-hidden="true"/>}</label>)}</div></fieldset>
  <label className="field-label" htmlFor="coach-custom-name"><B>Hoe heet jouw coach?</B><input id="coach-custom-name" value={draft.name} onChange={e=>{setDraft(p=>({...p,name:e.target.value}));setSaved(false)}} maxLength={30} required disabled={busy} autoComplete="off" aria-describedby="coach-name-help" placeholder="Bijvoorbeeld Pip, Nova of Milo"/></label><small id="coach-name-help"><B>Maximaal 30 tekens. Letters, cijfers, spaties, apostroffen en streepjes.</B></small>
  <section className="coach-preview" aria-label="Voorbeeld van je coach"><img src={character.image} alt={character.description} width={112} height={112}/><div><span className="eyebrow"><B>JOUW TAALMAATJE</B></span><h3 data-no-translate><B>Hoi, ik ben</B> {draft.name.trim()||'jouw coach'}.</h3><p>{character.greeting}</p></div></section>
  <p className="coach-custom-note"><B>Je keuze geldt voor je gesprekken, oefeningen en het hulpje rechtsonder. Je coach helpt je nadenken, op jouw niveau.</B></p>
  {error&&<p role="alert" className="notice">{error}</p>}{!valid&&<p className="notice"><B>Vul een geldige naam in om je coach op te slaan.</B></p>}{saved&&<p className="coach-saved" role="status"><Check size={18}/><B>Je coach is opgeslagen bij je profiel.</B></p>}
  <div className="coach-custom-actions"><button type="button" className="outline-button" disabled={busy} onClick={onClose}>{saved&&!changed?'Sluiten':'Annuleren'}</button><button type="submit" className="primary-button" disabled={busy||!valid||(!changed&&saved)}>{busy?'Opslaan…':'Mijn coach opslaan'}</button></div>
 </form>
}
export function PersonalizeCoachButton(){const {personalize}=useCoach();return <button type="button" className="outline-button" onClick={personalize}><Palette size={17}/><B>Personaliseer mijn coach</B></button>}

export function CoachLanguagePicker(){
 const {supportLanguage,chooseSupportLanguage}=useCoach();const [open,setOpen]=useState(false),[query,setQuery]=useState('');
 const matches=languages.filter(([code,name])=>languageSearchTerms(code,name).toLowerCase().includes(query.trim().toLowerCase()));
 return <div className="coach-support-picker"><button type="button" className="outline-button" aria-expanded={open} onClick={()=>setOpen(v=>!v)}><B>Taal voor uitleg</B>: <span dir="auto">{languageName(supportLanguage)}</span></button>
 {open&&<div className="coach-support-options"><label><B>Zoek je taal</B><input aria-label="Zoek je taal" value={query} onChange={e=>setQuery(e.target.value)} maxLength={80} placeholder="Nederlands, العربية, Turkish…"/></label><div className="coach-support-list">{matches.map(([code,name])=><button type="button" key={code} lang={code} dir="auto" aria-pressed={supportLanguage===code} onClick={()=>{chooseSupportLanguage(code);setOpen(false);setQuery('')}}>{name}</button>)}</div>{query.trim()&&!matches.length&&<button type="button" onClick={()=>{chooseSupportLanguage(query);setOpen(false);setQuery('')}}><B>Gebruik deze taal</B>: {query}</button>}<button type="button" onClick={()=>{chooseSupportLanguage('');setOpen(false)}}><B>Gebruik de taal van de app</B></button><small><B>Uitleg in jouw taal, oefenen in het Nederlands. De kwaliteit verschilt per taal. De vaste stem ondersteunt 31 talen; voor andere talen blijft tekst beschikbaar.</B></small></div>}</div>;
}
