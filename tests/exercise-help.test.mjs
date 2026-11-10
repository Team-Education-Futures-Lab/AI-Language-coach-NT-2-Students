import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
const require=createRequire(import.meta.url);
function loader(overrides={}){const cache=new Map();function load(file){file=resolve(file);if(cache.has(file))return cache.get(file);const module={exports:{}};cache.set(file,module.exports);const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInThisContext('(function(require,module,exports){'+code+'\n})')(name=>name in overrides?overrides[name]:name.startsWith('@/')?load(name.slice(2)+'.ts'):name.startsWith('.')?load(resolve(dirname(file),name+'.ts')):require(name),module,module.exports);return module.exports}return load}
const {exerciseHelpContext,helpPrompt,studyHint}=loader()('lib/pip-help.ts');
const exercise={id:'rotated-123',level:'A1',category:'grammatica',focus:'Lidwoorden',title:'De en het',description:'Kies een woord',questions:[{prompt:'… boek',options:['de','het'],correct:1,explanation:'secret answer'}]};
test('empty choice stays empty and answer keys never reach coach',()=>{
 const c=exerciseHelpContext(exercise,{answers:[''],text:'',checks:[]},0);
 assert.equal(c.attempt,'');assert.equal(c.focus,'Lidwoorden');assert.ok(!JSON.stringify(c).includes('secret answer'));assert.equal(c.correct,undefined);
 assert.equal(exerciseHelpContext(exercise,{answers:['0'],text:'',checks:[]},0).attempt,'de');
 assert.match(studyHint(c),/enkelvoud of meervoud/);
});
test('specific task and attempted answer are available without a forced generic hint',()=>{
 const c=exerciseHelpContext(exercise,{answers:['0'],text:'',checks:[]},0);const prompt=helpPrompt(c);
 assert.match(prompt,/THIS question/);assert.match(prompt,/one|ONE/);assert.match(prompt,/"attempt":"de"/);assert.ok(!prompt.includes('Teacher guidance (use only when relevant):'));
});
test('collapsing help tools never unmounts or hides the speech controller',()=>{
 const ast=ts.createSourceFile('pip.tsx',readFileSync('components/learning/pip-assistant.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);let found=false;
 function visit(n){if(ts.isJsxSelfClosingElement(n)&&n.tagName.getText(ast)==='VoiceControls'){found=true;for(let a=n.parent;a;a=a.parent){if(ts.isJsxElement(a)){assert.ok(!a.openingElement.attributes.properties.some(p=>p.name?.getText(ast)==='hidden'),'speech must be outside hidden tools');}if(ts.isBinaryExpression(a)&&a.operatorToken.kind===ts.SyntaxKind.AmpersandAmpersandToken)assert.notEqual(a.left.getText(ast),'toolsOpen');}}ts.forEachChild(n,visit)}visit(ast);assert.ok(found);
});
