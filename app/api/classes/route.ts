import {currentUser,database,fail} from '@/lib/server';
import {authenticatedUser} from '@/lib/auth';
export async function GET(r:Request){
 try{const user=await currentUser(r);if(!user)return fail('Log eerst in.',401);
 const db=database();
 const classes=await db.prepare('SELECT c.id,c.name,c.description,c.cohort,u.display_name AS teacher_name FROM classroom_members cm JOIN classrooms c ON c.id=cm.classroom_id JOIN users u ON u.id=c.teacher_id WHERE cm.student_id=? ORDER BY c.name').bind(user.id).all();
 const auth=await authenticatedUser();
 const invitations=!auth?.is_anonymous&&auth?.email_confirmed_at&&user.role==='student'?await db.prepare('SELECT i.id,c.name,c.description,c.cohort,u.display_name AS teacher_name,i.expires_at FROM classroom_invitations i JOIN classrooms c ON c.id=i.classroom_id JOIN users u ON u.id=c.teacher_id WHERE i.email=? AND i.expires_at>now() ORDER BY i.created_at DESC').bind(user.email).all():{results:[]};
 return Response.json({classes:classes.results,invitations:invitations.results});
 }catch{return fail('Je klassen konden niet worden geladen.',503)}
}
export async function POST(r:Request){
 try{const user=await currentUser(r),auth=await authenticatedUser();if(!user)return fail('Log eerst in.',401);
 if(auth?.is_anonymous||!auth?.email_confirmed_at||user.role!=='student')return fail('Gebruik een bevestigd studentenaccount.',403);
 const body=await r.json() as {action?:string;id?:string};if(!['accept','decline'].includes(body.action||'')||typeof body.id!=='string')return fail('Ongeldige uitnodiging.');
 const db=database();
 if(body.action==='accept'){
 // Consume and enroll atomically. Email and expiry are checked by the server.
 const result=await db.prepare(`WITH invitation AS (DELETE FROM classroom_invitations WHERE id=? AND email=? AND expires_at>now() RETURNING classroom_id)
 INSERT INTO classroom_members(classroom_id,student_id,joined_at) SELECT classroom_id,?,? FROM invitation ON CONFLICT DO NOTHING RETURNING classroom_id`).bind(body.id,user.email,user.id,new Date().toISOString()).all();
 if(!result.results.length)return fail('Deze uitnodiging is verlopen of al verwerkt.',404);
 }else await db.prepare('DELETE FROM classroom_invitations WHERE id=? AND email=?').bind(body.id,user.email).run();
 return Response.json({ok:true});
 }catch{return fail('De uitnodiging kon niet worden verwerkt.',503)}
}
