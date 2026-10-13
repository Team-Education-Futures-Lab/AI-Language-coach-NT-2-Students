import {createHash} from 'node:crypto';
import {database,identity,fail} from '@/lib/server';
import {parseFeed,weekKey} from '@/lib/news';
import {studentProfile} from '@/lib/server-profile';
import {aiAllowance,aiProvider,generateText} from '@/lib/server-ai';
export const maxDuration=60;
const feeds=[['https://feeds.nos.nl/nosnieuwsalgemeen','NOS'],['https://feeds.nos.nl/nosnieuwstech','NOS'],['https://feeds.nos.nl/nosnieuwseconomie','NOS'],['https://www.rivm.nl/nieuws/rss.xml','RIVM']];
export async function GET(r:Request){const u=await identity(r);if(!u)return fail('Log in om je vaknieuws te lezen.',401);try{
 const p=await studentProfile(u);const field=(new URL(r.url).searchParams.get('field')||p.field).trim().slice(0,160);
 const fingerprint='personal:'+createHash('sha256').update(JSON.stringify([field,p.interests,p.level])).digest('hex');const week=weekKey(),db=database();
 const cached=await db.prepare('SELECT * FROM news WHERE field=? ORDER BY week DESC LIMIT 4').bind(fingerprint).all();
 const readingPrompt=['A1','A2'].includes(p.level)?'Lees de titel. Zoek drie belangrijke woorden en leg ze uit. Vertel in één of twee korte zinnen waar het artikel over gaat.':p.level==='B1'?'Vat de kern in drie zinnen samen. Welke nieuwe woorden passen bij jouw opleiding of interesses?':'Vat het standpunt samen. Onderscheid feiten van meningen en geef een onderbouwde reactie vanuit jouw vakgebied.';
 if(cached.results.some(a=>a.week===week))return Response.json({articles:cached.results,readingPrompt,level:p.level});
 const loaded=await Promise.allSettled(feeds.map(async([url,source])=>{const response=await fetch(url,{signal:AbortSignal.timeout(10000),next:{revalidate:3600}});if(!response.ok)throw Error();return parseFeed(await response.text()).map(a=>({...a,source}))}));
 const all=loaded.flatMap(r=>r.status==='fulfilled'?r.value:[]).filter(a=>Date.parse(a.published_at)>Date.now()-14*86400000&&Date.parse(a.published_at)<Date.now()+86400000);const unique=[...new Map(all.map(a=>[a.url,a])).values()];
 const words=(field+' '+p.interests).toLowerCase().match(/[\p{L}]{4,}/gu)||[];
 const rank=(title:string)=>words.reduce((n,w)=>n+(title.toLowerCase().includes(w)?1:0),0);
 const candidates=unique.sort((a,b)=>rank(b.title)-rank(a.title)||Date.parse(b.published_at)-Date.parse(a.published_at)).slice(0,35);
 let index=0,warning='';if(!candidates.length)return Response.json({articles:cached.results,readingPrompt,level:p.level,warning:'De bronnen zijn tijdelijk niet bereikbaar. Eerder gekozen nieuws blijft staan.'});
 if(aiProvider()){try{await aiAllowance(u);const raw=JSON.parse(await generateText([{role:'system',content:'Select one real news headline most relevant to this adult learner: field, interests and Dutch reading level. Prefer a clear concrete topic at A1/A2. Only select from candidates. Never invent or change news. Return JSON {"index":integer}.'},{role:'user',content:JSON.stringify({field,interests:p.interests,level:p.level,candidates:candidates.map((a,index)=>({index,title:a.title}))})}],{json:true,maxTokens:120}));if(Number.isInteger(raw.index)&&raw.index>=0&&raw.index<candidates.length)index=raw.index}catch{warning='AI-selectie is tijdelijk niet beschikbaar. Dit artikel is gekozen op trefwoorden en actualiteit.'}}
 else warning='Dit artikel is gekozen op trefwoorden en actualiteit; de AI-selectie wordt nog ingesteld.';
 const a=candidates[index];await db.prepare('INSERT INTO news(id,field,title,url,source,published_at,selected_at,week) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT DO NOTHING').bind(fingerprint+'|'+week,fingerprint,a.title,a.url,a.source,new Date(a.published_at).toISOString(),new Date().toISOString(),week).run();
 return Response.json({articles:(await db.prepare('SELECT * FROM news WHERE field=? ORDER BY week DESC LIMIT 4').bind(fingerprint).all()).results,readingPrompt,level:p.level,warning});
 }catch{return fail('Het nieuws kon niet worden geladen. Probeer opnieuw.',503)}}
