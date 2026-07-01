import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CalendarDays, Car, ShieldCheck, Download, Trash2, Plus, Copy, Printer } from 'lucide-react';
import './styles.css';

const STORAGE_KEY = 'IP_RJP_V1_REGISTOS';
const hojeISO = () => new Date().toISOString().slice(0, 10);
const pad = n => String(n).padStart(2, '0');
const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2)}`;

function loadRegistos() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function saveRegistos(registos) { localStorage.setItem(STORAGE_KEY, JSON.stringify(registos)); }
function monthKey(date) { return date.slice(0, 7); }
function daysInMonth(year, monthIndex) { return new Date(year, monthIndex + 1, 0).getDate(); }
function firstWeekdayMonday(year, monthIndex) { return (new Date(year, monthIndex, 1).getDay() + 6) % 7; }

const emptyForm = {
  data: hojeISO(),
  tipo: 'deslocacao',
  origem: '',
  destino: '',
  matricula: '',
  horaSaida: '',
  horaChegada: '',
  prevencaoTipo: 'BT/CC',
  observacoes: ''
};

function App() {
  const [registos, setRegistos] = useState(loadRegistos);
  const [active, setActive] = useState('calendario');
  const [currentMonth, setCurrentMonth] = useState(hojeISO().slice(0, 7));
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const registosMes = useMemo(() => registos.filter(r => monthKey(r.data) === currentMonth).sort((a,b)=>a.data.localeCompare(b.data) || (a.horaSaida||'').localeCompare(b.horaSaida||'')), [registos, currentMonth]);
  const resumo = useMemo(() => ({
    deslocacoes: registosMes.filter(r => r.tipo === 'deslocacao').length,
    prevencoes: registosMes.filter(r => r.tipo === 'prevencao').length,
    diasPrevencao: new Set(registosMes.filter(r => r.tipo === 'prevencao').map(r => r.data)).size,
    diasDeslocacao: new Set(registosMes.filter(r => r.tipo === 'deslocacao').map(r => r.data)).size
  }), [registosMes]);

  function persist(next) { setRegistos(next); saveRegistos(next); }
  function limparForm(tipo = form.tipo) { setEditingId(null); setForm({ ...emptyForm, tipo, data: form.data || hojeISO() }); }
  function guardar(e) {
    e.preventDefault();
    const item = { ...form, id: editingId || uid() };
    const next = editingId ? registos.map(r => r.id === editingId ? item : r) : [item, ...registos];
    persist(next);
    setCurrentMonth(monthKey(item.data));
    limparForm(item.tipo);
    setActive('agenda');
  }
  function editar(r) { setEditingId(r.id); setForm(r); setActive(r.tipo === 'deslocacao' ? 'deslocacoes' : 'prevencoes'); }
  function duplicar(r) { setEditingId(null); setForm({ ...r, id: undefined, data: hojeISO() }); setActive(r.tipo === 'deslocacao' ? 'deslocacoes' : 'prevencoes'); }
  function remover(id) { if (confirm('Apagar este registo?')) persist(registos.filter(r => r.id !== id)); }

  function exportCSV() {
    const headers = ['Data','Tipo','Origem','Destino','Matricula','Hora Saida','Hora Chegada','Tipo Prevencao','Observacoes'];
    const rows = registosMes.map(r => [r.data,r.tipo,r.origem||'',r.destino||'',r.matricula||'',r.horaSaida||'',r.horaChegada||'',r.prevencaoTipo||'',r.observacoes||'']);
    const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replaceAll('"','""')}"`).join(';')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `IP_RJP_${currentMonth}.csv`; a.click(); URL.revokeObjectURL(a.href);
  }
  function imprimirPDF() { window.print(); }

  const [year, month] = currentMonth.split('-').map(Number);
  const mIndex = month - 1;
  const days = daysInMonth(year, mIndex);
  const offset = firstWeekdayMonday(year, mIndex);
  const byDay = Object.groupBy ? Object.groupBy(registosMes, r => Number(r.data.slice(8,10))) : registosMes.reduce((a,r)=>{const d=Number(r.data.slice(8,10)); (a[d] ||= []).push(r); return a;},{});

  return <div className="app">
    <header className="topbar">
      <div className="brand"><img src="/logo.png"/><div><b>IP_RJP</b><span>Deslocações e Prevenções</span></div></div>
      <input type="month" value={currentMonth} onChange={e=>setCurrentMonth(e.target.value)} />
    </header>

    <main>
      <section className="cards resumo print-hide">
        <div><b>{resumo.diasDeslocacao}</b><span>Dias com deslocação</span></div>
        <div><b>{resumo.diasPrevencao}</b><span>Dias de prevenção</span></div>
        <div><b>{resumo.deslocacoes}</b><span>Registos de deslocação</span></div>
        <div><b>{resumo.prevencoes}</b><span>Registos de prevenção</span></div>
      </section>

      <nav className="tabs print-hide">
        <button className={active==='calendario'?'on':''} onClick={()=>setActive('calendario')}><CalendarDays size={18}/> Calendário</button>
        <button className={active==='deslocacoes'?'on':''} onClick={()=>{limparForm('deslocacao');setActive('deslocacoes')}}><Car size={18}/> Deslocação</button>
        <button className={active==='prevencoes'?'on':''} onClick={()=>{limparForm('prevencao');setActive('prevencoes')}}><ShieldCheck size={18}/> Prevenção</button>
        <button className={active==='agenda'?'on':''} onClick={()=>setActive('agenda')}>Agenda</button>
      </nav>

      {active === 'calendario' && <section className="panel">
        <h2>Calendário mensal</h2>
        <div className="weekdays"><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span></div>
        <div className="calendar">
          {Array.from({length: offset}).map((_,i)=><div key={'e'+i} className="day empty"/>)}
          {Array.from({length: days}).map((_,i)=>{
            const d=i+1; const items=byDay[d]||[]; const hasD=items.some(x=>x.tipo==='deslocacao'); const hasP=items.some(x=>x.tipo==='prevencao');
            return <button key={d} className="day" onClick={()=>{setForm(f=>({...f,data:`${currentMonth}-${pad(d)}`})); setActive('agenda')}}>
              <strong>{d}</strong><div className="marks">{hasD && <span className="mark d">D</span>}{hasP && <span className="mark p">P</span>}</div>
            </button>
          })}
        </div>
      </section>}

      {(active === 'deslocacoes' || active === 'prevencoes') && <section className="panel formpanel">
        <h2>{editingId ? 'Editar' : 'Novo registo'} — {form.tipo === 'deslocacao' ? 'Deslocação' : 'Prevenção'}</h2>
        <form onSubmit={guardar}>
          <label>Data<input type="date" value={form.data} onChange={e=>setForm({...form,data:e.target.value})} required/></label>
          {form.tipo === 'deslocacao' ? <>
            <label>Origem<input value={form.origem} onChange={e=>setForm({...form,origem:e.target.value})} placeholder="Ex.: Leiria"/></label>
            <label>Destino<input value={form.destino} onChange={e=>setForm({...form,destino:e.target.value})} placeholder="Ex.: Caldas da Rainha" required/></label>
            <label>Matrícula da viatura<input value={form.matricula} onChange={e=>setForm({...form,matricula:e.target.value.toUpperCase()})} placeholder="00-AA-00"/></label>
            <div className="two"><label>Hora de saída<input type="time" value={form.horaSaida} onChange={e=>setForm({...form,horaSaida:e.target.value})}/></label><label>Hora de chegada<input type="time" value={form.horaChegada} onChange={e=>setForm({...form,horaChegada:e.target.value})}/></label></div>
          </> : <>
            <label>Tipo de prevenção<select value={form.prevencaoTipo} onChange={e=>setForm({...form,prevencaoTipo:e.target.value})}><option>BT</option><option>CC</option><option>BT/CC</option></select></label>
          </>}
          <label>Observações<textarea value={form.observacoes} onChange={e=>setForm({...form,observacoes:e.target.value})} placeholder="Notas para apoio aos abonos"/></label>
          <div className="actions"><button className="primary"><Plus size={18}/> Guardar</button><button type="button" onClick={()=>limparForm(form.tipo)}>Limpar</button></div>
        </form>
      </section>}

      {active === 'agenda' && <Agenda registos={registosMes} editar={editar} duplicar={duplicar} remover={remover}/>}      

      <section className="panel monthly">
        <div className="section-title"><h2>Resumo para abonos — {currentMonth}</h2><div className="actions print-hide"><button onClick={exportCSV}><Download size={18}/> CSV</button><button onClick={imprimirPDF}><Printer size={18}/> PDF</button></div></div>
        <table><thead><tr><th>Data</th><th>Tipo</th><th>Local / Destino</th><th>Matrícula</th><th>Saída</th><th>Chegada</th><th>Obs.</th></tr></thead><tbody>{registosMes.map(r=><tr key={r.id}><td>{r.data}</td><td>{r.tipo==='deslocacao'?'Deslocação':'Prevenção ' + (r.prevencaoTipo||'')}</td><td>{r.tipo==='deslocacao'?`${r.origem||''} → ${r.destino||''}`:'—'}</td><td>{r.matricula||''}</td><td>{r.horaSaida||''}</td><td>{r.horaChegada||''}</td><td>{r.observacoes||''}</td></tr>)}</tbody></table>
      </section>
    </main>
  </div>
}

