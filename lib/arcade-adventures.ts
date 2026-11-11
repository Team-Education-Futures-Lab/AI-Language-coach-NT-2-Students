export type AdventureLevel='A2'|'B1'|'B2';
export type Place={name:string;x:number;y:number;clue:string};
export const townPlaces:Place[]=[
 {name:'Bibliotheek',x:0,y:0,clue:'Breng het pakket naar de plek waar je boeken leent. Die staat linksboven.'},
 {name:'Bakker',x:4,y:0,clue:'De klant verkoopt brood. Ga naar de winkel rechtsboven.'},
 {name:'School',x:0,y:4,clue:'Hier geeft een docent les. Het gebouw staat linksonder.'},
 {name:'Sporthal',x:4,y:4,clue:'Hier kun je binnen sporten. Zoek het gebouw rechtsonder.'},
 {name:'Station',x:3,y:2,clue:'Hier vertrekken treinen. Het ligt rechts naast het water, in het midden.'},
 {name:'Apotheek',x:0,y:2,clue:'Hier haal je medicijnen op. Het ligt links van het water, tussen de bibliotheek en de school.'}
];
export function townMove(x:number,y:number,dx:number,dy:number){
 const nx=x+dx,ny=y+dy;
 if(Math.abs(dx)+Math.abs(dy)!==1||nx<0||nx>4||ny<0||ny>4||(nx===2&&ny!==1&&ny!==3))return{x,y};
 return{x:nx,y:ny};
}
export const trainSentences:Record<AdventureLevel,string[]>={
 A2:['Ik ga vandaag met de bus naar school.','Wij kopen morgen brood bij de bakker.','Mijn zus werkt in een winkel.','Na de les fiets ik naar huis.','Hij heeft gisteren een boek gelezen.','Zij drinkt elke ochtend een kop thee.'],
 B1:['Omdat het regent, neem ik vandaag de bus.','Morgen bel ik de huisarts voor een afspraak.','Ik heb de brief gelezen voordat ik reageerde.','Als je vragen hebt, kun je mij bellen.','Hoewel ik moe ben, maak ik mijn huiswerk.','Zij vertelt dat ze een nieuwe baan heeft.'],
 B2:['Als ik eerder was vertrokken, had ik de trein gehaald.','De docent legt uit waarom deze oplossing beter werkt.','Hoewel de opdracht lastig was, hebben we haar samen afgerond.','Nadat de vergadering afgelopen was, stuurde hij het verslag.','Hoe meer je oefent, hoe makkelijker het spreken wordt.','Voordat we een besluit nemen, moeten we de gevolgen bespreken.']
};
export function trainCorrect(words:string[],chosen:number[]){return chosen.length===words.length&&chosen.every((id,i)=>words[id]===words[i])}
export const marketProducts=[{name:'appels',single:'appel',color:'#e88c71'},{name:'broden',single:'brood',color:'#d9ac66'},{name:'tomaten',single:'tomaat',color:'#ed6c69'},{name:'flessen melk',single:'fles melk',color:'#d9e8ed'},{name:'stukken kaas',single:'stuk kaas',color:'#f4cc5c'},{name:'peren',single:'peer',color:'#aad07f'}];
export function marketOrder(level:AdventureLevel,round:number){
 const count=level==='A2'?2:level==='B1'?3:4;
 const ids=Array.from({length:6},(_,i)=>i); // Rotate products per customer.
 const amounts=Array(6).fill(0) as number[];
 for(let i=0;i<count;i++)amounts[ids[(round+i)%6]]=1+(round+i)%3;
 return amounts;
}
export function basketMatches(order:number[],basket:number[]){return order.length===basket.length&&order.every((n,i)=>n===basket[i])}
