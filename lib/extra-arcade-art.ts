import {worlds} from './arcade-worlds.ts';
export type ExtraScene={mode:'cross'|'bridge'|'snake';stage:number;time:number;x:number;y:number;tail:number[][];dir:number[];blocks:number[][];options:string[];bridge:number[];length:number;paused?:boolean;ended?:boolean;won?:boolean;flash?:number;good?:boolean};
export function renderExtraScene(g:CanvasRenderingContext2D,s:ExtraScene){
 const w=worlds[s.stage-1],t=s.time;g.imageSmoothingEnabled=false;
 const box=(x:number,y:number,width:number,height:number,c:string)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.ceil(width),Math.ceil(height))};
 const text=(str:string,x:number,y:number,size=13,color='#fff0c9',max=560)=>{g.font=`bold ${size}px "Courier New",monospace`;g.textAlign='center';g.fillStyle='#102235';g.fillText(str,x+1,y+2,max);g.fillStyle=color;g.fillText(str,x,y,max)};
 const panel=(x:number,y:number,width:number,height:number,c:string)=>{box(x+3,y+4,width,height,'#142439');box(x,y,width,height,'#17293b');box(x+2,y+2,width-4,height-4,c);box(x+4,y+4,width-8,2,'#ffffff66')};
 function tree(x:number,y:number){box(x+10,y+22,6,16,'#6a524a');box(x+2,y+9,24,18,s.stage===4?'#bddede':'#366c63');box(x+6,y,16,24,s.stage===4?'#edf5dd':'#76a76b');box(x+9,y+4,6,4,'#b3cf8c')}
 function fox(x:number,y:number){box(x+3,y+16,16,3,'#15253666');box(x+1,y+7,5,8,'#c86d48');box(x,y+5,4,7,'#fff1d2');box(x+7,y+7,10,10,'#dc814b');box(x+6,y+1,12,11,'#f4aa60');box(x+6,y-2,4,6,'#cf6d48');box(x+14,y-2,4,6,'#cf6d48');box(x+9,y+8,8,4,'#fff0d5');box(x+9,y+4,2,3,'#203346');box(x+15,y+4,2,3,'#203346');box(x+13,y+9,2,2,'#203346');box(x+7,y+16,4,3,'#34414b');box(x+14,y+16,4,3,'#34414b')}
 box(0,0,600,400,w.sky);
 if(s.mode==='bridge'){
  for(let i=0;i<9;i++){const x=((i*97-t*3)%700+700)%700-60,y=35+(i%3)*32;box(x+8,y,35,8,'#ffffff45');box(x,y+8,55,9,'#ffffff45')}
  box(455,36,38,38,w.accent);box(447,44,54,22,w.accent);
  for(let i=0;i<12;i++){const x=i*65;box(x,170+(i%4)*15,58,180,'#3f657577');box(x+8,152+(i%4)*15,42,20,'#3f657577')}
  for(let i=0;i<8;i++){const x=i*90-15;box(x,220+(i%3)*15,65,150,'#3f5b69');box(x+10,205+(i%3)*15,45,20,'#3f5b69');for(let j=0;j<3;j++)box(x+12+j*16,240+(i%3)*15,5,13,'#c3c88c55')}
  box(0,340,600,60,'#315d70');for(let i=0;i<40;i++)box((i*47+t*12)%620-20,348+i%5*10,16,2,i%2?'#8cb5b355':'#6b989d55');
  function tower(x:number,width:number){box(x,300,width,100,'#745f5c');box(x,300,width,7,w.accent);box(x,307,width,5,'#4c7565');for(let y=317;y<400;y+=15){box(x,y,width,2,'#4c484e');for(let xx=x+((y%2)*12);xx<x+width-3;xx+=23)box(xx,y,2,13,'#a08672')}box(x+5,315,4,70,'#c4a78044')}
  tower(20,70);s.bridge.forEach(px=>tower(px-42,84));
  box(90,290,s.length,8,'#f2ce8e');box(90,298,s.length,3,'#856247');for(let x=95;x<90+s.length;x+=12)box(x,292,2,6,'#bb8a55');fox(54,281);
  s.options.forEach((o,i)=>{const px=s.bridge[i];box(px-2,260,4,40,'#74524a');panel(px-43,257,86,31,'#334e61');text(o,px,278,14,'#fff2c9',78);box(px-6,298,12,2,'#fff2b2')});
  text('HOUD VAST · BOUW JE BRUG',300,22,11,w.accent);
 }else if(s.mode==='cross'){
  box(0,0,600,400,w.ground);for(let i=0;i<260;i++)box((i*137)%600,(i*71)%400,3,2,i%2?'#ffffff18':'#102c351c');
  for(let lane=0;lane<5;lane++){const cy=5+lane*2,yy=cy*20;box(0,yy-3,600,26,'#243747');box(0,yy,600,20,lane%2?'#445362':'#3b4959');for(let i=0;i<20;i++)box(i*34+5,yy+9,14,1,'#ccd6bb55');box(0,yy-3,600,2,'#b3c0aa');box(0,yy+21,600,2,'#7b8d88');const cx=((t*(2+s.stage*.3)*(lane%2?-1:1)+lane*6)%34+34)%34-2;const x=cx*20;box(x,yy+17,42,3,'#17263766');box(x+4,yy-1,9,4,'#142438');box(x+29,yy-1,9,4,'#142438');box(x+4,yy+16,9,4,'#142438');box(x+29,yy+16,9,4,'#142438');box(x,yy+2,42,14,lane%2?'#d6856b':'#e0bc71');box(x+11,yy+3,20,12,'#2c5066');box(x+13,yy+4,6,10,'#b4d8d5');box(x+31,yy+4,8,10,'#f0ce8b');box(x+40,yy+4,2,3,'#fff2be');box(x+40,yy+12,2,3,'#fff2be')}
  for(let i=0;i<9;i++){tree(i*73+5,350);box(i*73+45,375,3,3,'#f8c98d');box(i*73+48,372,3,3,'#f8c98d')}
  for(let i=0;i<15;i++){box(i*40,83,28,4,'#cfbf92');box(i*40+4,78,4,12,'#866e58')}
  s.options.forEach((o,i)=>{const px=(4+i*10)*20;box(px-32,20,64,61,'#8fa37a');for(let j=0;j<4;j++)box(px-30+j*16,76,8,4,'#ece2b5');panel(px-43,42,86,34,'#314b55');text(o,px,65,14,'#fff2cb',78)});fox(s.x*20,s.y*20);
  text('TROTS NAAR DE OVERKANT',300,17,11,w.accent);
 }else{
  const tiles=[['#304e4b','#2c4848'],['#464162','#3b3756'],['#796248','#6c593f'],['#46677a','#3c5e70'],['#48374d','#3c3045']][s.stage-1];box(0,0,600,400,w.ground);for(let y=0;y<20;y++)for(let x=0;x<30;x++){box(x*20,y*20,20,20,tiles[(x+y)%2]);box(x*20+4,y*20+15,2,2,'#688a6a22')}
  for(const [x,y]of s.blocks){panel(x*20,y*20,20,20,'#807592');box(x*20+5,y*20+5,10,5,'#b5a3b3');box(x*20+10,y*20+12,7,5,'#514d6a')}
  s.options.forEach((o,i)=>{const px=(4+i*10)*20;box(px-35,34,70,49,'#74916b');box(px-31,38,62,40,'#405e4f');panel(px-43,42,86,34,'#344f5b');text(o,px,65,14,'#fff0b9',78);box(px-2,33,4,6,w.accent)});
  s.tail.slice().reverse().forEach(([x,y],i)=>{box(x*20+2,y*20+4,17,15,'#172e35');box(x*20+1,y*20+1,17,16,i%2?'#90bd74':'#a8ce81');box(x*20+3,y*20+2,11,3,'#d2e5a1');box(x*20+7,y*20+10,4,3,'#719b65')});const hx=s.x*20,hy=s.y*20;box(hx+4,hy+4,4,5,'#203542');box(hx+12,hy+4,4,5,'#203542');box(hx+5,hy+4,2,2,'#fff9d8');box(hx+13,hy+4,2,2,'#fff9d8');
  text('EEN WOORDJE GROTER',300,20,11,w.accent);
 }
 if((s.flash||0)>0){for(let i=0;i<14;i++){const a=i*2.4,r=(1-s.flash!)*45;box(s.x*20+10+Math.cos(a)*r,s.y*20+8+Math.sin(a)*r,4,4,s.good?'#ffe6a2':'#f59988')}}
 if(s.paused||s.ended){box(0,0,600,400,'#101e31c9');panel(135,135,330,120,'#294357');text(s.paused?'EVEN PAUZE':s.won?'WERELD VOLTOOID!':'NOG EEN KEER?',300,183,22);text(s.paused?'Druk op Verder om door te spelen.':s.won?'Goed gedaan. Je kunt verder!':'Je kunt het opnieuw proberen.',300,217,13,'#c1d9c3')}
}
