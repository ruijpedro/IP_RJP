import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CalendarDays, Car, ShieldCheck, Download, Trash2, Plus, Copy, Printer, Settings, Save, X, FileJson, Upload, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import './styles.css';

const STORAGE_KEY = 'IP_RJP_V2_REGISTOS';
const SETTINGS_KEY = 'IP_RJP_V2_SETTINGS';

const hojeISO = () => new Date().toISOString().slice(0, 10);
const pad = n => String(n).padStart(2, '0');
const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2)}`;
const monthKey = date => (date || hojeISO()).slice(0, 7);
const diasMes = (ano, mesIndex) => new Date(ano, mesIndex + 1, 0).getDate();
const primeiroDiaSegunda = (ano, mesIndex) => (new Date(ano, mesIndex, 1).getDay() + 6) % 7;
const nextMonth = (m, delta) => {
  const [y, mm] = m.split('-').map(Number);
  const d = new Date(y, mm - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};

const defaultSettings = {
  matriculas: [''],
  locais: ['Leiria', 'Caldas da Rainha', 'São Martinho do Porto', 'Marinha Grande', 'Pataias', 'Valado dos Frades', 'Óbidos', 'Bombarral', 'Torres Vedras'],
  origemPadrao: 'Leiria',
  tipoPrevencaoPadrao: 'BT'
};

const emptyForm = {
  data: hojeISO(),
  tipo: 'deslocacao',
  origem: '',
  destino: '',
  matricula: '',
  horaSaida: '',
  horaChegada: '',
  prevencaoTipo: 'BT',
  observacoes: ''
};

function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}
function saveJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function cleanList(str) { return str.split('\n').map(x => x.trim()).filter(Boolean); }
function duration(start, end) {
  if (!start || !end) return '';
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return `${Math.floor(mins / 60)}h${pad(mins % 60)}`;
}

function App() {
  const [registos, setRegistos] = useState(() => loadJSON(STORAGE_KEY, []));
  const [settings, setSettings] = useState(() => ({ ...defaultSettings, ...loadJSON(SETTINGS_KEY, defaultSettings) }));
  const [active, setActive] = useState('calendario');
  const [currentMonth, setCurrentMonth] = useState(hojeISO().slice(0, 7));
  const [selectedDay, setSelectedDay] = useState(hojeISO());
  const [form, setForm] = useState(() => ({ ...emptyForm, origem: defaultSettings.origemPadrao }));
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState('');
  const [settingsText, setSettingsText] = useState({ matriculas: settings.matriculas.join('\n'), locais: settings.locais.join('\n') });

  const registosMes = useMemo(() => registos
    .filter(r => monthKey(r.data) === currentMonth)
    .sort((a, b) => a.data.localeCompare(b.data) || (a.horaSaida || '').localeCompare(b.horaSaida || '')), [registos, currentMonth]);

  const agendaFiltrada = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return registosMes;
    return registosMes.filter(r => JSON.stringify(r).toLowerCase().includes(q));
  }, [registosMes, query]);

  const resumo = useMemo(() => {
    const deslocacoes = registosMes.filter(r => r.tipo === 'deslocacao');
    const prevencoes = registosMes.filter(r => r.tipo === 'prevencao');
    return {
      deslocacoes: deslocacoes.length,
      prevencoes: prevencoes.length,
      diasPrevencao: new Set(prevencoes.map(r => r.data)).size,
      diasDeslocacao: new Set(deslocacoes.map(r => r.data)).size,
      horasDeslocacao: deslocacoes.map(r => duration(r.horaSaida, r.horaChegada)).filter(Boolean).length
    };
  }, [registosMes]);

  function persist(next) { setRegistos(next); saveJSON(STORAGE_KEY, next); }
  function persistSettings(next) { setSettings(next); saveJSON(SETTINGS_KEY, next); }

  function limparForm(tipo = form.tipo, data = form.data || selectedDay) {
    setEditingId(null);
    setForm({ ...emptyForm, tipo, data, origem: settings.origemPadrao || '', prevencaoTipo: settings.tipoPrevencaoPadrao || 'BT' });
  }

  function abrirNovo(tipo, data = selectedDay) {
    limparForm(tipo, data);
    setActive(tipo === 'deslocacao' ? 'deslocacoes' : 'prevencoes');
  }

  function guardar(e) {
    e.preventDefault();
    const item = { ...form, id: editingId || uid(), updatedAt: new Date().toISOString() };
    const next = editingId ? registos.map(r => r.id === editingId ? item : r) : [item, ...registos];
    persist(next);
    setSelectedDay(item.data);
    setCurrentMonth(monthKey(item.data));
    limparForm(item.tipo, item.data);
    setActive('agenda');
  }

  function editar(r) { setEditingId(r.id); setForm({ ...emptyForm, ...r }); setSelectedDay(r.data); setActive(r.tipo === 'deslocacao' ? 'deslocacoes' : 'prevencoes'); }
  function duplicar(r) { setEditingId(null); setForm({ ...r, id: undefined, data: hojeISO(), updatedAt: undefined }); setSelectedDay(hojeISO()); setActive(r.tipo === 'deslocacao' ? 'deslocacoes' : 'prevencoes'); }
  function remover(id) { if (confirm('Apagar este registo?')) persist(registos.filter(r => r.id !== id)); }

  function exportCSV() {
    const headers = ['Data','Tipo','Origem','Destino','Matricula','Hora Saida','Hora Chegada','Duracao','Tipo Prevencao','Observacoes'];
    const rows = registosMes.map(r => [r.data, r.tipo, r.origem || '', r.destino || '', r.matricula || '', r.horaSaida || '', r.horaChegada || '', duration(r.horaSaida, r.horaChegada), r.prevencaoTipo || '', r.observacoes || '']);
    const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replaceAll('"','""')}"`).join(';')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    baixar(blob, `IP_RJP_${currentMonth}_abonos.csv`);
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify({ app: 'IP_RJP', version: '2.1', exportedAt: new Date().toISOString(), settings, registos }, null, 2)], { type: 'application/json' });
    baixar(blob, `IP_RJP_backup_${hojeISO()}.json`);
  }

  function baixar(blob, nome) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = nome; a.click(); URL.revokeObjectURL(a.href);
  }

  async function importJSON(file) {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (Array.isArray(data.registos)) persist(data.registos);
      if (data.settings) persistSettings({ ...defaultSettings, ...data.settings });
      alert('Backup importado com sucesso.');
    } catch { alert('Não foi possível importar o ficheiro.'); }
  }

  function guardarSettings(e) {
    e.preventDefault();
    const next = {
      ...settings,
      matriculas: cleanList(settingsText.matriculas),
      locais: cleanList(settingsText.locais),
      origemPadrao: settings.origemPadrao,
      tipoPrevencaoPadrao: settings.tipoPrevencaoPadrao
    };
    persistSettings(next);
    alert('Definições guardadas.');
  }

  const [year, month] = currentMonth.split('-').map(Number);
  const mIndex = month - 1;
  const totalDias = diasMes(year, mIndex);
  const offset = primeiroDiaSegunda(year, mIndex);
  const byDay = registosMes.reduce((acc, r) => { const d = Number(r.data.slice(8, 10)); (acc[d] ||= []).push(r); return acc; }, {});
  const selectedItems = registosMes.filter(r => r.data === selectedDay);

  return <div className="app">
    <header className="topbar">
      <div className="brand"><img src="/logo.png" alt="IP_RJP"/><div><b>IP_RJP</b><span>Agenda profissional · Deslocações · Prevenções BT/CC</span></div></div>
      <div className="month-controls print-hide">
        <button onClick={() => setCurrentMonth(nextMonth(currentMonth, -1))}><ChevronLeft size={18}/></button>
        <input type="month" value={currentMonth} onChange={e => setCurrentMonth(e.target.value)} />
        <button onClick={() => setCurrentMonth(nextMonth(currentMonth, 1))}><ChevronRight size={18}/></button>
      </div>
    </header>

    <main>
      <section className="cards resumo print-hide">
        <div><b>{resumo.diasDeslocacao}</b><span>Dias com deslocação</span></div>
        <div><b>{resumo.diasPrevencao}</b><span>Dias de prevenção</span></div>
        <div><b>{resumo.deslocacoes}</b><span>Registos de deslocação</span></div>
        <div><b>{resumo.prevencoes}</b><span>Registos de prevenção</span></div>
      </section>

      <nav className="tabs print-hide">
        <button className={active === 'calendario' ? 'on' : ''} onClick={() => setActive('calendario')}><CalendarDays size={18}/> Calendário</button>
        <button className={active === 'deslocacoes' ? 'on' : ''} onClick={() => abrirNovo('deslocacao')}><Car size={18}/> Deslocação</button>
        <button className={active === 'prevencoes' ? 'on' : ''} onClick={() => abrirNovo('prevencao')}><ShieldCheck size={18}/> Prevenção</button>
        <button className={active === 'agenda' ? 'on' : ''} onClick={() => setActive('agenda')}>Agenda</button>
        <button className={active === 'definicoes' ? 'on' : ''} onClick={() => setActive('definicoes')}><Settings size={18}/> Definições</button>
      </nav>

      {active === 'calendario' && <section className="panel">
        <div className="section-title"><h2>Calendário mensal</h2><div className="legend"><span><i className="mark d">D</i> Deslocação</span><span><i className="mark p">P</i> Prevenção</span></div></div>
        <div className="weekdays"><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span></div>
        <div className="calendar">
          {Array.from({ length: offset }).map((_, i) => <div key={'e' + i} className="day empty" />)}
          {Array.from({ length: totalDias }).map((_, i) => {
            const d = i + 1; const iso = `${currentMonth}-${pad(d)}`; const items = byDay[d] || [];
            const hasD = items.some(x => x.tipo === 'deslocacao'); const hasP = items.some(x => x.tipo === 'prevencao');
            return <button key={d} className={`day ${selectedDay === iso ? 'selected' : ''}`} onClick={() => { setSelectedDay(iso); setForm(f => ({ ...f, data: iso })); }}>
              <strong>{d}</strong><div className="marks">{hasD && <span className="mark d">D</span>}{hasP && <span className="mark p">P</span>}</div>
              {!!items.length && <small>{items.length} reg.</small>}
            </button>;
          })}
        </div>
        <DayPanel data={selectedDay} items={selectedItems} abrirNovo={abrirNovo} editar={editar} duplicar={duplicar} remover={remover}/>
      </section>}

      {(active === 'deslocacoes' || active === 'prevencoes') && <section className="panel formpanel">
        <h2>{editingId ? 'Editar' : 'Novo registo'} — {form.tipo === 'deslocacao' ? 'Deslocação' : 'Prevenção'}</h2>
        <form onSubmit={guardar}>
          <label>Data<input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} required /></label>
          {form.tipo === 'deslocacao' ? <>
            <label>Origem<input list="locais" value={form.origem} onChange={e => setForm({ ...form, origem: e.target.value })} placeholder="Ex.: Leiria" /></label>
            <label>Destino<input list="locais" value={form.destino} onChange={e => setForm({ ...form, destino: e.target.value })} placeholder="Ex.: Caldas da Rainha" required /></label>
            <datalist id="locais">{settings.locais.map(x => <option key={x} value={x}/>)}</datalist>
            <label>Matrícula da viatura<input list="matriculas" value={form.matricula} onChange={e => setForm({ ...form, matricula: e.target.value.toUpperCase() })} placeholder="00-AA-00" /></label>
            <datalist id="matriculas">{settings.matriculas.map(x => <option key={x} value={x}/>)}</datalist>
            <div className="two"><label>Hora de saída<input type="time" value={form.horaSaida} onChange={e => setForm({ ...form, horaSaida: e.target.value })} /></label><label>Hora de chegada<input type="time" value={form.horaChegada} onChange={e => setForm({ ...form, horaChegada: e.target.value })} /></label></div>
            {duration(form.horaSaida, form.horaChegada) && <div className="hint">Duração: <b>{duration(form.horaSaida, form.horaChegada)}</b></div>}
          </> : <>
            <label>Tipo de prevenção<select value={form.prevencaoTipo} onChange={e => setForm({ ...form, prevencaoTipo: e.target.value })}><option>BT</option><option>CC</option></select></label>
          </>}
          <label>Observações<textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} placeholder="Notas para apoio aos abonos" /></label>
          <div className="actions"><button className="primary"><Save size={18}/> Guardar</button><button type="button" onClick={() => limparForm(form.tipo)}><X size={18}/> Limpar</button></div>
        </form>
      </section>}

      {active === 'agenda' && <section className="panel">
        <div className="section-title"><h2>Agenda profissional</h2><label className="search"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Pesquisar"/></label></div>
        <Agenda registos={agendaFiltrada} editar={editar} duplicar={duplicar} remover={remover}/>
      </section>}

      {active === 'definicoes' && <section className="panel formpanel">
        <h2>Definições rápidas</h2>
        <form onSubmit={guardarSettings}>
          <label>Origem padrão<input value={settings.origemPadrao} onChange={e => setSettings({ ...settings, origemPadrao: e.target.value })}/></label>
          <label>Tipo de prevenção padrão<select value={settings.tipoPrevencaoPadrao} onChange={e => setSettings({ ...settings, tipoPrevencaoPadrao: e.target.value })}><option>BT</option><option>CC</option></select></label>
          <label>Matrículas frequentes<textarea value={settingsText.matriculas} onChange={e => setSettingsText({ ...settingsText, matriculas: e.target.value })} placeholder="Uma matrícula por linha"/></label>
          <label>Locais frequentes<textarea value={settingsText.locais} onChange={e => setSettingsText({ ...settingsText, locais: e.target.value })} placeholder="Um local por linha"/></label>
          <div className="actions"><button className="primary"><Save size={18}/> Guardar definições</button><button type="button" onClick={exportJSON}><FileJson size={18}/> Backup JSON</button><label className="buttonlike"><Upload size={18}/> Importar JSON<input type="file" accept="application/json" hidden onChange={e => importJSON(e.target.files?.[0])}/></label></div>
        </form>
      </section>}

      <section className="panel monthly">
        <div className="section-title"><h2>Resumo para abonos — {currentMonth}</h2><div className="actions print-hide"><button onClick={exportCSV}><Download size={18}/> CSV</button><button onClick={() => window.print()}><Printer size={18}/> PDF</button></div></div>
        <table><thead><tr><th>Data</th><th>Tipo</th><th>Local / Destino</th><th>Matrícula</th><th>Saída</th><th>Chegada</th><th>Duração</th><th>Obs.</th></tr></thead><tbody>{registosMes.map(r => <tr key={r.id}><td>{r.data}</td><td>{r.tipo === 'deslocacao' ? 'Deslocação' : 'Prevenção ' + (r.prevencaoTipo || '')}</td><td>{r.tipo === 'deslocacao' ? `${r.origem || ''} → ${r.destino || ''}` : '—'}</td><td>{r.matricula || ''}</td><td>{r.horaSaida || ''}</td><td>{r.horaChegada || ''}</td><td>{duration(r.horaSaida, r.horaChegada)}</td><td>{r.observacoes || ''}</td></tr>)}</tbody></table>
      </section>
    </main>
  </div>;
}

