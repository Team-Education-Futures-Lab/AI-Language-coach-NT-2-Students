// Run locally with an approved OPENAI_API_KEY. Never exposes the credential.
// Writes temporary files first: existing exercise audio stays intact if a request fails.
import {readFileSync,writeFileSync,renameSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
let key=process.env.OPENAI_API_KEY;
if(!key){try{const s=readFileSync(path.join(root,'.env.local'),'utf8');key=s.match(/^OPENAI_API_KEY\s*=\s*["']?([^\s"']+)/m)?.[1]}catch{}}
if(!key){console.error('Geen goedgekeurde OPENAI_API_KEY beschikbaar. Er is niets gewijzigd.');process.exit(1)}
const source=readFileSync(path.join(root,'lib/exercises.ts'),'utf8');
const clips=[...source.matchAll(/audio:'\/audio\/([^']+)',passage:'((?:[^'\\]|\\.)*)'/g)];
if(clips.length!==3)throw Error('De drie luisterteksten konden niet veilig worden gelezen.');
const scratch=path.join(root,'work','human-listening');mkdirSync(scratch,{recursive:true});
for(const [_,file,raw] of clips){
 const input=raw.replace(/\\n/g,'\n').replace(/\\'/g,"'");
 const r=await fetch('https://api.openai.com/v1/audio/speech',{method:'POST',signal:AbortSignal.timeout(90000),headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-4o-mini-tts',voice:'marin',input,response_format:'mp3',instructions:'Spreek vloeiend en natuurlijk Nederlands zoals een vriendelijke Nederlandse gesprekspartner. Warm, helder en ontspannen, met natuurlijke intonatie en korte adempauzes. Geen robotstem of overdreven omroepstem. Dit is een luisteroefening voor volwassenen: goed verstaanbaar, niet kinderachtig en niet woord voor woord. Lees precies de aangeleverde tekst. Spreek tijden natuurlijk uit, bijvoorbeeld half elf in plaats van tien punt dertig. A2-fragmenten rustig, de overige fragmenten in een normaal gesprekstempo.'})});
 if(!r.ok){let code='unknown';try{code=(await r.json()).error?.code||String(r.status)}catch{};throw Error(`Spraakgeneratie mislukt (${r.status}, ${code}). Bestaande audio is behouden.`)}
 const bytes=new Uint8Array(await r.arrayBuffer());if(bytes.length<4000||!r.headers.get('content-type')?.startsWith('audio/'))throw Error('De spraakdienst gaf geen geldig audiobestand.');
 writeFileSync(path.join(scratch,file.replace(/\.[^.]+$/,'.mp3')),bytes);console.log(`Gemaakt: ${file.replace(/\.[^.]+$/,'.mp3')}`);
}
for(const [_,file] of clips){const name=file.replace(/\.[^.]+$/,'.mp3');renameSync(path.join(scratch,name),path.join(root,'public','audio',name));}
console.log('Drie nieuwe fragmenten klaar. Controleer uitspraak en inhoud vóór de verwijzingen worden bijgewerkt.');
