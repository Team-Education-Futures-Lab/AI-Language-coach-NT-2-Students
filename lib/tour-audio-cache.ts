/** Tour-local audio, including in-flight requests. Cleared when language/voice changes. */
export class TourAudioCache{
 private entries=new Map<string,Promise<Blob>>();
 private sizes=new Map<string,number>();
 private bytes=0;
 private maxBytes:number;
 constructor(maxBytes=32*1024*1024){this.maxBytes=maxBytes}
 get(key:string,load:()=>Promise<Blob>):Promise<Blob>{
  const hit=this.entries.get(key);if(hit)return hit;
  const pending=Promise.resolve().then(load).then(file=>{
   if(this.entries.get(key)!==pending)return file;
   this.sizes.set(key,file.size);this.bytes+=file.size;
   for(const old of this.sizes.keys()){
    if(this.bytes<=this.maxBytes)break;
    this.bytes-=this.sizes.get(old)!;this.sizes.delete(old);this.entries.delete(old);
   }
   return file;
  }).catch(error=>{if(this.entries.get(key)===pending)this.entries.delete(key);throw error});
  this.entries.set(key,pending);return pending;
 }
 clear(){this.entries.clear();this.sizes.clear();this.bytes=0}
}
