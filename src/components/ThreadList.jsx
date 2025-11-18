export default function ThreadList({ threads, selectedId, onSelect }) {
  if (!threads?.length) return <div>No threads found.</div>;
  return (
    <>
      {threads.map(t => (
        <div
          key={t.thread_id}
          className="card"
          style={t.thread_id === selectedId ? { outline: "2px solid #22c55e" } : {}}
          onClick={() => onSelect(t.thread_id)}
        >
          <div style={{ fontWeight: 600, marginBottom: 6 }}>{t.subject || t.topic}</div>
          <div className="row">
            <span className="chip">{t.topic}</span>
            <span className="chip">Order {t.order_id}</span>
          </div>
          <div className="row">
            <small className="mono">{t.thread_id}</small>
          </div>
        </div>
      ))}
    </>
  );
}