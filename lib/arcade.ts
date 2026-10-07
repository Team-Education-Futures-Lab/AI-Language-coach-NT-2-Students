export type ArcadeLevel='A2'|'B1'|'B2';
export type Noun={word:string;article:'de'|'het'};
export const nounSets:Record<ArcadeLevel,Noun[]>={
 A2:[{word:'huis',article:'het'},{word:'boek',article:'het'},{word:'kind',article:'het'},{word:'raam',article:'het'},{word:'water',article:'het'},{word:'school',article:'de'},{word:'tafel',article:'de'},{word:'fiets',article:'de'},{word:'deur',article:'de'},{word:'leraar',article:'de'}],
 B1:[{word:'gesprek',article:'het'},{word:'voorstel',article:'het'},{word:'resultaat',article:'het'},{word:'bedrijf',article:'het'},{word:'verslag',article:'het'},{word:'afspraak',article:'de'},{word:'planning',article:'de'},{word:'opleiding',article:'de'},{word:'werkplek',article:'de'},{word:'ervaring',article:'de'}],
 B2:[{word:'beleid',article:'het'},{word:'onderzoek',article:'het'},{word:'draagvlak',article:'het'},{word:'inzicht',article:'het'},{word:'belang',article:'het'},{word:'afweging',article:'de'},{word:'samenhang',article:'de'},{word:'werkwijze',article:'de'},{word:'toelichting',article:'de'},{word:'voorwaarde',article:'de'}]
};
export const memorySets:Record<ArcadeLevel,[string,string][]>= {
 A2:[['begin','start'],['snel','vlug'],['praten','spreken'],['klaar','gereed'],['moeilijk','lastig'],['blij','vrolijk']],
 B1:[['werkzaamheden','taken'],['begeleider','coach'],['reflecteren','terugkijken'],['instructie','aanwijzing'],['voorstel','suggestie'],['resultaat','uitkomst']],
 B2:[['essentieel','noodzakelijk'],['concreet','specifiek'],['relevant','ter zake'],['impliciet','niet uitdrukkelijk gezegd'],['nuanceren','verschillen aanbrengen'],['onderbouwen','argumenten geven']]
};
export const spellingSets:Record<ArcadeLevel,{word:string;clue:string;tip:string}[]>={
 A2:[{word:'school',clue:'Hier volg je lessen.',tip:'De lange oo-klank schrijf je hier met twee o’s.'},{word:'vrijdag',clue:'De dag tussen donderdag en zaterdag.',tip:'Vrijdag schrijf je met ij, net als vrij.'},{word:'fietsen',clue:'Met twee wielen en pedalen op pad gaan.',tip:'Je hoort de ie-klank: fietsen.'},{word:'vriend',clue:'Iemand met wie je graag tijd doorbrengt.',tip:'De laatste letter is d. Dat hoor je in vrienden.'},{word:'sleutel',clue:'Hiermee maak je een deur open.',tip:'De eu schrijf je met e en u.'}],
 B1:[{word:'afspraak',clue:'Iets dat je samen regelt, bijvoorbeeld om elkaar te ontmoeten.',tip:'In afspraak schrijf je de lange aa met twee a’s.'},{word:'opleiding',clue:'Een traject waarin je leert voor een beroep of diploma.',tip:'Opleiding heeft ei, net als opleiden.'},{word:'resultaat',clue:'Wat je bereikt nadat je iets hebt gedaan.',tip:'De laatste lange aa-klank krijgt twee a’s.'},{word:'planning',clue:'Een overzicht van wat je wanneer gaat doen.',tip:'De korte a blijft kort door de dubbele n.'},{word:'ervaring',clue:'Kennis die je opdoet door iets zelf mee te maken.',tip:'Ervaring schrijf je met één r na de eerste e.'}],
 B2:[{word:'onmiddellijk',clue:'Zonder uitstel; meteen.',tip:'Onmiddellijk heeft twee d’s en twee l’en.'},{word:'enthousiast',clue:'Vol zin en plezier om iets te doen.',tip:'Onthoud het stukje thous in enthousiast.'},{word:'consequent',clue:'Steeds volgens dezelfde regels handelen.',tip:'Consequent schrijf je met qu.'},{word:'categorie',clue:'Een groep dingen met dezelfde kenmerken.',tip:'Categorie begint met een c en eindigt op ie.'},{word:'verantwoordelijk',clue:'Aanspreekbaar op wat je doet en op het resultaat.',tip:'Je herkent antwoord in verantwoordelijk.'}]
};
export function shuffled<T>(items:T[],random= Math.random){const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]]}return result}
export type FallingWord=Noun&{id:number;x:number;y:number};
export type CatchState={elapsed:number;spawnIn:number;items:FallingWord[];score:number;caught:number;combo:number;lives:number;nextId:number;ended:boolean;feedback:string};
export const initialCatch=():CatchState=>({elapsed:0,spawnIn:.5,items:[],score:0,caught:0,combo:0,lives:5,nextId:0,ended:false,feedback:''});
export function advanceCatch(previous:CatchState,dt:number,playerX:number,target:'de'|'het',deck:Noun[],slow=false):CatchState{
 if(previous.ended)return previous;
 const s={...previous,items:previous.items.map(w=>({...w}))},step=Math.max(0,Math.min(dt,.1));s.elapsed+=step;s.spawnIn-=step;
 if(s.spawnIn<=0){const word=deck[s.nextId%deck.length];s.items.push({...word,id:s.nextId,x:15+(s.nextId*37)%70,y:0});s.nextId++;s.spawnIn=slow?2.8:2.1}
 s.items=s.items.filter(w=>{w.y+=step*(slow?14:19);if(w.y<84)return true;const caught=Math.abs(w.x-playerX)<=13;if(caught){if(w.article===target){s.caught++;s.combo++;s.score+=10+Math.min(s.combo-1,4)*2;s.feedback=`Goed gevangen: ${w.article} ${w.word}.`}else{s.lives--;s.combo=0;s.feedback=`Let op: ${w.article} ${w.word}. Die mocht voorbijgaan.`}}else if(w.article===target){s.lives--;s.combo=0;s.feedback=`Gemist: ${w.article} ${w.word}. Probeer de volgende!`}return false});
 if(s.lives<=0||s.elapsed>=60||s.caught>=10){s.ended=true;s.lives=Math.max(0,s.lives)}return s;
}
export const revealedWord=(word:string,guessed:string[])=>[...word].every(c=>!/[a-z]/i.test(c)||guessed.includes(c));
