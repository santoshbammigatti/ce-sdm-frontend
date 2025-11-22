# CE SDM Summarizer – Frontend (React + Vite)

This is the React UI for the CE workflow demo:

**raw email threads → NLP draft → human edit → approval → usable output**

It talks to the Django/DRF backend you set up in the companion repo.

---

## 1) Stack (what & why)

- **React 18** (functional components, hooks, Context API)
- **Vite** (fast dev server & build)
- **Plain CSS** (no framework; dark/light theme with CSS variables)
- **Fetch API** (centralized in `src/api/client.js`)
- **Theme System** (localStorage + system preference detection)

Project layout:
```
src/
  api/
    client.js          # HTTP wrapper to call the backend
  components/
    ThreadList.jsx     # left pane list of threads
    ThreadDetail.jsx   # messages panel + wires to summary panel
    SummaryPanel.jsx   # summarize → edit → approve → post-to-CRM
    Spinner.jsx        # elegant loading spinner component
    ThemeToggle.jsx    # dark/light mode toggle button
    Modal.jsx          # confirmation dialogs
    Toast.jsx          # notification toasts
  context/
    ThemeContext.jsx   # theme state management
  App.jsx              # app shell + toolbar (Refresh / Reset)
  main.jsx             # bootstrap with ThemeProvider
  index.css            # theming with CSS variables
.env.development       # VITE_API_BASE_URL=http://localhost:8000
.env.production        # VITE_API_BASE_URL=https://web-production-432b.up.railway.app
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

## 4) Features

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

## 7) Deployment Strategy

### **Current Production Setup**

**Frontend:** Netlify (Continuous Deployment)  
**Live URL:** https://dancing-kashata-38d6d1.netlify.app

**Backend:** Railway  
**API URL:** https://web-production-432b.up.railway.app

### **Deployment Process**

#### **Frontend (Netlify) - Automated CD**

1. **Initial Setup:**
   ```bash
   # Already configured with netlify.toml
   # Automatic deployments enabled from GitHub main branch
   ```

2. **Environment Variables (Set in Netlify Dashboard):**
   - `VITE_API_BASE_URL` = `https://web-production-432b.up.railway.app`
   - `NODE_VERSION` = `18` (specified in `.nvmrc`)

3. **Continuous Deployment Flow:**
   - Push code to `main` branch
   - Netlify automatically detects changes
   - Runs `npm run build` 
   - Deploys `dist/` folder to CDN
   - Site updates in ~2-3 minutes

4. **Build Configuration (netlify.toml):**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

#### **Backend (Railway)**

1. **CORS Configuration Required:**
   ```python
   # config/settings.py
   CORS_ALLOWED_ORIGINS = [
       'http://localhost:5173',           # Local development
       'https://dancing-kashata-38d6d1.netlify.app',  # Production
   ]
   ```

2. **Initial Data Setup:**
   ```bash
   # Run once after deploying backend
   curl -X POST https://web-production-432b.up.railway.app/api/admin/ingest/
   ```

3. **Environment Variables on Railway:**
   - `USE_LLM` = `True`
   - `HF_API_TOKEN` = `<your-huggingface-token>` (or Groq API key)
   - `DEBUG` = `False` (for production)
   - `DATABASE_URL` (auto-configured by Railway)

---

## 8) LLM Token Setup for Summary Generation

### **Getting a Groq API Token (Free Tier)**

**Sign Up for Groq:**
   - Go to https://console.groq.com/
   - Create a free account
   - Navigate to **API Keys** section
   - Click **Create API Key**
   - Copy your token (starts with `gsk_...`)


### **Using the Token in the App**

**Per-Request (Current Implementation)**
- Enter your LLM token in the **"LLM Token"** field in the toolbar
- Token is sent with each summarization request
- More secure (token not stored in backend)
- Backend uses this token automatically
- Users don't need to provide tokens

### **Token Pricing & Limits**

| Provider | Free Tier | Rate Limits |
|----------|-----------|-------------|
| **Groq** | Free | 30 requests/min, 6000 tokens/min |

---

## 9) Long-Term Production Strategy

### **Security Enhancements**

1. **Authentication & Authorization**
   - Implement JWT-based auth or OAuth 2.0
   - Add user registration/login
   - Role-based access control (admin, agent, viewer)

2. **API Security**
   - Rate limiting (prevent abuse)
   - API key authentication for backend
   - Input validation and sanitization
   - HTTPS enforcement (already enabled)

3. **Environment Variables**
   - Never commit `.env` files
   - Use secret management (Railway Secrets, Netlify Environment Variables)
   - Rotate API keys regularly

### **Monitoring & Observability**

1. **Error Tracking**
   - Integrate Sentry for error monitoring
   - Set up alerts for critical failures
   - Track API response times

