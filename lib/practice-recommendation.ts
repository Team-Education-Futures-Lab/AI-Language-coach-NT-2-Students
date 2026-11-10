import type {Exercise} from './exercises';
import type {Evidence} from './assessment';
/** Only scored, independent attempts count as evidence of difficulty. */
export function recommendPractice(catalog:Exercise[],level:string,evidence:Evidence[]){
 const matching=catalog.filter(e=>e.level===level);
 const pool=matching.length?matching:catalog.filter(e=>e.level==='A1');
 const recent=[...evidence].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,20);
 const skillTotals=new Map<string,{score:number;total:number;ids:Set<string>}>();
 for(const e of recent){if(e.assisted||e.total<1)continue;const t=skillTotals.get(e.skill)||{score:0,total:0,ids:new Set<string>()};if(t.ids.has(e.exerciseId))continue;t.ids.add(e.exerciseId);t.score+=e.score;t.total+=e.total;skillTotals.set(e.skill,t)}
 const weak=[...skillTotals].filter(([,t])=>t.ids.size>=2&&t.score/t.total<.7).sort((a,b)=>a[1].score/a[1].total-b[1].score/b[1].total).map(([s])=>s);
 const last=recent[0]?.exerciseId;
 const subject=(e:Exercise)=>e.focus||({spelling:'Spelling',lezen:'Lezen',luisteren:'Luisteren',schrijven:'Schrijven',formuleren:'Formuleren',grammatica:'Taalvormen'}[e.category]);
 const rank=(e:Exercise)=>(weak.includes(subject(e))?10:0)-(e.id===last?20:0)-(recent.some(r=>r.exerciseId===e.id)?2:0);
 const exercise=[...pool].sort((a,b)=>rank(b)-rank(a))[0];
 return exercise?{exercise,reason:weak.includes(subject(exercise))?'Dit onderwerp was nog lastig. We oefenen het nog een keer.':'Deze oefening past bij jouw niveau.'}:null;
}
export function levelCoachingInstruction(level:string){
 const base='Be patient, friendly and respectful to an adult. Ask only ONE question at a time. Correct at most one real mistake, quoting the learner accurately. If the learner does not understand, simplify and give one short example on a different topic. Offer a hint before an answer; never complete their exercise. Encourage one small Dutch response, without shaming use of their home language.';
 const style=level==='A1'?'A1: Use at most 2 or 3 very short sentences. Use common everyday words, one idea per sentence, and no grammar jargon. Give a concrete example when helpful.':level==='A2'?'A2: Use short simple sentences. Explain at most one new word briefly. Give simple grammar feedback with one example.':'B1 and above: Gradually increase complexity to the stated CEFR level. Invite reasons or detail without overwhelming the learner. Keep spoken turns brief.';
 return base+' '+style;
}
