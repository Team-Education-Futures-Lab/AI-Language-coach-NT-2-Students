import {identity,fail} from '@/lib/server';
import {aiAllowance,AIError} from '@/lib/server-ai';
export const maxDuration=60;
export async function POST(r:Request){const u=await identity(r);if(!u)return fail('Log in om te spreken.',401);try{
 if(process.env.AI_FREE_TIER_CONFIRMED!=='true'||!process.env.GROQ_API_KEY)return fail('Spraakherkenning wordt nog ingesteld.',503);
 if(Number(r.headers.get('content-length'))>2500000)return fail('Deze opname is te groot. Spreek maximaal 30 seconden.',413);
 const form=await r.formData(),file=form.get('audio');
 if(!(file instanceof File)||file.size>2000000||file.size<200||!/^audio\/(webm|ogg|mp4|mpeg|wav|x-wav)/.test(file.type))return fail('Gebruik een korte audio-opname.');
 await aiAllowance(u,'speech');const body=new FormData();body.append('file',file);body.append('model','whisper-large-v3-turbo');// Omit language: Whisper detects the student's language and preserves Dutch practice.
 body.append('response_format','verbose_json');
 const result=await fetch('https://api.groq.com/openai/v1/audio/transcriptions',{method:'POST',headers:{Authorization:'Bearer '+process.env.GROQ_API_KEY},body,signal:AbortSignal.timeout(35000)});
 if(!result.ok)return fail(result.status===429?'De gratis spraaklimiet is bereikt. Probeer later opnieuw.':'Spraakherkenning is tijdelijk niet bereikbaar.',result.status===429?429:503);
 const j=await result.json() as {text?:string;duration?:number;segments?:{no_speech_prob?:number}[]};
 if((j.duration||0)>40)return fail('Spreek maximaal 30 seconden per beurt.');
 if(!j.text?.trim()||j.segments?.every(s=>(s.no_speech_prob||0)>.8))return fail('Ik kon geen duidelijke spraak verstaan. Probeer het nog eens.');
 return Response.json({text:j.text.trim().slice(0,1000)});
 }catch(e){return fail(e instanceof AIError?e.message:'Je opname kon niet worden verwerkt. Probeer opnieuw.',e instanceof AIError?e.status:503)}}
