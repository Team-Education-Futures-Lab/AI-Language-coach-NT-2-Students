'use client';
import {useEffect,useRef,useState} from 'react';
import {Mic,Square,Volume2,VolumeX,Settings2} from 'lucide-react';
import type {PipMood} from './pip-mascot';
type Props={reply:string;disabled?:boolean;resetKey:string;onTranscript:(text:string)=>void;onMood?:(mood:PipMood)=>void};
type Phase='idle'|'opening'|'listening'|'transcribing'|'review'|'waiting'|'speaking';
export function VoiceControls({reply,disabled=false,resetKey,onTranscript,onMood}:Props){
 const [phase,setPhase]=useState<Phase>('idle'),[continuous,setContinuous]=useState(false),[draft,setDraft]=useState(''),[error,setError]=useState(''),[seconds,setSeconds]=useState(0),[settings,setSettings]=useState(false),[voices,setVoices]=useState<SpeechSynthesisVoice[]>([]),[voiceURI,setVoiceURI]=useState(''),[supported,setSupported]=useState(false);
 const recorder=useRef<MediaRecorder|null>(null),stream=useRef<MediaStream|null>(null),audio=useRef<AudioContext|null>(null),timer=useRef<ReturnType<typeof setInterval>|null>(null),controller=useRef<AbortController|null>(null),sequence=useRef(0),speechSequence=useRef(0),auto=useRef(false),started=useRef(0),lastReply=useRef(reply),waiting=useRef(false),latest=useRef({onTranscript,onMood,disabled});latest.current={onTranscript,onMood,disabled};
 function release(){if(timer.current)clearInterval(timer.current);timer.current=null;stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;void audio.current?.close().catch(()=>{});audio.current=null}
 function stopSpeech(){speechSequence.current++;if('speechSynthesis' in window)speechSynthesis.cancel()}
 function cancel(){sequence.current++;auto.current=false;waiting.current=false;setContinuous(false);controller.current?.abort();if(recorder.current){recorder.current.onstop=null;if(recorder.current.state!=='inactive')recorder.current.stop();recorder.current=null}release();stopSpeech();setPhase('idle')}
 useEffect(()=>{setSupported(!!navigator.mediaDevices?.getUserMedia&&typeof MediaRecorder!=='undefined');if(!('speechSynthesis' in window))return;const load=()=>setVoices(speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith('nl')));load();speechSynthesis.addEventListener('voiceschanged',load);return()=>speechSynthesis.removeEventListener('voiceschanged',load)},[]);
 useEffect(()=>{cancel();setError('');lastReply.current=reply;return()=>{cancel();latest.current.onMood?.('idle')}},[resetKey]);
 useEffect(()=>{const hide=()=>{if(document.hidden)cancel()};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide)},[]);
 useEffect(()=>{onMood?.(phase==='listening'?'listening':phase==='speaking'?'speaking':['waiting','transcribing'].includes(phase)?'thinking':'idle')},[phase,onMood]);
 useEffect(()=>{if(phase!=='waiting')return;const timeout=setTimeout(()=>{cancel();setError('Het antwoord duurt te lang. Je kunt verder typen of het spraakgesprek opnieuw starten.')},50000);return()=>clearTimeout(timeout)},[phase]);
 useEffect(()=>{if(lastReply.current===reply)return;lastReply.current=reply;if(waiting.current&&reply){waiting.current=false;speak(reply)}},[reply]);
 function speak(text:string){
  if(!('speechSynthesis' in window)){cancel();setError('Deze browser heeft geen voorleesfunctie. Het antwoord staat in het gesprek.');return}
  stopSpeech();const g=speechSequence.current;setPhase('speaking');
  const current=speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith('nl'));
  const voice=current.find(v=>v.voiceURI===voiceURI)||current.find(v=>/natural|online|premium|enhanced|google/i.test(v.name))||current.find(v=>v.lang.toLowerCase()==='nl-nl')||current[0];
  if(!voice){cancel();setError('Er is geen Nederlandse stem beschikbaar. Voeg een Nederlandse systeemstem toe of lees het antwoord in het gesprek.');return}
  const chunks=text.replace(/[*#_`]/g,'').match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[text];let index=0;
  const next=()=>{if(g!==speechSequence.current)return;if(index>=chunks.length){setPhase('idle');if(auto.current)void record(true);return}const u=new SpeechSynthesisUtterance(chunks[index++]);u.lang='nl-NL';u.voice=voice;u.rate=.94;u.onend=next;u.onerror=e=>{if(g!==speechSequence.current)return;cancel();if(!['canceled','interrupted'].includes(e.error))setError('Voorlezen lukte niet. Kies een andere stem in de spraakinstellingen.')};speechSynthesis.speak(u)};next();
 }
 async function record(isAuto=false){
  if(latest.current.disabled&&!isAuto)return;
  if(isAuto&&Date.now()-started.current>180000){cancel();setError('Je spraakgesprek van 3 minuten is afgerond. Je kunt een nieuw gesprek starten.');return}
  stopSpeech();setError('');setDraft('');setPhase('opening');setSeconds(0);const g=++sequence.current;
  try{
   const media=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
   if(g!==sequence.current){media.getTracks().forEach(t=>t.stop());return}stream.current=media;
   const mime=['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus'].find(m=>MediaRecorder.isTypeSupported(m));
   const rec=new MediaRecorder(media,mime?{mimeType:mime}:undefined);recorder.current=rec;const parts:Blob[]=[];
   rec.ondataavailable=e=>{if(e.data.size)parts.push(e.data)};rec.onerror=()=>{cancel();setError('De opname is onderbroken.')};
   rec.onstop=async()=>{release();recorder.current=null;if(g!==sequence.current)return;setPhase('transcribing');const c=new AbortController();controller.current=c;
    try{const body=new FormData();const ext=rec.mimeType.includes('mp4')?'m4a':rec.mimeType.includes('ogg')?'ogg':'webm';body.append('audio',new Blob(parts,{type:rec.mimeType}),`spraak.${ext}`);const r=await fetch('/api/speech',{method:'POST',body,signal:c.signal});const j=await r.json() as {text:string;error?:string};if(!r.ok)throw Error(j.error);if(g!==sequence.current)return;
    if(auto.current){waiting.current=true;setDraft(j.text);setPhase('waiting');latest.current.onTranscript(j.text)}else{setDraft(j.text);setPhase('review')}
    }catch(e){if(g===sequence.current){cancel();setError((e as Error).message)}}};
   let analyser:AnalyserNode|null=null,samples:Uint8Array<ArrayBuffer>|null=null;
   if(isAuto){audio.current=new AudioContext();await audio.current.resume();analyser=audio.current.createAnalyser();analyser.fftSize=1024;audio.current.createMediaStreamSource(media).connect(analyser);samples=new Uint8Array(analyser.fftSize)}
   if(g!==sequence.current){release();return}rec.start();setPhase('listening');const beginning=Date.now();let heard=false,lastSound=beginning;
   timer.current=setInterval(()=>{const now=Date.now();setSeconds(Math.floor((now-beginning)/1000));if(analyser&&samples){analyser.getByteTimeDomainData(samples);const rms=Math.sqrt(samples.reduce((sum,v)=>sum+((v-128)/128)**2,0)/samples.length);if(rms>.025){heard=true;lastSound=now}}
    if((now-beginning>=30000||(isAuto&&heard&&now-lastSound>1500&&now-beginning>2000))&&rec.state==='recording')rec.stop();
    else if(isAuto&&!heard&&now-beginning>12000){cancel();setError('Ik hoorde nog niets. Start opnieuw wanneer je klaar bent om te spreken.')}
   },100);
  }catch(e){if(g===sequence.current){cancel();setError((e as Error).name==='NotAllowedError'?'Geef deze website microfoontoegang om te spreken. Je kunt ook blijven typen.':'Je microfoon kon niet starten. Controleer de aansluiting en browsertoegang.')}}
 }
 return <div className="voice-controls"><div className="voice-actions"><button type="button" disabled={!supported||disabled||!['idle','review'].includes(phase)} onClick={()=>void record()}><Mic size={17}/>Spreek één bericht</button>{continuous?<button type="button" onClick={cancel}><Square size={17}/>Stop gesprek</button>:<button type="button" disabled={!supported||disabled||phase!=='idle'} onClick={()=>{auto.current=true;started.current=Date.now();setContinuous(true);void record(true)}}><Mic size={17}/>Spraakgesprek</button>}<button type="button" disabled={!reply||!['idle','speaking'].includes(phase)} aria-label={phase==='speaking'?'Stop voorlezen':'Lees het antwoord voor'} onClick={()=>phase==='speaking'?(stopSpeech(),setPhase('idle')):speak(reply)}>{phase==='speaking'?<VolumeX size={17}/>:<Volume2 size={17}/>}</button><button type="button" aria-label="Spraakinstellingen" onClick={()=>setSettings(v=>!v)}><Settings2 size={17}/></button></div>
 {phase==='opening'&&<p role="status">Microfoon openen…</p>}{phase==='listening'&&<p role="status">Ik luister · {seconds}s <button type="button" onClick={()=>recorder.current?.stop()}>Klaar met spreken</button></p>}{phase==='transcribing'&&<p role="status">Je spraak omzetten…</p>}{phase==='waiting'&&<p role="status">Verstaan: “{draft}” · De coach denkt mee. <button type="button" onClick={cancel}>Gesprek stoppen</button></p>}{phase==='speaking'&&<p role="status">Je coach spreekt. {continuous&&<button type="button" onClick={()=>void record(true)}>Ik wil reageren</button>}</p>}
 {phase==='review'&&<div className="voice-review"><label>Dit verstond ik<textarea rows={2} maxLength={1000} value={draft} onChange={e=>setDraft(e.target.value)}/></label><button type="button" className="primary-button" disabled={!draft.trim()||disabled} onClick={()=>{waiting.current=true;setPhase('waiting');onTranscript(draft)}}>Versturen</button><button type="button" onClick={cancel}>Annuleren</button></div>}{phase!=='idle'&&!continuous&&phase!=='review'&&<button type="button" onClick={cancel}>Annuleren</button>}
 {error&&<p role="alert" className="voice-error">{error}</p>}{settings&&<div className="voice-settings"><label>Nederlandse stem<select value={voiceURI} onChange={e=>setVoiceURI(e.target.value)}><option value="">Beste beschikbare stem</option>{voices.map(v=><option value={v.voiceURI} key={v.voiceURI}>{v.name}</option>)}</select></label><p>Spraakherkenning via Groq, zonder modeldownload. De Nederlandse stem komt van je browser of apparaat. In een spraakgesprek wisselen luisteren en antwoorden elkaar automatisch af. Maximaal 3 minuten; je kunt antwoorden onderbreken.</p></div>}<small>Als je spreekt, wordt je opname door Groq verwerkt. Typen blijft altijd mogelijk.</small>
 </div>;
}
