import {Seasons} from 'astronomy-engine';
export type Season='spring'|'summer'|'autumn'|'winter';
export type Celebration='christmas'|'newyear'|null;
const cache=new Map<number,ReturnType<typeof Seasons>>();
export function seasonalMoment(now=new Date()){
 const parts=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);const year=Number(parts.slice(0,4)),monthDay=parts.slice(5);
 let dates=cache.get(year);if(!dates){dates=Seasons(year);cache.set(year,dates)}
 const time=now.getTime();let season:Season='winter';
 if(time>=dates.mar_equinox.date.getTime()&&time<dates.jun_solstice.date.getTime())season='spring';else if(time>=dates.jun_solstice.date.getTime()&&time<dates.sep_equinox.date.getTime())season='summer';else if(time>=dates.sep_equinox.date.getTime()&&time<dates.dec_solstice.date.getTime())season='autumn';
 const celebration:Celebration=monthDay==='01-01'?'newyear':['12-24','12-25','12-26'].includes(monthDay)?'christmas':null;
 return {season,celebration,year,date:parts,rewardKey:celebration?`${year}:${celebration}`:null};
}
export const seasonNames:Record<Season,string>={spring:'Lente',summer:'Zomer',autumn:'Herfst',winter:'Winter'};
export const seasonalPalette={spring:'spring',summer:'summer',autumn:'autumn',winter:'winter',christmas:'christmas',newyear:'newyear'};
