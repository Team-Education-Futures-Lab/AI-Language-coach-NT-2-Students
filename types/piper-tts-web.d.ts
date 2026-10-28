declare module 'piper-tts-web' {
 export class HuggingFaceVoiceProvider {constructor(options?:Record<string,unknown>)}
 export class OnnxWebWorkerRuntime {constructor(options?:Record<string,unknown>)}
 export class PiperWebWorkerEngine {
  constructor(options?:Record<string,unknown>);
  generate(text:string,voice:string,speaker?:number):Promise<{file:Blob}>;
  destroy():void;
 }
}
