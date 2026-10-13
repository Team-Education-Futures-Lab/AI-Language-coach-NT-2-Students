import 'server-only';
import {database} from './database';
import {defaultProfile,type Profile} from './profile';
import {calculateProgress} from './progression';
export async function studentProfile(userId:string):Promise<Profile>{
 const db=database();const [row,override,activity]=await Promise.all([
 db.prepare('SELECT data FROM profiles WHERE user_id=?').bind(userId).first<{data:string}>(),
 db.prepare('SELECT override_level FROM student_levels WHERE user_id=?').bind(userId).first<{override_level:string|null}>(),
 // Only server-validated, uniquely completed exercises unlock levels. Repeating cannot farm XP.
 db.prepare("SELECT xp,date FROM activities WHERE user_id=? AND kind='exercise' ORDER BY date").bind(userId).all<{xp:number;date:string}>()]);
 const progress=calculateProgress(activity.results,override?.override_level);return {...defaultProfile,...(row?JSON.parse(row.data):{}),level:progress.level,adaptive:true,progress};
}
