'use client';
import {B} from '@/components/learning/translation';
import {useCallback,useEffect,useMemo,useState} from 'react';
import {GraduationCap,Minus,Plus,Save,Trash2,Users} from 'lucide-react';

type Classroom={id:string;name:string;description:string;cohort:string};
type Student={id:string;email:string;display_name:string;class_count:number};
type Member={profile?:{level:string;progress?:{teacherSet:boolean}};classroom_id:string;student_id:string;email:string;display_name:string};
type Data={invitations:{id:string;classroom_id:string;email:string;expires_at:string}[];classes:Classroom[];students:Student[];members:Member[]};

async function call(body?:unknown){
  const r=await fetch('/api/teacher',body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:undefined);
  const data=await r.json() as any;if(!r.ok)throw new Error(data.error||'Er ging iets mis.');return data as Data;
}

export function TeacherDashboard(){
  const [data,setData]=useState<Data>({invitations:[],classes:[],students:[],members:[]});
  const [selected,setSelected]=useState('');
  const [name,setName]=useState('');
  const [description,setDescription]=useState('');
  const [cohort,setCohort]=useState(''),[newCohort,setNewCohort]=useState('');
  const [email,setEmail]=useState('');
  const [newName,setNewName]=useState('');
  const [newDescription,setNewDescription]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const load=useCallback(async()=>{try{setData(await call());setError('')}catch(e){setError((e as Error).message)}},[]);
  useEffect(()=>{void load()},[load]);
  const active=data.classes.find(c=>c.id===selected)||data.classes[0];
  const members=useMemo(()=>data.members.filter(m=>m.classroom_id===active?.id),[data.members,active?.id]);
  useEffect(()=>{if(!selected&&data.classes[0])setSelected(data.classes[0].id)},[data.classes,selected]);
  function reset(){setName('');setDescription('');setNotice('')}
  async function saveClass(){
    if(!newName.trim())return;
    setBusy(true);setError('');try{const next=await call({action:'class_create',name:newName,description:newDescription,cohort:newCohort});const created=next.classes.find(c=>!data.classes.some(previous=>previous.id===c.id));setData(next);setSelected(created?.id||'');setNewName('');setNewDescription('');setNewCohort('');setNotice('Klas aangemaakt.')}catch(e){setError((e as Error).message)}finally{setBusy(false)}
  }
  async function updateClass(){
    if(!active||!name.trim())return;
    setBusy(true);setError('');try{const next=await call({action:'class_update',id:active.id,name,description,cohort});setData(next);setNotice('Klas opgeslagen.')}catch(e){setError((e as Error).message)}finally{setBusy(false)}
  }
  async function deleteClass(){
    if(!active||!window.confirm(`Klas "${active.name}" verwijderen?`))return;
    setBusy(true);setError('');try{const next=await call({action:'class_delete',id:active.id});setData(next);setSelected(next.classes[0]?.id||'');reset();setNotice('Klas verwijderd.')}catch(e){setError((e as Error).message)}finally{setBusy(false)}
  }
  async function addStudent(){
    if(!active||!email.trim())return;
    setBusy(true);setError('');try{setData(await call({action:'student_add',classroomId:active.id,studentEmail:email}));setEmail('');setNotice('Uitnodiging klaargezet. De student ziet deze na inloggen met dit e-mailadres en bevestigt zelf de deelname. Er is geen aparte e-mail verstuurd.')}catch(e){setError((e as Error).message)}finally{setBusy(false)}
  }
  async function removeStudent(studentId:string){
    if(!active)return;
    setBusy(true);setError('');try{setData(await call({action:'student_remove',classroomId:active.id,studentId}));setNotice('Student uit de klas verwijderd.')}catch(e){setError((e as Error).message)}finally{setBusy(false)}
  }
  useEffect(()=>{if(active){setName(active.name);setDescription(active.description);setCohort(active.cohort||'')}},[active?.id]);
  return <section className="teacher-dashboard">
    <div className="teacher-intro"><span className="icon-tile"><GraduationCap size={23}/></span><div><h3><B>Studentenbeheer</B></h3><p><B>Beheer je klassen en houd bij welke studenten deelnemen.</B></p></div><span className="tag"><B>Docent admin</B></span></div>
    {error&&<div className="error-banner" role="alert">{error}<button onClick={()=>void load()}><B>Opnieuw proberen</B></button></div>}
    {notice&&<div className="notice" role="status">{notice}</div>}
    <div className="teacher-dashboard-grid">
      <section className="panel class-list"><div className="section-heading"><div><h2><B>Mijn klassen</B></h2><p>{data.classes.length} {data.classes.length===1?'klas':'klassen'}</p></div><Users size={21}/></div>
        {data.classes.map(c=><button key={c.id} className={'class-list-item '+(active?.id===c.id?'active':'')} onClick={()=>setSelected(c.id)}><span><b>{c.name}</b><small>{c.cohort?c.cohort+' · ':''}{data.members.filter(m=>m.classroom_id===c.id).length}<B>studenten</B></small></span><span>›</span></button>)}
        {!data.classes.length&&<p className="muted"><B>Maak je eerste klas aan.</B></p>}
        <div className="class-form"><label className="field-label"><B>Nieuwe klasnaam</B><input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Bijvoorbeeld: NT2 B1 ochtend"/></label><label className="field-label"><B>Cohort</B><input maxLength={100} value={newCohort} onChange={e=>setNewCohort(e.target.value)} placeholder="Bijvoorbeeld: 2026–2027"/></label><label className="field-label"><B>Beschrijving</B><textarea rows={3} value={newDescription} onChange={e=>setNewDescription(e.target.value)} placeholder="Optioneel"/></label><button className="primary-button" disabled={busy||!newName.trim()} onClick={saveClass}><Plus size={17}/><B>Klas toevoegen</B></button></div>
      </section>
      <section className="panel class-detail">{active?<><div className="section-heading"><div><span className="eyebrow"><B>GESELECTEERDE KLAS</B></span><h2>{active.name}</h2><p>{members.length}<B>studenten in deze klas</B></p></div><button className="icon-action" aria-label="Klas verwijderen" onClick={deleteClass}><Trash2 size={18}/></button></div>
        <div className="class-form inline"><label className="field-label"><B>Naam</B><input value={name} onChange={e=>setName(e.target.value)}/></label><label className="field-label"><B>Cohort</B><input maxLength={100} value={cohort} onChange={e=>setCohort(e.target.value)} placeholder="Bijvoorbeeld: 2026–2027"/></label><label className="field-label"><B>Beschrijving</B><textarea rows={2} value={description} onChange={e=>setDescription(e.target.value)}/></label><button className="outline-button" disabled={busy||!name.trim()} onClick={updateClass}><Save size={16}/><B>Wijzigingen opslaan</B></button></div>
        <div className="section-heading student-heading"><div><h3><B>Studenten</B></h3><p><B>Nodig een student uit op het e-mailadres van diens account. Ook mogelijk vóór registratie; de uitnodiging verschijnt na inloggen en blijft 30 dagen geldig.</B></p></div></div>
        <div className="student-add"><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="student@voorbeeld.nl" aria-label="E-mailadres student"/><button className="primary-button" disabled={busy||!email.trim()} onClick={addStudent}><Plus size={17}/><B>Uitnodigen</B></button></div>
        <div className="class-pending">{data.invitations.filter(i=>i.classroom_id===active.id).map(i=><div className="student-row" key={i.id}><span><b>{i.email}</b><small><B>Wacht op bevestiging · geldig tot</B> {new Date(i.expires_at).toLocaleDateString('nl-NL')}</small></span><button type="button" className="outline-button" disabled={busy} onClick={async()=>{setBusy(true);setError('');try{setData(await call({action:'invite_remove',id:i.id}));setNotice('Uitnodiging ingetrokken.')}catch(e){setError((e as Error).message)}finally{setBusy(false)}}}><B>Intrekken</B></button></div>)}</div><div className="student-list">{members.map(m=><div className="student-row" key={m.student_id}><span className="avatar"><Users size={16}/></span><span><b>{m.display_name}</b><small>{m.email}</small><label className="field-label"><B>Oefenniveau</B><select aria-label={`Oefenniveau van ${m.email}`} disabled={busy} value={m.profile?.progress?.teacherSet?m.profile.level:'auto'} onChange={async e=>{setBusy(true);setError('');try{setData(await call({action:'level_update',studentId:m.student_id,level:e.target.value==='auto'?null:e.target.value}));setNotice('Oefenniveau bijgewerkt.')}catch(err){setError((err as Error).message)}finally{setBusy(false)}}}><option value="auto">Automatisch ({m.profile?.level||'A1'})</option>{['A1','A2','B1','B2','C1','C2'].map(l=><option key={l}>{l}</option>)}</select></label></span><button className="icon-action" aria-label={`${m.display_name} verwijderen`} onClick={()=>void removeStudent(m.student_id)}><Minus size={17}/></button></div>)}{!members.length&&<div className="empty-state"><Users size={30}/><p><B>Nog geen studenten in deze klas.</B></p></div>}</div>
      </>:<div className="empty-state"><GraduationCap size={42}/><h2><B>Maak je eerste klas</B></h2><p><B>Daarna kun je studenten toevoegen en beheren.</B></p></div>}</section>
    </div>
  </section>
}
