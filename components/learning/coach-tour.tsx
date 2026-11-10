'use client';
import {useEffect,useState} from 'react';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {PipMascot} from './pip-mascot';
import {B,LanguageSwitcher,useLanguage} from './translation';
import {interfaceTranslation} from '@/lib/translation-terms';
import {useCoach} from './coach-preferences';
const steps=[
 {target:'today',title:'Start met één oefening',body:'Hier staat een oefening voor jou. Je ziet het niveau en de tijd. Klik op Start oefening om te beginnen.'},
 {target:'level',title:'Mijn niveau',body:'Hier zie je jouw niveau. Nieuw? Begin bij A1. Doe de korte taalcheck als je niet weet wat bij je past. Je docent kan je niveau aanpassen.'},
 {target:'coach',title:'Vraag mij om hulp',body:'Je kunt met mij typen of praten. Bij een oefening klik je op Hulp nodig? Ik geef een tip. Jij probeert het antwoord zelf.'},
 {target:'progress',title:'Mijn voortgang',body:'Hier zie je wat je vandaag hebt gedaan. In Mijn voortgang zie je al je oefeningen. Fouten maken mag. Zo leer je!'}
];
export function CoachTour({userId,ready,replay,onStart}:{userId:string;ready:boolean;replay:number;onStart:()=>void}){
 const [open,setOpen]=useState(false),[step,setStep]=useState(-1);
 const {language,cache,queue,error,retry,revision}=useLanguage();const {coach,chooseSupportLanguage}=useCoach();
 const key='taalcoach-tour-v1:'+userId;
 useEffect(()=>{if(!ready||!userId)return;try{if(!localStorage.getItem(key)){setStep(-1);setOpen(true)}}catch{setOpen(true)}},[ready,userId,key]);
 useEffect(()=>{if(replay){setStep(-1);setOpen(true)}},[replay]);
 useEffect(()=>{if(open){for(const s of steps){queue(s.title,true);queue(s.body,true)}}},[open,language,queue,revision]);
 useEffect(()=>{if(!open||step<0)return;const el=document.querySelector<HTMLElement>(`[data-tour="${steps[step].target}"]`);if(!el)return;el.classList.add('tour-highlight');el.scrollIntoView({block:'start',behavior:'instant'});return()=>el.classList.remove('tour-highlight')},[open,step]);
 function close(){try{localStorage.setItem(key,'done')}catch{}setOpen(false)}
 const current=steps[step];const translated=language==='nl'||!current||!!((cache[current.title]||interfaceTranslation(current.title,language))&&(cache[current.body]||interfaceTranslation(current.body,language)));
 return <Dialog open={open} onOpenChange={value=>{if(!value)close()}}><DialogContent className={'coach-tour '+(step>=0?'tour-guiding':'')} showCloseButton={false} onInteractOutside={e=>e.preventDefault()}><DialogHeader><PipMascot size="small"/><DialogTitle>{step<0?<>Hi, ik ben je AI taalcoach, {coach.name}.<br/><small lang="en">Hi! I am your AI language coach.</small></>:<B>{current.title}</B>}</DialogTitle><DialogDescription>{step<0?<><span>Kies de taal voor je rondleiding.</span><br/><span lang="en">Choose your language for this short tour.</span></>:<B>{current.body}</B>}</DialogDescription></DialogHeader>
 {step<0&&<LanguageSwitcher/>}
 {step>=0&&!translated&&<p role="status">{error||'Vertalen… / Translating…'}{error&&<button className="outline-button" onClick={retry}><B>Opnieuw proberen</B></button>}</p>}
 <div className="tour-actions"><button className="text-button" onClick={close}><B>Overslaan</B> / Skip</button>{step>=0&&<button className="outline-button" onClick={()=>setStep(s=>s-1)}><B>Terug</B></button>}<button className="primary-button" disabled={step>=0&&!translated} onClick={()=>{if(step<0){chooseSupportLanguage(language)}if(step===steps.length-1){close();onStart()}else setStep(s=>s+1)}}><B>{step<0?'Start rondleiding':step===steps.length-1?'Start oefening':'Volgende'}</B></button></div>{step>=0&&<p dir="ltr" className="tour-count" aria-live="polite">{step+1} / {steps.length}</p>}
 </DialogContent></Dialog>;
}
