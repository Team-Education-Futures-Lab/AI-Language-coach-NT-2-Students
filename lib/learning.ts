import type {Assessment,Evidence} from './assessment';
import type {Profile} from './profile';
export const focuses=['Lidwoorden','Enkelvoud & meervoud','Tegenwoordige tijd','Verleden tijd','Toekomstige tijd','Lezen & samenvatten','Hulp vragen & samenwerken'] as const;
export type Focus=typeof focuses[number];
export const routeGoals:Record<string,{title:string;goal:string;context:string}>={
 Inburgering:{title:'Nederlands voor elke dag',goal:'Ik kan een afspraak maken, een bericht begrijpen en om uitleg vragen.',context:'Een afspraak bij de gemeente, de bibliotheek of je werk.'},
 Mbo:{title:'Van les naar praktijk',goal:'Ik kan een werkinstructie navertellen en een gerichte vraag aan mijn begeleider stellen.',context:'Een praktijkles, stage of overdracht aan een collega.'},
 Hbo:{title:'Samenwerken en onderbouwen',goal:'Ik kan een voorstel uitleggen, een argument geven en feedback verwerken.',context:'Een projectoverleg, presentatie of reflectieverslag.'},
 Wo:{title:'Lezen, afwegen en redeneren',goal:'Ik kan een bron samenvatten, een bewering van een argument onderscheiden en een kritische vraag stellen.',context:'Een werkgroep, onderzoeksverslag of discussie over een artikel.'}
};
export type PlanTask={id:string;title:string;date:string;minutes:number;done:boolean;destination:'grammar'|'atelier'|'content'|'missions';focus:Focus};
export type LearningPlan={goal:string;focus:Focus;tasks:PlanTask[];aiReason:string};
export type Stroke={color:string;points:[number,number][]};
export type PortfolioEntry={id:string;kind:'beeldverhaal'|'leesclub'|'samen'|'tijdreis';title:string;topic:string;source:string;text:string;reflection:string;nextStep:string;drawing:Stroke[];aiHint:string;completed:boolean;updatedAt?:string};
export type LearningState={plan:LearningPlan|null;entries:PortfolioEntry[];assessment:Assessment|null;draft:Record<string,unknown>|null;evidence:Evidence[];advice:{level:string|null;reason:string;evidenceCount:number}};
export const emptyLearning:LearningState={plan:null,entries:[],assessment:null,draft:null,evidence:[],advice:{level:null,reason:'',evidenceCount:0}};
export function makePlan(profile:Profile,focus:Focus,date:string):LearningPlan{
 const day=(offset:number)=>{const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+offset);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
 return{goal:profile.learningGoals||routeGoals[profile.goal].goal,focus,aiReason:'',tasks:[
 {id:crypto.randomUUID(),title:`Een kleine stap: ${focus.toLowerCase()}`,date:day(0),minutes:10,done:false,destination:focus==='Lezen & samenvatten'?'content':focus==='Hulp vragen & samenwerken'?'missions':'grammar',focus},
 {id:crypto.randomUUID(),title:`Maak iets over ${profile.interests.trim().split(/[,;\n]/)[0]?.slice(0,65)||'iets dat je leuk vindt'}`,date:day(2),minutes:15,done:false,destination:'atelier',focus},
 {id:crypto.randomUUID(),title:'Bespreek je werk en schrijf één volgende stap op',date:day(4),minutes:10,done:false,destination:'atelier',focus:'Hulp vragen & samenwerken'}]};
}
export const atelierTasks=[
 {id:'beeldverhaal' as const,title:'Teken je verhaal',label:'MAKEN & VERTELLEN',description:'Begin met een tekening. Geef jouw idee daarna woorden.',prompt:'Teken een plek, hobby of gebeurtenis. Schrijf erbij: wie is er, wat gebeurt er en waarom is dit belangrijk voor jou?',en:'Draw something meaningful to you. Describe who, what and why.',steps:['Teken of beschrijf je idee.','Schrijf bij je beeld.','Kies één zin om verder uit te werken.']},
 {id:'leesclub' as const,title:'Jouw kleine leesclub',label:'BOEKEN, VERHALEN & NIEUWS',description:'Lees iets dat je raakt en ontdek wat jij ervan vindt.',prompt:'Lees een verhaal, een stukje uit je eigen boek of een nieuwsartikel. Noteer de kern in je eigen woorden, twee nieuwe woorden en één vraag of mening. Houd feit en mening uit elkaar.',en:'Read, then write the main idea, two new words and your own question or opinion.',steps:['Lees en noteer de bron.','Vat samen in je eigen woorden.','Bespreek een feit en je eigen mening.']},
 {id:'samen' as const,title:'Samen kom je verder',label:'COMMUNICEREN & HULP VRAGEN',description:'Werk naast een klasgenoot, of oefen de rollen zelf.',prompt:'Werk samen op één apparaat. A legt een taak uit, B vraagt om verduidelijking. Wissel daarna van rol. Noteer wat jullie zeiden en welke uitleg hielp. Alleen? Schrijf beide rollen en oefen ze hardop.',en:'Partner A explains a task. Partner B asks a specific question. Swap roles, then reflect.',steps:['A: leg een taak uit.','B: stel één gerichte hulpvraag.','Wissel rollen en geef een bruikbare tip.']},
 {id:'tijdreis' as const,title:'Gisteren, vandaag, morgen',label:'TAAL & TOEKOMST',description:'Vertel over jouw leven en maak een plan voor later.',prompt:'Kies een hobby, opleiding of werkdag. Schrijf wat je gisteren deed, wat je nu doet en wat je volgende week gaat doen. Voeg bij je plan toe wie je kan helpen.',en:'Write about yesterday, today and next week. Who can help with your plan?',steps:['Gisteren: kijk terug.','Vandaag: vertel wat je doet.','Morgen: maak een concreet plan.']}
];
export const studioHints=[
 'Maak eerst drie losse notities: wie, wat en wanneer. Welke notitie kun je zelf in één zin veranderen?',
 'Kies één zin uit je tekst. Welk detail zou een lezer helpen die jouw situatie niet kent?',
 'Onderstreep een feit en omcirkel jouw mening. Met welk argument kun je die mening uitleggen?',
 'Formuleer je hulpvraag precies: welk stukje begrijp je al en bij welke stap loop je vast?',
 'Zoek de tijdwoorden gisteren, vandaag en morgen. Welke werkwoorden horen bij elk moment?',
 'Lees je werk aan iemand voor. Vraag welk stukje duidelijk is en waar die persoon nog een vraag bij heeft.'
];
export const originalStories={simple:'Mila wil haar buurman leren kennen. Ze maakt soep en neemt een klein bakje mee. De buurman houdt van koken. Hij vertelt over een recept van zijn moeder. Mila kent niet alle woorden. “Wat betekent dat woord?”, vraagt ze. De buurman tekent een groente op papier. Nu begrijpt Mila het. Volgende week gaan ze samen koken.',advanced:'Tijdens een buurtproject wil Amir een leeg plein veranderen in een ontmoetingsplek. Zijn eerste plan bestaat vooral uit sporttoestellen. Een buurvrouw merkt op dat er dan weinig plek overblijft voor mensen die rustig willen zitten. Amir vraagt haar om mee te tekenen. Samen maken ze een nieuw ontwerp met banken, planten en een klein sportveld. Niet iedereen is meteen overtuigd: wie gaat het groen onderhouden? Het team besluit eerst een proefmiddag te organiseren en bewoners te vragen welke taak ze zelf willen oppakken. Amir ontdekt dat een goed voorstel niet alleen uit een origineel idee bestaat, maar ook uit luisteren en haalbare afspraken maken.'};
export function newEntry(kind:PortfolioEntry['kind'],topic=''):PortfolioEntry{return{id:crypto.randomUUID(),kind,title:atelierTasks.find(t=>t.id===kind)!.title,topic,source:'',text:'',reflection:'',nextStep:'',drawing:[],aiHint:'',completed:false}}
