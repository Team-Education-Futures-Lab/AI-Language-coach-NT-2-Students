import type {ActionMode} from './action-arcade';
export type ArcadeSound='jump'|'land'|'laser'|'collect'|'hit'|'win'|'lose';
export const chipTunes:Record<ActionMode,number[]>={platform:[72,76,79,76,74,77,81,77,71,74,79,74,69,72,76,79],race:[64,67,71,76,64,67,74,71,62,66,69,74,62,66,72,69],space:[69,76,81,76,67,74,79,74,65,72,77,72,64,71,76,71]};
export const noteFrequency=(midi:number)=>440*2**((midi-69)/12);
// Original, locally synthesized score. No files, network, microphone or autoplay.
export class ArcadeAudio{
 private context:AudioContext|null=null;private master:GainNode|null=null;private enabled=false;private music=false;private playing=false;private volume=.35;private mode:ActionMode='platform';private timer:ReturnType<typeof setInterval>|null=null;private next=0;private beat=0;private nodes=new Set<AudioScheduledSourceNode>();
 setEnabled(value:boolean){this.enabled=value;if(value){try{if(!this.context){this.context=new AudioContext();this.master=this.context.createGain();this.master.connect(this.context.destination)}this.master!.gain.value=this.volume;void this.context.resume().then(()=>this.sync()).catch(()=>{})}catch{}}else this.stop();}
 setMusic(value:boolean){this.music=value;this.sync()}
 setVolume(value:number){this.volume=Math.max(0,Math.min(.6,value));if(this.master&&this.context)this.master.gain.setTargetAtTime(this.volume,this.context.currentTime,.03)}
 setPlaying(value:boolean,mode:ActionMode=this.mode){if(mode!==this.mode){this.stop();this.mode=mode;this.beat=0}this.playing=value;this.sync()}
 private stop(){if(this.timer)clearInterval(this.timer);this.timer=null;for(const node of this.nodes){try{node.stop()}catch{}}this.nodes.clear()}
 private sync(){this.stop();if(!this.enabled||!this.playing||!this.music||this.context?.state!=='running')return;this.next=this.context.currentTime+.04;const schedule=()=>{const c=this.context;if(!c)return;while(this.next<c.currentTime+.16){const n=chipTunes[this.mode][this.beat%16];this.tone(n,.105,'square',.11,this.next);if(this.beat%2===0)this.tone(chipTunes[this.mode][Math.floor(this.beat/4)*4%16]-24,.19,'triangle',.24,this.next);if(this.beat%4===2)this.noise(.035,.045,this.next);this.next+=this.mode==='race'?.145:this.mode==='space'?.205:.18;this.beat++}};schedule();this.timer=setInterval(schedule,60)}
 private source(node:AudioScheduledSourceNode,gain:GainNode){this.nodes.add(node);node.onended=()=>{this.nodes.delete(node);node.disconnect();gain.disconnect()}}
 private tone(note:number,duration:number,type:OscillatorType,volume:number,at:number,slide?:number){if(!this.context||!this.master)return;const c=this.context,osc=c.createOscillator(),gain=c.createGain();osc.type=type;osc.frequency.setValueAtTime(noteFrequency(note),at);if(slide!==undefined)osc.frequency.exponentialRampToValueAtTime(noteFrequency(slide),at+duration);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume,at+.004);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);osc.connect(gain);gain.connect(this.master);this.source(osc,gain);osc.start(at);osc.stop(at+duration+.01)}
 private noise(duration:number,volume:number,at:number){if(!this.context||!this.master)return;const c=this.context,buffer=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate),values=buffer.getChannelData(0);let n=1;for(let i=0;i<values.length;i++){n=(n*16807)%2147483647;values[i]=(n/2147483647*2-1)}const source=c.createBufferSource(),gain=c.createGain();source.buffer=buffer;gain.gain.setValueAtTime(volume,at);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);source.connect(gain);gain.connect(this.master);this.source(source,gain);source.start(at);source.stop(at+duration)}
 effect(kind:ArcadeSound){const c=this.context;if(!this.enabled||!c||c.state!=='running')return;const t=c.currentTime;
  if(kind==='jump')this.tone(52,.16,'square',.19,t,79);
  else if(kind==='laser')this.tone(88,.075,'sawtooth',.07,t,52);
  else if(kind==='land')this.noise(.035,.08,t);
  else if(kind==='hit'){this.noise(.19,.24,t);this.tone(45,.23,'square',.15,t,26)}
  else if(kind==='collect'){this.tone(83,.08,'square',.2,t);this.tone(95,.18,'square',.15,t+.075)}
  else if(kind==='win')[72,76,79,84,79,84,88].forEach((n,i)=>this.tone(n,.18,'square',.15,t+i*.11));
  else [60,56,52,48].forEach((n,i)=>this.tone(n,.25,'triangle',.25,t+i*.16));
 }
 dispose(){this.enabled=false;this.playing=false;this.stop();void this.context?.close();this.context=null;this.master=null}
}
