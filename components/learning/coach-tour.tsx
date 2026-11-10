'use client';
import {useEffect,useState} from 'react';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {PipMascot} from './pip-mascot';
import {B,LanguageSwitcher,useLanguage} from './translation';
import {interfaceTranslation} from '@/lib/translation-terms';
import {useCoach} from './coach-preferences';
import {coachTourSteps as steps} from '@/lib/coach-tour';
export function CoachTour({userId,ready,replay,onStart,onNavigate}:{userId:string;ready:boolean;replay:number;onStart:()=>void;onNavigate:(view:string)=>void}){
 const [open,setOpen]=useState(false),[step,setStep]=useState(-1);
 const {language,cache,queue,error,retry,revision}=useLanguage();const {coach,chooseSupportLanguage}=useCoach();
 const key='taalcoach-tour-v1:'+userId;
 useEffect(()=>{if(!ready||!userId)return;try{if(!localStorage.getItem(key)){setStep(-1);setOpen(true)}}catch{setOpen(true)}},[ready,userId,key]);
 useEffect(()=>{if(replay){setStep(-1);setOpen(true)}},[replay]);
 useEffect(()=>{if(open){for(const s of steps){queue(s.title,true);queue(s.body,true)}}},[open,language,queue,revision]);
 useEffect(()=>{if(!open||step<0)return;const current=steps[step];onNavigate(current.view);let highlighted:HTMLElement|null=null;
 const highlight=()=>{const preferred='target' in current?document.querySelector<HTMLElement>(current.target):null;const page=document.querySelector<HTMLElement>(`[data-tour-page="${current.view}"]`);const el=preferred&&preferred.getClientRects().length?preferred:page?.querySelector<HTMLElement>('.page-heading,.pip-introduction,section');if(!el||el===highlighted)return;highlighted?.classList.remove('tour-highlight');highlighted=el;el.classList.add('tour-highlight');el.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})};
 const frame=requestAnimationFrame(highlight);const observer=new MutationObserver(highlight);observer.observe(document.querySelector('.page-content')||document.body,{childList:true,subtree:true});return()=>{cancelAnimationFrame(frame);observer.disconnect();highlighted?.classList.remove('tour-highlight')};},[open,step,onNavigate]);
 function close(){try{localStorage.setItem(key,'done')}catch{}setOpen(false)}
 const current=steps[step];const translated=language==='nl'||!current||!!((cache[current.title]||interfaceTranslation(current.title,language))&&(cache[current.body]||interfaceTranslation(current.body,language)));
 return <Dialog open={open} onOpenChange={value=>{if(!value)close()}}><DialogContent className={'coach-tour '+(step>=0?'tour-guiding':'')} showCloseButton={false} onInteractOutside={e=>e.preventDefault()}><DialogHeader key={step} className="tour-step-enter"><div className="tour-coach-wave"><PipMascot size="small"/></div><DialogTitle>{step<0?<>Hi, ik ben je AI taalcoach, {coach.name}.<br/><small lang="en">Hi! I am your AI language coach.</small></>:<B>{current.title}</B>}</DialogTitle><DialogDescription>{step<0?<><span>Kies de taal voor je rondleiding.</span><br/><span lang="en">Choose your language for this short tour.</span></>:<B>{current.body}</B>}</DialogDescription></DialogHeader>
 {step<0&&<LanguageSwitcher/>}
 {step>=0&&!translated&&<p role="status">{error||'Vertalen… / Translating…'}{error&&<button className="outline-button" onClick={retry}><B>Opnieuw proberen</B></button>}</p>}
 <div className="tour-actions"><button className="text-button" onClick={close}><B>Overslaan</B> / Skip</button>{step>=0&&<button className="outline-button" onClick={()=>setStep(s=>s-1)}><B>Terug</B></button>}<button className="primary-button" disabled={step>=0&&!translated} onClick={()=>{if(step<0){chooseSupportLanguage(language)}if(step===steps.length-1){close();onStart()}else setStep(s=>s+1)}}><B>{step<0?'Start rondleiding':step===steps.length-1?'Start oefening':'Volgende'}</B></button></div>{step>=0&&<div className="tour-progress"><progress aria-label="Rondleiding" value={step+1} max={steps.length}/><p dir="ltr" className="tour-count" aria-live="polite">{step+1} / {steps.length}</p></div>}
 </DialogContent></Dialog>;
}
