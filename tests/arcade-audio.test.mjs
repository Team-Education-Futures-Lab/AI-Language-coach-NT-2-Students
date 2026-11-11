import test from 'node:test';import assert from 'node:assert/strict';
import {ArcadeAudio,noteFrequency,chipTunes} from '../lib/arcade-audio.ts';
const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){}});
class FakeContext{
 static made=0;static sources=[];constructor(){FakeContext.made++;this.currentTime=0;this.state='running';this.sampleRate=44100;this.destination={}}
 createGain(){return{gain:param(),connect(){},disconnect(){}}}
 node(){const n={frequency:param(),connect(){},disconnect(){},start(){this.started=true},stop(){this.stopped=true}};FakeContext.sources.push(n);return n}
 createOscillator(){return this.node()}createBufferSource(){return this.node()}createBuffer(n,length){return{getChannelData:()=>new Float32Array(length)}}resume(){return Promise.resolve()}close(){this.state='closed';return Promise.resolve()}
}
test('audio requires opt-in, effects differ, mute and dispose release scheduled voices',async()=>{globalThis.AudioContext=FakeContext;const a=new ArcadeAudio();a.setPlaying(true);a.effect('laser');assert.equal(FakeContext.made,0);a.setEnabled(true);await Promise.resolve();a.effect('jump');const before=FakeContext.sources.length;a.effect('collect');assert.equal(FakeContext.sources.length-before,2);a.setMusic(true);assert.ok(FakeContext.sources.length>before+2);a.setPlaying(false);assert.ok(FakeContext.sources.every(s=>s.stopped));a.setEnabled(false);const count=FakeContext.sources.length;a.effect('laser');assert.equal(FakeContext.sources.length,count);a.dispose();delete globalThis.AudioContext});
test('three original melody patterns and notes stay in a modest audible range',()=>{assert.equal(new Set(Object.values(chipTunes).map(n=>n.join())).size,3);assert.equal(noteFrequency(69),440);for(const notes of Object.values(chipTunes))for(const n of notes)assert.ok(noteFrequency(n)>100&&noteFrequency(n)<2000)});
