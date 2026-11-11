import type {ActionMode,Body} from './action-arcade';
export const enemyNames={platform:['Boskever','Grotvleermuis','Zandschorpioen','IJspinguïn','Fortwachter'],race:['Tractor','Mijnkar','Zandbuggy','Sneeuwschuiver','Patrouillewagen'],space:['Zaadsonde','Kristaldrone','Zandwesp','IJskomeet','Fortdrone']};
export function enemyHint(mode:ActionMode,stage:number){const names=enemyNames[mode];return `${names[stage-1]}: ${['beweegt rustig vooruit.','beweegt heen en weer.','maakt korte snelle bewegingen.','glijdt breed heen en weer.','beweegt snel in een golfpatroon.'][stage-1]}`}
export function platformEnemy(stage:number,index:number,time:number,count:number,speed:number,range:number):Body{
 const phase=time*speed*(stage===3?1.6:stage===4?.7:1)+index,base=430+index*(2600/Math.max(1,count-1));
 const x=base+Math.sin(phase)*(stage===3?range*.6:range);
 const y=stage===2?335+Math.sin(phase*1.4)*22:stage===5?379-Math.max(0,Math.sin(phase))*55:379;
 return{x,y,w:30,h:26};
}
export function driftEnemy(stage:number,base:number,time:number,phase:number,min:number,max:number){const swing=stage===1?0:stage===2?24:stage===3?12:stage===4?45:32;const rate=stage===3?3:stage===4?.7:1.5;return Math.max(min,Math.min(max,base+Math.sin(time*rate+phase)*swing))}
