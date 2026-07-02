import { useState } from 'react';

export default function Vehicles({ data, setData }) {
  const [form, setForm] = useState({ plate: '', brand: '', model: '', color: 'Branco', type: 'Viatura de serviço', photo: '', active: true, favorite: false, notes: '' });

  function addVehicle(e) {
    e.preventDefault();
    if (!form.plate.trim()) return;
    setData(d => ({ ...d, vehicles: [...d.vehicles, { ...form, id: crypto.randomUUID(), plate: form.plate.trim().toUpperCase() }] }));
    setForm({ plate: '', brand: '', model: '', color: 'Branco', type: 'Viatura de serviço', photo: '', active: true, favorite: false, notes: '' });
  }

  function removeVehicle(id) {
    setData(d => ({ ...d, vehicles: d.vehicles.filter(v => v.id !== id) }));
  }

  return (
    <section>
      <div className="panel">
        <h2>Viaturas registadas</h2>
        <div className="vehiclegrid">
          {data.vehicles.map(v => (
            <article className="vehicle" key={v.id}>
              <img src={v.photo || '/icons/icon-512.png'} alt={v.plate} />
              <b>{v.plate}</b>
              <span>{v.brand} {v.model}</span>
              <small>{v.type} · {v.color}</small>
              <button className="print-hide" onClick={() => removeVehicle(v.id)}>Eliminar</button>
            </article>
          ))}
        </div>
      </div>
      <div className="panel formpanel print-hide">
        <h2>Adicionar viatura</h2>
        <form onSubmit={addVehicle}>
          <div className="two"><label>Matrícula<input value={form.plate} onChange={e => setForm({ ...form, plate: e.target.value })} placeholder="00-AA-00" /></label><label>Marca<input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} /></label></div>
          <div className="two"><label>Modelo<input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} /></label><label>Tipo<input value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} /></label></div>
          <label>Cor<input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} /></label>
          <button className="primary">Adicionar</button>
        </form>
      </div>
    </section>
  );
}
