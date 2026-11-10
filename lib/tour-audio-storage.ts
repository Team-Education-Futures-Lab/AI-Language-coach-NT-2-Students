// Only authored tour narration is stored here, never chats or microphone recordings.
const cacheName='taalcoach-tour-audio-v1';
const maxBytes=32*1024*1024,maxAge=30*24*60*60*1000;
export async function storedTourAudio(key:string,generate:()=>Promise<Blob>):Promise<Blob>{
 let cache:Cache|undefined,url:string|undefined;
 try{
  if(typeof window!=='undefined'&&typeof caches!=='undefined'&&crypto.subtle){
   const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('supertonic-3:rate=.95:'+key));
   url=new URL('/__tour_audio__/'+Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join(''),window.location.origin).href;
   cache=await caches.open(cacheName);const saved=await cache.match(url);
   if(saved&&Date.now()-Number(saved.headers.get('x-created'))<maxAge)return saved.blob();
   if(saved)await cache.delete(url);
  }
 }catch{cache=undefined}
 const file=await generate();
 if(cache&&url&&file.size<=maxBytes){
  try{
   await cache.put(url,new Response(file,{headers:{'content-type':'audio/wav','x-created':String(Date.now()),'x-bytes':String(file.size)}}));
   const entries=await cache.keys();let bytes=0;
   for(const entry of [...entries].reverse()){
    const value=await cache.match(entry);const size=Number(value?.headers.get('x-bytes'))||0;bytes+=size;
    if(bytes>maxBytes||Date.now()-Number(value?.headers.get('x-created'))>=maxAge)await cache.delete(entry);
   }
  }catch{/* Private mode or full storage: playback still works without persistent caching. */}
 }
 return file;
}
