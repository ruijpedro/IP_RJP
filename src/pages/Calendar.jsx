import { getDaysInMonth, formatMonthTitle } from '../utils/date.js';

export default function Calendar({ month, trips, guards, activities }) {
  const days = getDaysInMonth(month);
  return (
    <section className="panel">
      <h2>Calendário — {formatMonthTitle(month)}</h2>
      <div className="legend print-hide"><span><i className="dot d" /> Deslocação</span><span><i className="dot bt" /> BT</span><span><i className="dot cc" /> CC</span><span><i className="dot a" /> Atividade</span></div>
      <div className="calendar">
        {Array.from({ length: days }, (_, i) => {
          const day = `${month}-${String(i + 1).padStart(2, '0')}`;
          const dayTrips = trips.filter(t => t.date === day);
          const dayGuards = guards.filter(g => g.date === day);
          const dayActs = activities.filter(a => a.date === day);
          return (
            <div className="day" key={day}>
              <strong>{i + 1}</strong>
              <div className="marks">
                {dayTrips.length > 0 && <em className="mark d">D</em>}
                {dayGuards.map(g => <em key={g.id} className={`mark ${g.kind.toLowerCase()}`}>{g.kind}</em>)}
                {dayActs.length > 0 && <em className="mark a">A</em>}
              </div>
              <small>{dayTrips.length + dayGuards.length + dayActs.length ? `${dayTrips.length + dayGuards.length + dayActs.length} reg.` : ''}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
}
