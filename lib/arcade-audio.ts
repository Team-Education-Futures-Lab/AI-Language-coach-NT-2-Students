import type {ActionMode} from './action-arcade';
export type ArcadeSound='jump'|'land'|'laser'|'collect'|'hit'|'win'|'lose';
export const chipTunes:Record<ActionMode,number[]>={platform:[72,76,79,76,74,77,81,77,71,74,79,74,69,72,76,79],race:[64,67,71,76,64,67,74,71,62,66,69,74,62,66,72,69],space:[69,76,81,76,67,74,79,74,65,72,77,72,64,71,76,71]};
type WorldScore={name:string;notes:number[];bass:number[];step:number;wave:OscillatorType;percussion:number};
export const worldScores:WorldScore[]=[
 {name:'Groene vallei',notes:[72,76,79,76,81,79,76,0,74,77,81,77,79,77,74,0,76,79,84,83,81,79,76,74,72,76,79,74,76,72,0,0],bass:[48,48,53,53,55,55,48,48],step:.19,wave:'square',percussion:.03},
 {name:'Kristalgrotten',notes:[69,0,76,0,81,80,76,0,72,0,71,0,68,71,76,0,69,72,76,0,83,81,80,0,76,72,71,68,69,0,0,0],bass:[45,45,41,41,40,40,45,45],step:.25,wave:'triangle',percussion:.012},
 {name:'Zandstad',notes:[64,65,68,69,71,69,68,65,64,0,68,71,72,71,68,0,69,72,76,72,71,68,65,64,65,68,71,65,64,0,64,0],bass:[40,40,41,41,45,45,40,40],step:.17,wave:'square',percussion:.045},
 {name:'IJseilanden',notes:[79,0,83,0,86,0,83,81,79,0,76,0,74,0,78,0,79,83,86,0,88,86,83,0,81,78,74,0,79,0,0,0],bass:[43,43,48,48,50,50,43,43],step:.23,wave:'sine',percussion:.008},
 {name:'Sterrenfort',notes:[60,67,72,75,74,72,67,0,68,72,75,79,77,75,72,0,65,72,77,80,79,77,74,71,67,71,74,77,75,72,67,60],bass:[36,36,44,44,41,41,43,36],step:.15,wave:'square',percussion:.05},
];
export function worldScore(stage:number){return worldScores[Math.max(0,Math.min(4,Math.floor(stage)-1||0))]}
export const noteFrequency=(midi:number)=>440*2**((midi-69)/12);
// Original, locally synthesized score. No files, network, microphone or autoplay.
export class ArcadeAudio{
 private context:AudioContext|null=null;private master:GainNode|null=null;private enabled=false;private music=false;private playing=false;private volume=.35;private mode:ActionMode='platform';private stage=1;private timer:ReturnType<typeof setInterval>|null=null;private next=0;private beat=0;private nodes=new Set<AudioScheduledSourceNode>();
 setEnabled(value:boolean){this.enabled=value;if(value){try{if(!this.context){this.context=new AudioContext();this.master=this.context.createGain();this.master.connect(this.context.destination)}this.master!.gain.value=this.volume;void this.context.resume().then(()=>this.sync()).catch(()=>{})}catch{}}else this.stop();}
 setMusic(value:boolean){this.music=value;this.sync()}
 setVolume(value:number){this.volume=Math.max(0,Math.min(.6,value));if(this.master&&this.context)this.master.gain.setTargetAtTime(this.volume,this.context.currentTime,.03)}
 setPlaying(value:boolean,mode:ActionMode=this.mode,stage:number=this.stage){if(mode!==this.mode||stage!==this.stage){this.stop();this.mode=mode;this.stage=stage;this.beat=0}this.playing=value;this.sync()}
 private stop(){if(this.timer)clearInterval(this.timer);this.timer=null;for(const node of this.nodes){try{node.stop()}catch{}}this.nodes.clear()}
 private sync(){this.stop();if(!this.enabled||!this.playing||!this.music||this.context?.state!=='running')return;this.next=this.context.currentTime+.04;const schedule=()=>{const c=this.context;if(!c)return;while(this.next<c.currentTime+.16){const score=worldScore(this.stage),step=score.step*(this.mode==='race'?.88:this.mode==='space'?1.08:1),n=score.notes[this.beat%score.notes.length];if(n)this.tone(n,step*.7,score.wave,.10,this.next);if(this.beat%2===0)this.tone(score.bass[Math.floor(this.beat/4)%score.bass.length],step*1.6,'triangle',.20,this.next);if(this.beat%4===2)this.noise(.035,score.percussion,this.next);this.next+=step;this.beat++}};schedule();this.timer=setInterval(schedule,60)}
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
