export default function Outlook({ data, setData }) {
  const outlook = data.outlook || {};
  const setOutlook = (obj) => setData(d => ({ ...d, outlook: { ...d.outlook, ...obj } }));
  return (
    <section className="panel formpanel">
      <h2>Microsoft Outlook</h2>
      <p className="emptytext">Interface preparado para Microsoft Graph. Depois de criares o registo no Microsoft Entra, coloca aqui o Client ID e Tenant ID.</p>
      <label>Application / Client ID<input value={outlook.clientId || ''} onChange={e => setOutlook({ clientId: e.target.value })} /></label>
      <label>Directory / Tenant ID<input value={outlook.tenantId || ''} onChange={e => setOutlook({ tenantId: e.target.value })} /></label>
      <div className="actions"><button className="primary" onClick={() => setOutlook({ connected: true })}>Guardar configuração</button><button onClick={() => alert('A sincronização real será ativada quando o registo Entra estiver autorizado.')}>Testar ligação</button></div>
    </section>
  );
}
