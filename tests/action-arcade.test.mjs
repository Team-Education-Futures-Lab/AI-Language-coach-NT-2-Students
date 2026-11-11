import test from 'node:test';import assert from 'node:assert/strict';import {overlaps,stepJump,clamp} from '../lib/action-arcade.ts';
test('collisions distinguish overlap from adjacent objects',()=>{const a={x:0,y:0,w:32,h:40};assert.ok(overlaps(a,{x:30,y:20,w:20,h:20}));assert.equal(overlaps(a,{x:32,y:0,w:20,h:20}),false);assert.equal(overlaps(a,{x:0,y:41,w:20,h:20}),false)});
test('jump can reach the highest platform and returns under gravity',()=>{let y=365,vy=-550,min=y;for(let i=0;i<90;i++){({y,vy}=stepJump(y,vy,1/60));min=Math.min(min,y)}assert.ok(min<260);assert.ok(y>365);assert.ok(vy>0)});
test('a long suspended frame cannot teleport the player',()=>{assert.deepEqual(stepJump(100,100,9),stepJump(100,100,.035));assert.equal(clamp(-3,0,10),0);assert.equal(clamp(20,0,10),10)});
