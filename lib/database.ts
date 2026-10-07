import 'server-only';
import postgres from 'postgres';
type Row=Record<string,unknown>;
let connection:ReturnType<typeof postgres>|undefined;
function sql(){
 if(!process.env.DATABASE_URL)throw new Error('Database is nog niet geconfigureerd.');
 return connection??=postgres(process.env.DATABASE_URL,{password:process.env.DATABASE_PASSWORD,prepare:false,max:3,idle_timeout:20,connect_timeout:10,ssl:'require'});
}
// Only server-owned SQL reaches this adapter. Values always stay bound parameters.
export class Statement{
 constructor(readonly query:string,readonly values:unknown[]=[]){ }
 bind(...values:unknown[]){return new Statement(this.query,values)}
 async all<T=Row>(){const rows=await sql().unsafe(this.query,this.values as never[]);return {results:Array.from(rows) as T[],meta:{changes:rows.count}}}
 async first<T=Row>(){return (await this.all<T>()).results[0]??null}
 async run(){return this.all()}
}
export function database(){return {
 prepare(query:string){let i=0;return new Statement(query.replace(/\?/g,()=>`$${++i}`))},
 async batch(statements:Statement[]){return sql().begin(async tx=>{const results=[];for(const s of statements){const rows=await tx.unsafe(s.query,s.values as never[]);results.push({results:Array.from(rows),meta:{changes:rows.count}})}return results})}
}}
