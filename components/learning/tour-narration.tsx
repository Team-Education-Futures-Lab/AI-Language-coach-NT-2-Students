'use client';
import {useEffect,useState} from 'react';
import {Volume2,VolumeX} from 'lucide-react';
import {B} from './translation';
import {bestVoice} from '@/lib/learning-language';
import {localCoachSpeech} from '@/lib/local-tts';
import {SpeechPlayback,unlockCoachAudio} from '@/lib/speech-playback';
import {validVoiceProfile,voiceLanguage} from '@/lib/voice-profiles';
import {spokenText} from '@/lib/speech';
export function TourNarration({text,language,active}:{text:string;language:string;active:boolean}){
 const [enabled,setEnabled]=useState(false),[status,setStatus]=useState(''),[error,setError]=useState('');
 useEffect(()=>{
  setError('');setStatus('');if(!active||!enabled||!text)return;
  const control=new AbortController();let player:SpeechPlayback|null=null;let utterance:SpeechSynthesisUtterance|null=null;
  const clean=spokenText(text);
  async function read(){
   try{
    let profile='F1';try{profile=localStorage.getItem('taalcoach-voice-profile-v1')||'F1'}catch{}
    if(profile!=='browser'&&voiceLanguage(language)&&typeof AudioContext!=='undefined'){
     setStatus('Stem voorbereiden…');player=new SpeechPlayback(()=>{if(!control.signal.aborted)setStatus('Voorlezen…')});await player.unlock();if(control.signal.aborted)return;
     let streamed=false;const result=await localCoachSpeech([{text:clean,language}],{profile:validVoiceProfile(profile)?profile:'F1',rate:.95,signal:control.signal,onChunk:chunk=>{if(!control.signal.aborted){streamed=true;player?.add(chunk)}}});
     if(control.signal.aborted)return;if(!streamed)await player.addFile(result.file);await player.finish();
    }else{
     if(!('speechSynthesis' in window))throw Error('Deze browser kan deze taal niet voorlezen. Je kunt de uitleg wel lezen.');
     // Some browsers populate their system voices shortly after opening the page.
     if(!speechSynthesis.getVoices().length)await new Promise<void>(resolve=>setTimeout(resolve,300));
     if(control.signal.aborted)return;const voice=bestVoice(speechSynthesis.getVoices(),language,'');
     if(!voice)throw Error('Geen stem voor deze taal beschikbaar. Kies een andere taal of voeg een stem toe in je apparaatinstellingen.');
     setStatus('Voorlezen…');await new Promise<void>((resolve,reject)=>{utterance=new SpeechSynthesisUtterance(clean);utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=.95;utterance.pitch=.98;const finish=(error?:Error)=>{control.signal.removeEventListener('abort',abort);error?reject(error):resolve()};const abort=()=>finish(new DOMException('Geannuleerd','AbortError'));control.signal.addEventListener('abort',abort,{once:true});utterance.onend=()=>finish();utterance.onerror=e=>finish(Error(e.error));speechSynthesis.speak(utterance)});
    }
    if(!control.signal.aborted)setStatus('');
   }catch(e){if(!control.signal.aborted){setStatus('');setError(e instanceof Error?e.message:'Voorlezen lukte niet. Zet voorlezen uit en weer aan om opnieuw te proberen.')}}
  }
  void read();return()=>{control.abort();player?.stop();if(utterance){utterance.onend=null;utterance.onerror=null;speechSynthesis.cancel()}};
 },[text,language,active,enabled]);
 return <div className="tour-narration"><button type="button" className="tour-sound-toggle" aria-pressed={enabled} onClick={()=>{if(!enabled)unlockCoachAudio();setEnabled(v=>!v)}}>{enabled?<Volume2 size={18}/>:<VolumeX size={18}/>}<B>{enabled?'Voorlezen aan':'Voorlezen uit'}</B></button>{status&&<small role="status"><B>{status}</B></small>}{error&&<p role="alert"><B>{error}</B></p>}</div>
}
