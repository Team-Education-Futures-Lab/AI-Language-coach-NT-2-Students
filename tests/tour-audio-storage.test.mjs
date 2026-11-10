import test from 'node:test';
import assert from 'node:assert/strict';
import {storedTourAudio} from '../lib/tour-audio-storage.ts';
test('tour audio survives a fresh in-memory cache and varies by voice/language',async()=>{
 const oldWindow=globalThis.window,oldCaches=globalThis.caches;const entries=new Map();
 globalThis.window={location:{origin:'https://example.com'}};
 globalThis.caches={open:async()=>({match:async key=>entries.get(key)?.clone(),put:async(key,value)=>entries.set(key,value),delete:async key=>entries.delete(key),keys:async()=>[...entries.keys()]})};
 try{let calls=0;const generate=async()=>{calls++;return new Blob(['audio'])};await storedTourAudio('nl:F1:hello',generate);await storedTourAudio('nl:F1:hello',generate);assert.equal(calls,1);await storedTourAudio('ar:M1:hello',generate);assert.equal(calls,2);
 globalThis.caches={open:async()=>{throw Error('Storage blocked')}};assert.equal(await (await storedTourAudio('nl:F1:hello',generate)).text(),'audio');assert.equal(calls,3);
 }finally{globalThis.window=oldWindow;globalThis.caches=oldCaches}
});
