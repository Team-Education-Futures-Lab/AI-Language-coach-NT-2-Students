import postgres from 'postgres';
import {readFile} from 'node:fs/promises';
if(!process.env.DATABASE_URL)throw Error('DATABASE_URL ontbreekt. Gebruik de Supabase transaction pooler-verbindingsstring.');
const sql=postgres(process.env.DATABASE_URL,{password:process.env.DATABASE_PASSWORD,ssl:'require',prepare:false,max:1});
try{await sql.begin(async tx=>{for(const file of ['202610070001_platform.sql','202610130001_adaptive_learning.sql'])await tx.unsafe(await readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'))});console.log('Supabase-schema gereed.');}finally{await sql.end();}
