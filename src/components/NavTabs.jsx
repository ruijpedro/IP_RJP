const labels = {
  dashboard: 'Início',
  calendar: 'Calendário',
  trips: 'Deslocações',
  guards: 'Prevenções',
  activities: 'Atividades',
  vehicles: 'Viaturas',
  settings: 'Definições',
  export: 'Exportar',
  outlook: 'Outlook',
  about: 'Sobre'
};

export default function NavTabs({ active, setActive }) {
  return (
    <nav className="tabs print-hide">
      {Object.entries(labels).map(([key, label]) => (
        <button key={key} className={active === key ? 'on' : ''} onClick={() => setActive(key)}>{label}</button>
      ))}
    </nav>
  );
}
