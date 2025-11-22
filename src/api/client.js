const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Log API configuration (helpful for debugging)
console.log("API Base URL:", API_BASE);

async function http(method, path, body) {
  const opts = {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  if (body) opts.body = JSON.stringify(body);

  // Debug log
  if (path === "/api/summarize") {
    console.log("🔍 Sending summarize request with body:", body);
  }

  const res = await fetch(`${API_BASE}${path}`, opts);
  // Try to parse JSON; if HTML arrives (e.g., debug errors), throw a readable error
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    if (!res.ok) throw new Error(json.detail || `HTTP ${res.status}`);
    return json;
  } catch {
    if (!res.ok) {
      throw new Error(text || `HTTP ${res.status}`);
    }
    return text;
  }
}

export const api = {
  listThreads: () => http("GET", "/api/threads/"),
  getThread: (threadId) =>
    http("GET", `/api/threads/${encodeURIComponent(threadId)}/`),
  getSummary: (threadId) =>
    http("GET", `/api/threads/${encodeURIComponent(threadId)}/summary/`),
  summarize: (threadId, llmToken) =>
    http("POST", "/api/summarize/", { thread_id: threadId, ...(llmToken && { llm_token: llmToken }) }),
  saveEdit: (threadId, edited_summary, edited_fields) =>
    http("POST", `/api/threads/${encodeURIComponent(threadId)}/save-edit/`, {
      edited_summary,
      edited_fields,
    }),
  approve: (threadId, approver) =>
    http("POST", `/api/threads/${encodeURIComponent(threadId)}/approve/`, {
      approver,
    }),
  postCrmNote: (threadId, note, metadata = {}) =>
    http("POST", "/api/crm-note/", { thread_id: threadId, note, metadata }),
  adminResetAll: () => http("POST", "/api/admin-reset/", {}),
  adminResetOne: (threadId) =>
    http("POST", "/api/admin-reset/", { thread_id: threadId }),
};
