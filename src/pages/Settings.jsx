import { backupData } from '../services/storage.js';

export default function Settings({ data, setData }) {
  const updateList = (key, value) => setData(d => ({ ...d, [key]: value.split('\n').map(x => x.trim()).filter(Boolean) }));
  return (
    <section>
      <div className="panel formpanel">
        <h2>Definições</h2>
        <label>Locais frequentes<textarea value={data.places.join('\n')} onChange={e => updateList('places', e.target.value)} /></label>
        <label>Tipos de atividade<textarea value={data.activityTypes.join('\n')} onChange={e => updateList('activityTypes', e.target.value)} /></label>
        <button onClick={() => backupData(data)}>Criar backup JSON</button>
      </div>
    </section>
  );
}
