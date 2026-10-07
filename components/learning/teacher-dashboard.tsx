'use client';
import {useCallback,useEffect,useMemo,useState} from 'react';
import {GraduationCap,Minus,Plus,Save,Trash2,Users} from 'lucide-react';

type Classroom={id:string;name:string;description:string};
type Student={id:string;email:string;display_name:string;class_count:number};
type Member={classroom_id:string;student_id:string;email:string;display_name:string};
type Data={classes:Classroom[];students:Student[];members:Member[]};

async function call(body?:unknown){
  const r=await fetch('/api/teacher',body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:undefined);
  const data=await r.json() as any;if(!r.ok)throw new Error(data.error||'Er ging iets mis.');return data as Data;
}

export function TeacherDashboard(){
  const [data,setData]=useState<Data>({classes:[],students:[],members:[]});
  const [selected,setSelected]=useState('');
  const [name,setName]=useState('');
  const [description,setDescription]=useState('');
  const [email,setEmail]=useState('');
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
    if(!name.trim())return;
    setBusy(true);setError('');try{const next=await call({action:'class_create',name,description});setData(next);setSelected(next.classes.at(-1)?.id||'');reset();setNotice('Klas aangemaakt.')}catch(e){setError((e as Error).message)}finally{setBusy(false)}
  }
  async function updateClass(){
    if(!active||!name.trim())return;
    setBusy(true);setError('');try{const next=await call({action:'class_update',id:active.id,name,description});setData(next);setNotice('Klas opgeslagen.')}catch(e){setError((e as Error).message)}finally{setBusy(false)}
  }
  async function deleteClass(){
    if(!active||!window.confirm(`Klas "${active.name}" verwijderen?`))return;
    setBusy(true);setError('');try{const next=await call({action:'class_delete',id:active.id});setData(next);setSelected(next.classes[0]?.id||'');reset();setNotice('Klas verwijderd.')}catch(e){setError((e as Error).message)}finally{setBusy(false)}
  }
  async function addStudent(){
    if(!active||!email.trim())return;
    setBusy(true);setError('');try{setData(await call({action:'student_add',classroomId:active.id,studentEmail:email}));setEmail('');setNotice('Student aan de klas toegevoegd.')}catch(e){setError((e as Error).message)}finally{setBusy(false)}
  }
  async function removeStudent(studentId:string){
    if(!active)return;
    setBusy(true);setError('');try{setData(await call({action:'student_remove',classroomId:active.id,studentId}));setNotice('Student uit de klas verwijderd.')}catch(e){setError((e as Error).message)}finally{setBusy(false)}
  }
  useEffect(()=>{if(active){setName(active.name);setDescription(active.description)}},[active?.id]);
  return <section className="teacher-dashboard">
    <div className="teacher-intro"><span className="icon-tile"><GraduationCap size={23}/></span><div><h3>Studentenbeheer</h3><p>Beheer je klassen en houd bij welke studenten deelnemen.</p></div><span className="tag">Docent admin</span></div>
    {error&&<div className="error-banner" role="alert">{error}<button onClick={()=>void load()}>Opnieuw proberen</button></div>}
    {notice&&<div className="notice" role="status">{notice}</div>}
    <div className="teacher-dashboard-grid">
      <section className="panel class-list"><div className="section-heading"><div><h2>Mijn klassen</h2><p>{data.classes.length} {data.classes.length===1?'klas':'klassen'}</p></div><Users size={21}/></div>
        {data.classes.map(c=><button key={c.id} className={'class-list-item '+(active?.id===c.id?'active':'')} onClick={()=>setSelected(c.id)}><span><b>{c.name}</b><small>{data.members.filter(m=>m.classroom_id===c.id).length} studenten</small></span><span>›</span></button>)}
        {!data.classes.length&&<p className="muted">Maak je eerste klas aan.</p>}
        <div className="class-form"><label className="field-label">Nieuwe klasnaam<input value={!active?name:''} onChange={e=>{setName(e.target.value);if(active)setSelected('')}} placeholder="Bijvoorbeeld: NT2 B1 ochtend"/></label><label className="field-label">Beschrijving<textarea rows={3} value={!active?description:''} onChange={e=>setDescription(e.target.value)} placeholder="Optioneel"/></label><button className="primary-button" disabled={busy||!name.trim()||!!active} onClick={saveClass}><Plus size={17}/>Klas toevoegen</button></div>
      </section>
      <section className="panel class-detail">{active?<><div className="section-heading"><div><span className="eyebrow">GESELECTEERDE KLAS</span><h2>{active.name}</h2><p>{members.length} studenten in deze klas</p></div><button className="icon-action" aria-label="Klas verwijderen" onClick={deleteClass}><Trash2 size={18}/></button></div>
        <div className="class-form inline"><label className="field-label">Naam<input value={name} onChange={e=>setName(e.target.value)}/></label><label className="field-label">Beschrijving<textarea rows={2} value={description} onChange={e=>setDescription(e.target.value)}/></label><button className="outline-button" disabled={busy||!name.trim()} onClick={updateClass}><Save size={16}/>Wijzigingen opslaan</button></div>
        <div className="section-heading student-heading"><div><h3>Studenten</h3><p>Voeg studenten toe die al een account hebben.</p></div></div>
        <div className="student-add"><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="student@voorbeeld.nl" aria-label="E-mailadres student"/><button className="primary-button" disabled={busy||!email.trim()} onClick={addStudent}><Plus size={17}/>Toevoegen</button></div>
        <div className="student-list">{members.map(m=><div className="student-row" key={m.student_id}><span className="avatar"><Users size={16}/></span><span><b>{m.display_name}</b><small>{m.email}</small></span><button className="icon-action" aria-label={`${m.display_name} verwijderen`} onClick={()=>void removeStudent(m.student_id)}><Minus size={17}/></button></div>)}{!members.length&&<div className="empty-state"><Users size={30}/><p>Nog geen studenten in deze klas.</p></div>}</div>
      </>:<div className="empty-state"><GraduationCap size={42}/><h2>Maak je eerste klas</h2><p>Daarna kun je studenten toevoegen en beheren.</p></div>}</section>
    </div>
  </section>
}
