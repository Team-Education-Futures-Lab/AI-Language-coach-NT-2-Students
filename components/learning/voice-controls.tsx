'use client';
import {useEffect,useRef,useState} from 'react';
import {Mic,Phone,PhoneOff,MessageCircle,Volume2,VolumeX,Settings2} from 'lucide-react';
import {B} from './translation';
import {useCoach} from './coach-preferences';
import {bestVoice,coachSpeechSegments,languageName} from '@/lib/learning-language';
import {localCoachSpeech,preloadCoachVoice} from '@/lib/local-tts';
import {SpeechPlayback,unlockCoachAudio} from '@/lib/speech-playback';
import {createVoiceActivity} from '@/lib/voice-activity';
import {VoicePreload} from './voice-preload';
import {voiceProfiles,validVoiceProfile,voiceLanguage,type VoiceProfile} from '@/lib/voice-profiles';
import {PipMascot,type PipMood} from './pip-mascot';
type Props={reply:string;replyKey?:string;replyLanguage?:string;requestError?:string;disabled?:boolean;resetKey:string;onTranscript:(text:string)=>void;onMood?:(mood:PipMood)=>void};
type Phase='idle'|'opening'|'listening'|'transcribing'|'review'|'waiting'|'preparing'|'speaking';
const readKey='taalcoach-read-aloud-v1';
export function VoiceControls({reply,replyKey,replyLanguage,requestError,disabled=false,resetKey,onTranscript,onMood}:Props){
 const {supportLanguage:language}=useCoach();
 const [mode,setMode]=useState<'type'|'call'>('type'),[rate,setRate]=useState(.95),[profile,setProfile]=useState<VoiceProfile>('F1'),[engineMode,setEngineMode]=useState<'natural'|'browser'>('natural');
 const [phase,setPhase]=useState<Phase>('idle'),[continuous,setContinuous]=useState(false),[readAloud,setReadAloud]=useState(false),[draft,setDraft]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState(''),[seconds,setSeconds]=useState(0),[settings,setSettings]=useState(false),[voices,setVoices]=useState<SpeechSynthesisVoice[]>([]),[voiceURI,setVoiceURI]=useState(''),[supported,setSupported]=useState(false);
 const [micLevel,setMicLevel]=useState(0),[quiet,setQuiet]=useState(false),[testing,setTesting]=useState(false),[devices,setDevices]=useState<MediaDeviceInfo[]>([]),[deviceId,setDeviceId]=useState('');
 const playback=useRef<SpeechPlayback|null>(null),synthesis=useRef<AbortController|null>(null),prefetch=useRef<AbortController|null>(null),readEnabled=useRef(false);
 const recorder=useRef<MediaRecorder|null>(null),stream=useRef<MediaStream|null>(null),audio=useRef<AudioContext|null>(null),source=useRef<MediaStreamAudioSourceNode|null>(null),timer=useRef<ReturnType<typeof setInterval>|null>(null),controller=useRef<AbortController|null>(null),sequence=useRef(0),speechSequence=useRef(0),auto=useRef(false),started=useRef(0),lastReply=useRef(replyKey||reply),waiting=useRef(false),latest=useRef({onTranscript,onMood,disabled});latest.current={onTranscript,onMood,disabled};
 function release(close=false){
  if(timer.current)clearInterval(timer.current);timer.current=null;source.current?.disconnect();source.current=null;
  stream.current?.getTracks().forEach(t=>{t.onended=null;t.stop()});stream.current=null;setMicLevel(0);
  if(close){void audio.current?.close().catch(()=>{});audio.current=null}
 }
 function stopSpeech(){synthesis.current?.abort();synthesis.current=null;playback.current?.stop();playback.current=null;speechSequence.current++;if('speechSynthesis' in window)speechSynthesis.cancel()}
 function cancel(){sequence.current++;auto.current=false;waiting.current=false;setContinuous(false);setTesting(false);controller.current?.abort();if(recorder.current){recorder.current.onstop=null;if(recorder.current.state!=='inactive')recorder.current.stop();recorder.current=null}release(true);stopSpeech();setNotice('');setPhase('idle')}
 function saveReadAloud(value:boolean){readEnabled.current=value;setReadAloud(value);try{localStorage.setItem(readKey,String(value));window.dispatchEvent(new Event('taalcoach-read-aloud'))}catch{}}
 useEffect(()=>{
  const sync=()=>{try{const value=localStorage.getItem('taalcoach-voice-profile-v1');if(validVoiceProfile(value)){setProfile(value);setEngineMode('natural')}else if(value==='browser')setEngineMode('browser');setDeviceId(localStorage.getItem('taalcoach-microphone-v1')||'')}catch{}};
  const syncRead=()=>{try{const value=localStorage.getItem(readKey)==='true';readEnabled.current=value;setReadAloud(value);if(!value){stopSpeech();setPhase(p=>p==='preparing'||p==='speaking'?'idle':p)}}catch{}};
  sync();syncRead();window.addEventListener('taalcoach-voice',sync);window.addEventListener('taalcoach-read-aloud',syncRead);window.addEventListener('storage',syncRead);
  return()=>{window.removeEventListener('taalcoach-voice',sync);window.removeEventListener('taalcoach-read-aloud',syncRead);window.removeEventListener('storage',syncRead)};
 },[]);
 function chooseProfile(value:string){cancel();if(value==='browser')setEngineMode('browser');else if(validVoiceProfile(value)){setEngineMode('natural');setProfile(value)}try{localStorage.setItem('taalcoach-voice-profile-v1',value);window.dispatchEvent(new Event('taalcoach-voice'))}catch{}}
 useEffect(()=>{setSupported(!!navigator.mediaDevices?.getUserMedia&&typeof MediaRecorder!=='undefined');if(!('speechSynthesis' in window))return;const load=()=>setVoices(speechSynthesis.getVoices());load();speechSynthesis.addEventListener('voiceschanged',load);return()=>speechSynthesis.removeEventListener('voiceschanged',load)},[]);
 useEffect(()=>{cancel();setError('');lastReply.current=replyKey||reply;return()=>{cancel();prefetch.current?.abort();latest.current.onMood?.('idle')}},[resetKey,language]);
 useEffect(()=>{if(disabled&&['opening','listening','review'].includes(phase))cancel()},[disabled,phase]);
 useEffect(()=>{if(requestError){cancel();setError(requestError)}},[requestError]);
 useEffect(()=>{const hide=()=>{if(document.hidden)cancel()};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide)},[]);
 useEffect(()=>{onMood?.(phase==='listening'?'listening':phase==='speaking'?'speaking':['waiting','transcribing','preparing'].includes(phase)?'thinking':'idle')},[phase,onMood]);
 useEffect(()=>{if(phase!=='waiting')return;const timeout=setTimeout(()=>{cancel();setError('Het antwoord duurt te lang. Je kunt verder typen of het spraakgesprek opnieuw starten.')},50000);return()=>clearTimeout(timeout)},[phase]);
 useEffect(()=>{
  const key=replyKey||reply;if(lastReply.current===key)return;lastReply.current=key;if(!reply)return;
  const wasWaiting=waiting.current;waiting.current=false;
  if(readEnabled.current)void speak(reply);else if(auto.current)void record(true);else if(wasWaiting)setPhase('idle');
 },[reply,replyKey]);
 // Prepare a visible reply while the learner reads it; clicking later can use cached audio.
 useEffect(()=>{
  if(!reply||disabled||readAloud||engineMode!=='natural')return;
  const parts=coachSpeechSegments(reply,replyLanguage||language);if(parts.some(p=>!voiceLanguage(p.language)))return;
  const c=new AbortController();prefetch.current=c;
  const timer=setTimeout(()=>{void preloadCoachVoice().then(()=>localCoachSpeech(parts,{profile,rate,signal:c.signal})).catch(()=>{})},350);
  return()=>{clearTimeout(timer);c.abort()};
 },[reply,replyLanguage,language,profile,rate,readAloud,disabled,engineMode]);
 async function speak(text:string,supportLanguage?:string){
  prefetch.current?.abort();stopSpeech();const g=speechSequence.current;setError('');setNotice('');
  const control=new AbortController();synthesis.current=control;const chunks=coachSpeechSegments(text,supportLanguage||replyLanguage||language);
  try{
   if(engineMode==='natural'){
    if(typeof AudioContext==='undefined')throw Error('Deze browser kan de lokale stem niet afspelen. Kies de browserstem in Spraakinstellingen.');
    setPhase('preparing');let streamed=false;
    const player=new SpeechPlayback(()=>{if(g===speechSequence.current){setNotice('');setPhase('speaking')}});playback.current=player;
    control.signal.addEventListener('abort',()=>player.stop(),{once:true});await player.unlock();
    const result=await localCoachSpeech(chunks,{profile,rate,signal:control.signal,onProgress:message=>{if(g===speechSequence.current&&!streamed)setNotice(message)},onChunk:chunk=>{if(g===speechSequence.current){streamed=true;player.add(chunk)}}});
    if(g!==speechSequence.current)return;if(!streamed)await player.addFile(result.file);await player.finish();
   }else for(const chunk of chunks){
    if(g!==speechSequence.current)return;
    if(!('speechSynthesis' in window))throw Error('Deze browser heeft geen voorleesstem. Je kunt het antwoord lezen.');
    const voice=bestVoice(speechSynthesis.getVoices(),chunk.language,chunk.language==='nl'?voiceURI:'');
    if(!voice)throw Error('Geen stem beschikbaar voor '+languageName(chunk.language)+'. Je kunt het antwoord lezen of een systeemstem toevoegen in je apparaatinstellingen.');
    setPhase('speaking');
    await new Promise<void>((resolve,reject)=>{
     const u=new SpeechSynthesisUtterance(chunk.text);u.lang=voice.lang;u.voice=voice;u.rate=rate;u.pitch=.98;
     let settled=false;const abort=()=>finish(new DOMException('Geannuleerd','AbortError'));
     const finish=(error?:unknown)=>{if(settled)return;settled=true;control.signal.removeEventListener('abort',abort);u.onend=null;u.onerror=null;error?reject(error):resolve()};
     u.onend=()=>finish();u.onerror=e=>finish(Error(e.error));control.signal.addEventListener('abort',abort,{once:true});speechSynthesis.resume();speechSynthesis.speak(u);
    });
   }
   if(g!==speechSequence.current)return;setNotice('');setPhase('idle');if(auto.current)void record(true);
  }catch(e){if(g!==speechSequence.current)return;cancel();setError((e as Error).message)}
 }
 function toggleReadAloud(){
  const next=!readEnabled.current;saveReadAloud(next);
  if(next&&reply&&!['opening','listening','transcribing','waiting'].includes(phase))void speak(reply);
  else if(!next){stopSpeech();if(['speaking','preparing'].includes(phase)){setPhase('idle');if(auto.current&&!latest.current.disabled)void record(true)}}
 }
 async function record(isAuto=false,testOnly=false){
  if(latest.current.disabled&&!testOnly){cancel();return}
  if(isAuto&&Date.now()-started.current>180000){cancel();setError('Je spraakgesprek van 3 minuten is afgerond. Je kunt een nieuw gesprek starten.');return}
  unlockCoachAudio();prefetch.current?.abort();stopSpeech();setError('');setNotice('');setDraft('');setQuiet(false);setTesting(testOnly);setPhase('opening');setSeconds(0);const g=++sequence.current;
  try{
   // Unlock from the click, before waiting for permission. Recording itself must
   // never wait for a suspended AudioContext; the manual stop works without VAD.
   if(typeof AudioContext!=='undefined'){audio.current??=new AudioContext();void audio.current.resume().catch(()=>{})}
   const media=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,...(deviceId?{deviceId:{exact:deviceId}}:{})}});
   if(g!==sequence.current){media.getTracks().forEach(t=>t.stop());return}stream.current=media;
   void navigator.mediaDevices.enumerateDevices().then(all=>{if(g===sequence.current)setDevices(all.filter(d=>d.kind==='audioinput'))}).catch(()=>{});
   media.getAudioTracks().forEach(track=>{track.onended=()=>{if(g===sequence.current){cancel();setError('De microfoon is losgekoppeld. Kies een andere microfoon in de spraakinstellingen.')}}});
   const mime=['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus'].find(m=>MediaRecorder.isTypeSupported(m));
   const rec=new MediaRecorder(media,mime?{mimeType:mime}:undefined);recorder.current=rec;const parts:Blob[]=[];
   rec.ondataavailable=e=>{if(e.data.size)parts.push(e.data)};rec.onerror=()=>{cancel();setError('De opname is onderbroken.')};
   rec.onstop=async()=>{
    release(!isAuto);recorder.current=null;if(g!==sequence.current)return;
    if(testOnly){setTesting(false);setPhase('idle');setNotice('Microfoontest afgerond. Deze test is niet verstuurd.');return}
    setPhase('transcribing');const c=new AbortController();controller.current=c;
    try{
     const blob=new Blob(parts,{type:rec.mimeType});if(blob.size<200)throw Error('De opname bevat nog geen geluid. Spreek iets langer en probeer opnieuw.');
     const body=new FormData(),ext=rec.mimeType.includes('mp4')?'m4a':rec.mimeType.includes('ogg')?'ogg':'webm';body.append('audio',blob,`spraak.${ext}`);
     const timeout=setTimeout(()=>c.abort(),45000);let r:Response;try{r=await fetch('/api/speech',{method:'POST',body,signal:c.signal})}finally{clearTimeout(timeout)}
     const j=await r.json() as {text:string;error?:string};if(!r.ok)throw Error(j.error);if(!j.text?.trim())throw Error('Ik kon geen woorden verstaan. Controleer de geluidsmeter en probeer opnieuw.');if(g!==sequence.current)return;
     if(auto.current){waiting.current=true;setDraft(j.text);setPhase('waiting');latest.current.onTranscript(j.text)}else{setDraft(j.text);setPhase('review')}
    }catch(e){if(g===sequence.current){cancel();setError((e as Error).name==='AbortError'?'Spraakherkenning duurde te lang. Probeer opnieuw.':(e as Error).message)}}
   };
   let analyser:AnalyserNode|null=null,samples:Float32Array<ArrayBuffer>|null=null;
   if(audio.current){analyser=audio.current.createAnalyser();analyser.fftSize=1024;source.current=audio.current.createMediaStreamSource(media);source.current.connect(analyser);samples=new Float32Array(analyser.fftSize)}
   rec.start(250);setPhase('listening');const beginning=Date.now(),activity=createVoiceActivity(beginning);
   timer.current=setInterval(()=>{
    const now=Date.now();setSeconds(Math.floor((now-beginning)/1000));let heard=false,finished=false;
    if(analyser&&samples&&audio.current?.state==='running'){analyser.getFloatTimeDomainData(samples);const rms=Math.sqrt(samples.reduce((sum,v)=>sum+v*v,0)/samples.length),reading=activity.sample(rms,now);setMicLevel(reading.level);setQuiet(reading.quiet);heard=reading.heard;finished=reading.finished}
    else setQuiet(now-beginning>8000);
    if(testOnly&&now-beginning>=10000){if(rec.state==='recording')rec.stop()}
    else if(isAuto&&finished&&rec.state==='recording')rec.stop();
    else if(now-beginning>=30000&&rec.state==='recording'){
     if(isAuto&&!heard&&analyser&&audio.current?.state==='running'){cancel();setError('Geen geluid gemeten. Controleer de microfoonkeuze en systeemtoegang, of gebruik Klaar met spreken om zelf te versturen.')}
     else rec.stop();
    }
   },100);
  }catch(e){if(g===sequence.current){cancel();const name=(e as Error).name;setError(name==='NotAllowedError'?'Geef deze website microfoontoegang in je browser én systeeminstellingen.':name==='NotFoundError'||name==='OverconstrainedError'?'De gekozen microfoon is niet beschikbaar. Kies Standaardmicrofoon in de spraakinstellingen.':'Je microfoon kon niet starten. Controleer de aansluiting en browsertoegang.')}}
 }
 const labels:Record<Phase,string>={idle:'Klaar om te praten',opening:'Microfoon openen…',listening:testing?'Test je microfoon':'Ik luister naar je',transcribing:'Even luisteren naar je woorden…',review:'Controleer je bericht',waiting:'Je coach denkt mee',preparing:'Je coach bereidt de stem voor…',speaking:'Je coach spreekt'};
 function beginCall(){unlockCoachAudio();saveReadAloud(true);auto.current=true;started.current=Date.now();setContinuous(true);void record(true)}
 return <div className="voice-controls" data-mode={mode} data-phase={phase}>
 <div className="conversation-modes" role="group" aria-label="Gespreksvorm"><button type="button" aria-pressed={mode==='type'} onClick={()=>{cancel();setMode('type')}}><MessageCircle size={16}/><B>Typen</B></button><button type="button" aria-pressed={mode==='call'} onClick={()=>{cancel();setMode('call')}}><Phone size={16}/><B>Bellen</B></button><span dir="auto">{languageName(language)} {language!=='nl'?'↔ Nederlands':''}</span></div>
 {mode==='call'&&<div className="voice-call-card" data-phase={phase}><div className="voice-call-orbit"><PipMascot size="small" mood={phase==='listening'?'listening':phase==='speaking'?'speaking':['waiting','transcribing','preparing'].includes(phase)?'thinking':'idle'} decorative/></div><div className="voice-call-copy"><b role="status"><B>{labels[phase]}</B></b><small dir="auto">{languageName(language)} {language!=='nl'?'↔ Nederlands':''}</small></div>{continuous?<button className="voice-hangup" type="button" onClick={cancel} aria-label="Ophangen"><PhoneOff size={19}/></button>:<button className="voice-connect" type="button" disabled={!supported||disabled||phase!=='idle'} onClick={beginCall}><Phone size={18}/><B>Start gesprek</B></button>}</div>}
 <div className="voice-actions">{mode==='type'&&<button type="button" disabled={!supported||disabled||!['idle','review'].includes(phase)} onClick={()=>void record()}><Mic size={17}/><B>Spreek één bericht</B></button>}<button type="button" className="voice-read-toggle" aria-label="Automatisch voorlezen" aria-pressed={readAloud} onClick={toggleReadAloud}>{readAloud?<Volume2 size={17}/>:<VolumeX size={17}/>}<B>{readAloud?'Voorlezen: aan':'Voorlezen: uit'}</B></button><button type="button" aria-label="Spraakinstellingen" aria-expanded={settings} onClick={()=>setSettings(v=>!v)}><Settings2 size={17}/></button></div>
 {readAloud&&<small><B>Nieuwe antwoorden worden vanzelf uitgesproken. Klik op Voorlezen: aan om dit uit te zetten.</B></small>}
 {phase==='opening'&&mode==='type'&&<p role="status"><B>Microfoon openen…</B></p>}
 {phase==='listening'&&<div className="voice-mic-feedback"><div><Mic size={16}/><B>{testing?'Microfoontest':'Ik luister'}</B> · {seconds}s</div><meter aria-label="Microfoongeluid" min={0} max={1} value={micLevel}/><small><B>{micLevel>.025?'Je microfoon ontvangt geluid.':'Spreek rustig naar je microfoon.'}</B></small>{quiet&&<p role="status"><B>Nog weinig geluid. Controleer je microfoon in Spraakinstellingen. Je kunt ook zelf op Klaar met spreken klikken.</B></p>}<button type="button" onClick={()=>recorder.current?.state==='recording'&&recorder.current.stop()}><B>{testing?'Test afronden':'Klaar met spreken'}</B></button></div>}
 {phase==='transcribing'&&mode==='type'&&<p role="status"><B>Je spraak omzetten…</B></p>}{phase==='waiting'&&<p role="status" dir="auto">“{draft}”</p>}{['preparing','speaking'].includes(phase)&&continuous&&<button type="button" onClick={()=>void record(true)}><Mic size={15}/><B>Ik wil reageren</B></button>}
 {phase==='review'&&<div className="voice-review"><label><B>Dit verstond ik</B><textarea dir="auto" rows={2} maxLength={1000} value={draft} onChange={e=>setDraft(e.target.value)}/></label><button type="button" className="primary-button" disabled={!draft.trim()||disabled} onClick={()=>{waiting.current=true;setPhase('waiting');onTranscript(draft)}}><B>Versturen</B></button><button type="button" onClick={cancel}><B>Annuleren</B></button></div>}{phase!=='idle'&&!continuous&&phase!=='review'&&<button type="button" onClick={cancel}><B>Annuleren</B></button>}
 {phase==='preparing'&&!notice&&mode==='type'&&<p role="status"><B>Je audio wordt klaargezet…</B></p>}{notice&&<p role="status"><B>{notice}</B></p>}{error&&<p role="alert" className="voice-error"><B>{error}</B></p>}{!supported&&<p className="voice-error"><B>Spraakopname is in deze browser niet beschikbaar. Je kunt blijven typen.</B></p>}
 {settings&&<div className="voice-settings"><VoicePreload/><label><B>Stemprofiel</B><select value={engineMode==='browser'?'browser':profile} onChange={e=>chooseProfile(e.target.value)}><optgroup label="Vrouwelijk">{voiceProfiles.filter(v=>v.id.startsWith('F')).map(v=><option key={v.id} value={v.id}>{v.name}</option>)}</optgroup><optgroup label="Mannelijk">{voiceProfiles.filter(v=>v.id.startsWith('M')).map(v=><option key={v.id} value={v.id}>{v.name}</option>)}</optgroup><option value="browser">Browserstem (kan per taal verschillen)</option></select></label><button type="button" disabled={phase!=='idle'} onClick={()=>void speak('Hallo! Vandaag oefenen we samen Nederlands. Wat wil je vandaag leren?','nl')}><Volume2 size={16}/><B>Beluister stem</B></button>{engineMode==='browser'&&<label><B>Nederlandse browserstem</B><select value={voiceURI} onChange={e=>{cancel();setVoiceURI(e.target.value)}}><option value="">Automatisch</option>{voices.filter(v=>v.lang.startsWith('nl')).map(v=><option value={v.voiceURI} key={v.voiceURI}>{v.name}</option>)}</select></label>}<label><B>Tempo</B><select value={rate} onChange={e=>{cancel();setRate(Number(e.target.value))}}><option value={.85}>Rustig</option><option value={.95}>Natuurlijk</option><option value={1.05}>Vlot</option></select></label>
 <label><B>Microfoon</B><select value={deviceId} onChange={e=>{cancel();setDeviceId(e.target.value);try{localStorage.setItem('taalcoach-microphone-v1',e.target.value)}catch{}}}><option value="">Standaardmicrofoon</option>{devices.filter(d=>d.deviceId&&d.deviceId!=='default').map((d,i)=><option key={d.deviceId} value={d.deviceId}>{d.label||`Microfoon ${i+1}`}</option>)}</select></label><button type="button" disabled={!supported||phase!=='idle'} onClick={()=>void record(false,true)}><Mic size={16}/><B>Microfoon testen</B></button><small><B>De test blijft op je apparaat. Na toestemming kun je hier ook een andere microfoon kiezen.</B></small>
 <p><B>Eén stemprofiel voor Nederlands en 30 andere ondersteunde talen. De eerste zin begint zodra de audio klaar is; de rest wordt ondertussen voorbereid. De snelheid hangt af van je apparaat.</B></p>{!voiceLanguage(language)&&engineMode==='natural'&&<p role="status"><B>Chatten kan in jouw gekozen taal. Deze vaste stem ondersteunt die taal nog niet. Kies de browserstem als je apparaat een stem voor deze taal heeft; die kan anders klinken.</B></p>}<a href="/spraaklicenties.txt" target="_blank" rel="noreferrer"><B>Ondersteunde talen en stemlicenties</B></a></div>}<small><B>Je microfoon gaat alleen aan wanneer je start. Groq verwerkt je opname. Typen blijft mogelijk.</B></small>
 </div>;
}
