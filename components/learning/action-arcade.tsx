'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,ArrowUp,ArrowDown,Crosshair,Pause,Play,Maximize} from 'lucide-react';
import {nounSets,spellingSets,shuffled,type ArcadeLevel} from '@/lib/arcade';
import {clamp,overlaps,stepJump,type ActionMode,type Body,type Prompt} from '@/lib/action-arcade';
import {B} from './translation';
type Item=Body&{text?:string;correct?:boolean;done?:boolean;vx?:number};
type Props={mode:ActionMode;level:ArcadeLevel;tone:(good:boolean)=>void;onEnd:(r:{score:number;summary:string;success:boolean})=>void};
const W=800,H=460;
export function ActionArcade({mode,level,tone,onEnd}:Props){
 const canvas=useRef<HTMLCanvasElement>(null),shell=useRef<HTMLDivElement>(null),keys=useRef(new Set<string>()),callbacks=useRef({tone,onEnd});callbacks.current={tone,onEnd};
 const [paused,setPaused]=useState(false),[slow,setSlow]=useState(false),[hud,setHud]=useState({lives:5,score:0,round:0,text:'',tip:'',done:0,remaining:180});const pauseRef=useRef(false),slowRef=useRef(false);pauseRef.current=paused;slowRef.current=slow;
 useEffect(()=>{const clear=()=>{keys.current.clear();setPaused(true)},hidden=()=>{if(document.hidden)clear()};window.addEventListener('blur',clear);document.addEventListener('visibilitychange',hidden);canvas.current?.focus();return()=>{window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',hidden)}},[]);
 useEffect(()=>{
  const c=canvas.current,ctx=c?.getContext('2d');if(!c||!ctx)return;
  const deck:Prompt[]=mode==='space'?shuffled(spellingSets[level]).map(p=>({word:p.clue,answer:p.word,options:shuffled([p.word,p.word.slice(0,-1),p.word.replace(/([aeiou])/, '$1$1')===p.word?p.word+'t':p.word.replace(/([aeiou])/, '$1$1')]),explanation:p.tip})):shuffled(nounSets[level]).map(p=>({word:p.word,answer:p.article,options:['de','het'],explanation:`${p.article} ${p.word}`}));
  let player={x:mode==='platform'?45:380,y:mode==='platform'?340:360,w:32,h:40},vy=0,grounded=false,jumpHeld=false,shot=0,time=0,camera=0,lives=5,score=0,done=0,round=0,invincible=0,ended=false,last=performance.now(),frame=0,spawn=1,wave=0,tip='',tipUntil=0;
  let items:Item[]=[],shots:Item[]=[],traffic:Item[]=[],sparks:{x:number;y:number;vx:number;vy:number;life:number;color:string}[]=[];
  const platforms=[{x:0,y:405,w:3300,h:55},...Array.from({length:8},(_,i)=>({x:250+i*350,y:i%2?300:330,w:155,h:18}))];
  const coins=Array.from({length:12},(_,i)=>({x:220+i*240,y:i%2?260:350,w:140,h:30,text:i%2?'het':'de',correct:i%2===0,done:false}));
  function burst(x:number,y:number,good:boolean){for(let i=0;i<14;i++)sparks.push({x,y,vx:(Math.random()-.5)*200,vy:(Math.random()-.7)*220,life:1,color:good?'#ffe291':'#ff9b9b'})}
  function publish(){setHud({lives,score,round,text:mode==='platform'?'Verzamel alleen DE-woorden':deck[round%deck.length].word,tip:time<tipUntil?tip:'',done,remaining:Math.max(0,180-Math.floor(time))})}
  function hit(message:string){if(invincible>0)return;lives--;invincible=1.5;tip=message;tipUntil=time+3;callbacks.current.tone(false);burst(player.x,player.y,false)}
  function success(message:string){done++;score+=100;tip=message;tipUntil=time+2.5;callbacks.current.tone(true);burst(player.x,player.y,true)}
  function finish(win:boolean){if(ended)return;ended=true;callbacks.current.onEnd({score,success:win,summary:`${done}/6 taaldoelen gehaald · ${Math.floor(time)} seconden gespeeld. ${win?'Level voltooid!':'Probeer het opnieuw; lees de aanwijzingen rustig.'}`})}
  function rect(x:number,y:number,w:number,h:number,color:string,r=6){ctx!.fillStyle=color;ctx!.beginPath();ctx!.roundRect(x,y,w,h,r);ctx!.fill()}
  function text(value:string,x:number,y:number,size=17,color='#fff',align:CanvasTextAlign='center'){ctx!.font=`700 ${size}px system-ui`;ctx!.textAlign=align;ctx!.fillStyle=color;ctx!.fillText(value,x,y)}
  function draw(){
   const g=ctx!;const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,mode==='space'?'#10152f':mode==='race'?'#193c42':'#73bfce');bg.addColorStop(1,mode==='space'?'#353364':mode==='race'?'#386459':'#e3e8b9');g.fillStyle=bg;g.fillRect(0,0,W,H);
   if(mode==='platform'){
    for(let i=0;i<12;i++){const x=((i*135-camera*.25)%1800+1800)%1800-150;rect(x,180+(i%3)*24,75,230,'#87aaa1');rect(x+12,199+(i%3)*24,14,24,'#e8d59a');rect(x+42,199+(i%3)*24,14,24,'#e8d59a')}
    g.save();g.translate(-camera,0);for(const p of platforms){rect(p.x,p.y,p.w,p.h,'#516443',2);rect(p.x,p.y,p.w,7,'#a7c66d',2)}
    for(const item of coins)if(!item.done){const word=nounSets[level].filter(n=>n.article===item.text)[Math.floor((item.x-220)/480)%5].word;rect(item.x,item.y+Math.sin(time*3+item.x)*3,item.w,item.h,'#f9e4a6',9);text(word,item.x+item.w/2,item.y+22,20,'#303944')}
    for(let i=0;i<7;i++){const x=430+i*370+Math.sin(time*1.6+i)*55;rect(x,379,30,26,'#aa4e60',8);rect(x+5,384,7,6,'#fff');rect(x+19,384,7,6,'#fff')}
    rect(3120,325,65,80,done>=6?'#98dfac':'#526b75',12);text(done>=6?'FINISH':'6 / DE',3152,367,14);g.restore();
   }else if(mode==='race'){
    rect(160,0,480,H,'#343d51',0);for(let i=0;i<10;i++){const y=(i*65+time*180)%600-70;rect(315,y,5,34,'#d6d8d3',0);rect(475,y,5,34,'#d6d8d3',0);rect(150,y,9,38,i%2?'#fff0d0':'#cf766a',0);rect(640,y,9,38,i%2?'#fff0d0':'#cf766a',0)}
    for(let i=0;i<6;i++){const y=(i*100+time*75)%620-60;rect(45,y,38,60,'#a9c982',22);rect(710,y-25,42,66,'#a9c982',22)}
    for(const car of traffic){rect(car.x,car.y,car.w,car.h,'#bd7583',10);rect(car.x+8,car.y+12,car.w-16,17,'#293c52')}
   }else{for(let i=0;i<65;i++){const y=(i*43+time*(15+i%3*12))%H;rect((i*137)%W,y,i%4===0?3:1,2,'#b6c8eb',1)}for(const b of traffic){g.fillStyle='#857f9e';g.beginPath();g.arc(b.x+15,b.y+15,18,0,Math.PI*2);g.fill();rect(b.x+6,b.y+8,10,6,'#65617d')}}
   for(const item of items)if(!item.done){rect(item.x,item.y,item.w,item.h,mode==='space'?'#394b73':'#eedfba',mode==='space'?18:5);text(item.text||'',item.x+item.w/2,item.y+26,mode==='space'?20:23,mode==='space'?'#fff':'#20363c')}
   for(const s of shots)rect(s.x,s.y,4,16,'#98eddf',3);
   const px=player.x-camera;if(invincible===0||Math.floor(time*12)%2===0){if(mode==='space'){g.fillStyle='#ffca84';g.beginPath();g.moveTo(px+16,player.y-7);g.lineTo(px-7,player.y+38);g.lineTo(px+16,player.y+28);g.lineTo(px+39,player.y+38);g.closePath();g.fill();rect(px+11,player.y+6,10,16,'#5bbccc');rect(px+10,player.y+39,12,8+Math.sin(time*30)*5,'#9ce2df')}
   else if(mode==='race'){rect(px,player.y,32,48,'#ffcf74',8);rect(px+5,player.y+9,22,13,'#34546e');rect(px-4,player.y+9,5,13,'#172335');rect(px+31,player.y+9,5,13,'#172335');rect(px+5,player.y+31,22,10,'#bb854f')}
   else{rect(px+5,player.y+17,24,21,'#326b78',5);rect(px+5,player.y-1,24,23,'#f2b677',7);rect(px+21,player.y+7,4,5,'#283b4c',1);rect(px+1,player.y-5,30,9,'#d7694d',3);rect(px+4,player.y+35,10,6,'#283b4c');rect(px+23,player.y+35,10,6,'#283b4c')}}
   for(const s of sparks){g.globalAlpha=Math.max(0,s.life);rect(s.x-camera,s.y,5,5,s.color,1)}g.globalAlpha=1;
   text(mode==='platform'?'WOORDENWERELD':mode==='race'?'TAALRALLY':'WOORDENKOSMOS',20,28,12,'#ffffffb0','left');
  }
  function tick(now:number){const raw=Math.min((now-last)/1000,.035);last=now;if(ended)return;if(!pauseRef.current){const dt=raw*(slowRef.current?.65:1);time+=dt;invincible=Math.max(0,invincible-dt);const k=keys.current;
   const dx=(k.has('ArrowRight')||k.has('d')?1:0)-(k.has('ArrowLeft')||k.has('a')?1:0);player.x+=dx*(mode==='platform'?235:330)*dt;
   if(mode==='platform'){
    player.x=clamp(player.x,0,3220);const jump=k.has(' ')||k.has('ArrowUp')||k.has('w');if(jump&&!jumpHeld&&grounded){vy=-550;grounded=false}jumpHeld=jump;const oldBottom=player.y+player.h;const next=stepJump(player.y,vy,dt);player.y=next.y;vy=next.vy;grounded=false;
    for(const p of platforms)if(vy>=0&&oldBottom<=p.y+1&&player.y+player.h>=p.y&&player.x+player.w>p.x&&player.x<p.x+p.w){player.y=p.y-player.h;vy=0;grounded=true}
    camera=clamp(player.x-200,0,2500);
    for(const item of coins)if(!item.done&&overlaps(player,item)){item.done=true;if(item.correct)success('Goed! Dit is een de-woord.');else hit('Dit is een het-woord. Verzamel de de-woorden.')}
    for(let i=0;i<7;i++)if(overlaps(player,{x:430+i*370+Math.sin(time*1.6+i)*55,y:379,w:30,h:26}))hit('Spring over de robots.');
    if(player.x>3080&&done>=6)finish(true);
   }else{
    player.x=clamp(player.x,mode==='race'?175:10,mode==='race'?590:758);
    const dy=(k.has('ArrowDown')||k.has('s')?1:0)-(k.has('ArrowUp')||k.has('w')?1:0);player.y=clamp(player.y+dy*250*dt,270,410);
    spawn-=dt;wave-=dt;shot-=dt;
    if(wave<=0&&!items.some(i=>!i.done)){
     const p=deck[round%deck.length];items=p.options.map((option,i)=>({x:mode==='race'?180+i*240:45+i*250,y:-45,w:mode==='race'?200:210,h:42,text:option,correct:option===p.answer}));wave=mode==='race'?7:9;
    }
    if(spawn<=0){traffic.push({x:mode==='race'?185+Math.floor(Math.random()*3)*155:Math.random()*750,y:-60,w:mode==='race'?44:30,h:mode==='race'?65:30});spawn=mode==='race'?2.3:1.8}
    for(const obstacle of traffic){obstacle.y+=dt*(mode==='race'?115+done*6:80+done*5);if(overlaps(player,obstacle)){hit(mode==='race'?'Ontwijk de andere auto’s.':'Ontwijk de meteorieten.');obstacle.y=600}}
    traffic=traffic.filter(t=>t.y<H+90);
    if(mode==='space'&&(k.has(' ')||k.has('fire'))&&shot<=0){shots.push({x:player.x+14,y:player.y,w:4,h:16});shot=.22}
    for(const s of shots)s.y-=dt*520;
    let resolved=false;
    for(const item of items){item.y+=dt*(mode==='race'?68:28);if(item.done)continue;const collision=mode==='race'?overlaps(player,item):shots.some(s=>overlaps(s,item));if(collision){item.done=true;if(item.correct){success(deck[round%deck.length].explanation);resolved=true}else{hit(deck[round%deck.length].explanation);if(mode==='race')resolved=true}shots=shots.filter(s=>!overlaps(s,item))}}
    if(items.length&&(resolved||items.every(i=>i.done||i.y>H))){if(!resolved){tip='Gemist. '+deck[round%deck.length].explanation;tipUntil=time+3}round++;items=[];wave=1.8}
    shots=shots.filter(s=>s.y>-30);if(done>=6)finish(true);
   }
   for(const p of sparks){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt}sparks=sparks.filter(p=>p.life>0);if(lives<=0||time>=180)finish(false);if(Math.floor(time*10)!==Math.floor((time-dt)*10))publish();
  }draw();if(!ended)frame=requestAnimationFrame(tick)}
  publish();frame=requestAnimationFrame(tick);return()=>{ended=true;cancelAnimationFrame(frame);keys.current.clear()};
 },[mode,level]);
 const setKey=(key:string,value:boolean)=>{if(value)keys.current.add(key);else keys.current.delete(key)};
 return <div ref={shell} className="action-shell"><div className="action-hud"><span aria-label={`${hud.lives} levens`}>{'♥'.repeat(Math.max(0,hud.lives))}</span><strong>{hud.score} <B>punten</B></strong><span>{hud.done}/6 · {Math.floor(hud.remaining/60)}:{String(hud.remaining%60).padStart(2,'0')}</span><button onClick={()=>{keys.current.clear();setPaused(p=>!p)}} aria-label={paused?'Hervatten':'Pauze'}>{paused?<Play size={20}/>:<Pause size={20}/>}</button><button aria-label="Volledig scherm" onClick={()=>{void shell.current?.requestFullscreen?.().catch(()=>{})}}><Maximize size={19}/></button></div><div className="action-mission" data-no-translate><small>{mode==='platform'?'JOUW MISSIE':mode==='race'?'RIJD DOOR HET JUISTE LIDWOORD':'SCHIET OP HET GOED GESPELDE WOORD'}</small><strong>{hud.text}</strong></div><div className="action-stage"><canvas ref={canvas} width={W} height={H} tabIndex={0} aria-label={mode==='platform'?'Platformspel: pijltjes bewegen, spatie springen. Verzamel de-woorden en bereik de uitgang.':mode==='race'?'Race: pijltjes sturen. Rij door het juiste lidwoord en ontwijk auto’s.':'Ruimtespel: pijltjes sturen, spatie schieten. Schiet het goed gespelde woord.'} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','w','a','s','d'].includes(e.key)){e.preventDefault();setKey(e.key,true)}if(e.key==='p'){keys.current.clear();setPaused(p=>!p)}}} onKeyUp={e=>setKey(e.key,false)}/>{paused&&<div className="arcade-paused"><b><B>Even pauze</B></b><button className="primary-button" onClick={()=>{setPaused(false);canvas.current?.focus()}}><B>Verder spelen</B></button></div>}</div><div className="action-controls">{[{key:'ArrowLeft',label:'Links',icon:ArrowLeft},{key:'ArrowRight',label:'Rechts',icon:ArrowRight},...(mode==='platform'?[{key:' ',label:'Spring',icon:ArrowUp}]:[{key:'ArrowUp',label:'Omhoog',icon:ArrowUp},{key:'ArrowDown',label:'Omlaag',icon:ArrowDown}]),...(mode==='space'?[{key:'fire',label:'Schiet',icon:Crosshair}]:[])].map(b=><button key={b.key} aria-label={b.label} disabled={paused} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);setKey(b.key,true)}} onPointerUp={()=>setKey(b.key,false)} onPointerCancel={()=>setKey(b.key,false)} onLostPointerCapture={()=>setKey(b.key,false)} onKeyDown={e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();setKey(b.key,true)}}} onKeyUp={()=>setKey(b.key,false)}><b.icon size={22}/><B>{b.label}</B></button>)}<label><input type="checkbox" checked={slow} onChange={e=>setSlow(e.target.checked)}/><B>Rustiger tempo</B></label></div><p className="arcade-feedback" role="status">{hud.tip||'Pijltjestoetsen of knoppen vasthouden · P = pauze · haal 6 taaldoelen binnen 3 minuten.'}</p></div>
}
