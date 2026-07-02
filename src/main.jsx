import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import './style.css'

const LS_KEY = 'IP_RJP_PRO_1_DATA'
const defaultData = {
  trips: [],
  duties: [],
  vehicles: ['Viatura serviço', 'Viatura particular'],
  places: ['Leiria', 'Caldas da Rainha', 'Torres Vedras', 'Marinha Grande', 'Bombarral'],
  profiles: [
    { name: 'Dia normal', out: '08:00', in: '17:30' },
    { name: 'Manhã', out: '08:00', in: '13:00' },
    { name: 'Tarde', out: '14:00', in: '18:00' },
    { name: 'Prevenção', out: '00:00', in: '23:59' }
  ],
  profile: { name: 'Rui Jorge Pedro', unit: '', role: '', employeeNo: '' },
  outlook: { tenantId: '', clientId: '', enabled: false }
}
const todayISO = () => new Date().toISOString().slice(0, 10)
const uid = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`
const load = () => {
  try { return { ...defaultData, ...(JSON.parse(localStorage.getItem(LS_KEY)) || {}) } }
  catch { return defaultData }
}
const persist = data => localStorage.setItem(LS_KEY, JSON.stringify(data))
const monthName = month => new Date(`${month}-01T00:00:00`).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
const minutesBetween = (a, b) => {
  if (!a || !b) return 0
  const [ah, am] = a.split(':').map(Number), [bh, bm] = b.split(':').map(Number)
  let start = ah * 60 + am, end = bh * 60 + bm
  if (end < start) end += 24 * 60
  return Math.max(0, end - start)
}
const fmtDuration = mins => `${Math.floor(mins / 60)}h${String(mins % 60).padStart(2, '0')}`
const monthRows = (data, month) => {
  const trips = data.trips.filter(x => x.date?.startsWith(month)).sort(sortItems)
  const duties = data.duties.filter(x => x.date?.startsWith(month)).sort(sortItems)
  return { trips, duties }
}
const sortItems = (a,b) => a.date.localeCompare(b.date) || (a.out || '').localeCompare(b.out || '')
const statsFor = (trips, duties) => ({
  trips: trips.length,
  bt: duties.filter(d => d.type === 'BT').length,
  cc: duties.filter(d => d.type === 'CC').length,
  minutes: trips.reduce((s, t) => s + minutesBetween(t.out, t.in), 0),
  days: new Set([...trips.map(t => t.date), ...duties.map(d => d.date)]).size
})

function App(){
  const [data, setData] = useState(load())
  const [month, setMonth] = useState(todayISO().slice(0,7))
  const [tab, setTab] = useState('dash')
  const [editing, setEditing] = useState(null)
  const update = next => { setData(next); persist(next) }
  const { trips, duties } = monthRows(data, month)
  const stats = useMemo(() => statsFor(trips, duties), [trips, duties])
  const openEdit = (kind, item) => { setEditing({kind,item}); setTab(kind === 'trip' ? 'trip' : 'duty') }
  return <div className="app">
    <header><img src="/icon-512.png"/><div><h1>IP_RJP Professional</h1><p>Agenda profissional · deslocações · prevenções BT/CC</p></div></header>
    <section className="toolbar"><input type="month" value={month} onChange={e=>setMonth(e.target.value)} /><button onClick={()=>{setEditing(null);setTab('trip')}}>+ Deslocação</button><button onClick={()=>{setEditing(null);setTab('duty')}}>+ Prevenção</button></section>
    <nav>
      {[
        ['dash','Dashboard'],['cal','Calendário'],['week','Semana'],['day','Dia'],['agenda','Agenda'],['export','Exportar'],['year','Ano'],['settings','Definições']
      ].map(([id,label]) => <button key={id} className={tab===id?'on':''} onClick={()=>setTab(id)}>{label}</button>)}
    </nav>
    <main>
      {tab==='dash' && <Dashboard month={month} trips={trips} duties={duties} stats={stats} setTab={setTab}/>} 
      {tab==='cal' && <Calendar month={month} trips={trips} duties={duties} stats={stats}/>} 
      {tab==='week' && <WeekView month={month} trips={trips} duties={duties}/>} 
      {tab==='day' && <DayView trips={trips} duties={duties} onEdit={openEdit}/>} 
      {tab==='agenda' && <Agenda trips={trips} duties={duties} data={data} update={update} onEdit={openEdit}/>} 
      {tab==='trip' && <TripForm data={data} update={update} edit={editing?.kind==='trip'?editing.item:null} onDone={()=>{setEditing(null);setTab('agenda')}}/>} 
      {tab==='duty' && <DutyForm data={data} update={update} edit={editing?.kind==='duty'?editing.item:null} onDone={()=>{setEditing(null);setTab('agenda')}}/>} 
      {tab==='export' && <Export month={month} trips={trips} duties={duties} stats={stats} profile={data.profile}/>} 
      {tab==='year' && <YearStats data={data} year={month.slice(0,4)} setMonth={setMonth}/>} 
      {tab==='settings' && <Settings data={data} update={update}/>} 
    </main>
  </div>
}

function Dashboard({month,trips,duties,stats,setTab}){
  const upcoming = [...trips.map(x=>({...x,kind:'Deslocação'})), ...duties.map(x=>({...x,kind:'Prevenção'}))].filter(x=>x.date>=todayISO()).sort(sortItems).slice(0,5)
  return <><h2>Dashboard — {monthName(month)}</h2><div className="cards"><Card t="Deslocações" v={stats.trips}/><Card t="Prevenções BT" v={stats.bt}/><Card t="Prevenções CC" v={stats.cc}/><Card t="Horas em deslocação" v={fmtDuration(stats.minutes)}/></div><div className="quick"><button onClick={()=>setTab('trip')}>Registar deslocação</button><button onClick={()=>setTab('duty')}>Registar prevenção</button><button onClick={()=>setTab('export')}>Fecho do mês</button></div><section className="panel"><h3>Próximos registos</h3>{upcoming.length?upcoming.map(x=><Mini key={x.kind+x.id} item={x}/>):<p className="empty">Sem registos futuros neste mês.</p>}</section></>
}
function Mini({item}){return <p className="mini"><b>{item.date}</b> — {item.kind==='Deslocação'?`🚗 ${item.origin} → ${item.dest} (${item.out}-${item.in})`:`${item.type==='BT'?'🔵':'🟠'} Prevenção ${item.type}`}</p>}
function Card({t,v}){return <div className="card"><small>{t}</small><strong>{v}</strong></div>}

function Calendar({month,trips,duties,stats}){
  const [y,m]=month.split('-').map(Number); const first = new Date(y,m-1,1).getDay(); const pad=(first+6)%7; const days=new Date(y,m,0).getDate()
  return <><h2>{monthName(month)}</h2><div className="cards"><Card t="Deslocações" v={stats.trips}/><Card t="BT" v={stats.bt}/><Card t="CC" v={stats.cc}/><Card t="Dias com registo" v={stats.days}/></div><div className="legend"><span className="dot trip">🚗 Deslocação</span><span className="dot bt">BT</span><span className="dot cc">CC</span></div><div className="week"><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span></div><div className="grid">{Array.from({length:pad},(_,i)=><div key={'p'+i} className="day muted"/>)}{Array.from({length:days},(_,i)=>{const d=`${month}-${String(i+1).padStart(2,'0')}`; const ts=trips.filter(x=>x.date===d); const ds=duties.filter(x=>x.date===d); return <div className="day" key={d}><b>{i+1}</b>{ts.length ? <span className="tripTxt">🚗 {ts.length}</span> : null}{ds.map(x=><em key={x.id} className={x.type==='BT'?'bt':'cc'}>{x.type}</em>)}</div>})}</div></>
}
function WeekView({month,trips,duties}){
  const [selected,setSelected]=useState(todayISO())
  const start=new Date(selected+'T00:00:00'); const day=(start.getDay()+6)%7; start.setDate(start.getDate()-day)
  const days=Array.from({length:7},(_,i)=>{const d=new Date(start); d.setDate(start.getDate()+i); return d.toISOString().slice(0,10)})
  return <div><h2>Vista semanal</h2><input type="date" value={selected} onChange={e=>setSelected(e.target.value)}/><div className="weekCards">{days.map(d=><section key={d} className="panel"><h3>{new Date(d+'T00:00:00').toLocaleDateString('pt-PT',{weekday:'short',day:'2-digit',month:'2-digit'})}</h3>{trips.filter(x=>x.date===d).map(t=><Mini key={t.id} item={{...t,kind:'Deslocação'}}/>)}{duties.filter(x=>x.date===d).map(p=><Mini key={p.id} item={{...p,kind:'Prevenção'}}/>)}{!trips.some(x=>x.date===d)&&!duties.some(x=>x.date===d)&&<p className="empty">Sem registos.</p>}</section>)}</div></div>
}
function DayView({trips,duties,onEdit}){
  const [date,setDate]=useState(todayISO())
  const dayTrips=trips.filter(x=>x.date===date); const dayDuties=duties.filter(x=>x.date===date)
  return <div><h2>Vista diária</h2><input type="date" value={date} onChange={e=>setDate(e.target.value)}/>{[...dayDuties.map(x=>({...x,kind:'Prevenção'})),...dayTrips.map(x=>({...x,kind:'Deslocação'}))].sort(sortItems).map(it=><article className="item" key={it.kind+it.id}><Mini item={it}/><button onClick={()=>onEdit(it.kind==='Deslocação'?'trip':'duty',it)}>Editar</button></article>)}{dayTrips.length+dayDuties.length===0 && <p className="empty">Sem registos neste dia.</p>}</div>
}

function TripForm({data,update,onDone,edit}){
  const [f,setF]=useState(edit || {id:uid(),date:todayISO(),origin:'',dest:'',plate:'',out:'08:00',in:'17:30',obs:''})
  const set=(k,v)=>setF({...f,[k]:v}); const isEdit=!!edit
  const applyProfile=name=>{const p=data.profiles.find(x=>x.name===name); if(p) setF({...f,out:p.out,in:p.in})}
  return <form onSubmit={e=>{e.preventDefault(); const trips=isEdit?data.trips.map(x=>x.id===f.id?f:x):[...data.trips,f]; update({...data,trips});onDone()}}><h2>{isEdit?'Editar deslocação':'Nova deslocação'}</h2><label>Perfil horário<select onChange={e=>applyProfile(e.target.value)} defaultValue=""><option value="">Escolher perfil</option>{data.profiles.map(p=><option key={p.name}>{p.name}</option>)}</select></label><Input label="Data" type="date" v={f.date} s={v=>set('date',v)}/><Input label="Origem" v={f.origin} s={v=>set('origin',v)} list="places"/><Input label="Destino" v={f.dest} s={v=>set('dest',v)} list="places"/><Input label="Matrícula" v={f.plate} s={v=>set('plate',v)} list="vehicles"/><Input label="Hora saída" type="time" v={f.out} s={v=>set('out',v)}/><Input label="Hora chegada" type="time" v={f.in} s={v=>set('in',v)}/><Input label="Observações" v={f.obs} s={v=>set('obs',v)}/><Datalists data={data}/><button className="primary">{isEdit?'Guardar alterações':'Guardar deslocação'}</button></form>
}
function DutyForm({data,update,onDone,edit}){const [f,setF]=useState(edit || {id:uid(),date:todayISO(),type:'BT',obs:''}); const isEdit=!!edit; return <form onSubmit={e=>{e.preventDefault(); const duties=isEdit?data.duties.map(x=>x.id===f.id?f:x):[...data.duties,f]; update({...data,duties});onDone()}}><h2>{isEdit?'Editar prevenção':'Nova prevenção'}</h2><Input label="Data" type="date" v={f.date} s={v=>setF({...f,date:v})}/><label>Tipo<select value={f.type} onChange={e=>setF({...f,type:e.target.value})}><option>BT</option><option>CC</option></select></label><Input label="Observações" v={f.obs} s={v=>setF({...f,obs:v})}/><button className="primary">{isEdit?'Guardar alterações':'Guardar prevenção'}</button></form>}
function Input({label,type='text',v,s,list}){return <label>{label}<input type={type} value={v || ''} list={list} onChange={e=>s(e.target.value)} /></label>}
function Datalists({data}){return <><datalist id="vehicles">{data.vehicles.map(x=><option key={x} value={x}/>)}</datalist><datalist id="places">{data.places.map(x=><option key={x} value={x}/>)}</datalist></>}

function Agenda({trips,duties,data,update,onEdit}){
  const [filter,setFilter]=useState('Todos'); const [q,setQ]=useState('')
  let items=[...trips.map(x=>({...x,kind:'Deslocação'})),...duties.map(x=>({...x,kind:'Prevenção'}))].sort(sortItems)
  items=items.filter(it=> filter==='Todos' || it.kind===filter || it.type===filter).filter(it=>JSON.stringify(it).toLowerCase().includes(q.toLowerCase()))
  const duplicate=(it)=>{ if(it.kind==='Deslocação') update({...data,trips:[...data.trips,{...it,id:uid(),date:todayISO()}]}); else update({...data,duties:[...data.duties,{...it,id:uid(),date:todayISO()}]}) }
  return <div><h2>Agenda mensal</h2><div className="filters"><select value={filter} onChange={e=>setFilter(e.target.value)}><option>Todos</option><option>Deslocação</option><option>Prevenção</option><option>BT</option><option>CC</option></select><input placeholder="Pesquisar" value={q} onChange={e=>setQ(e.target.value)}/></div>{items.length===0?<p className="empty">Sem registos neste mês.</p>:items.map(it=><article className="item" key={it.kind+it.id}><b>{it.date} — {it.kind}</b>{it.kind==='Deslocação'?<p>🚗 {it.origin} → {it.dest}<br/>Matrícula: {it.plate || '-'} | {it.out}–{it.in} ({fmtDuration(minutesBetween(it.out,it.in))})<br/>{it.obs}</p>:<p className={it.type==='BT'?'btTxt':'ccTxt'}>Prevenção {it.type}<br/>{it.obs}</p>}<div className="actions"><button onClick={()=>onEdit(it.kind==='Deslocação'?'trip':'duty', it)}>Editar</button><button onClick={()=>duplicate(it)}>Duplicar hoje</button><button className="danger" onClick={()=>{ if(it.kind==='Deslocação') update({...data,trips:data.trips.filter(x=>x.id!==it.id)}); else update({...data,duties:data.duties.filter(x=>x.id!==it.id)});}}>Apagar</button></div></article>)}</div>
}
function rowsFor(trips,duties){return [...trips.map(t=>({Data:t.date,Tipo:'Deslocação',Origem:t.origin,Destino:t.dest,Matricula:t.plate,Saida:t.out,Chegada:t.in,Duracao:fmtDuration(minutesBetween(t.out,t.in)),Prevencao:'',Observacoes:t.obs})),...duties.map(d=>({Data:d.date,Tipo:'Prevenção',Origem:'',Destino:'',Matricula:'',Saida:'',Chegada:'',Duracao:'',Prevencao:d.type,Observacoes:d.obs}))].sort((a,b)=>a.Data.localeCompare(b.Data))}
function Export({month,trips,duties,stats,profile}){const rows=rowsFor(trips,duties); const csv=()=>{const header=Object.keys(rows[0]||{Data:'',Tipo:'',Origem:'',Destino:'',Matricula:'',Saida:'',Chegada:'',Duracao:'',Prevencao:'',Observacoes:''}); const txt='\ufeff'+[header.join(';'),...rows.map(r=>header.map(h=>`"${String(r[h]??'').replaceAll('"','""')}"`).join(';'))].join('\n'); dl(new Blob([txt],{type:'text/csv;charset=utf-8'}),`IP_RJP_${month}.csv`)}; const pdf=()=>{const doc=new jsPDF({orientation:'landscape'}); doc.setFontSize(16); doc.text(`IP_RJP - Relatório mensal ${monthName(month)}`,10,12); doc.setFontSize(10); doc.text(`Trabalhador: ${profile?.name||''}   Unidade: ${profile?.unit||''}   Nº: ${profile?.employeeNo||''}`,10,20); doc.text(`Deslocações: ${stats.trips} | BT: ${stats.bt} | CC: ${stats.cc} | Horas deslocação: ${fmtDuration(stats.minutes)}`,10,28); let y=40; doc.setFont('helvetica','bold'); ['Data','Tipo','Origem','Destino','Matrícula','Horário','Prev.','Observações'].forEach((h,i)=>doc.text(h,[10,34,66,112,160,194,230,252][i],y)); doc.setFont('helvetica','normal'); y+=7; rows.forEach(r=>{doc.text(String(r.Data),10,y); doc.text(String(r.Tipo).slice(0,14),34,y); doc.text(String(r.Origem).slice(0,22),66,y); doc.text(String(r.Destino).slice(0,22),112,y); doc.text(String(r.Matricula).slice(0,14),160,y); doc.text(`${r.Saida||''}-${r.Chegada||''}`,194,y); doc.text(String(r.Prevencao||''),230,y); doc.text(String(r.Observacoes||'').slice(0,28),252,y); y+=7; if(y>190){doc.addPage(); y=18}}); doc.save(`IP_RJP_${month}.pdf`)}; const xlsx=()=>{const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'Registos'); XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet([{Mes:month,Deslocacoes:stats.trips,BT:stats.bt,CC:stats.cc,HorasDeslocacao:fmtDuration(stats.minutes)}]),'Resumo'); XLSX.writeFile(wb,`IP_RJP_${month}.xlsx`)}; return <div><h2>Fecho do mês / Exportação</h2><p>Gera ficheiros mensais para apoio aos abonos.</p><div className="exportBtns"><button onClick={pdf}>Gerar PDF</button><button onClick={csv}>Gerar CSV</button><button onClick={xlsx}>Gerar Excel</button></div><Preview rows={rows}/></div>}
function Preview({rows}){return <div className="tableWrap"><table><thead><tr><th>Data</th><th>Tipo</th><th>Origem</th><th>Destino</th><th>Matrícula</th><th>Horário</th><th>Prev.</th></tr></thead><tbody>{rows.map((r,i)=><tr key={i}><td>{r.Data}</td><td>{r.Tipo}</td><td>{r.Origem}</td><td>{r.Destino}</td><td>{r.Matricula}</td><td>{r.Saida}-{r.Chegada}</td><td>{r.Prevencao}</td></tr>)}</tbody></table></div>}
function YearStats({data,year,setMonth}){const months=Array.from({length:12},(_,i)=>`${year}-${String(i+1).padStart(2,'0')}`); return <div><h2>Resumo anual {year}</h2><div className="yearGrid">{months.map(m=>{const {trips,duties}=monthRows(data,m); return <button className="monthCard" key={m} onClick={()=>setMonth(m)}><b>{new Date(`${m}-01`).toLocaleDateString('pt-PT',{month:'short'})}</b><span>🚗 {trips.length}</span><span>BT {duties.filter(x=>x.type==='BT').length}</span><span>CC {duties.filter(x=>x.type==='CC').length}</span><span>{fmtDuration(trips.reduce((s,t)=>s+minutesBetween(t.out,t.in),0))}</span></button>})}</div></div>}
function dl(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();URL.revokeObjectURL(a.href)}
function Settings({data,update}){const [vehicle,setVehicle]=useState(''); const [place,setPlace]=useState(''); const [sched,setSched]=useState({name:'',out:'08:00',in:'17:30'}); const [profile,setProfile]=useState(data.profile || defaultData.profile); const [outlook,setOutlook]=useState(data.outlook || defaultData.outlook); const backup=()=>dl(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),`IP_RJP_backup_${todayISO()}.json`); const restore=(file)=>{const r=new FileReader(); r.onload=()=>{try{const next={...defaultData,...JSON.parse(r.result)}; update(next); alert('Backup importado.')}catch{alert('Ficheiro inválido.')}}; if(file) r.readAsText(file)}; return <div><h2>Definições</h2><section className="panel"><h3>Perfil</h3><Input label="Nome" v={profile.name} s={v=>setProfile({...profile,name:v})}/><Input label="Unidade" v={profile.unit} s={v=>setProfile({...profile,unit:v})}/><Input label="Função" v={profile.role} s={v=>setProfile({...profile,role:v})}/><Input label="N.º colaborador/mecanográfico" v={profile.employeeNo} s={v=>setProfile({...profile,employeeNo:v})}/><button onClick={()=>update({...data,profile})}>Guardar perfil</button></section><section className="panel"><h3>Viaturas</h3>{data.vehicles.map(x=><span className="tag" key={x}>{x}<button onClick={()=>update({...data,vehicles:data.vehicles.filter(v=>v!==x)})}>×</button></span>)}<input placeholder="Nova matrícula/viatura" value={vehicle} onChange={e=>setVehicle(e.target.value)}/><button onClick={()=>{if(vehicle.trim()){update({...data,vehicles:[...new Set([...data.vehicles,vehicle.trim()])]});setVehicle('')}}}>Adicionar</button></section><section className="panel"><h3>Destinos frequentes</h3>{data.places.map(x=><span className="tag" key={x}>{x}<button onClick={()=>update({...data,places:data.places.filter(v=>v!==x)})}>×</button></span>)}<input placeholder="Novo destino" value={place} onChange={e=>setPlace(e.target.value)}/><button onClick={()=>{if(place.trim()){update({...data,places:[...new Set([...data.places,place.trim()])]});setPlace('')}}}>Adicionar</button></section><section className="panel"><h3>Perfis de horário</h3>{data.profiles.map(x=><span className="tag" key={x.name}>{x.name} {x.out}-{x.in}<button onClick={()=>update({...data,profiles:data.profiles.filter(v=>v.name!==x.name)})}>×</button></span>)}<div className="triple"><input placeholder="Nome" value={sched.name} onChange={e=>setSched({...sched,name:e.target.value})}/><input type="time" value={sched.out} onChange={e=>setSched({...sched,out:e.target.value})}/><input type="time" value={sched.in} onChange={e=>setSched({...sched,in:e.target.value})}/></div><button onClick={()=>{if(sched.name.trim()){update({...data,profiles:[...data.profiles,sched]});setSched({name:'',out:'08:00',in:'17:30'})}}}>Adicionar perfil</button></section><section className="panel"><h3>Outlook / Microsoft 365</h3><p className="hint">Preparado para a próxima fase: guarda aqui os dados do registo no Microsoft Entra.</p><Input label="Tenant ID" v={outlook.tenantId} s={v=>setOutlook({...outlook,tenantId:v})}/><Input label="Client ID" v={outlook.clientId} s={v=>setOutlook({...outlook,clientId:v})}/><label>Ativar sincronização futuramente<select value={outlook.enabled?'Sim':'Não'} onChange={e=>setOutlook({...outlook,enabled:e.target.value==='Sim'})}><option>Não</option><option>Sim</option></select></label><button onClick={()=>update({...data,outlook})}>Guardar Outlook</button></section><section className="panel"><h3>Backup</h3><button onClick={backup}>Exportar backup JSON</button><label>Importar backup<input type="file" accept="application/json" onChange={e=>restore(e.target.files?.[0])}/></label></section></div>}

createRoot(document.getElementById('root')).render(<App />)
