import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import mysql from 'mysql2/promise';

const url=process.env.MYSQL_URL;
if(!url){
  console.error('MYSQL_URL ontbreekt. Voorbeeld: mysql://user:password@127.0.0.1:3306/ai_taalcoach_project');
  process.exit(1);
}
const sql=await readFile(path.join(path.dirname(fileURLToPath(import.meta.url)),'../db/mysql/0002_full_project.sql'),'utf8');
const connection=await mysql.createConnection(url);
try{
  for(const statement of sql.split(';').map(v=>v.trim()).filter(Boolean))await connection.query(statement);
  console.log('Volledig MySQL-schema voor AI Taalcoach is aangemaakt.');
}finally{await connection.end();}
