import { useEffect, useState } from "react";
import { api } from "./api/client";
import ThreadList from "./components/ThreadList";
import ThreadDetail from "./components/ThreadDetail";
import Modal from "./components/Modal";
import Toast from "./components/Toast";
import "./index.css";

/**
 * App layout:
 * - Left: Thread list
 * - Right: Thread detail (messages + summary panel)
 * - Top toolbar: Refresh + Reset Current + Reset ALL + API label
 */
export default function App() {
  const [threads, setThreads] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const [toastMessage, setToastMessage] = useState("");

  // Load thread list once on mount
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await api.listThreads();
        setThreads(data || []);
        // Auto-select first thread for convenience
        if (data?.length && !selectedId) {
          setSelectedId(data[0].thread_id);
        }
      } catch (e) {
        setErr(String(e));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleReset(all = false) {
    if (all) {
      setModalConfig({
        isOpen: true,
        title: "Reset ALL Threads",
        message: "Reset ALL threads and truncate output files? This clears drafts/edits/approvals.",
        onConfirm: async () => {
          try {
            await api.adminResetAll();
            setModalConfig({ isOpen: false });
            setToastMessage("All summaries cleared. Output files truncated.");
            setTimeout(() => window.location.reload(), 1500);
          } catch (e) {
            setToastMessage("Reset failed: " + String(e));
            setModalConfig({ isOpen: false });
          }
        },
      });
    } else {
      if (!selectedId) {
        setToastMessage("Select a thread first.");
        return;
      }
      setModalConfig({
        isOpen: true,
        title: "Reset Current Thread",
        message: `Reset ONLY ${selectedId}?`,
        onConfirm: async () => {
          try {
            await api.adminResetOne(selectedId);
            setModalConfig({ isOpen: false });
            setToastMessage(`Summary cleared for ${selectedId}.`);
            setTimeout(() => window.location.reload(), 1500);
          } catch (e) {
            setToastMessage("Reset failed: " + String(e));
            setModalConfig({ isOpen: false });
          }
        },
      });
    }
  }

  return (
    <div className="app">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="header">CE Threads</div>
        <div className="list">
          {loading && <div>Loading…</div>}
          {err && <div className="row" style={{ color: "tomato" }}>{err}</div>}
          <ThreadList
            threads={threads}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </div>

      {/* Main area */}
      <div className="main">
        {/* Toolbar */}
        <div className="toolbar">
          <button className="btn" onClick={() => window.location.reload()}>
            Refresh
          </button>

          {/* NEW: Reset buttons */}
          <button className="btn" onClick={() => handleReset(false)}>
            Reset Current
          </button>
          <button className="btn" onClick={() => handleReset(true)}>
            Reset ALL
          </button>

          <div style={{ marginLeft: "auto" }}>
            <small className="mono">
              API: {import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}
            </small>
          </div>
        </div>

        {/* Content */}
        <div className="content">
          {selectedId ? (
            <ThreadDetail threadId={selectedId} />
          ) : (
            <div className="panel">Select a thread on the left.</div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
      />
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />
    </div>
  );
}