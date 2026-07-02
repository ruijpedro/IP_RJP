import { useState } from 'react';
import RecordList from '../components/RecordList.jsx';
import { today } from '../utils/date.js';

export default function Guards({ guards, addRecord, deleteRecord }) {
  const [form, setForm] = useState({ date: today(), kind: 'BT', notes: '' });
  function submit(e) {
    e.preventDefault();
    addRecord('guards', form);
    setForm({ date: today(), kind: 'BT', notes: '' });
  }
  return (
    <section>
      <div className="panel formpanel print-hide">
        <h2>Nova prevenção</h2>
        <form onSubmit={submit}>
          <div className="two"><label>Data<input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></label><label>Tipo<select value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value })}><option>BT</option><option>CC</option></select></label></div>
          <label>Observações<textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label>
          <button className="primary">Guardar prevenção</button>
        </form>
      </div>
      <div className="panel">
        <h2>Prevenções do mês</h2>
        <RecordList
          items={guards}
          onDelete={id => deleteRecord('guards', id)}
          onDuplicate={item => addRecord('guards', { ...item, date: today() })}
          render={g => <><b>{g.date} · Prevenção {g.kind}</b><span>{g.notes}</span></>}
        />
      </div>
    </section>
  );
}
