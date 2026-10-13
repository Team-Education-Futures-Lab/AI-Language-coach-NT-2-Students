import {z} from 'zod';
import {exercises,type Exercise} from './exercises';
import {missions} from './missions';
import {atelierTasks} from './learning';
import {sentenceRounds,editRounds,registerRounds} from './challenges';
import {generatedSchema} from './assignment-schema';
export const rotationAreas=['library-grammatica','library-spelling','library-lezen','library-luisteren','library-schrijven','library-formuleren','missions','atelier','challenges'] as const;
export type RotationArea=typeof rotationAreas[number];
export const rotationLabels:Record<RotationArea,string>={'library-grammatica':'Grammatica','library-spelling':'Spelling','library-lezen':'Begrijpend lezen','library-luisteren':'Luisteren','library-schrijven':'Schrijven','library-formuleren':'Formuleren',missions:'AI-coach',atelier:'Taalatelier',challenges:'Meer taaluitdagingen'};
export const intervalSchema=z.union([z.literal(1),z.literal(2),z.literal(7),z.literal(14),z.literal(21),z.literal(30)]);
export const atelierTaskSchema=z.object({id:z.enum(['beeldverhaal','leesclub','samen','tijdreis']),title:z.string().min(5).max(120),label:z.string().max(100),description:z.string().min(10).max(600),prompt:z.string().min(20).max(1800),en:z.string().max(1200),steps:z.array(z.string().min(5).max(300)).min(3).max(5),story:z.string().max(3500).optional()});
export type AtelierTask=z.infer<typeof atelierTaskSchema>;
const missionSchema=z.object({id:z.string(),title:z.string().min(5).max(120),description:z.string().min(20).max(600),role:z.string().min(2).max(100),time:z.number().int().min(3).max(20),goals:z.array(z.string().min(5).max(180)).length(3),opening:z.string().min(10).max(700)});
const choiceRound=z.object({q:z.string().min(10).max(600),options:z.array(z.string().min(1).max(350)).min(3).max(4),correct:z.number().int().min(0).max(3),why:z.string().min(10).max(500)}).refine(q=>q.correct<q.options.length&&new Set(q.options).size===q.options.length);
const challengeSchema=z.object({id:z.enum(['sentence','editor','register']),rounds:z.array(z.union([z.object({words:z.array(z.string().min(1).max(50)).min(3).max(22),why:z.string().min(10).max(500)}),choiceRound])).length(5)}).superRefine((v,c)=>{if(v.rounds.some(r=>(v.id==='sentence')!==('words'in r)))c.addIssue({code:'custom',message:'Verkeerd speltype'});});
export function baseItems(area:RotationArea):any[]{if(area.startsWith('library-'))return exercises.filter(e=>e.category===area.slice(8));if(area==='missions')return missions.filter(m=>m.id!=='personal');if(area==='atelier')return atelierTasks.map(t=>({...t}));return [{id:'sentence',rounds:sentenceRounds},{id:'editor',rounds:editRounds},{id:'register',rounds:registerRounds}];}
export function parseRotation(area:RotationArea,raw:string,level:string){
 const value=JSON.parse(raw);if(value?.items&&typeof value.items==='object'&&!Array.isArray(value.items))value.items=Object.entries(value.items).map(([id,item])=>({...item as object,id}));const items=z.object({items:z.array(z.unknown()).min(1).max(6)}).parse(value).items;
 const bases=baseItems(area);if(items.length!==bases.length)throw Error('Onvolledige reeks');
 const parsed=items.map((item:any)=>{
  const base=bases.find(b=>b.id===item?.id);if(!base)throw Error('Onbekende oefenplek');
  if(area.startsWith('library-')){
   const category=area.slice(8);const input={...item,category:category==='luisteren'?'lezen':category};
   const ex=generatedSchema.parse(input);if(ex.level!==level)throw Error('Verkeerd niveau');
   return {...ex,id:base.id,category,focus:base.focus} as Exercise;
  }
  if(area==='missions')return {...base,...missionSchema.parse(item),level};
  if(area==='atelier'){const t=atelierTaskSchema.parse(item);if(t.id==='leesclub'&&!t.story?.trim())throw Error('Leesverhaal ontbreekt');return t;}
  return challengeSchema.parse(item);
 });
 if(new Set(parsed.map(x=>x.id)).size!==bases.length)throw Error('Dubbele oefenplek');
 return parsed;
}
export type RotationGroup={area:RotationArea;dueAt:string;pending:boolean;warning:string;versionId:string|null;items:any[];level:string;intervalDays:number};
export function versionedItems(group:RotationGroup){return group.items.map(item=>({...item,...(group.area.startsWith('library-')&&group.versionId?{id:`rot:${group.versionId}:${item.id}`}:{})}));}
