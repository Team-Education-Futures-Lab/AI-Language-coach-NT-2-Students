export type ActionMode='platform'|'race'|'space';
export type Prompt={word:string;answer:string;options:string[];explanation:string};
export type Body={x:number;y:number;w:number;h:number};
export const overlaps=(a:Body,b:Body)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
export function stepJump(y:number,vy:number,dt:number){const t=clamp(dt,0,.035);return{y:y+vy*t,vy:vy+1250*t}}
