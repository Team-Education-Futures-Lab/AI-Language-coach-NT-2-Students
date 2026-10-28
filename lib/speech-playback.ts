let sharedContext:AudioContext|null=null;
function audioContext(){if(!sharedContext||sharedContext.state==='closed')sharedContext=new AudioContext();return sharedContext}
export function unlockCoachAudio(){if(typeof AudioContext!=='undefined')void audioContext().resume().catch(()=>{})}
export type SpeechAudioChunk={samples:Float32Array;sampleRate:number};
/** Schedule PCM on one audio clock. No new HTML player or utterance per sentence. */
export class SpeechPlayback{
 private context:AudioContext;
 private sources=new Set<AudioBufferSourceNode>();
 private nextTime=0;private started=false;private ended=false;private sealed=false;
 private resolve!:()=>void;private reject!:(error:Error)=>void;
 private done:Promise<void>;
 constructor(private onStart:()=>void){
  this.context=audioContext();this.done=new Promise((resolve,reject)=>{this.resolve=resolve;this.reject=reject});
  // A stop can happen before finish() is awaited.
  void this.done.catch(()=>{});
 }
 async unlock(){
  let timer:ReturnType<typeof setTimeout>|undefined;
  try{await Promise.race([this.context.resume(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(Error('Je browser wacht op toestemming voor geluid. Klik nogmaals op Voorlezen om geluid te starten.')),2500)})])}finally{clearTimeout(timer)}
 }
 add({samples,sampleRate}:SpeechAudioChunk){
  if(this.ended)return;
  const buffer=this.context.createBuffer(1,samples.length,sampleRate);buffer.getChannelData(0).set(samples);
  this.schedule(buffer);
 }
 private schedule(buffer:AudioBuffer){
  if(this.ended)return;
  const source=this.context.createBufferSource();source.buffer=buffer;source.connect(this.context.destination);this.sources.add(source);
  source.onended=()=>{source.disconnect();this.sources.delete(source);this.check()};
  const start=Math.max(this.nextTime,this.context.currentTime+.035);this.nextTime=start+buffer.duration;source.start(start);
  if(!this.started){this.started=true;this.onStart()}
 }
 async addFile(file:Blob){const buffer=await this.context.decodeAudioData(await file.arrayBuffer());this.schedule(buffer)}
 finish(){this.sealed=true;this.check();return this.done}
 private check(){if(this.sealed&&!this.sources.size&&!this.ended){this.ended=true;this.resolve()}}
 stop(){if(this.ended)return;this.ended=true;for(const source of this.sources){source.onended=null;source.stop();source.disconnect()}this.sources.clear();this.reject(new DOMException('Geannuleerd','AbortError'))}
}
