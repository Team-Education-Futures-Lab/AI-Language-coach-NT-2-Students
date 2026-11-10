import {test} from 'node:test';
import assert from 'node:assert/strict';
import {recommendPractice,levelCoachingInstruction} from '../lib/practice-recommendation.ts';
const item=(id,focus='Lidwoorden',level='A1')=>({id,focus,level,category:'grammatica',minutes:5,questions:[]});
const evidence=(id,skill='Lidwoorden',assisted=false)=>({exerciseId:id,skill,assisted,total:5,score:1,date:'2026-11-10',level:'A1'});
test('new learner receives an existing exercise at their level',()=>{assert.equal(recommendPractice([item('a'),item('b','Lidwoorden','A2')],'A2',[]).exercise.id,'b');assert.equal(recommendPractice([],'A1',[]),null)});
test('two independent low scores prioritise the subject and avoid latest exercise',()=>{const r=recommendPractice([item('other','Verleden tijd'),item('recent'),item('next')],'A1',[evidence('recent'),evidence('old')]);assert.equal(r.exercise.id,'next');assert.match(r.reason,/lastig/)});
test('assisted work or duplicate attempts never infer weakness',()=>{for(const ev of [[evidence('a'),evidence('b','Lidwoorden',true)],[evidence('a'),evidence('a')]])assert.doesNotMatch(recommendPractice([item('fresh')],'A1',ev).reason,/lastig/)});
test('beginner coaching stays short and never solves the exercise',()=>{assert.match(levelCoachingInstruction('A1'),/2 or 3/);assert.match(levelCoachingInstruction('A2'),/one new word/);assert.match(levelCoachingInstruction('B2'),/stated CEFR/);assert.match(levelCoachingInstruction('A1'),/never complete/)});
