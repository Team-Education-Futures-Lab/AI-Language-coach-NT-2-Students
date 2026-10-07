import ts from 'typescript';
import {copyFile,mkdir,readFile,writeFile} from 'node:fs/promises';
const source=new URL('../node_modules/@huggingface/transformers/',import.meta.url);
const output=new URL('../public/vendor/speech/',import.meta.url);
await mkdir(output,{recursive:true});
// Serve the package's browser bundle unchanged: it must run inside a Web Worker,
// outside the framework's DOM-specific development transforms.
for(const file of ['transformers.min.js','ort-wasm-simd-threaded.jsep.mjs','ort-wasm-simd-threaded.jsep.wasm']){
 await copyFile(new URL('dist/'+file,source),new URL(file,output));
}
await copyFile(new URL('LICENSE',source),new URL('LICENSE.txt',output));

const worker=await readFile(new URL('../lib/speech-worker.ts',import.meta.url),'utf8');
await writeFile(new URL('worker.js',output),ts.transpileModule(worker,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText);
