'use client';
import {useEffect,useState,useRef} from 'react';
import {Volume2,VolumeX} from 'lucide-react';
import {B} from './translation';
import {availableBrowserVoices,bestVoice} from '@/lib/learning-language';
import {storedTourAudio} from '@/lib/tour-audio-storage';
import {TourAudioCache} from '@/lib/tour-audio-cache';
import {localCoachSpeech} from '@/lib/local-tts';
import {SpeechPlayback,unlockCoachAudio} from '@/lib/speech-playback';
import {validVoiceProfile,voiceLanguage} from '@/lib/voice-profiles';
import {spokenText} from '@/lib/speech';
export function TourNarration({text,nextText,language,active}:{text:string;nextText:string;language:string;active:boolean}){
 const [enabled,setEnabled]=useState(false),[status,setStatus]=useState(''),[error,setError]=useState('');
 const audioCache=useRef(new TourAudioCache()),session=useRef(new AbortController()),next=useRef(nextText);next.current=nextText;
 const [profile,setProfile]=useState('F1');
 useEffect(()=>{const sync=()=>{try{setProfile(localStorage.getItem('taalcoach-voice-profile-v1')||'F1')}catch{}};sync();window.addEventListener('taalcoach-voice',sync);return()=>window.removeEventListener('taalcoach-voice',sync)},[]);
 useEffect(()=>{session.current=new AbortController();return()=>{session.current.abort();audioCache.current.clear()}},[active,language,profile,enabled]);
 function prepare(value:string,onChunk?:Parameters<typeof localCoachSpeech>[1]['onChunk']){
  const clean=spokenText(value),selected=validVoiceProfile(profile)?profile:'F1';
  const key=JSON.stringify([language,selected,clean]);
  return audioCache.current.get(key,()=>storedTourAudio(key,()=>localCoachSpeech([{text:clean,language}],{profile:selected,rate:.95,signal:session.current.signal,onChunk}).then(result=>result.file)));
 }
 // Only one step ahead: avoid a long background queue delaying a learner who skips ahead.
 useEffect(()=>{if(active&&enabled&&nextText&&status==='Voorlezen…'&&profile!=='browser'&&voiceLanguage(language))void prepare(nextText).catch(()=>{})},[nextText,status,active,enabled,language,profile]);
 useEffect(()=>{
  setError('');setStatus('');if(!active||!enabled||!text)return;
  const control=new AbortController();let player:SpeechPlayback|null=null;let utterance:SpeechSynthesisUtterance|null=null;
  const clean=spokenText(text);
  async function read(forceBrowser=false):Promise<void>{
   try{
    if(!forceBrowser&&profile!=='browser'&&voiceLanguage(language)&&typeof AudioContext!=='undefined'){
     setStatus('Audio voorbereiden…');player=new SpeechPlayback(()=>{if(!control.signal.aborted)setStatus('Voorlezen…')});await player.unlock();if(control.signal.aborted)return;
     let streamed=false;const file=await prepare(clean,chunk=>{if(!control.signal.aborted){streamed=true;player?.add(chunk)}});
     if(control.signal.aborted)return;
     if(next.current)void prepare(next.current).catch(()=>{});
     if(!streamed)await player.addFile(file);await player.finish();
    }else{
     if(!('speechSynthesis' in window))throw Error('Deze browser kan deze taal niet voorlezen. Je kunt de uitleg wel lezen.');
     // Some browsers populate their system voices shortly after opening the page.
     const voices=await availableBrowserVoices(control.signal);
     if(control.signal.aborted)return;const voice=bestVoice(voices,language,'');
     if(!voice)throw Error('Geen stem voor deze taal beschikbaar. Kies een andere taal of voeg een stem toe in je apparaatinstellingen.');
     setStatus('Voorlezen…');await new Promise<void>((resolve,reject)=>{utterance=new SpeechSynthesisUtterance(clean);utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=.95;utterance.pitch=.98;const finish=(error?:Error)=>{control.signal.removeEventListener('abort',abort);error?reject(error):resolve()};const abort=()=>finish(new DOMException('Geannuleerd','AbortError'));control.signal.addEventListener('abort',abort,{once:true});utterance.onend=()=>finish();utterance.onerror=e=>finish(Error(e.error));speechSynthesis.speak(utterance)});
    }
    if(!control.signal.aborted)setStatus('');
   }catch(e){if(!control.signal.aborted){if(!forceBrowser&&profile!=='browser'&&voiceLanguage(language)){player?.stop();return read(true)}setStatus('');setError(e instanceof Error?e.message:'Voorlezen lukte niet. Zet voorlezen uit en weer aan om opnieuw te proberen.')}}
  }
  void read();return()=>{control.abort();player?.stop();if(utterance){utterance.onend=null;utterance.onerror=null;speechSynthesis.cancel()}};
 },[text,language,active,enabled,profile]);
 return <div className="tour-narration"><button type="button" className="tour-sound-toggle" aria-pressed={enabled} onClick={()=>{if(!enabled)unlockCoachAudio();setEnabled(v=>!v)}}>{enabled?<Volume2 size={18}/>:<VolumeX size={18}/>}<B>{enabled?'Voorlezen aan':'Voorlezen uit'}</B></button>{status&&<small role="status"><B>{status}</B></small>}{error&&<p role="alert"><B>{error}</B></p>}</div>
}
