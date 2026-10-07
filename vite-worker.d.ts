declare module '*?worker' { const WorkerConstructor: {new():Worker}; export default WorkerConstructor; }

interface ImportMeta { readonly hot?: {dispose:(callback:()=>void)=>void}; }
