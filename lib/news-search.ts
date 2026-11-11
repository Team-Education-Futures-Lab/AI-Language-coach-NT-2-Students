const aliases:Record<string,string[]>={
 sport:['sport','voetbal','tennis','wielrennen','hockey','formule','schaatsen','zwemmen','atletiek'],
 football:['voetbal'],soccer:['voetbal'],health:['gezondheid','zorg','ziekenhuis'],education:['onderwijs','school','leraar','docent'],
 zorg:['zorg','zorgkosten','zorgverzekering','zorgsector','zorgpersoneel','ziekenhuis','huisarts','verpleeg','patient','medisch'],
 onderwijs:['onderwijs','school','leraar','docent','student','universiteit'],
 klimaat:['klimaat','opwarming','uitstoot','broeikas'],
 ai:['ai','kunstmatige intelligentie','artificiele intelligentie'],
 ict:['ict','software','computer','cyber','digitaal'],technology:['technologie','techniek','software','computer']
};
const normalize=(s:string)=>s.toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const stop=new Set(['de','het','een','en','van','over','in','op','voor','met','nieuws','the','and','about','news']);
export function newsTopicMatches(title:string,query:string){
 const text=' '+normalize(title)+' ',words=normalize(query).split(/\s+/).filter(w=>w.length>=2&&!stop.has(w));
 if(!words.length)return false;
 return words.every(word=>(aliases[word]||[word]).some(term=>{
  // Short abbreviations must match whole words, not e.g. AI inside 'fraai'.
  if(term.length<4||term==='zorg')return text.includes(' '+term+' ');
  return text.trim().split(' ').some(w=>w.startsWith(term))||text.includes(' '+term+' ');
 }));
}
