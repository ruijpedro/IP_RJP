import { useState } from 'react';
import RecordList from '../components/RecordList.jsx';
import { today } from '../utils/date.js';

export default function Activities({ data, activities, addRecord, deleteRecord }) {
  const [form, setForm] = useState({ date: today(), start: '09:00', end: '10:00', type: data.activityTypes[0], place: data.places[0], notes: '' });
  function submit(e) {
    e.preventDefault();
    addRecord('activities', form);
    setForm({ ...form, notes: '' });
  }
  return (
    <section>
      <div className="panel formpanel print-hide">
        <h2>Nova atividade</h2>
        <form onSubmit={submit}>
          <div className="two"><label>Data<input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></label><label>Tipo<select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>{data.activityTypes.map(t => <option key={t}>{t}</option>)}</select></label></div>
          <div className="two"><label>Hora início<input type="time" value={form.start} onChange={e => setForm({ ...form, start: e.target.value })} /></label><label>Hora fim<input type="time" value={form.end} onChange={e => setForm({ ...form, end: e.target.value })} /></label></div>
          <label>Local<select value={form.place} onChange={e => setForm({ ...form, place: e.target.value })}>{data.places.map(p => <option key={p}>{p}</option>)}</select></label>
          <label>Observações<textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label>
          <button className="primary">Guardar atividade</button>
        </form>
      </div>
      <div className="panel">
        <h2>Atividades do mês</h2>
        <RecordList
          items={activities}
          onDelete={id => deleteRecord('activities', id)}
          onDuplicate={item => addRecord('activities', { ...item, date: today() })}
          render={a => <><b>{a.date} · {a.type}</b><span>{a.place} · {a.start}-{a.end}</span><small>{a.notes}</small></>}
        />
      </div>
    </section>
  );
}
