import {TourAudioCache} from './tour-audio-cache';
import recordings from '../public/tour-audio/manifest.json';
import {spokenText} from './speech';
const manifest=recordings as Record<string,string>;
export const tourRecordingKey=(text:string,language:string,profile:string)=>JSON.stringify([language.toLowerCase().split('-')[0],profile,spokenText(text)]);
export const tourRecordingPath=(text:string,language:string,profile:string)=>manifest[tourRecordingKey(text,language,profile)];
const loaded=new TourAudioCache(16*1024*1024);
export async function prerecordedTourAudio(text:string,language:string,profile:string,signal?:AbortSignal):Promise<Blob|null>{
 const path=tourRecordingPath(text,language,profile);if(!path)return null;
 if(signal?.aborted)throw new DOMException('Geannuleerd','AbortError');
 return loaded.get(path,async()=>{
 const response=await fetch(path,{signal:AbortSignal.timeout(15000),cache:'force-cache'});if(!response.ok)throw Error('De opname kon niet laden. Controleer je verbinding en probeer opnieuw.');
 const blob=await response.blob();if(!blob.size)throw Error('De opname is leeg. Probeer opnieuw.');return blob;
 });
}

// Warm only small, authored recordings; never download a model speculatively.
export function hasRecordedTour(language:string,profile='F1'){
 const code=language.toLowerCase().split('-')[0];return Object.keys(manifest).some(key=>{const [lang,voice]=JSON.parse(key);return lang===code&&voice===profile});
}
export async function preloadTourRecordings(language:string,profile:string,signal:AbortSignal){
 const code=language.toLowerCase().split('-')[0];
 const entries=Object.keys(manifest).filter(key=>{const [lang,voice]=JSON.parse(key);return lang===code&&voice===profile});
 let index=0;
 await Promise.all(Array.from({length:3},async()=>{while(!signal.aborted&&index<entries.length){const [lang,voice,text]=JSON.parse(entries[index++]);try{await prerecordedTourAudio(text,lang,voice)}catch{/* A foreground retry remains available. */}}}));
}
