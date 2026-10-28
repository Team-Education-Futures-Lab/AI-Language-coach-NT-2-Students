export const voiceProfiles=[
 {id:'F1',name:'Vrouw 1'},{id:'F2',name:'Vrouw 2'},{id:'F3',name:'Vrouw 3'},{id:'F4',name:'Vrouw 4'},{id:'F5',name:'Vrouw 5'},
 {id:'M1',name:'Man 1'},{id:'M2',name:'Man 2'},{id:'M3',name:'Man 3'},{id:'M4',name:'Man 4'},{id:'M5',name:'Man 5'},
] as const;
export type VoiceProfile=typeof voiceProfiles[number]['id'];
export function validVoiceProfile(value:unknown):value is VoiceProfile{return voiceProfiles.some(v=>v.id===value)}
export const voiceLanguages=['en','ko','ja','ar','bg','cs','da','de','el','es','et','fi','fr','hi','hr','hu','id','it','lt','lv','nl','pl','pt','ro','ru','sk','sl','sv','tr','uk','vi'];
export function voiceLanguage(value:string){const code=value.toLowerCase().split('-')[0];return voiceLanguages.includes(code)?code:null}
