import {mkdirSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {projectRoot} from './sites-env.mjs';
// Uses the same placeholder ID as vite.config.ts. Never touches the hosted DB.
const runtime=path.join(projectRoot,'.sites-runtime');
mkdirSync(runtime,{recursive:true});
const config=path.join(runtime,'local-db.json');
writeFileSync(config,JSON.stringify({name:'taalcoach-local',compatibility_date:'2026-05-15',d1_databases:[{binding:'DB',database_name:'site-creator-d1',database_id:'00000000-0000-4000-8000-000000000000',migrations_dir:path.join(projectRoot,'drizzle')}]}));
const cli=fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js',import.meta.url));
const result=spawnSync(process.execPath,[cli,'d1','migrations','apply','DB','--local','--config',config,'--persist-to',path.join(projectRoot,'.wrangler/state')],{cwd:projectRoot,stdio:'inherit'});
if(result.error)throw result.error;
process.exit(result.status??1);
