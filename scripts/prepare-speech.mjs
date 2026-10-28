import ts from 'typescript';
import {copyFile,cp,mkdir,readFile,writeFile} from 'node:fs/promises';
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

// Piper 1.1.2 uses these absolute worker/runtime paths. Keep the package intact.
const piperSource=new URL('../node_modules/piper-tts-web/dist/',import.meta.url);
for(const directory of ['onnx','piper','worker']){
 await cp(new URL(directory+'/',piperSource),new URL('../public/'+directory+'/',import.meta.url),{recursive:true});
}
await copyFile(new URL('../node_modules/piper-tts-web/LICENSE',import.meta.url),new URL('../public/piper/LICENSE.txt',import.meta.url));

await mkdir(new URL('../public/vendor/piper/',import.meta.url),{recursive:true});
await copyFile(new URL('piper-tts-web.js',piperSource),new URL('../public/vendor/piper/piper-tts-web.js',import.meta.url));
