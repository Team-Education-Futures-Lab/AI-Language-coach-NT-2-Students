'use client';
import {B} from '@/components/learning/translation';
import {useEffect,useSyncExternalStore} from 'react';
import {startLocalAI,subscribeAI,getAIState,getServerAIState} from '@/lib/local-ai';
export function useLocalAI(){const state=useSyncExternalStore(subscribeAI,getAIState,getServerAIState);useEffect(()=>{if(state.status==='idle')void startLocalAI().catch(()=>{})},[state.status]);return state}
export function LocalAISetup(){const ai=useLocalAI();return ai.status==='ready'?<p className="pip-local-status"><B>AI verbonden · geen modeldownload · gratis gebruikslimiet</B></p>:<div className="pip-setup" role="status">{ai.status==='error'?<><p>{ai.error}</p><button className="outline-button" onClick={()=>void startLocalAI().catch(()=>{})}><B>Verbinding opnieuw controleren</B></button></>:<p><B>AI-verbinding controleren…</B></p>}</div>}
