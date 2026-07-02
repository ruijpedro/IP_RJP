import { durationHHMM, formatMonthTitle } from '../utils/date.js';

function sumDurations(records, startKey, endKey) {
  let total = 0;
  for (const r of records) {
    if (!r[startKey] || !r[endKey]) continue;
    const [sh, sm] = r[startKey].split(':').map(Number);
    const [eh, em] = r[endKey].split(':').map(Number);
    let mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins < 0) mins += 24 * 60;
    total += mins;
  }
  return `${Math.floor(total / 60)}h${String(total % 60).padStart(2, '0')}`;
}

export default function Dashboard({ month, trips, guards, activities }) {
  return (
    <section>
      <h2>Dashboard — {formatMonthTitle(month)}</h2>
      <div className="cards">
        <div><b>{trips.length}</b><span>Deslocações</span></div>
        <div><b>{guards.filter(g => g.kind === 'BT').length}</b><span>Prevenções BT</span></div>
        <div><b>{guards.filter(g => g.kind === 'CC').length}</b><span>Prevenções CC</span></div>
        <div><b>{activities.length}</b><span>Atividades</span></div>
        <div><b>{sumDurations(trips, 'out', 'in')}</b><span>Horas deslocação</span></div>
        <div><b>{sumDurations(activities, 'start', 'end')}</b><span>Horas atividades</span></div>
      </div>
      <div className="panel">
        <h3>Últimos registos</h3>
        {[...trips, ...guards, ...activities].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 5).map(r => (
          <p key={r.id} className="minirow"><b>{r.date}</b> — {r.from ? `Deslocação ${r.from} → ${r.to}` : r.kind ? `Prevenção ${r.kind}` : `${r.type} · ${r.place}`}</p>
        ))}
      </div>
    </section>
  );
}
