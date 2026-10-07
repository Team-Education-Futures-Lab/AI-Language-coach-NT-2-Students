import {database} from './server';
import {fields} from './profile';
const feeds=[
 {url:'https://feeds.nos.nl/nosnieuwstech',field:fields[0],source:'NOS'},
 {url:'https://feeds.nos.nl/nosnieuwseconomie',field:fields[2],source:'NOS'},
 {url:'https://feeds.nos.nl/nosnieuwsbinnenland',field:'',source:'NOS'},
 {url:'https://www.rivm.nl/nieuws/rss.xml',field:'',source:'RIVM'}
];
const rules:Record<string,RegExp>={
 [fields[1]]:/\b(zorg|zorgkosten|zorgverlener\w*|gezondheid\w*|ziekenhuis\w*|patiënt\w*|verpleeg\w*|huisarts\w*|medisch\w*|vaccin\w*|hepatitis|luchtweginfectie\w*)\b/i,
 [fields[3]]:/\b(onderwijs\w*|school\w*|student\w*|universiteit\w*|leraar\w*|docent\w*|studieschuld\w*)\b/i,
 [fields[4]]:/\b(energie\w*|klimaat\w*|duurzaam\w*|stroomnet\w*|netbeheerder\w*|elektric\w*|techniek|technisch\w*|windpark\w*|zonnepane\w*|circulair\w*|stikstof\w*)\b/i,
 [fields[5]]:/\b(wonen|woning\w*|huur\w*|vervoer|trein\w*|fiets\w*|supermarkt\w*|restaurant\w*|voeding|opvoed\w*|bibliotheek\w*|gemeente\w*|school\w*)\b/i
};
function decode(s:string){return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<[^>]*>/g,'').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').trim();}
export function parseFeed(xml:string){return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/g)].map(m=>{const get=(tag:string)=>decode(m[1].match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))?.[1]||'');return {title:get('title'),url:get('link'),published_at:get('pubDate')};}).filter(i=>{try{return ['nos.nl','www.rivm.nl'].includes(new URL(i.url).hostname)&&!!i.title&&Number.isFinite(Date.parse(i.published_at));}catch{return false}});}
export function weekKey(){const s=new Date().toLocaleDateString('sv-SE',{timeZone:'Europe/Amsterdam'});const d=new Date(s+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);return d.toISOString().slice(0,10);}
export function matchesField(field:string,title:string){return !/^podcast\b|^wekdienst\b|in Nieuwsuur:/i.test(title)&&(!rules[field]||rules[field].test(title));}
export async function refreshNews(){
 const db=database(),week=weekKey();
 const results=await Promise.allSettled(feeds.map(async f=>{const r=await fetch(f.url,{signal:AbortSignal.timeout(12000),headers:{Accept:'application/rss+xml, application/xml, text/xml'}});if(!r.ok)throw Error('Nieuwsbron tijdelijk niet bereikbaar');return {...f,items:parseFeed(await r.text())};}));
 const loaded=results.flatMap(x=>x.status==='fulfilled'?[x.value]:[]);
 if(!loaded.length)throw Error('De nieuwsbronnen zijn tijdelijk niet bereikbaar.');
 let inserted=0;const missing:string[]=[];
 for(const field of fields){
  const existing=await db.prepare('SELECT id,title FROM news WHERE field=? AND week=? LIMIT 1').bind(field,week).first<{id:string;title:string}>();
  if(existing&&matchesField(field,existing.title))continue;
  const all=loaded.flatMap(f=>f.items.filter(i=>(rules[field]?matchesField(field,i.title):f.field===field&&matchesField(field,i.title))).map(i=>({...i,source:f.source}))).sort((a,b)=>Date.parse(b.published_at)-Date.parse(a.published_at));
  let chosen=false;
  for(const a of all){
   if(Date.parse(a.published_at)<Date.now()-14*86400000||Date.parse(a.published_at)>Date.now()+86400000)continue;
   const id=field+'|'+a.url;
   if(await db.prepare('SELECT id FROM news WHERE id=?').bind(id).first())continue;
   const save=db.prepare('INSERT OR IGNORE INTO news(id,field,title,url,source,published_at,selected_at,week) VALUES(?,?,?,?,?,?,?,?)').bind(id,field,a.title,a.url,a.source,new Date(a.published_at).toISOString(),new Date().toISOString(),week);
   // Replace an incorrectly classified automatic selection atomically.
   if(existing)await db.batch([db.prepare('DELETE FROM news WHERE id=? AND week=?').bind(existing.id,week),save]);else await save.run();
   inserted++;chosen=true;break;
  }
  if(!chosen){missing.push(field);if(existing)await db.prepare('DELETE FROM news WHERE id=? AND week=?').bind(existing.id,week).run();}
 }
 return {inserted,week,sources:loaded.length,missing};
}
