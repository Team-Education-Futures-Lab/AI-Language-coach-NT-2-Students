export const levels=['A1','A2','B1','B2','C1','C2'] as const;
export const milestones=[{level:'A1',xp:0,days:0},{level:'A2',xp:200,days:3},{level:'B1',xp:700,days:7},{level:'B2',xp:1600,days:14},{level:'C1',xp:3000,days:21},{level:'C2',xp:5000,days:30}];
export type Progression={xp:number;streak:number;bestStreak:number;level:string;teacherSet:boolean;next:{level:string;xp:number;days:number}|null};
export function calculateProgress(rows:{xp:number;date:string}[],override?:string|null):Progression{
 const dates=[...new Set(rows.map(r=>r.date.slice(0,10)))].sort();let run=0,best=0,previous=0;
 for(const day of dates){const time=Date.parse(day+'T12:00:00Z');run=time-previous===86400000?run+1:1;best=Math.max(best,run);previous=time}
 const today=new Date().toISOString().slice(0,10),yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
 const streak=dates.at(-1)===today||dates.at(-1)===yesterday?run:0;
 const xp=rows.reduce((n,r)=>n+Math.max(0,Math.min(20,Number(r.xp)||0)),0);
 const unlocked=milestones.filter(m=>xp>=m.xp&&best>=m.days).at(-1)!;
 const level=override&&levels.includes(override as typeof levels[number])?override:unlocked.level;
 return {xp,streak,bestStreak:best,level,teacherSet:!!override,next:override?null:milestones[milestones.indexOf(unlocked)+1]||null};
}