function Agenda({ registos, editar, duplicar, remover }) {
  if (!registos.length) return <section className="panel"><h2>Agenda</h2><p>Ainda não existem registos neste mês.</p></section>;
  return <section className="panel"><h2>Agenda profissional</h2><div className="list">{registos.map(r => <article className="item" key={r.id}>
    <div className="item-icon">{r.tipo === 'deslocacao' ? <Car/> : <ShieldCheck/>}</div>
    <div className="item-body"><b>{r.data} — {r.tipo === 'deslocacao' ? 'Deslocação' : 'Prevenção ' + r.prevencaoTipo}</b><span>{r.tipo === 'deslocacao' ? `${r.origem || 'Origem'} → ${r.destino || 'Destino'} · ${r.matricula || 'sem matrícula'} · ${r.horaSaida || '--:--'}-${r.horaChegada || '--:--'}` : r.observacoes || 'Sem observações'}</span>{r.tipo==='deslocacao' && r.observacoes && <small>{r.observacoes}</small>}</div>
    <div className="item-actions print-hide"><button onClick={()=>editar(r)}>Editar</button><button onClick={()=>duplicar(r)}><Copy size={15}/></button><button onClick={()=>remover(r.id)}><Trash2 size={15}/></button></div>
  </article>)}</div></section>
}

createRoot(document.getElementById('root')).render(<App />);
