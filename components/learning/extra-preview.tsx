'use client';
import {useEffect,useRef} from 'react';
import {renderExtraScene,type ExtraScene} from '@/lib/extra-arcade-art';
export function ExtraPreview({mode}:{mode:ExtraScene['mode']}){const ref=useRef<HTMLCanvasElement>(null);useEffect(()=>{const g=ref.current?.getContext('2d');if(g)renderExtraScene(g,{mode,stage:mode==='bridge'?3:1,time:3.4,x:10,y:mode==='cross'?15:12,tail:[[10,12],[10,13],[10,14],[9,14],[8,14],[7,14]],dir:[0,-1],blocks:[[18,10],[7,8]],options:['de','het'],bridge:[210,390],length:130})},[mode]);return <div className="arcade-preview extra-preview" aria-hidden="true"><canvas ref={ref} width={600} height={400}/><span>{mode==='cross'?'OVERSTEKEN':mode==='bridge'?'BOUW & BALANCEER':'VANG & GROEI'} · 5 WERELDEN</span></div>}
