import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import './style.css'

const LS_KEY = 'IP_RJP_V3_DATA'
const todayISO = () => new Date().toISOString().slice(0, 10)
const load = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || { trips: [], duties: [], vehicles: ['Viatura serviço', 'Viatura particular'], places: ['Leiria', 'Caldas da Rainha', 'Torres Vedras', 'Marinha Grande'] } } catch { return { trips: [], duties: [], vehicles: [], places: [] } }
}
const save = (data) => localStorage.setItem(LS_KEY, JSON.stringify(data))

function App(){
  const [data, setData] = useState(load())
  const [month, setMonth] = useState(todayISO().slice(0,7))
  const [tab, setTab] = useState('cal')
  const update = (next) => { setData(next); save(next) }
  const trips = data.trips.filter(x => x.date?.startsWith(month))
  const duties = data.duties.filter(x => x.date?.startsWith(month))
  const stats = { trips: trips.length, bt: duties.filter(d=>d.type==='BT').length, cc: duties.filter(d=>d.type==='CC').length }
  return <div className="app">
    <header><img src="/icon-512.png"/><div><h1>IP_RJP</h1><p>Deslocações e prevenções</p></div></header>
    <section className="toolbar"><input type="month" value={month} onChange={e=>setMonth(e.target.value)} /><button onClick={()=>setTab('trip')}>+ Deslocação</button><button onClick={()=>setTab('duty')}>+ Prevenção</button></section>
    <nav><button className={tab==='cal'?'on':''} onClick={()=>setTab('cal')}>Calendário</button><button className={tab==='agenda'?'on':''} onClick={()=>setTab('agenda')}>Agenda</button><button className={tab==='export'?'on':''} onClick={()=>setTab('export')}>Exportar</button><button className={tab==='settings'?'on':''} onClick={()=>setTab('settings')}>Definições</button></nav>
    <main>
      {tab==='cal' && <Calendar month={month} trips={trips} duties={duties} stats={stats}/>} 
      {tab==='agenda' && <Agenda trips={trips} duties={duties} update={update} data={data}/>} 
      {tab==='trip' && <TripForm data={data} update={update} onDone={()=>setTab('agenda')}/>} 
      {tab==='duty' && <DutyForm data={data} update={update} onDone={()=>setTab('agenda')}/>} 
      {tab==='export' && <Export month={month} trips={trips} duties={duties} stats={stats}/>} 
      {tab==='settings' && <Settings data={data} update={update}/>} 
    </main>
  </div>
}
function Calendar({month,trips,duties,stats}){
  const [y,m]=month.split('-').map(Number); const days=new Date(y,m,0).getDate();
  return <><div className="cards"><Card t="Deslocações" v={stats.trips}/><Card t="Prevenções BT" v={stats.bt}/><Card t="Prevenções CC" v={stats.cc}/></div><div className="grid">{Array.from({length:days},(_,i)=>{const d=`${month}-${String(i+1).padStart(2,'0')}`; const hasT=trips.some(x=>x.date===d); const duty=duties.find(x=>x.date===d); return <div className="day" key={d}><b>{i+1}</b><span>{hasT?'🚗':''}</span><em className={duty?.type==='BT'?'bt':duty?.type==='CC'?'cc':''}>{duty?.type||''}</em></div>})}</div></>
}
function Card({t,v}){return <div className="card"><small>{t}</small><strong>{v}</strong></div>}
function TripForm({data,update,onDone}){const [f,setF]=useState({date:todayISO(),origin:'',dest:'',plate:'',out:'08:00',in:'17:30',obs:''}); const set=(k,v)=>setF({...f,[k]:v}); return <form onSubmit={e=>{e.preventDefault();update({...data,trips:[...data.trips,{...f,id:Date.now()}]});onDone()}}><h2>Nova deslocação</h2><Input label="Data" type="date" v={f.date} s={v=>set('date',v)}/><Input label="Origem" v={f.origin} s={v=>set('origin',v)} list="places"/><Input label="Destino" v={f.dest} s={v=>set('dest',v)} list="places"/><Input label="Matrícula" v={f.plate} s={v=>set('plate',v)} list="vehicles"/><Input label="Hora saída" type="time" v={f.out} s={v=>set('out',v)}/><Input label="Hora chegada" type="time" v={f.in} s={v=>set('in',v)}/><Input label="Observações" v={f.obs} s={v=>set('obs',v)}/><Datalists data={data}/><button className="primary">Guardar deslocação</button></form>}
function DutyForm({data,update,onDone}){const [f,setF]=useState({date:todayISO(),type:'BT',obs:''}); return <form onSubmit={e=>{e.preventDefault();update({...data,duties:[...data.duties,{...f,id:Date.now()}]});onDone()}}><h2>Nova prevenção</h2><Input label="Data" type="date" v={f.date} s={v=>setF({...f,date:v})}/><label>Tipo<select value={f.type} onChange={e=>setF({...f,type:e.target.value})}><option>BT</option><option>CC</option></select></label><Input label="Observações" v={f.obs} s={v=>setF({...f,obs:v})}/><button className="primary">Guardar prevenção</button></form>}
function Input({label,type='text',v,s,list}){return <label>{label}<input type={type} value={v} list={list} onChange={e=>s(e.target.value)} /></label>}
function Datalists({data}){return <><datalist id="vehicles">{data.vehicles.map(x=><option key={x} value={x}/>)}</datalist><datalist id="places">{data.places.map(x=><option key={x} value={x}/>)}</datalist></>}
function Agenda({trips,duties,data,update}){const items=[...trips.map(x=>({...x,kind:'Deslocação'})),...duties.map(x=>({...x,kind:'Prevenção'}))].sort((a,b)=>a.date.localeCompare(b.date));return <div><h2>Agenda mensal</h2>{items.length===0?<p className="empty">Sem registos neste mês.</p>:items.map(it=><article className="item" key={it.kind+it.id}><b>{it.date} — {it.kind}</b>{it.kind==='Deslocação'?<p>🚗 {it.origin} → {it.dest}<br/>Matrícula: {it.plate || '-'} | {it.out}–{it.in}<br/>{it.obs}</p>:<p className={it.type==='BT'?'btTxt':'ccTxt'}>Prevenção {it.type}<br/>{it.obs}</p>}<button onClick={()=>{ if(it.kind==='Deslocação') update({...data,trips:data.trips.filter(x=>x.id!==it.id)}); else update({...data,duties:data.duties.filter(x=>x.id!==it.id)});}}>Apagar</button></article>)}</div>}
function Export({month,trips,duties,stats}){const rows=[...trips.map(t=>({Data:t.date,Tipo:'Deslocação',Origem:t.origin,Destino:t.dest,Matricula:t.plate,Saida:t.out,Chegada:t.in,Prevencao:'',Observacoes:t.obs})),...duties.map(d=>({Data:d.date,Tipo:'Prevenção',Origem:'',Destino:'',Matricula:'',Saida:'',Chegada:'',Prevencao:d.type,Observacoes:d.obs}))].sort((a,b)=>a.Data.localeCompare(b.Data)); const csv=()=>{const header=Object.keys(rows[0]||{Data:'',Tipo:'',Origem:'',Destino:'',Matricula:'',Saida:'',Chegada:'',Prevencao:'',Observacoes:''}); const txt=[header.join(';'),...rows.map(r=>header.map(h=>`"${String(r[h]??'').replaceAll('"','""')}"`).join(';'))].join('\n'); dl(new Blob([txt],{type:'text/csv;charset=utf-8'}),`IP_RJP_${month}.csv`)}; const pdf=()=>{const doc=new jsPDF(); doc.text(`IP_RJP - Relatório mensal ${month}`,10,12); doc.text(`Deslocações: ${stats.trips} | BT: ${stats.bt} | CC: ${stats.cc}`,10,22); let y=34; rows.forEach(r=>{doc.text(`${r.Data} ${r.Tipo} ${r.Origem} ${r.Destino} ${r.Matricula} ${r.Saida}-${r.Chegada} ${r.Prevencao}`,10,y); y+=8; if(y>280){doc.addPage(); y=15}}); doc.save(`IP_RJP_${month}.pdf`)}; const xlsx=()=>{const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'Registos'); XLSX.writeFile(wb,`IP_RJP_${month}.xlsx`)}; return <div><h2>Exportação</h2><p>Gera ficheiros mensais para apoio aos abonos.</p><button onClick={pdf}>Gerar PDF</button><button onClick={csv}>Gerar CSV</button><button onClick={xlsx}>Gerar Excel</button></div>}
function dl(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();URL.revokeObjectURL(a.href)}
function Settings({data,update}){const [vehicle,setVehicle]=useState(''); const [place,setPlace]=useState(''); return <div><h2>Definições</h2><section className="panel"><h3>Viaturas</h3>{data.vehicles.map(x=><span className="tag" key={x}>{x}</span>)}<input placeholder="Nova matrícula/viatura" value={vehicle} onChange={e=>setVehicle(e.target.value)}/><button onClick={()=>{if(vehicle.trim()){update({...data,vehicles:[...data.vehicles,vehicle.trim()]});setVehicle('')}}}>Adicionar</button></section><section className="panel"><h3>Destinos frequentes</h3>{data.places.map(x=><span className="tag" key={x}>{x}</span>)}<input placeholder="Novo destino" value={place} onChange={e=>setPlace(e.target.value)}/><button onClick={()=>{if(place.trim()){update({...data,places:[...data.places,place.trim()]});setPlace('')}}}>Adicionar</button></section></div>}

createRoot(document.getElementById('root')).render(<App />)
