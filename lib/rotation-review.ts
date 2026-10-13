import {z} from 'zod';
const review=z.object({approved:z.boolean(),fixes:z.array(z.object({path:z.array(z.string().min(1).max(100)).min(3).max(7),value:z.union([z.string().max(7000),z.number().int(),z.array(z.string().max(700)).max(22)])})).max(20)});
export const reviewOutputSchema:Record<string,unknown>={
 type:'object',additionalProperties:false,required:['approved','fixes'],
 properties:{approved:{type:'boolean'},fixes:{type:'array',maxItems:20,items:{
  type:'object',additionalProperties:false,required:['path','value'],properties:{
   path:{type:'array',minItems:3,maxItems:7,items:{type:'string'}},
   value:{anyOf:[{type:'string'},{type:'integer'},{type:'array',items:{type:'string'}}]}
  }
 }}}
};
export function applyRotationReview(raw:string,output:string){
 const draft=JSON.parse(raw),result=review.parse(JSON.parse(output));if(!result.approved)throw Error('De inhoudelijke controle is nog niet akkoord');
 for(const fix of result.fixes){if(fix.path[0]!=='items'||fix.path.some(p=>['__proto__','constructor','prototype'].includes(p)))throw Error('Ongeldig correctiepad');let target=draft;for(const part of fix.path.slice(0,-1)){if(!target||typeof target!=='object'||!Object.hasOwn(target,part))throw Error('Onbekend correctiepad');target=target[part]}const key=fix.path.at(-1)!;if(!target||!Object.hasOwn(target,key))throw Error('Onbekend correctieveld');const before=target[key];if(Array.isArray(before)!==Array.isArray(fix.value)||typeof before!==typeof fix.value)throw Error('Onjuist correctietype');target[key]=fix.value;}
 return JSON.stringify(draft);
}
