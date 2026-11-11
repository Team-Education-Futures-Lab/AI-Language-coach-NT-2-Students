import type {ActionMode,Body} from './action-arcade';
type Item=Body&{text?:string;done?:boolean};
export type PixelScene={mode:ActionMode;time:number;camera:number;player:Body;moving:boolean;airborne:boolean;invincible:number;done:number;platforms:Body[];coins:Item[];items:Item[];traffic:Body[];shots:Body[];sparks:{x:number;y:number;life:number;color:string}[];reducedMotion:boolean};
const palette:Record<string,string>={o:'#16203b',r:'#cb4e45',R:'#ff9363',s:'#ffcf92',S:'#c78c6b',b:'#365d84',B:'#75bfc4',w:'#f7efd0',y:'#f2ca61',g:'#47846f',G:'#a4c775',p:'#7c6598',P:'#b6a3c7',c:'#91e4df',C:'#91e4df'};
const hero=[
'.....ooooooo....','....orrRRRrro...','...orRRRRRRRro..','...orrrrrrrrrro.','....osswossso...','....ossoossso...','....osssssso....','.....oSSSSo.....','...ooobbbbBoo...','..ossoBBBBBosso.','..ossoBBBBBosso.','...ooobbBboo....','.....obbbbo.....','.....obooBo.....','....obo..oBo....','...oooo..oooo...'];
const robot=['....ooooooo....','..oopppppppoo..','.opPPPPPPPPppo.','.opPwwPPwwPppo.','.opPooPPooPppo.','.opPPPPPPPPppo.','..opppppppppo..','...oRRRRRRRo...','...ooo..ooo....','..oooo..oooo...'];
const ship=['.......oo.......','......oyyo......','......oRR o.....'.replace(' ',''),'.....oywwyo.....','.....oywwyo.....','....oyBCCByo....','....oyBCCByo....','...oyyBCCByyo...','..oyyyBwwByyyo..','.oyrryBBBB yrryo.'.replace(' ',''),'oyRrryBBBB yrrRyo'.replace(' ',''),'oyrrryyyyyyrrryo','ooooyyoyyoyyoooo','....oo.oo.oo....'];
const tree=['......GGG......','....GGGGGGG....','..GGGggggGGGG..','.GGGgggggggGGG.','GGGgggggggggGGG','.GGgggggggggGG.','...ggggggggg...','......SSS......','......SSS......','.....SSSSS.....'];
export function drawSprite(g:CanvasRenderingContext2D,rows:string[],x:number,y:number,size=2,flip=false){g.save();g.translate(Math.round(x/2)*2,Math.round(y/2)*2);if(flip){g.translate(rows[0].length*size,0);g.scale(-1,1)}rows.forEach((row,j)=>[...row].forEach((color,i)=>{if(palette[color]){g.fillStyle=palette[color];g.fillRect(i*size,j*size,size,size)}}));g.restore()}
export function renderPixelScene(g:CanvasRenderingContext2D,s:PixelScene){
 const {mode,time,camera,player}=s;const t=s.reducedMotion?0:time;
 function box(x:number,y:number,w:number,h:number,color:string){g.fillStyle=color;g.fillRect(Math.round(x/2)*2,Math.round(y/2)*2,Math.ceil(w/2)*2,Math.ceil(h/2)*2)}
 function label(value:string,x:number,y:number,size=18,color='#fff2c9',align:CanvasTextAlign='center'){g.font=`bold ${size}px "Courier New",monospace`;g.textAlign=align;g.fillStyle='#142033';g.fillText(value,x+1,y+2);g.fillStyle=color;g.fillText(value,x,y)}
 function panel(x:number,y:number,w:number,h:number,fill:string){box(x+4,y+4,w,h,'#121c34');box(x,y,w,h,'#17283d');box(x+2,y+2,w-4,h-4,fill);box(x+4,y+4,w-8,2,'#ffffff60');box(x+4,y+h-6,w-8,2,'#00000035')}
 function cloud(x:number,y:number){box(x+16,y,48,8,'#eff3d3');box(x+8,y+8,72,12,'#eff3d3');box(x,y+20,96,10,'#c5dfcf')}
 function house(x:number,y:number,w:number,h:number,color:string){box(x,y,w,h,'#263748');box(x+4,y+4,w-8,h-4,color);for(let r=0;r<4;r++)box(x+8+r*8,y-8-r*8,w-16-r*16,8,color);for(let yy=y+16;yy<y+h-22;yy+=40)for(let xx=x+12;xx<x+w-15;xx+=28){box(xx,yy,16,23,'#233949');box(xx+2,yy+2,12,18,'#edc98b');box(xx+7,yy,2,23,'#667b79');box(xx,yy+10,16,2,'#667b79')}box(x+w/2-9,y+h-28,18,28,'#233949');box(x+w/2-5,y+h-24,10,22,'#567477')}
 g.imageSmoothingEnabled=false;g.clearRect(0,0,800,460);
 if(mode==='platform'){
  box(0,0,800,460,'#9fd2ce');box(0,0,800,70,'#77b7bf');box(0,70,800,65,'#85c1c6');box(638,34,44,44,'#f4df9b');box(630,42,60,28,'#f4df9b');
  for(let i=0;i<6;i++)cloud(((i*211-camera*.12-t*3)%1300+1300)%1300-150,35+i%3*37);
  for(let i=0;i<15;i++){const x=i*120-camera*.24;box(x,214+(i%3)*18,105,194,'#719b9a');box(x+12,198+(i%3)*18,80,18,'#719b9a')}
  for(let i=0;i<16;i++)house(i*155-camera*.48-50,205+(i%3)*19,92,195-(i%3)*19,['#6c938e','#789d8c','#869f8a'][i%3]);
  box(0,388,800,17,'#3f858d');for(let i=0;i<20;i++)box((i*47+t*14)%850-20,394+i%2*5,20,2,'#acd9c0');
  g.save();g.translate(-Math.round(camera/2)*2,0);
  for(const p of s.platforms){box(p.x,p.y,p.w,p.h,'#805d51');box(p.x,p.y,p.w,6,'#b6ca76');box(p.x,p.y+6,p.w,5,'#567c58');for(let yy=p.y+14;yy<p.y+p.h;yy+=14){box(p.x,yy,p.w,2,'#644c4c');for(let xx=p.x+((yy/14)%2)*14;xx<p.x+p.w;xx+=28)box(xx,yy,2,12,'#ad7b5c')}for(let xx=p.x+8;xx<p.x+p.w-8;xx+=28)box(xx,p.y-2,6,4,'#d1df87')}
  for(let i=0;i<10;i++){drawSprite(g,tree,i*320+110,343,2);box(i*320+170,399,4,6,'#537348');box(i*320+168,395,8,4,'#f0b070')}
  for(const item of s.coins)if(!item.done){const bob=Math.round(Math.sin(t*3+item.x)*2)*2;panel(item.x,item.y+bob,item.w,item.h,'#d9ad5d');box(item.x+6,item.y+8+bob,4,4,'#fff4be');label(item.text||'',item.x+item.w/2,item.y+22+bob,20,'#203440')}
  for(let i=0;i<7;i++){const x=430+i*370+Math.sin(time*1.6+i)*55;drawSprite(g,robot,x,379,2);box(x+4,401,8,4,'#272840');box(x+20,401,8,4,'#272840')}
  const exit=s.done>=6;panel(3118,319,70,86,exit?'#427b70':'#414858');box(3128,329,50,66,exit?'#a3dab7':'#26374c');for(let y=331;y<392;y+=8)box(3134,y,38,2,exit?'#d7edb260':'#637384');label(exit?'UIT':'6 DE',3153,362,16);box(3120,312,66,8,exit?'#e8d47e':'#647980');
  g.restore();
 }else if(mode==='race'){
  box(0,0,800,460,'#557f62');for(let i=0;i<160;i++)box((i*117)%800,(i*63+time*95)%500-20,6,3,i%2?'#719862':'#3c6f5a');
  box(142,0,516,460,'#b8a98a');box(160,0,480,460,'#35414c');for(let i=0;i<24;i++){const y=(i*24+time*150)%576-40;box(150,y,10,24,i%2?'#efddae':'#ba665e');box(640,y,10,24,i%2?'#efddae':'#ba665e')}
  for(let i=0;i<12;i++){const y=(i*65+time*180)%700-70;box(315,y,5,34,'#d7d2b6');box(475,y,5,34,'#d7d2b6');box(178+(i*71)%440,y+20,22,2,'#47515b')}
  for(let i=0;i<5;i++){const y=(i*170+time*90)%850-180;drawSprite(g,tree,24,y,4);drawSprite(g,tree,707,y-90,4);panel(669,y+90,74,34,'#d1b66b');label(i%2?'STAD':'SCHOOL',706,y+111,12,'#233d42');box(704,y+124,5,24,'#bcb793')}
  for(const car of s.traffic)drawCar(car.x,car.y,car.w,car.h,['#bd6d68','#a6b48e','#648cb8'][Math.floor(car.x)%3],false);
 }else{
  box(0,0,800,460,'#121b34');for(let i=0;i<7;i++){box(470+i*12,48+i*10,190-i*18,94,'#252647');box(90+i*8,270+i*9,130-i*10,50,'#1a2440')}
  // Stepped planet silhouette and rings, drawn in integer pixels.
  for(let y=-48;y<=48;y+=4){const w=Math.floor(Math.sqrt(48*48-y*y)/4)*4;box(670-w,98+y,w*2,4,y<0?'#77708f':'#4f547a')}
  box(592,109,156,4,'#ad8a9c');box(606,113,148,4,'#81778f');box(624,78,24,4,'#9c8b9f');
  for(let i=0;i<85;i++){const y=(i*43+t*(15+i%3*12))%460,x=(i*137)%800;box(x,y,i%6===0?4:2,2,i%4?'#8691b3':'#e1dac7');if(i%17===0){box(x+1,y-3,2,8,'#ada6c1')}}
  for(const b of s.traffic){const x=b.x-3,y=b.y-3;box(x+8,y,22,6,'#535875');box(x+2,y+6,34,24,'#535875');box(x+8,y+30,22,6,'#3b425e');box(x+6,y+8,24,18,'#898098');box(x+10,y+10,8,6,'#b4a0ae');box(x+21,y+18,10,8,'#635b7c')}
 }
 for(const item of s.items)if(!item.done){panel(item.x,item.y,item.w,item.h,mode==='space'?'#3d486b':'#d5bd85');if(mode==='space'){box(item.x+6,item.y+15,4,10,'#a5e1da');box(item.x+item.w-10,item.y+15,4,10,'#a5e1da')}else{box(item.x,item.y-8,6,8,'#e9e2c7');box(item.x+item.w-6,item.y-8,6,8,'#e9e2c7')}label(item.text||'',item.x+item.w/2,item.y+28,mode==='space'?20:24,mode==='space'?'#e7f0d3':'#24394a')}
 for(const shot of s.shots){box(shot.x-2,shot.y,8,18,'#306e83');box(shot.x,shot.y,4,14,'#9ff2dc');box(shot.x,shot.y-4,4,6,'#fff5ca')}
 const px=player.x-camera;if(s.invincible===0||Math.floor(time*12)%2===0){if(mode==='platform'){drawSprite(g,hero,px,player.y+7,2);if(s.moving&&!s.airborne){const f=Math.floor(time*12)%2;box(px+(f?6:20),player.y+36,12,5,'#15263d')}}else if(mode==='race')drawCar(px,player.y,32,48,'#e5ba62',true);else{drawSprite(g,ship,px,player.y+3,2);const flame=6+Math.floor(t*18)%3*4;box(px+12,player.y+31,10,flame,'#de775d');box(px+15,player.y+31,4,flame-2,'#ffe6a3')}}
 for(const p of s.sparks){g.globalAlpha=Math.max(0,p.life);box(p.x-camera,p.y,4,4,p.color)}g.globalAlpha=1;
 box(12,12,mode==='platform'?148:136,20,'#17263cbb');label(mode==='platform'?'WOORDENWERELD':mode==='race'?'TAALRALLY':'WOORDENKOSMOS',20,26,12,'#e5e6c7','left');
 function drawCar(x:number,y:number,w:number,h:number,color:string,own:boolean){box(x-3,y+8,w+6,13,'#192634');box(x-3,y+h-20,w+6,12,'#192634');box(x+4,y,w-8,h,'#1b293c');box(x,y+5,w,h-10,color);box(x+4,y+4,w-8,5,'#f5dfac');box(x+5,y+13,w-10,h*.25,'#263d51');box(x+7,y+15,5,h*.2,'#96bec0');box(x+4,y+h-19,w-8,9,'#3d5265');box(x+3,y+h-7,6,4,'#e77c64');box(x+w-9,y+h-7,6,4,'#e77c64');box(x+w/2-2,y+h*.48,4,h*.2,'#fff0c3');if(own){box(x+5,y+h,4,4,'#da9564');box(x+w-9,y+h,4,4,'#da9564')}}
}
