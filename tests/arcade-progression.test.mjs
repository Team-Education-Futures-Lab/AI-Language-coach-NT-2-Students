import test from 'node:test';
import assert from 'node:assert/strict';
import {gameLanguageLevels,languageNouns,languageSpelling,stageRules,unlockedStage,validGameLevel} from '../lib/arcade-progression.ts';
for(const level of gameLanguageLevels){
 test(`${level}: enough distinct Dutch words and unambiguous spelling options`,()=>{
  const nouns=languageNouns(level);assert.equal(new Set(nouns.map(n=>n.word)).size,12);
  for(const article of ['de','het'])assert.equal(nouns.filter(n=>n.article===article).length,6);
  const spelling=languageSpelling(level);assert.equal(spelling.length,8);
  for(const p of spelling){assert.equal(new Set(p.options).size,3);assert.equal(p.options.filter(w=>w===p.word).length,1);assert.ok(p.options.every(w=>/^\p{L}+$/u.test(w)));assert.ok(p.clue.length>5)}
 });
}
test('stages increase physical challenge without changing CEFR level',()=>{
 for(const level of gameLanguageLevels)for(let stage=2;stage<=5;stage++){
  const a=stageRules(stage-1,level),b=stageRules(stage,level);assert.ok(b.speed>a.speed);assert.ok(b.spawnScale<a.spawnScale);assert.ok(b.robotCount>a.robotCount);assert.ok(b.platformWidth<a.platformWidth);assert.equal(b.seconds,a.seconds);assert.notEqual(b.target,a.target);
 }
 assert.equal(stageRules(-1,'A1').stage,1);assert.equal(stageRules(99,'A1').stage,5);assert.ok(stageRules(1,'A1').seconds>stageRules(1,'B2').seconds);assert.equal(validGameLevel('A0'),false);
});
const win=(stage,level='A1',kind='arcade-train',success=true)=>({kind,detail:JSON.stringify({stage,level,success})});
test('only sequential saved wins for the same game and CEFR unlock the next stage',()=>{
 assert.equal(unlockedStage([],'arcade-train','A1'),1);
 assert.equal(unlockedStage([win(1)],'arcade-train','A1'),2);
 assert.equal(unlockedStage([win(3),win(1)],'arcade-train','A1'),2);
 assert.equal(unlockedStage([1,2,3,4,5].map(n=>win(n)),'arcade-train','A1'),5);
 assert.equal(unlockedStage([win(1,'A2'),win(1,'A1','arcade-market'),win(1,'A1','arcade-train',false),{kind:'arcade-train',detail:'null'},{kind:'arcade-train',detail:'bad'},win(undefined)],'arcade-train','A1'),1);
});
