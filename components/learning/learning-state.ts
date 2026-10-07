'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {emptyLearning,type LearningState} from '@/lib/learning';
export function useLearningState(){
 const [data,setData]=useState<LearningState>(emptyLearning),[loaded,setLoaded]=useState(false),[error,setError]=useState('');const revision=useRef(0);
 const load=useCallback(async()=>{const n=++revision.current;try{const r=await fetch('/api/learning');const j=await r.json() as any;if(!r.ok)throw Error(j.error);if(n===revision.current){setData(j);setLoaded(true);setError('')}}catch(e){if(n===revision.current)setError((e as Error).message)}},[]);
 useEffect(()=>{void load()},[load]);
 const save=useCallback(async(body:unknown)=>{++revision.current;const r=await fetch('/api/learning',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const j=await r.json() as any;if(!r.ok)throw Error(j.error||'Opslaan is niet gelukt.');setData(j);setLoaded(true);setError('');return j as LearningState},[]);
 return{data,loaded,error,load,save};
}
export type LearningStore=ReturnType<typeof useLearningState>;
