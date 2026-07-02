export default function MonthSelector({ month, setMonth }) {
  return (
    <div className="monthbar print-hide">
      <input type="month" value={month} onChange={e => setMonth(e.target.value)} />
    </div>
  );
}
