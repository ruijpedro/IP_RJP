export default function RecordList({ items, empty = 'Sem registos.', render, onDelete, onDuplicate }) {
  if (!items.length) return <p className="emptytext">{empty}</p>;
  return (
    <div className="list">
      {items.map(item => (
        <div className="item" key={item.id}>
          <div className="item-body">{render(item)}</div>
          <div className="item-actions print-hide">
            {onDuplicate && <button onClick={() => onDuplicate(item)}>Duplicar</button>}
            {onDelete && <button onClick={() => onDelete(item.id)}>Eliminar</button>}
          </div>
        </div>
      ))}
    </div>
  );
}
