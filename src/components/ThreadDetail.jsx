import { useEffect, useState } from "react";
import { api } from "../api/client";
import SummaryPanel from "./SummaryPanel";
import Toast from "./Toast";

export default function ThreadDetail({ threadId }) {
  const [thread, setThread] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        setErr("");
        const [t, s] = await Promise.allSettled([
          api.getThread(threadId),
          api.getSummary(threadId),
        ]);
        if (t.status === "fulfilled") setThread(t.value);
        else throw t.reason;
        if (s.status === "fulfilled") setSummary(s.value);
        else setSummary(null); // no summary yet
      } catch (e) {
        setErr(String(e));
      } finally {
        setLoading(false);
      }
    }
    
    loadAll();
  }, [threadId]);

  return (
    <>
      <div className="panel">
        <h3 style={{ marginTop: 0 }}>{thread?.subject || thread?.topic}</h3>
        <div className="row">
          <span className="label">Thread:</span><small className="mono">{threadId}</small>
        </div>
        <div className="row">
          <span className="label">Order:</span><span>{thread?.order_id}</span>
          <span className="label" style={{ marginLeft: 12 }}>Product:</span><span>{thread?.product}</span>
        </div>
        <h4>Messages</h4>
        {loading && <div>Loading…</div>}
        {err && <div style={{ color: "tomato" }}>{err}</div>}
        <div>
          {thread?.messages?.map(m => (
            <div key={m.id} className="msg">
              <div>
                <b>{m.sender}</b> <small className="mono">{m.timestamp}</small>
              </div>
              <div>{m.body}</div>
            </div>
          ))}
        </div>
      </div>

      <SummaryPanel
        summary={summary}
        onNeedSummarize={async () => {
          const s = await api.summarize(threadId);
          setSummary(s);
        }}
        onSaveEdit={async (edited_summary, edited_fields) => {
          const s = await api.saveEdit(threadId, edited_summary, edited_fields);
          setSummary(s);
        }}
        onApprove={async (approver) => {
          const s = await api.approve(threadId, approver);
          setSummary(s);
        }}
        onPostCrm={async (note) => {
          await api.postCrmNote(threadId, note || "Posted approved summary from UI");
          setToastMessage("Posted to CRM (simulated)");
        }}
      />
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />
    </>
  );
}