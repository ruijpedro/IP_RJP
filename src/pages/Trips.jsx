import { useMemo, useState } from 'react';
import RecordList from '../components/RecordList.jsx';
import { today } from '../utils/date.js';

const emptyTrip = (vehicles, places) => ({
  date: today(),
  from: places[0] || 'Leiria',
  to: places[1] || 'Caldas da Rainha',
  vehiclePlate: vehicles[0]?.plate || '',
  out: '08:00',
  in: '17:30',
  activity: '',
  notes: ''
});

export default function Trips({ data, trips, addRecord, deleteRecord }) {
  const [form, setForm] = useState(() => emptyTrip(data.vehicles, data.places));
  const vehicleLabel = useMemo(() => Object.fromEntries(data.vehicles.map(v => [v.plate, `${v.plate} — ${v.brand} ${v.model}`.trim()])), [data.vehicles]);

  function submit(e) {
    e.preventDefault();
    addRecord('trips', form);
    setForm(emptyTrip(data.vehicles, data.places));
  }

  return (
    <section>
      <div className="panel formpanel print-hide">
        <h2>Nova deslocação</h2>
        <form onSubmit={submit}>
          <div className="two"><label>Data<input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></label><label>Viatura<select value={form.vehiclePlate} onChange={e => setForm({ ...form, vehiclePlate: e.target.value })}>{data.vehicles.map(v => <option key={v.id} value={v.plate}>{vehicleLabel[v.plate]}</option>)}</select></label></div>
          <div className="two"><label>Origem<select value={form.from} onChange={e => setForm({ ...form, from: e.target.value })}>{data.places.map(p => <option key={p}>{p}</option>)}</select></label><label>Destino<select value={form.to} onChange={e => setForm({ ...form, to: e.target.value })}>{data.places.map(p => <option key={p}>{p}</option>)}</select></label></div>
          <div className="two"><label>Hora de saída<input type="time" value={form.out} onChange={e => setForm({ ...form, out: e.target.value })} /></label><label>Hora de chegada<input type="time" value={form.in} onChange={e => setForm({ ...form, in: e.target.value })} /></label></div>
          <label>Atividade associada<input value={form.activity} onChange={e => setForm({ ...form, activity: e.target.value })} placeholder="Opcional" /></label>
          <label>Observações<textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label>
          <button className="primary">Guardar deslocação</button>
        </form>
      </div>
      <div className="panel">
        <h2>Deslocações do mês</h2>
        <RecordList
          items={trips}
          onDelete={id => deleteRecord('trips', id)}
          onDuplicate={item => addRecord('trips', { ...item, date: today() })}
          render={t => <><b>{t.date} · {t.from} → {t.to}</b><span>{t.vehiclePlate} · {t.out}-{t.in}</span><small>{t.activity || t.notes}</small></>}
        />
      </div>
    </section>
  );
}
