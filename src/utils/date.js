export const today = () => new Date().toISOString().slice(0, 10);
export const currentMonth = () => today().slice(0, 7);
export const monthKey = (date) => String(date || '').slice(0, 7);
export const sameMonth = (date, month) => monthKey(date) === month;
export const getDaysInMonth = (month) => {
  const [year, mm] = month.split('-').map(Number);
  return new Date(year, mm, 0).getDate();
};
export const formatMonthTitle = (month) => new Date(`${month}-01T00:00:00`).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
export function durationHHMM(start, end) {
  if (!start || !end) return '0h00';
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  const h = Math.floor(mins / 60);
  const m = String(mins % 60).padStart(2, '0');
  return `${h}h${m}`;
}
