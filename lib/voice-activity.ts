/** Sensitive to quiet speech without mistaking a steady background hum for a turn. */
export function createVoiceActivity(start:number){
 let noise=.001,voiced=0,heard=false,lastSound=start;
 return {sample(rms:number,now:number){
  const threshold=Math.max(.003,Math.min(.015,noise*2.5));
  if(rms>threshold){voiced+=100;if(voiced>=200)heard=true;lastSound=now}
  else{voiced=0;if(!heard)noise=noise*.95+Math.min(rms,.006)*.05}
  return {heard,level:Math.min(1,rms/.08),quiet:!heard&&now-start>8000,finished:heard&&now-lastSound>1800&&now-start>2200};
 }};
}
