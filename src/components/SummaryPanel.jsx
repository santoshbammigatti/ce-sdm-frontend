import { useMemo, useState } from "react";
import { useEffect } from "react";
import Toast from "./Toast";
import Spinner from "./Spinner";

function FieldRow({ label, children }) {
  return (
    <div className="row">
      <span className="label">{label}</span>
      <div>{children}</div>
    </div>
  );
}

export default function SummaryPanel({
  summary,
  loading,
  onNeedSummarize, onSaveEdit, onApprove, onPostCrm
}) {
  const state = summary?.state || "NONE";
  const [summarizing, setSummarizing] = useState(false);
  
  const draftFields = useMemo(() => summary?.draft_fields || {}, [summary]);
  const editedFields = useMemo(() => summary?.edited_fields || {}, [summary]);
  const approvedFields = useMemo(() => summary?.approved_fields || {}, [summary]);
  
  const effectiveFields = useMemo(() => {
    if (state === "APPROVED") return approvedFields;
    if (state === "EDITED") return { ...draftFields, ...editedFields };
    return draftFields;
  }, [state, draftFields, editedFields, approvedFields]);

  // ✅ Derive text from summary instead of using setState in effect
  const defaultText = useMemo(() => {
    return summary?.approved_summary ||
      summary?.edited_summary ||
      summary?.draft_summary ||
      "";
  }, [summary]);

  const [text, setText] = useState(defaultText);

  // ✅ Reset text when defaultText changes (e.g., new summary loaded)
  useEffect(() => {
    setText(defaultText);
  }, [defaultText]);

  

  const [status, setStatus] = useState("");
  const [approver, setApprover] = useState("santosh.b");
  const [currentStatus, setCurrentStatus] = useState(
    editedFields.current_status || draftFields.current_status || "Unresolved"
  );
  const [toastMessage, setToastMessage] = useState("");

  const canSummarize = state === "NONE" || (!summary?.draft_summary);
  const canEdit = state !== "APPROVED" && summary?.draft_summary;
  const canApprove = state !== "APPROVED" && (summary?.edited_summary || summary?.draft_summary);

  return (
    <div className="panel">
      <h3 style={{ marginTop: 0 }}>Summary</h3>

      {canSummarize && (
        <>
          <button className="btn primary" onClick={async () => {
            setStatus("Summarizing…");
            setSummarizing(true);
            await onNeedSummarize();
            setSummarizing(false);
            setStatus("");
          }} disabled={summarizing}>
            Generate Draft
          </button>
          {summarizing && <Spinner size="medium" text="Generating summary..." />}
        </>
      )}

      {summary?.draft_summary && (
        <>
          <FieldRow label="State:">
            <span className="chip">{state}</span>
          </FieldRow>

          {/* Faithfulness warnings (if you add them later) */}
          {effectiveFields?.faithfulness_warnings?.length ? (
            <div className="row warning-box">
              <b>Check before approval:</b>
              <ul>
                {effectiveFields.faithfulness_warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          ) : null}

          <div className="row">
            <textarea rows={8} value={text} onChange={e => setText(e.target.value)} readOnly={state === "APPROVED"}/>
          </div>

          <FieldRow label="Issue Type:">
            <input className="input" defaultValue={effectiveFields.issue_type || ""} readOnly />
          </FieldRow>

          <FieldRow label="Current Status:">
            <input className="input" value={currentStatus} onChange={e => setCurrentStatus(e.target.value)} />
          </FieldRow>

          <FieldRow label="Recommended:">
            <input className="input" defaultValue={effectiveFields.recommended_disposition || ""} readOnly />
          </FieldRow>

          <FieldRow label="CRM:">
            <small className="mono">
              {effectiveFields?.crm_snapshot?.policy
                ? `Policy: ${effectiveFields.crm_snapshot.policy}`
                : "No policy"}
              {" · "}
              {effectiveFields?.crm_snapshot?.order_status
                ? `Order: ${effectiveFields.crm_snapshot.order_status}`
                : "Order: n/a"}
              {" · "}
              {String(effectiveFields?.crm_snapshot?.stock_available ?? "unknown")}
            </small>
          </FieldRow>

          <div className="row" style={{ display: "flex", gap: 8 }}>
            {canEdit && (
              <button className="btn" onClick={async () => {
                setStatus("Saving edit…");
                await onSaveEdit(text, { ...effectiveFields, current_status: currentStatus });
                setStatus("");
                setToastMessage("Saved edit");
              }}>
                Save Edit
              </button>
            )}

            {canApprove && (
              <button className="btn primary" onClick={async () => {
                setStatus("Approving…");
                await onApprove(approver || "reviewer");
                setStatus("");
                setToastMessage("Approved");
              }}>
                Approve
              </button>
            )}

            <button className="btn" onClick={async () => {
              await onPostCrm(text || "Posted approved summary from UI");
            }}>
              Post to CRM
            </button>

            <div style={{ marginLeft: "auto" }}>
              <input
                className="input"
                style={{ width: 180 }}
                placeholder="approver"
                value={approver}
                onChange={e => setApprover(e.target.value)}
              />
            </div>
          </div>

          {status && <div className="row"><small className="mono">{status}</small></div>}
        </>
      )}
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />
    </div>
  );
}