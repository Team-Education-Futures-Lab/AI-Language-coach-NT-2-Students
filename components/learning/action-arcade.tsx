'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,ArrowUp,ArrowDown,Crosshair,Pause,Play,Maximize} from 'lucide-react';
import {shuffled} from '@/lib/arcade';
import {clamp,overlaps,stepJump,type ActionMode,type Body,type Prompt} from '@/lib/action-arcade';
import {B} from './translation';
import {languageNouns,languageSpelling,stageRules,type GameLanguageLevel} from '@/lib/arcade-progression';
import {worlds,worldDeck,worldNouns} from '@/lib/arcade-worlds';
import {renderPixelScene} from '@/lib/arcade-pixels';
import type {ArcadeAudio} from '@/lib/arcade-audio';
type Item=Body&{text?:string;correct?:boolean;done?:boolean;vx?:number};
type Props={audio:ArcadeAudio;mode:ActionMode;level:GameLanguageLevel;stage:number;tone:(good:boolean)=>void;onEnd:(r:{score:number;summary:string;success:boolean})=>void};
const W=800,H=460;
export function ActionArcade({mode,level,stage,tone,onEnd,audio}:Props){
 const rules=stageRules(stage,level),world=worlds[stage-1],rescue=mode==='space'&&(stage===2||stage===4);
 const canvas=useRef<HTMLCanvasElement>(null),shell=useRef<HTMLDivElement>(null),keys=useRef(new Set<string>()),callbacks=useRef({tone,onEnd});callbacks.current={tone,onEnd};
 const [paused,setPaused]=useState(false),[slow,setSlow]=useState(false),[hud,setHud]=useState({lives:5,score:0,round:0,text:'',tip:'',done:0,remaining:180});const pauseRef=useRef(false),slowRef=useRef(false);pauseRef.current=paused;slowRef.current=slow;
 useEffect(()=>{const clear=()=>{keys.current.clear();setPaused(true)},hidden=()=>{if(document.hidden)clear()};window.addEventListener('blur',clear);document.addEventListener('visibilitychange',hidden);canvas.current?.focus();return()=>{window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',hidden)}},[]);
 useEffect(()=>{audio.setPlaying(!paused,mode);return()=>audio.setPlaying(false,mode)},[audio,paused,mode]);
 useEffect(()=>{
  const c=canvas.current,ctx=c?.getContext('2d');if(!c||!ctx)return;
  const deck:Prompt[]=worldDeck(level,stage,mode==='space'?'space':'race').map(p=>({...p,options:shuffled(p.options)}));
  const nouns=shuffled(worldNouns(level,stage));
  const target=stage===5?'het':rules.target;
  let player={x:mode==='platform'?(stage===4?3100:45):380,y:mode==='platform'?340:360,w:32,h:40},vy=0,grounded=false,jumpHeld=false,shot=0,time=0,camera=0,lives=5,score=0,done=0,round=0,invincible=0,ended=false,last=performance.now(),frame=0,spawn=1,wave=0,tip='',tipUntil=0;
  let items:Item[]=[],shots:Item[]=[],traffic:Item[]=[],sparks:{x:number;y:number;vx:number;vy:number;life:number;color:string}[]=[];
  const platforms=[{x:0,y:405,w:3300,h:55},...Array.from({length:8},(_,i)=>({x:200+i*350+(stage%3)*25,y:(i+stage)%2?300:330,w:rules.platformWidth,h:18}))];
  const coins=Array.from({length:12},(_,i)=>({x:220+i*240,y:i%2?260:350,w:140,h:30,text:nouns.filter(n=>n.article===(i%2?(target==='de'?'het':'de'):target))[Math.floor(i/2)].word,correct:i%2===0,done:false}));
  const sequence=coins.filter(i=>i.correct);if(stage===4)sequence.reverse();
  function burst(x:number,y:number,good:boolean){for(let i=0;i<14;i++)sparks.push({x,y,vx:(Math.random()-.5)*200,vy:(Math.random()-.7)*220,life:1,color:good?'#ffe291':'#ff9b9b'})}
  function publish(){setHud({lives,score,round,text:mode==='platform'?(done>=6?(stage===3?'Breng de sleutels terug naar START.':'Ga naar de vlag bij de uitgang.'):(stage===2||stage===4)?`Vang: ${sequence[done].text}`:`Verzamel zes ${target}-woorden`):deck[round%deck.length].word,tip:time<tipUntil?tip:'',done,remaining:Math.max(0,rules.seconds-Math.floor(time))})}
  function hit(message:string){if(invincible>0)return;lives--;invincible=1.5;tip=message;tipUntil=time+3;audio.effect('hit');burst(player.x,player.y,false)}
  function success(message:string){done++;score+=100;tip=message;tipUntil=time+2.5;audio.effect('collect');burst(player.x,player.y,true)}
  function finish(win:boolean){if(ended)return;ended=true;callbacks.current.onEnd({score,success:win,summary:`${level} · spellevel ${stage}/5 · ${done}/6 taaldoelen gehaald · ${Math.floor(time)} seconden gespeeld. ${win?'Level voltooid!':'Probeer het opnieuw; lees de aanwijzingen rustig.'}`})}
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.motion==='off';
  function draw(){renderPixelScene(ctx!,{mode,time,camera,player,world:stage,moving:keys.current.has('ArrowLeft')||keys.current.has('ArrowRight')||keys.current.has('a')||keys.current.has('d'),airborne:!grounded,invincible,done,platforms,coins,items,traffic,shots,sparks,reducedMotion,robots:{count:rules.robotCount,speed:rules.robotSpeed,range:rules.robotRange},target:target})}
  function tick(now:number){const raw=Math.min((now-last)/1000,.035);last=now;if(ended)return;if(!pauseRef.current){const dt=raw*(slowRef.current?.65:1);time+=dt;invincible=Math.max(0,invincible-dt);const k=keys.current;
   const dx=(k.has('ArrowRight')||k.has('d')?1:0)-(k.has('ArrowLeft')||k.has('a')?1:0);player.x+=dx*(mode==='platform'?235:330)*dt;
   if(mode==='platform'){
    player.x=clamp(player.x,0,3220);const jump=k.has(' ')||k.has('ArrowUp')||k.has('w');if(jump&&!jumpHeld&&grounded){vy=-550;grounded=false;audio.effect('jump')}jumpHeld=jump;const wasGrounded=grounded,fallSpeed=vy;const oldBottom=player.y+player.h;const next=stepJump(player.y,vy,dt);player.y=next.y;vy=next.vy;grounded=false;
    for(const p of platforms)if(vy>=0&&oldBottom<=p.y+1&&player.y+player.h>=p.y&&player.x+player.w>p.x&&player.x<p.x+p.w){player.y=p.y-player.h;vy=0;grounded=true}
    if(!wasGrounded&&grounded&&fallSpeed>100)audio.effect('land');
    camera=clamp(player.x-200,0,2500);
    for(const item of coins)if(!item.done&&overlaps(player,item)){if((stage===2||stage===4)&&item.correct&&item!==sequence[done])continue;item.done=true;if(item.correct)success(`Goed: ${target} ${item.text}.`);else hit(`${target==='de'?'Het':'De'} ${item.text}. Verzamel de ${target}-woorden.`)}
    for(let i=0;i<rules.robotCount;i++)if(overlaps(player,{x:430+i*(2600/Math.max(1,rules.robotCount-1))+Math.sin(time*rules.robotSpeed+i)*rules.robotRange,y:379,w:30,h:26}))hit('Spring over de robots.');
    if((stage===3?player.x<100:player.x>3080)&&done>=6)finish(true);
   }else{
    player.x=clamp(player.x,mode==='race'?175:10,mode==='race'?590:758);
    const dy=(k.has('ArrowDown')||k.has('s')?1:0)-(k.has('ArrowUp')||k.has('w')?1:0);player.y=clamp(player.y+dy*250*dt,270,410);
    spawn-=dt;wave-=dt;shot-=dt;
    if(wave<=0&&!items.some(i=>!i.done)){
     const p=deck[round%deck.length];items=p.options.map((option,i)=>({x:mode==='race'?175+i*(460/p.options.length):45+i*(710/p.options.length),y:-45,w:mode==='race'?440/p.options.length:680/p.options.length,h:42,text:option,correct:option===p.answer}));wave=mode==='race'?7:9;
    }
    if(spawn<=0){traffic.push({x:mode==='race'?185+Math.floor(Math.random()*3)*155:Math.random()*750,y:-60,w:mode==='race'?44:30,h:mode==='race'?65:30});spawn=(mode==='race'?2.3:1.8)*rules.spawnScale}
    for(const obstacle of traffic){obstacle.y+=dt*(mode==='race'?95+done*6:65+done*5)*rules.speed;if(overlaps(player,obstacle)){hit(mode==='race'?'Ontwijk de andere auto’s.':'Ontwijk de meteorieten.');obstacle.y=600}}
    traffic=traffic.filter(t=>t.y<H+90);
    if(mode==='space'&&!rescue&&(k.has(' ')||k.has('fire'))&&shot<=0){shots.push({x:player.x+14,y:player.y,w:4,h:16});shot=.22;audio.effect('laser')}
    for(const s of shots)s.y-=dt*520;
    let resolved=false;
    for(const item of items){item.y+=dt*(mode==='race'?55:rescue?65:24)*rules.speed;if(item.done)continue;const collision=(mode==='race'||rescue)?overlaps(player,item):shots.some(s=>overlaps(s,item));if(collision){item.done=true;if(item.correct){success(deck[round%deck.length].explanation);resolved=true}else{hit(deck[round%deck.length].explanation);if(mode==='race'||rescue)resolved=true}shots=shots.filter(s=>!overlaps(s,item))}}
    if(items.length&&(resolved||items.every(i=>i.done||i.y>H))){if(!resolved){tip='Gemist. '+deck[round%deck.length].explanation;tipUntil=time+3}round++;items=[];wave=1.8}
    shots=shots.filter(s=>s.y>-30);if(done>=6)finish(true);
   }
   for(const p of sparks){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt}sparks=sparks.filter(p=>p.life>0);if(lives<=0||time>=rules.seconds)finish(false);if(Math.floor(time*10)!==Math.floor((time-dt)*10))publish();
  }draw();if(!ended)frame=requestAnimationFrame(tick)}
  publish();frame=requestAnimationFrame(tick);return()=>{ended=true;cancelAnimationFrame(frame);keys.current.clear()};
 },[mode,level,stage,audio]);
 const setKey=(key:string,value:boolean)=>{if(value)keys.current.add(key);else keys.current.delete(key)};
 return <div ref={shell} className={`action-shell pixel-arcade pixel-${mode}`} lang="nl" dir="ltr" translate="no"><div className="action-hud"><strong>Level {stage}/5 · {level}</strong><span aria-label={`${hud.lives} levens`}>{'♥'.repeat(Math.max(0,hud.lives))}</span><strong>{hud.score} <B>punten</B></strong><span>{hud.done}/6 · {Math.floor(hud.remaining/60)}:{String(hud.remaining%60).padStart(2,'0')}</span><button onClick={()=>{keys.current.clear();setPaused(p=>!p)}} aria-label={paused?'Hervatten':'Pauze'}>{paused?<Play size={20}/>:<Pause size={20}/>}</button><button aria-label="Volledig scherm" onClick={()=>{void shell.current?.requestFullscreen?.().then(()=>canvas.current?.focus()).catch(()=>{})}}><Maximize size={19}/></button></div><div className="action-mission" data-no-translate><small>{world.name} · {world.mission[mode==='platform'?0:mode==='race'?1:2]}</small><strong>{hud.text}</strong></div><div className="action-stage"><canvas ref={canvas} width={W} height={H} tabIndex={0} aria-label={`${world.name}. ${world.mission[mode==='platform'?0:mode==='race'?1:2]}`} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','w','a','s','d'].includes(e.key)){e.preventDefault();setKey(e.key,true)}if(e.key==='p'){keys.current.clear();setPaused(p=>!p)}}} onKeyUp={e=>setKey(e.key,false)}/>{paused&&<div className="arcade-paused"><b><B>Even pauze</B></b><button className="primary-button" onClick={()=>{setPaused(false);canvas.current?.focus()}}><B>Verder spelen</B></button></div>}</div><div className="action-controls">{[{key:'ArrowLeft',label:'Links',icon:ArrowLeft},{key:'ArrowRight',label:'Rechts',icon:ArrowRight},...(mode==='platform'?[{key:' ',label:'Spring',icon:ArrowUp}]:[{key:'ArrowUp',label:'Omhoog',icon:ArrowUp},{key:'ArrowDown',label:'Omlaag',icon:ArrowDown}]),...(mode==='space'&&!rescue?[{key:'fire',label:'Schiet',icon:Crosshair}]:[])].map(b=><button key={b.key} aria-label={b.label} disabled={paused} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);setKey(b.key,true)}} onPointerUp={()=>setKey(b.key,false)} onPointerCancel={()=>setKey(b.key,false)} onLostPointerCapture={()=>setKey(b.key,false)} onKeyDown={e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();setKey(b.key,true)}}} onKeyUp={()=>setKey(b.key,false)}><b.icon size={22}/><B>{b.label}</B></button>)}<label><input type="checkbox" checked={slow} onChange={e=>setSlow(e.target.checked)}/><B>Rustiger tempo</B></label></div><p className="arcade-feedback" role="status">{hud.tip||`Pijltjestoetsen of knoppen vasthouden · P = pauze · haal 6 taaldoelen binnen ${rules.seconds} seconden.`}</p></div>
}
