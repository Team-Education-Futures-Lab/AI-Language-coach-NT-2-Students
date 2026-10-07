'use client';
import {useCoach} from './coach-preferences';
import {coachCharacter} from '@/lib/coach-preferences';
export type PipMood='idle'|'thinking'|'listening'|'speaking'|'celebrating';
export function PipMascot({mood='idle',size='medium',decorative=false}:{mood?:PipMood;size?:'small'|'medium'|'large';decorative?:boolean}){const {coach}=useCoach();const character=coachCharacter(coach);return <span className={`pip-mascot pip-${size} pip-${mood}`} aria-hidden={decorative||undefined}><img src={character.image} alt={decorative?'':`${coach.name}, ${character.description.toLowerCase()}`} width={1254} height={1254}/>{mood==='thinking'&&<span className="pip-thoughts" aria-hidden="true"><i/><i/><i/></span>}{mood==='listening'&&<span className="pip-listen-ring" aria-hidden="true"/>}{mood==='celebrating'&&<span className="pip-sparkle" aria-hidden="true">✦</span>}</span>}