function DayPanel({ data, items, abrirNovo, editar, duplicar, remover }) {
  return <div className="daypanel">
    <div><h3>{data}</h3><p>{items.length ? `${items.length} registo(s) neste dia` : 'Sem registos neste dia.'}</p></div>
    <div className="actions print-hide"><button onClick={() => abrirNovo('deslocacao', data)}><Car size={17}/> Deslocação</button><button onClick={() => abrirNovo('prevencao', data)}><ShieldCheck size={17}/> Prevenção</button></div>
    {!!items.length && <Agenda registos={items} editar={editar} duplicar={duplicar} remover={remover}/>} 
  </div>;
}

function Agenda({ registos, editar, duplicar, remover }) {
  if (!registos.length) return <p className="emptytext">Ainda não existem registos.</p>;
  return <div className="list">{registos.map(r => <article className="item" key={r.id}>
    <div className="item-icon">{r.tipo === 'deslocacao' ? <Car/> : <ShieldCheck/>}</div>
    <div className="item-body"><b>{r.data} — {r.tipo === 'deslocacao' ? 'Deslocação' : 'Prevenção ' + r.prevencaoTipo}</b><span>{r.tipo === 'deslocacao' ? `${r.origem || 'Origem'} → ${r.destino || 'Destino'} · ${r.matricula || 'sem matrícula'} · ${r.horaSaida || '--:--'}-${r.horaChegada || '--:--'} ${duration(r.horaSaida, r.horaChegada) ? '· ' + duration(r.horaSaida, r.horaChegada) : ''}` : r.observacoes || 'Sem observações'}</span>{r.tipo === 'deslocacao' && r.observacoes && <small>{r.observacoes}</small>}</div>
    <div className="item-actions print-hide"><button onClick={() => editar(r)}>Editar</button><button title="Duplicar" onClick={() => duplicar(r)}><Copy size={15}/></button><button title="Apagar" onClick={() => remover(r.id)}><Trash2 size={15}/></button></div>
  </article>)}</div>;
}

createRoot(document.getElementById('root')).render(<App />);