2. **Analytics**
   - Google Analytics or Plausible for user tracking
   - Monitor deployment success/failure
   - Track API usage patterns

3. **Logging**
   - Structured logging with proper levels
   - Centralized log aggregation (e.g., LogDNA, Papertrail)
   - Alert on error thresholds

### **Performance Optimization**

1. **Frontend**
   - Code splitting with React.lazy()
   - Image optimization (WebP format)
   - Bundle size analysis (vite-bundle-visualizer)
   - CDN caching headers (already configured in netlify.toml)

2. **Backend**
   - Database query optimization
   - Response caching with Redis
   - Background job processing (Celery for long-running tasks)
   - Database connection pooling

3. **API Optimization**
   - Implement pagination for thread lists
   - Add response compression (gzip)
   - Use database indexes for frequently queried fields

### **Database & Data Management**

1. **Migrations**
   - Version control all migrations
   - Test migrations in staging before production
   - Backup database before major schema changes

2. **Backups**
   - Automated daily database backups
   - Point-in-time recovery capability
   - Test restore procedures regularly

3. **Data Retention**
   - Define retention policies for old summaries
   - Archive/delete stale data
   - GDPR compliance for user data (if applicable)

### **🔄 CI/CD Improvements**

1. **Automated Testing**
   - Unit tests (Jest for frontend, pytest for backend)
   - Integration tests
   - E2E tests (Playwright/Cypress)
   - Pre-commit hooks (Husky)

2. **Staging Environment**
   - Deploy to staging before production
   - Smoke tests on staging
   - Preview deployments for PRs (Netlify already supports this)

3. **Deployment Pipeline**
   ```
   Push to main → Run tests → Build → Deploy to staging → Manual approval → Deploy to production
   ```

### **Feature Enhancements**

1. **Multi-tenancy**
   - Separate data per organization
   - Workspace/team management
   - User-specific thread isolation

2. **Advanced Features**
   - Real-time collaboration (WebSockets)
   - Email notifications for approvals
   - Export summaries to PDF/CSV
   - Bulk operations on threads

3. **Mobile Support**
   - Responsive design improvements
   - Progressive Web App (PWA) features
   - Offline support with service workers

### **Cost Optimization**

1. **Frontend**
   - Netlify: Free tier supports 100GB bandwidth/month
   - Optimize images and assets to reduce bandwidth

2. **Backend**
   - Railway: $5/month for Starter plan (500 hours)
   - Monitor database size (free tier: 512MB)
   - Consider serverless functions for infrequent operations

3. **LLM Costs**
   - Cache frequently generated summaries
   - Implement token usage tracking
   - Consider switching to cheaper models for drafts

### **🔧 Infrastructure as Code**

1. **Version Control Infrastructure**
   - Store Netlify config in `netlify.toml`
   - Document Railway environment variables
   - Use Docker for consistent environments

2. **Reproducible Deployments**
   - Document all manual setup steps
   - Automate database seeding
   - Create deployment checklists

---

## 10) How components talk to the API

- `src/api/client.js` centralizes all calls:
  - `listThreads()`, `getThread(id)`
  - `getSummary(id)`, `summarize(id)`
  - `saveEdit(id, summary, fields)`, `approve(id, approver)`
  - `postCrmNote(id, note)`,
  - `adminResetAll()`, `adminResetOne(id)`
- `ThreadDetail.jsx` loads thread + summary, and passes handlers to `SummaryPanel.jsx`.
- `SummaryPanel.jsx` drives the flow (buttons call the API via the handlers).

---

## 11) Troubleshooting

- **Empty summary text after Approve**:
  Ensure `SummaryPanel.jsx` syncs text when `summary` changes (there’s a `useEffect` that prefers `approved_summary → edited_summary → draft_summary`).
- **CORS errors**:
  Backend must allow the FE origin. For dev: `CORS_ALLOW_ALL_ORIGINS=True`. For prod: add your FE URL to `CORS_ALLOWED_ORIGINS`.
- **HTML error response in dev**:
  Add header `Accept: application/json` in API calls or disable DRF Browsable API. The provided `client.js` already requests JSON and throws readable errors.
- **Reset buttons do nothing**:
  Confirm the backend route `POST /api/admin/reset` exists and returns `{status:"ok"}`.

---

## 12) Demo flow (suggested)

1. Click any thread on the left.
2. Click **Generate Draft**.
3. Tweak the text and set **Current Status**.
4. Click **Save Edit**.
5. Click **Approve** (this writes an export line server-side).
6. Click **Post to CRM** (simulated log server-side).
7. Use **Reset Current** or **Reset ALL** and replay.

---

## 13) License & Attribution

**For demonstration and portfolio use.**

Please ask before forwarding, using commercially, or publishing this code or dataset publicly.
