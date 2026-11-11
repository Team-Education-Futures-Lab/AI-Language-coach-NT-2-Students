export function newsSearchUrl(query:string){const u=new URL('https://news.google.com/rss/search');u.search=new URLSearchParams({q:query.trim().slice(0,160),hl:'nl',gl:'NL',ceid:'NL:nl'}).toString();return u.href}
function plain(value:string){return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<[^>]*>/g,'').replace(/&#(x[\da-f]+|\d+);/gi,(_,n)=>{const code=n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n);return code<=0x10ffff?String.fromCodePoint(code):''}).replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').trim()}
export function parseNewsSearch(xml:string,now=Date.now()){
 const seen=new Set<string>();
 return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/g)].flatMap(([_,item])=>{
  const get=(tag:string)=>plain(item.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`))?.[1]||'');
  const source=get('source')||'Google Nieuws',rawTitle=get('title'),title=rawTitle.endsWith(' - '+source)?rawTitle.slice(0,-source.length-3):rawTitle,url=get('link'),date=Date.parse(get('pubDate'));
  try{const parsed=new URL(url);if(parsed.protocol!=='https:'||parsed.hostname!=='news.google.com'||parsed.username||parsed.password||!title||!Number.isFinite(date)||date>now+86400000)return []}catch{return []}
  const key=title.toLocaleLowerCase()+'|'+source;if(seen.has(key))return [];seen.add(key);
  return [{title,url,source,published_at:new Date(date).toISOString()}];
 }).sort((a,b)=>Date.parse(b.published_at)-Date.parse(a.published_at)).slice(0,20);
}
