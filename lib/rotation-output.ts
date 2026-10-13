import {baseItems,type RotationArea} from './rotation-schema';
type Schema=Record<string,unknown>;
const str=(min=1,max=700):Schema=>({type:'string',minLength:min,maxLength:max});
const num=(min:number,max:number):Schema=>({type:'integer',minimum:min,maximum:max});
const obj=(properties:Record<string,Schema>):Schema=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const list=(items:Schema,min:number,max=min):Schema=>({type:'array',items,minItems:min,maxItems:max});
export function rotationOutputSchema(area:RotationArea,level:string){
 const choice=obj({prompt:str(5,600),options:list(str(1,300),3),correct:num(0,2),explanation:str(10,700)});
 const round=obj({q:str(10,600),options:list(str(1,350),3),correct:num(0,2),why:str(10,500)});
 const slots=Object.fromEntries(baseItems(area).map(base=>{
 let fields:Record<string,Schema>;
 if(area.startsWith('library-')){const category=area.slice(8);fields={category:{type:'string',enum:[category]},level:{type:'string',enum:[level]},title:str(5,120),description:str(10,800),minutes:num(2,60)};
 if(category==='schrijven')fields.writing=obj({prompt:str(20,1200),minWords:num(5,500),maxWords:num(10,1200),checklist:list(str(5,200),3),example:str(10,5000)});
 else fields.questions=list(choice,3);
 if(['lezen','luisteren'].includes(category))fields.passage=str(20,5000);
 }else if(area==='missions')fields={title:str(5,120),description:str(20,600),role:str(2,100),time:num(3,15),goals:list(str(5,180),3),opening:str(10,700)};
 else if(area==='atelier'){fields={title:str(5,120),label:str(1,100),description:str(10,600),prompt:str(20,1800),en:str(1,1200),steps:list(str(5,300),3)};if(base.id==='leesclub')fields.story=str(30,3500)}
 else fields={rounds:list(base.id==='sentence'?obj({words:list(str(1,50),3,22),why:str(10,500)}):round,5)};
 return [base.id,obj(fields)];
 }));
 return obj({items:obj(slots)});
}
