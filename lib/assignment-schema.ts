import {z} from 'zod';
export const assignmentIntervals=[{days:1,label:'1 dag'},{days:2,label:'2 dagen'},{days:7,label:'1 week'},{days:14,label:'2 weken'},{days:21,label:'3 weken'},{days:30,label:'Elke maand'}];
export const generatedSchema=z.object({category:z.enum(['grammatica','spelling','lezen','schrijven','formuleren']),level:z.enum(['A1','A2','B1','B2','C1','C2']),title:z.string().min(5).max(120),description:z.string().min(10).max(800),minutes:z.number().int().min(2).max(60),passage:z.string().max(7000).optional(),questions:z.array(z.object({prompt:z.string().min(5).max(600),options:z.array(z.string().min(1).max(300)).min(2).max(5),correct:z.number().int().min(0).max(4),explanation:z.string().min(10).max(700)})).max(6),writing:z.object({prompt:z.string().min(20).max(1200),minWords:z.number().int().min(5).max(500),maxWords:z.number().int().min(10).max(1200),checklist:z.array(z.string().min(5).max(200)).min(2).max(5),example:z.string().min(10).max(5000)}).optional()}).superRefine((v,c)=>{
 if(v.category==='schrijven'&&!v.writing)c.addIssue({code:'custom',message:'Schrijfopdracht ontbreekt'});
 if(v.writing&&(v.writing.maxWords<v.writing.minWords||v.questions.length))c.addIssue({code:'custom',message:'Ongeldige schrijfopdracht'});
 if(!v.writing&&v.questions.length<3)c.addIssue({code:'custom',message:'Minimaal drie vragen'});
 for(const q of v.questions)if(q.correct>=q.options.length||new Set(q.options).size!==q.options.length)c.addIssue({code:'custom',message:'Ongeldige antwoordopties'});
 if(v.category==='lezen'&&!v.passage)c.addIssue({code:'custom',message:'Leestekst ontbreekt'});
});
export function assignmentPeriod(created:string,days:number,now=new Date()){
 const anchor=new Date(created);if(days===30){let month=(now.getUTCFullYear()-anchor.getUTCFullYear())*12+now.getUTCMonth()-anchor.getUTCMonth();const at=(n:number)=>{const d=new Date(Date.UTC(anchor.getUTCFullYear(),anchor.getUTCMonth()+n,1,anchor.getUTCHours(),anchor.getUTCMinutes(),anchor.getUTCSeconds()));const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(anchor.getUTCDate(),last));return d};if(at(month)>now)month--;return {start:at(Math.max(0,month)).toISOString(),due:at(Math.max(0,month)+1).toISOString()}}
 const duration=days*86400000;const start=anchor.getTime()+Math.max(0,Math.floor((now.getTime()-anchor.getTime())/duration))*duration;return {start:new Date(start).toISOString(),due:new Date(start+duration).toISOString()};
}

export function assignmentView<T>(rows:{exercise:T|null;period_start:string;due_at:string;last_error:string|null}[],period:{start:string;due:string}){
 const current=rows.find(row=>new Date(row.period_start).getTime()===new Date(period.start).getTime());
 const available=current?.exercise?current:rows.find(row=>row.exercise);
 return {exercise:available?.exercise||null,dueAt:current?.exercise?period.due:available?.due_at||period.due,pending:!current?.exercise,warning:current?.last_error||''};
}
