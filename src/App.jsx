import { useEffect, useState } from "react";
import { api } from "./api/client";
import ThreadList from "./components/ThreadList";
import ThreadDetail from "./components/ThreadDetail";
import Modal from "./components/Modal";
import Toast from "./components/Toast";
import Spinner from "./components/Spinner";
import ThemeToggle from "./components/ThemeToggle";
import UserGuide from "./components/UserGuide";
import InfoButton from "./components/InfoButton";
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
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState("");
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const [toastMessage, setToastMessage] = useState("");
  const [llmToken, setLlmToken] = useState("");

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
        <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>CE Threads</span>
          <UserGuide />
        </div>
        <div className="list">
          {loading && <Spinner size="small" text="Loading threads..." />}
          {err && <div className="row" style={{ color: "tomato" }}>{err}</div>}
          {!loading && <ThreadList
            threads={threads}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />}
        </div>
      </div>

      {/* Main area */}
      <div className="main">
        {/* Toolbar */}
        <div className="toolbar">
          <button className="btn" onClick={async () => {
            setRefreshing(true);
            await new Promise(resolve => setTimeout(resolve, 300)); // Small delay for UX
            window.location.reload();
          }} disabled={refreshing}>
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          {/* NEW: Reset buttons */}
          <button className="btn" onClick={() => handleReset(false)}>
            Reset Current
          </button>
          <button className="btn" onClick={() => handleReset(true)}>
            Reset ALL
          </button>

          {/* Groq API Key Input */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 16 }}>
            <label htmlFor="llm-token" style={{ fontSize: 14, fontWeight: 500 }}>Groq API Key:</label>
            <input
              id="llm-token"
              type="password"
              className="input"
              style={{ width: 200 }}
              placeholder="Enter API Key"
              value={llmToken}
              onChange={e => setLlmToken(e.target.value)}
            />
            <InfoButton 
              title="API Key Information"
              content={
                <div>
                  <p><strong>With API Key:</strong></p>
                  <ul style={{ marginTop: 4, marginBottom: 8, paddingLeft: 20 }}>
                    <li>Generate AI-powered summaries</li>
                    <li>Intelligent issue detection</li>
                    <li>Recommended actions</li>
                    <li>Free tier: 30 requests/minute</li>
                  </ul>
                  <p><strong>Without API Key:</strong></p>
                  <ul style={{ marginTop: 4, marginBottom: 8, paddingLeft: 20, fontSize: '12px' }}>
                    <li>Deterministic keyword matching fallback</li>
                    <li>Basic summary generation available</li>
                    <li>Can view and edit existing summaries</li>
                  </ul>
                  <p style={{ marginTop: 8, fontSize: '12px' }}>
                    <strong>Get a free API key:</strong><br/>
                    <a href="https://console.groq.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand)' }}>
                      https://console.groq.com/
                    </a>
                  </p>
                </div>
              }
            />
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <small className="mono">
              API: {import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}
            </small>
            <ThemeToggle />
          </div>
        </div>

        {/* Content */}
        <div className="content">
          {selectedId ? (
            <ThreadDetail threadId={selectedId} llmToken={llmToken} />
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