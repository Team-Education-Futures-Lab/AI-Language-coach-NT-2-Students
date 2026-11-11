import {languageNouns,languageSpelling,type GameLanguageLevel} from './arcade-progression.ts';
export const worlds=[
 {name:'Groene vallei',sky:'#90cdbd',ground:'#577958',accent:'#f6d880',mission:['Verzamel zes de-woorden.','Rijd door het juiste lidwoord.','Schiet het goed gespelde woord.']},
 {name:'Kristalgrotten',sky:'#25254b',ground:'#51436c',accent:'#bb98ef',mission:['Vang de woorden in de aangegeven volgorde.','Bezorg woorden: zet de letters in de goede volgorde.','Red woorden: raak het juiste woord met je schip. Niet schieten!']},
 {name:'Zandstad',sky:'#e5ba7f',ground:'#ad7047',accent:'#fff1b4',mission:['Zoek zes sleutels met het juiste lidwoord. Breng ze terug naar START.','Volg de route: kies de juiste spelling.','Ruim de fout op: schiet de verkeerd gespelde vorm.']},
 {name:'IJseilanden',sky:'#b6d9ef',ground:'#688dad',accent:'#f0ffff',mission:['Zoek de woorden van rechts naar links. Volg het doel bovenaan.','Pakketdienst: kies het woord bij het lidwoord.','Vang de signalen: maak een woord van de letters en raak het met je schip.']},
 {name:'Sterrenfort',sky:'#211e3f',ground:'#493955',accent:'#ffbf77',mission:['Verzamel zes het-woorden en verover de vlag bij de uitgang.','Finalerit: lidwoorden en spelling wisselen elkaar af.','Eindmissie: schiet afwisselend de goede en de foute spelling.']},
] as const;
export function worldDeck(level:GameLanguageLevel,stage:number,mode:'race'|'space'){
 const nouns=worldNouns(level,stage),spell=languageSpelling(level);const offset=(stage-1)*3;
 return Array.from({length:8},(_,i)=>{const n=nouns[(i+offset)%nouns.length],p=spell[(i+offset)%spell.length];
  const spelling=stage===2||stage===4?{word:`Zet de letters goed: ${[...n.word].reverse().join(' · ')}`,answer:n.word,options:[n.word,n.word+n.word.slice(-1),n.word.slice(0,-1)+'zz'],explanation:`${n.article} ${n.word}`}:{word:p.clue,answer:p.word,options:p.options,explanation:p.tip};
  if(mode==='space'){
   const wrong=stage===3||(stage===5&&i%2===1);
   return wrong?{word:`Welke spelling is fout? (${p.word})`,answer:p.options[1],options:[p.word,p.options[1]],explanation:p.tip}:spelling;
  }
  if(stage===2||stage===3||(stage===5&&i%2===1))return spelling;
  if(stage===4){const other=nouns.find(v=>v.article!==n.article)!;return{word:`Welk woord hoort bij ${n.article}?`,answer:n.word,options:[n.word,other.word],explanation:`${n.article} ${n.word}`}}
  return{word:n.word,answer:n.article,options:['de','het'],explanation:`${n.article} ${n.word}`};
 });
}
const worldWords=[
 [['boom','bloem','tuin','vogel','rivier','brug'],['bos','gras','blad','dier','pad','water']],
 [['steen','lamp','grot','muur','trap','deur'],['licht','zand','gat','dak','vuur','glas']],
 [['markt','winkel','straat','tas','prijs','klant'],['geld','plein','brood','fruit','bord','eten']],
 [['sneeuw','jas','muts','sjaal','wind','berg'],['ijs','weer','meer','dorp','raam','huis']],
 [['ster','maan','zon','wereld','reis','nacht'],['schip','heelal','plan','team','doel','einde']],
];
const advancedWords=[
 [['biodiversiteit','begroeiing','kringloop','oever','vegetatie','natuurbehoud'],['ecosysteem','leefgebied','landschap','evenwicht','milieu','natuurgebied']],
 [['delfstof','bodemlaag','formatie','erosie','duisternis','vindplaats'],['mineraal','gesteente','kristal','gewelf','bodemonderzoek','grondwater']],
 [['onderhandeling','concurrentie','koopkracht','handel','onderneming','omzet'],['aanbod','assortiment','betaalmiddel','prijsverschil','verkoopcijfer','marktplein']],
 [['temperatuur','neerslag','gletsjer','weersverwachting','opwarming','vorst'],['klimaat','vriespunt','smeltwater','poolgebied','ijsoppervlak','natuurverschijnsel']],
 [['zwaartekracht','dampkring','omwenteling','waarneming','planeet','ruimtereis'],['ruimtevaartuig','onderzoek','universum','hemellichaam','zonnestelsel','observatorium']],
];
export function worldNouns(level:GameLanguageLevel,stage:number){return (['A1','A2'].includes(level)?worldWords:advancedWords)[stage-1].flatMap((words,i)=>words.map(word=>({word,article:i===0?'de' as const:'het' as const})))}
