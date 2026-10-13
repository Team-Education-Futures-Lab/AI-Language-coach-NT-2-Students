// Keep answer checking outside the model; answer keys never enter its prompt.
export function avoidsAnswer(text:string,answers:string[]){
 const normalize=(s:string)=>s.toLowerCase().normalize('NFKC').replace(/[’]/g,"'").replace(/[^\p{L}\p{N}' ]/gu,' ').replace(/\s+/g,' ').trim();
 const t=' '+normalize(text)+' ';
 return !answers.some(a=>{const n=normalize(a);return (!['de','het','een','en','maar','in','op','te','om'].includes(n)||new RegExp('[\"“]'+n+'[\"”]','i').test(text))&&t.includes(' '+n+' ')})&&!/(het|de) (juiste |goede )?(antwoord|oplossing) is|kies (optie )?[abc123]\b/i.test(text);
}
