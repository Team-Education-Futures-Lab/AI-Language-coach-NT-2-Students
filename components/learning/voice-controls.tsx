'use client';
import {useCoach} from '@/components/learning/coach-preferences';
import {useEffect,useRef,useState} from 'react';
import {Mic,Square,Volume2,VolumeX,LoaderCircle,Settings2,X} from 'lucide-react';
import {audioSamples,transcribeAudio,spokenText} from '@/lib/speech';
import type {PipMood} from './pip-mascot';
type Props={reply:string;disabled?:boolean;resetKey:string;onTranscript:(text:string)=>void;onMood?:(mood:PipMood)=>void};
export function VoiceControls({reply,disabled=false,resetKey,onTranscript,onMood}:Props){const {text:coachText,coach}=useCoach();
 const [phase,setPhase]=useState<'idle'|'requesting'|'recording'|'transcribing'|'reviewing'|'speaking'>('idle'),[draft,setDraft]=useState(''),[error,setError]=useState(''),[seconds,setSeconds]=useState(0),[progress,setProgress]=useState<number|null>(null),[readReplies,setReadReplies]=useState(false),[settings,setSettings]=useState(false),[voices,setVoices]=useState<SpeechSynthesisVoice[]>([]),[voiceURI,setVoiceURI]=useState(''),[rate,setRate]=useState(1),[supported,setSupported]=useState(false);
 const recorder=useRef<MediaRecorder|null>(null),stream=useRef<MediaStream|null>(null),timer=useRef<ReturnType<typeof setInterval>|null>(null),abort=useRef<AbortController|null>(null),generation=useRef(0),speechGeneration=useRef(0),lastReply=useRef(reply),live=useRef({onTranscript,onMood,reply,readReplies,disabled});
 live.current={onTranscript,onMood,reply,readReplies,disabled};
 function releaseMic(){if(timer.current)clearInterval(timer.current);timer.current=null;stream.current?.getTracks().forEach(t=>t.stop());stream.current=null}
 function stopSpeech(){speechGeneration.current++;if(typeof speechSynthesis!=='undefined')speechSynthesis.cancel()}
 function cancel(){generation.current++;abort.current?.abort();abort.current=null;if(recorder.current){recorder.current.onstop=null;if(recorder.current.state!=='inactive')recorder.current.stop();recorder.current=null}releaseMic();stopSpeech();setPhase('idle');setProgress(null);setDraft('')}
 useEffect(()=>{setSupported(!!navigator.mediaDevices?.getUserMedia&&typeof MediaRecorder!=='undefined');if(!('speechSynthesis' in window))return;const load=()=>setVoices(speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith('nl')));load();speechSynthesis.addEventListener('voiceschanged',load);try{setVoiceURI(localStorage.getItem('pip-voice')||'')}catch{}return()=>speechSynthesis.removeEventListener('voiceschanged',load)},[]);
 useEffect(()=>{cancel();setError('');setReadReplies(false);lastReply.current=reply;return()=>{generation.current++;abort.current?.abort();if(recorder.current){recorder.current.onstop=null;if(recorder.current.state!=='inactive')recorder.current.stop()}releaseMic();stopSpeech();live.current.onMood?.('idle')}},[resetKey,coach.name,coach.character]);
 useEffect(()=>{onMood?.(phase==='recording'?'listening':phase==='speaking'?'speaking':phase==='transcribing'?'thinking':'idle')},[phase,onMood]);
 useEffect(()=>{const hide=()=>{if(document.hidden)cancel()};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide)},[]);
 useEffect(()=>{if(disabled)cancel()},[disabled]);
 useEffect(()=>{if(reply===lastReply.current)return;lastReply.current=reply;if(readReplies&&reply&&(phase==='idle'||phase==='speaking'))speak(reply)},[reply,readReplies]);
 function speak(text:string){
  if(!('speechSynthesis' in window)){setError('Deze browser kan geen tekst voorlezen. Je kunt de antwoorden wel lezen.');return}
  stopSpeech();const g=speechGeneration.current;setError('');setPhase('speaking');
  const selected=voices.find(v=>v.voiceURI===voiceURI)||voices.find(v=>/enhanced|premium|natural|google|microsoft/i.test(v.name))||voices.find(v=>v.lang.toLowerCase()==='nl-nl')||voices[0];
  const chunks=spokenText(text).match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[text];let index=0;
  const next=()=>{if(g!==speechGeneration.current)return;if(index>=chunks.length){setPhase('idle');return}const u=new SpeechSynthesisUtterance(chunks[index++]);u.lang='nl-NL';u.rate=rate;u.pitch=1;if(selected)u.voice=selected;u.onend=next;u.onerror=e=>{if(g!==speechGeneration.current)return;setPhase('idle');if(e.error!=='canceled'&&e.error!=='interrupted')setError('Voorlezen lukte niet. Kies eventueel een andere Nederlandse stem.')};speechSynthesis.speak(u)};next();
 }
 async function start(){
  if(disabled||phase==='transcribing'||phase==='requesting')return;
  stopSpeech();setDraft('');setError('');setReadReplies(true);setPhase('requesting');setSeconds(0);const g=++generation.current;
  try{
   const media=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
   if(g!==generation.current){media.getTracks().forEach(t=>t.stop());return}
   stream.current=media;const rec=new MediaRecorder(media);recorder.current=rec;const parts:Blob[]=[];let elapsed=0;
   rec.ondataavailable=e=>{if(e.data.size)parts.push(e.data)};
   rec.onerror=()=>{if(g===generation.current){cancel();setError('De opname is onderbroken. Controleer je microfoon.')}};
   rec.onstop=async()=>{
    releaseMic();recorder.current=null;if(g!==generation.current)return;setPhase('transcribing');setProgress(0);const controller=new AbortController();abort.current=controller;
    try{const samples=await audioSamples(new Blob(parts,{type:rec.mimeType}));if(g!==generation.current)return;const text=await transcribeAudio(samples,{signal:controller.signal,onProgress:p=>{if(g===generation.current)setProgress(p)}});if(g!==generation.current)return;setPhase('reviewing');setProgress(null);setDraft(text)}catch(e){if(g===generation.current){setPhase('idle');setError((e as Error).message)}}
   };
   rec.start();setPhase('recording');timer.current=setInterval(()=>{elapsed++;setSeconds(elapsed);if(elapsed>=30&&rec.state==='recording')rec.stop()},1000);
  }catch(e){releaseMic();if(g===generation.current){setPhase('idle');setError((e as Error).name==='NotAllowedError'?'Je microfoon is geblokkeerd. Geef deze site microfoontoegang via de browserinstellingen.':(e as Error).name==='NotFoundError'?'Er is geen microfoon gevonden. Sluit er een aan en probeer opnieuw.':'De microfoon kon niet starten. Probeer opnieuw.')}}
 }
 const working=phase==='transcribing'||phase==='requesting',recording=phase==='recording';
 return <div className="voice-controls"><div className="voice-actions">
 <button type="button" className={recording?'voice-mic is-recording':'voice-mic'} onClick={()=>recording?recorder.current?.stop():void start()} disabled={!supported||disabled||working} aria-label={recording?'Stop opname':coachText('Spreek met Pip')}>{recording?<Square size={16}/>:working?<LoaderCircle size={16} className="spin"/>:<Mic size={17}/>}<span>{recording?`Klaar · ${seconds}s`:phase==='requesting'?'Microfoon openen…':phase==='transcribing'?'Spraak verwerken…':'Spreek'}</span></button>
 {(recording||working)&&<button type="button" onClick={cancel} aria-label="Opname annuleren"><X size={16}/></button>}
 <button type="button" disabled={!reply||recording||working||phase==='reviewing'} onClick={()=>{if(phase==='speaking'){stopSpeech();setPhase('idle')}else speak(reply)}} aria-label={phase==='speaking'?'Stop voorlezen':coachText('Lees het antwoord van Pip voor')}>{phase==='speaking'?<VolumeX size={18}/>:<Volume2 size={18}/>}</button>
 <button type="button" onClick={()=>setSettings(v=>!v)} aria-label="Spraakinstellingen" aria-expanded={settings}><Settings2 size={17}/></button>
 </div>
 {phase==='reviewing'&&<div className="voice-review"><label>Dit verstond ik<textarea value={draft} onChange={e=>setDraft(e.target.value)} maxLength={1000} rows={2}/></label><p>Klopt de tekst? Pas hem aan als ik je verkeerd verstond.</p><button type="button" className="primary-button" disabled={!draft.trim()||disabled} onClick={()=>{const text=draft.trim();setDraft('');setPhase('idle');live.current.onTranscript(text)}}>{coachText("Stuur naar Pip")}</button><button type="button" onClick={cancel}>Annuleren</button></div>}
 {recording&&<p role="status" className="voice-live"><span/>Ik luister. Klik op Klaar zodra je uitgesproken bent.</p>}
 {phase==='transcribing'&&<p role="status">{progress===null?'Ik zet je spraak om naar tekst…':`Spraakherkenning laden… ${Math.round(progress*100)}%`}</p>}
 {phase==='speaking'&&<p role="status">{coachText("Pip spreekt…")}</p>}
 {error&&<p role="alert" className="voice-error">{error}</p>}
 {settings&&<div className="voice-settings"><label><input type="checkbox" checked={readReplies} onChange={e=>{setReadReplies(e.target.checked);if(!e.target.checked){stopSpeech();if(phase==='speaking')setPhase('idle')}}}/>Lees nieuwe antwoorden voor</label><label>Stem<select value={voiceURI} onChange={e=>{setVoiceURI(e.target.value);try{localStorage.setItem('pip-voice',e.target.value)}catch{}}}><option value="">Aanbevolen Nederlandse stem</option>{voices.map(v=><option value={v.voiceURI} key={v.voiceURI}>{v.name} · {v.lang}</option>)}</select></label><label>Tempo<select value={rate} onChange={e=>setRate(Number(e.target.value))}><option value={.85}>Rustig</option><option value={1}>Normaal</option><option value={1.1}>Vlot</option></select></label><p>Je opname blijft op dit apparaat. De eerste keer wordt ongeveer 150 MB spraakherkenning gedownload. Maximaal 30 seconden per beurt. De voorleesstem komt van je browser of apparaat.</p>{!supported&&<p>Deze browser ondersteunt geen microfoonopname. Probeer Chrome of Edge.</p>}</div>}
 </div>;
}
