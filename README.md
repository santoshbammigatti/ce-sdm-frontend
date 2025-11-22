# CE SDM Summarizer – Frontend (React + Vite)

This is the React UI for the CE workflow demo:

**raw email threads → NLP draft → human edit → approval → usable output**

It talks to the Django/DRF backend you set up in the companion repo.

---

## 1) Stack (what & why)

- **React 18** (functional components, hooks)
- **Vite** (fast dev server & build)
- **Plain CSS** (no framework; simple, dark theme)
- **Fetch API** (centralized in `src/api/client.js`)

Project layout:
```
src/
  api/
    client.js          # HTTP wrapper to call the backend
  components/
    ThreadList.jsx     # left pane list of threads
    ThreadDetail.jsx   # messages panel + wires to summary panel
    SummaryPanel.jsx   # summarize → edit → approve → post-to-CRM
  App.jsx              # app shell + toolbar (Refresh / Reset)
  main.jsx             # bootstrap
  index.css            # minimal styling
.env.local             # VITE_API_BASE_URL=http://localhost:8000
```

---

## 2) Prerequisites

- Node.js 18+
- The **backend** running locally (default: `http://localhost:8000`) or on Railway.
- CORS enabled on backend (dev):
  ```python
  # config/settings.py
  CORS_ALLOW_ALL_ORIGINS = True
  ```

---

## 3) Local setup

```bash
# from your workspace
npm create vite@latest ce-sdm-frontend -- --template react
cd ce-sdm-frontend
npm install

# Copy example environment file
cp .env.example .env

# For local development (default):
# .env will use: VITE_API_BASE_URL=http://localhost:8000

# For Railway production:
# Edit .env and set: VITE_API_BASE_URL=https://web-production-432b.up.railway.app

# start
npm run dev
# → http://localhost:5173
```

### Environment Configuration

This project uses different environment files for different scenarios:

- **`.env.development`** - Used automatically in development mode (`npm run dev`)
  - Points to localhost: `http://localhost:8000`
  
- **`.env.production`** - Used automatically in production build (`npm run build`)
  - Points to Railway: `https://web-production-432b.up.railway.app`
  
- **`.env.example`** - Template file (commit to git)
  - Copy this to `.env` to customize your local setup

- **`.env`** or **`.env.local`** - Override for local development (not committed to git)
  - Create this file to override the default settings

To switch between backends:
```bash
# Option 1: Edit .env file
VITE_API_BASE_URL=http://localhost:8000              # for local
VITE_API_BASE_URL=https://web-production-432b.up.railway.app  # for Railway

# Option 2: Let Vite use the default environment files
npm run dev      # uses .env.development (localhost)
npm run build    # uses .env.production (Railway)
```

---

## 4) Features for demo

- **Thread list** (left): loads from `GET /api/threads/`.
- **Thread detail** (middle): shows the raw email messages from `GET /api/threads/:id`.
- **Summary panel** (right):
  - **Generate Draft** → `POST /api/summarize`.
  - **Edit** (agent text area + a couple of fields) → `POST /api/summary/:id/save-edit`.
  - **Approve** (finalize) → `POST /api/summary/:id/approve` (backend also writes an export line to `output/approved_summaries.jsonl`).
  - **Post to CRM** (simulated) → `POST /api/crm/post-note` (backend appends to `output/crm_notes.jsonl`).
  - Shows CRM context (policy, order status, stock) when available from backend.
- **Reset buttons** in the top toolbar:
  - **Reset Current** → `POST /api/admin/reset { thread_id }` (clears only this thread’s Summary).
  - **Reset ALL** → `POST /api/admin/reset {}` (clears all Summaries + truncates export files).

---

## 5) Configuration

- **API base URL:** `VITE_API_BASE_URL` (via `.env.local`).
- **Approver default name:** set in `SummaryPanel.jsx` (defaults to `santosh.b`).

---

## 6) Scripts

```bash
npm run dev     # start Vite dev server
npm run build   # production build to dist/
npm run preview # preview the production build locally
```

---

## 7) Deployment (free tiers)

### Frontend (Vercel/Netlify)
1. Push this folder to GitHub.
2. Import the repo in **Vercel** (or **Netlify**).
3. Set an env var in the dashboard:
   - `VITE_API_BASE_URL=https://<your-backend-host>`
4. Deploy. Your app will be available at `https://<your-fe>.vercel.app`.

### Backend (Render/Railway)
- Deploy the Django app using `gunicorn`.
- In backend settings, restrict CORS to your FE origin, e.g.:
  ```python
  CORS_ALLOW_ALL_ORIGINS = False
  CORS_ALLOWED_ORIGINS = ["https://<your-fe>.vercel.app"]
  ```

---

## 8) How components talk to the API

- `src/api/client.js` centralizes all calls:
  - `listThreads()`, `getThread(id)`
  - `getSummary(id)`, `summarize(id)`
  - `saveEdit(id, summary, fields)`, `approve(id, approver)`
  - `postCrmNote(id, note)`,
  - `adminResetAll()`, `adminResetOne(id)`
- `ThreadDetail.jsx` loads thread + summary, and passes handlers to `SummaryPanel.jsx`.
- `SummaryPanel.jsx` drives the flow (buttons call the API via the handlers).

---

## 9) Troubleshooting

- **Empty summary text after Approve**:
  Ensure `SummaryPanel.jsx` syncs text when `summary` changes (there’s a `useEffect` that prefers `approved_summary → edited_summary → draft_summary`).
- **CORS errors**:
  Backend must allow the FE origin. For dev: `CORS_ALLOW_ALL_ORIGINS=True`. For prod: add your FE URL to `CORS_ALLOWED_ORIGINS`.
- **HTML error response in dev**:
  Add header `Accept: application/json` in API calls or disable DRF Browsable API. The provided `client.js` already requests JSON and throws readable errors.
- **Reset buttons do nothing**:
  Confirm the backend route `POST /api/admin/reset` exists and returns `{status:"ok"}`.

---

## 10) Demo flow (suggested)

1. Click any thread on the left.
2. Click **Generate Draft**.
3. Tweak the text and set **Current Status**.
4. Click **Save Edit**.
5. Click **Approve** (this writes an export line server-side).
6. Click **Post to CRM** (simulated log server-side).
7. Use **Reset Current** or **Reset ALL** and replay.

---

## 11) License & attribution

For interview/demo use. The email thread dataset comes from the exercise prompt; redact or replace before any public posting.
