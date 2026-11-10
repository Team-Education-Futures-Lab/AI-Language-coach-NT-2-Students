import recordings from '../public/tour-audio/manifest.json';
import {spokenText} from './speech';
const manifest=recordings as Record<string,string>;
export const tourRecordingKey=(text:string,language:string,profile:string)=>JSON.stringify([language.toLowerCase().split('-')[0],profile,spokenText(text)]);
export const tourRecordingPath=(text:string,language:string,profile:string)=>manifest[tourRecordingKey(text,language,profile)];
export async function prerecordedTourAudio(text:string,language:string,profile:string,signal?:AbortSignal):Promise<Blob|null>{
 const path=tourRecordingPath(text,language,profile);if(!path)return null;
 const response=await fetch(path,{signal,cache:'force-cache'});if(!response.ok)throw Error('De opname kon niet laden. Controleer je verbinding en probeer opnieuw.');
 const blob=await response.blob();if(!blob.size)throw Error('De opname is leeg. Probeer opnieuw.');return blob;
}
