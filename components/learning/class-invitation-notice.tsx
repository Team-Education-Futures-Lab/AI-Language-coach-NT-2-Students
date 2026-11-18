'use client';
import {useEffect,useRef,useState} from 'react';
import {GraduationCap,X} from 'lucide-react';
import {B} from './translation';
type Invitation={id:string;name:string;cohort:string;teacher_name:string};
export function ClassInvitationNotice({onOpen}:{onOpen:()=>void}){
 const [invitations,setInvitations]=useState<Invitation[]>([]);
 const dismissed=useRef(new Set<string>());
 useEffect(()=>{
  let stopped=false,pending=false;const controller=new AbortController();
  async function refresh(){
   if(document.hidden||pending)return;pending=true;
   try{const response=await fetch('/api/classes',{cache:'no-store',signal:controller.signal});if(!response.ok)return;const data=await response.json() as {invitations?:Invitation[]};if(!stopped&&Array.isArray(data.invitations))setInvitations(data.invitations.filter((i:Invitation)=>!dismissed.current.has(i.id)))}catch{/* Retry when the tab returns or on the next poll. */}finally{pending=false}
  }
  void refresh();const interval=setInterval(()=>void refresh(),30000);
  document.addEventListener('visibilitychange',refresh);window.addEventListener('focus',refresh);window.addEventListener('taalcoach-classes-changed',refresh);
  return()=>{stopped=true;controller.abort();clearInterval(interval);document.removeEventListener('visibilitychange',refresh);window.removeEventListener('focus',refresh);window.removeEventListener('taalcoach-classes-changed',refresh)};
 },[]);
 const invitation=invitations[0];if(!invitation)return null;
 function dismiss(){dismissed.current.add(invitation.id);setInvitations(list=>list.filter(i=>i.id!==invitation.id))}
 return <aside className="class-invitation-notice" aria-label="Klasuitnodiging"><button type="button" className="invitation-notice-close" aria-label="Melding sluiten" onClick={dismiss}><X size={18}/></button><div role="status" aria-live="polite" aria-atomic="true"><span className="invitation-notice-heading"><GraduationCap size={22}/><strong><B>Je bent uitgenodigd!</B></strong></span><p><b>{invitation.teacher_name}</b> <B>nodigt je uit voor</B> <b>{invitation.name}</b>{invitation.cohort&&<> · {invitation.cohort}</>}.</p>{invitations.length>1&&<small>{invitations.length} <B>uitnodigingen staan voor je klaar.</B></small>}</div><button type="button" className="primary-button" onClick={()=>{dismiss();onOpen()}}><B>Bekijk uitnodiging</B></button><small><B>Jij kiest of je deelneemt.</B></small></aside>;
}
