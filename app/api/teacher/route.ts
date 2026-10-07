import {database,fail,requireTeacher} from '@/lib/server';

async function dashboard(teacherId:string){
  const db=database();
  const classes=await db.prepare('SELECT id,name,description,created_at,updated_at FROM classrooms WHERE teacher_id=? ORDER BY name').bind(teacherId).all();
  const members=await db.prepare(`SELECT cm.classroom_id,cm.student_id,cm.joined_at,u.email,u.display_name
    FROM classroom_members cm JOIN classrooms c ON c.id=cm.classroom_id JOIN users u ON u.id=cm.student_id
    WHERE c.teacher_id=? ORDER BY u.display_name`).bind(teacherId).all();
  const students=await db.prepare(`SELECT u.id,u.email,u.display_name,u.role,COUNT(cm.classroom_id) AS class_count
    FROM users u LEFT JOIN classroom_members cm ON cm.student_id=u.id
    WHERE u.role='student' GROUP BY u.id,u.email,u.display_name,u.role ORDER BY u.display_name`).all();
  return {classes:classes.results,members:members.results,students:students.results};
}

export async function GET(r:Request){
  const auth=await requireTeacher(r);if(auth.error)return auth.error;
  try{return Response.json(await dashboard(auth.user.id));}catch{return fail('Het studentenbeheer kon niet worden geladen.',503)}
}

export async function POST(r:Request){
  const auth=await requireTeacher(r);if(auth.error)return auth.error;
  let body:any;try{body=await r.json()}catch{return fail('Ongeldige invoer.')}
  const db=database(),now=new Date().toISOString();
  try{
    if(body.action==='class_create'){
      const name=String(body.name||'').trim().slice(0,120);if(!name)return fail('Geef de klas een naam.');
      const id=crypto.randomUUID();await db.prepare('INSERT INTO classrooms (id,teacher_id,name,description,created_at,updated_at) VALUES (?,?,?,?,?,?)').bind(id,auth.user.id,name,String(body.description||'').trim().slice(0,500),now,now).run();
    }else if(body.action==='class_update'){
      const name=String(body.name||'').trim().slice(0,120);if(!name||typeof body.id!=='string')return fail('Ongeldige klas.');
      await db.prepare('UPDATE classrooms SET name=?,description=?,updated_at=? WHERE id=? AND teacher_id=?').bind(name,String(body.description||'').trim().slice(0,500),now,body.id,auth.user.id).run();
    }else if(body.action==='class_delete'){
      if(typeof body.id!=='string')return fail('Ongeldige klas.');
      await db.prepare('DELETE FROM classroom_members WHERE classroom_id IN (SELECT id FROM classrooms WHERE id=? AND teacher_id=?)').bind(body.id,auth.user.id).run();
      await db.prepare('DELETE FROM classrooms WHERE id=? AND teacher_id=?').bind(body.id,auth.user.id).run();
    }else if(body.action==='student_add'){
      if(typeof body.classroomId!=='string'||typeof body.studentEmail!=='string')return fail('Vul een leerling-e-mailadres in.');
      const classroom=await db.prepare('SELECT id FROM classrooms WHERE id=? AND teacher_id=?').bind(body.classroomId,auth.user.id).first();if(!classroom)return fail('Klas niet gevonden.',404);
      const email=body.studentEmail.trim().toLowerCase();if(!email.includes('@'))return fail('Gebruik een geldig e-mailadres.');
      const student=await db.prepare('SELECT id FROM users WHERE email=? AND role=?').bind(email,'student').first<{id:string}>();
      if(!student)return fail('Deze student heeft nog geen account. Laat de student eerst inloggen.');
      await db.prepare('INSERT INTO classroom_members (classroom_id,student_id,joined_at) VALUES (?,?,?) ON CONFLICT DO NOTHING').bind(body.classroomId,student.id,now).run();
    }else if(body.action==='student_remove'){
      if(typeof body.classroomId!=='string'||typeof body.studentId!=='string')return fail('Ongeldige studentkoppeling.');
      await db.prepare('DELETE FROM classroom_members WHERE classroom_id=? AND student_id=? AND classroom_id IN (SELECT id FROM classrooms WHERE id=? AND teacher_id=?)').bind(body.classroomId,body.studentId,body.classroomId,auth.user.id).run();
    }else return fail('Onbekende beheeractie.');
    return Response.json(await dashboard(auth.user.id));
  }catch{return fail('De beheeractie kon niet worden uitgevoerd.',503)}
}
