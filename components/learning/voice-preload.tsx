'use client';
import {useEffect,useSyncExternalStore} from 'react';
import {CheckCircle2,Download,LoaderCircle,RefreshCw} from 'lucide-react';
import {getVoiceLoadState,getServerVoiceLoadState,preloadCoachVoice,subscribeVoiceLoad} from '@/lib/local-tts';
import {B} from './translation';

export function VoicePreload({autoStart=false}:{autoStart?:boolean}){
 const state=useSyncExternalStore(subscribeVoiceLoad,getVoiceLoadState,getServerVoiceLoadState);
 useEffect(()=>{
  if(!autoStart)return;
  const load=()=>{
   try{if(localStorage.getItem('taalcoach-voice-profile-v1')==='browser')return}catch{}
   void preloadCoachVoice().catch(()=>{});
  };
  // Let the page render first. Closing a chat never cancels this shared warmup.
  const timer=setTimeout(load,500);window.addEventListener('taalcoach-voice',load);
  return()=>{clearTimeout(timer);window.removeEventListener('taalcoach-voice',load)};
 },[autoStart]);
 const busy=state.phase==='loading'||state.phase==='downloading';
 return <details className="voice-preload" data-state={state.phase}>
  <summary><span className="voice-preload-icon" aria-hidden="true">{state.phase==='ready'?<CheckCircle2 size={17}/>:busy?<LoaderCircle size={17}/>:<Download size={17}/>}</span><span role="status"><B>{state.message}</B>{state.detail&&<small className="voice-preload-count" dir="ltr">{state.detail}</small>}</span></summary>
  <div className="voice-preload-details">
   {busy&&<progress aria-label="Stemmen voorbereiden" max={state.total||16} value={state.completed||0}/>}
   <p><B>We laden alle 10 stemprofielen vooraf. De eerste keer is dit circa 400 MB. Daarna openen we de opgeslagen stemmen op dit apparaat.</B></p>
   <p><B>Nieuwe berichten worden op je apparaat omgezet naar audio. Dat kost nog rekentijd, maar geen nieuwe download van de stemmen.</B></p>
   {state.cached===false&&<p className="voice-error"><B>Je browser kon de stemmen niet bewaren. Ze werken nu wel, maar moeten bij een volgend bezoek opnieuw worden geladen. Controleer de vrije opslagruimte en gebruik een gewoon browservenster.</B></p>}
   {(state.phase==='idle'||state.phase==='error')&&<button type="button" onClick={()=>void preloadCoachVoice().catch(()=>{})}><RefreshCw size={15}/><B>{state.phase==='error'?'Opnieuw voorbereiden':'Stemmen vooraf laden'}</B></button>}
   <small><B>De browser kan opgeslagen bestanden verwijderen als de opslag vol is of je browsergegevens wist.</B></small>
  </div>
 </details>;
}
