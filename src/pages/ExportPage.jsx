import { exportCSV, exportPDF, exportXLSX } from '../services/exporters.js';

export default function ExportPage({ month, data, trips, guards, activities }) {
  const payload = { month, profile: data.profile, trips, guards, activities };
  return (
    <section className="panel">
      <h2>Exportação mensal</h2>
      <p className="emptytext">Gera ficheiros para apoio aos abonos: PDF para arquivo/impressão, CSV para Excel e XLSX formatável.</p>
      <div className="actions">
        <button className="primary" onClick={() => exportPDF(payload)}>Gerar PDF</button>
        <button onClick={() => exportCSV(payload)}>Gerar CSV</button>
        <button onClick={() => exportXLSX(payload)}>Gerar Excel</button>
      </div>
    </section>
  );
}
