'use client';
import {useEffect,useSyncExternalStore} from 'react';
import {startLocalAI,subscribeAI,getAIState,getServerAIState} from '@/lib/local-ai';
export function useLocalAI(){const state=useSyncExternalStore(subscribeAI,getAIState,getServerAIState);useEffect(()=>{if(state.status==='idle')void startLocalAI().catch(()=>{})},[state.status]);return state}
export function LocalAISetup(){const ai=useLocalAI();return ai.status==='ready'?<p className="pip-local-status">AI verbonden · geen modeldownload · gratis gebruikslimiet</p>:<div className="pip-setup" role="status">{ai.status==='error'?<><p>{ai.error}</p><button className="outline-button" onClick={()=>void startLocalAI().catch(()=>{})}>Verbinding opnieuw controleren</button></>:<p>AI-verbinding controleren…</p>}</div>}
