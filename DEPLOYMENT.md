# JanSahayak AI — Production Deployment Guide 🚀
*AI-Powered Multilingual Public Grievance Redressal Platform*
> *"Your Language. Your Voice. Your Government."*

---

## 1. System Architecture Overview

```mermaid
graph TD
    User([Citizen / Officer / Admin]) -->|HTTPS| Frontend[Vercel: React 18 + Vite + Tailwind CSS]
    Frontend -->|REST API & JWT| Backend[Render / Docker: FastAPI + SQLAlchemy 2.0]
    Backend -->|PostgreSQL 5432 / SSL| DB[(Supabase PostgreSQL: 15 Tables)]
    Backend -->|Speech-to-Text & Translation| AI[Sarvam AI / Local Indic Classifier]
```

- **Frontend**: Vite 5 + React 18 + Tailwind CSS + Lucide Icons + Web Audio API Speech Equalizer.
- **Backend**: FastAPI + SQLAlchemy 2.0 + Uvicorn + Pydantic v2.
- **Database**: Cloud Supabase PostgreSQL (`public` schema with 15 relational tables, seeded with 11 Government Departments, Categories, and Demo Accounts).

---

## 2. Cloud Database (Supabase)

Your Supabase PostgreSQL database is **already fully initialized and live**:
- **Project Ref**: `luqbgnizyvfalmtzwdlw`
- **Host**: `db.luqbgnizyvfalmtzwdlw.supabase.co:5432`
- **Database**: `postgres`
- **Tables (15 created)**:
  `users`, `user_roles`, `departments`, `complaint_categories`, `category_department_mappings`, `complaints`, `complaint_assignments`, `complaint_status_history`, `complaint_comments`, `complaint_attachments`, `complaint_feedback`, `notifications`, `notification_preferences`, `ai_processing_logs`, `audit_logs`.

---

## 3. Frontend Deployment (Vercel)

### Step 1: Push Code to GitHub
Ensure your repository is pushed to GitHub.

### Step 2: Import into Vercel
1. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
2. Select your `Jan Sahayak-AI` repository.
3. In **Root Directory**, set: `frontend`.
4. Framework Preset: **Vite**.
5. Build Command: `npm run build`.
6. Output Directory: `dist`.

### Step 3: Configure Environment Variables in Vercel
In Vercel Project Settings > **Environment Variables**, add:
| Variable | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://your-backend-service.onrender.com/api/v1` | URL of your deployed FastAPI backend |

*(The included `frontend/vercel.json` already contains single-page application rewrite rules so subpaths like `/citizen/complaints` and `/track` refresh seamlessly).*

---

## 4. Backend Deployment (Render / Docker)

### Option A: Render (Web Service)
1. Go to [render.com](https://render.com) and select **"New Web Service"**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3` or `Docker`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. In Render > **Environment Variables**, add:
   | Variable | Value |
   | :--- | :--- |
   | `DATABASE_URL` | `postgresql+psycopg2://postgres:Namdasom2257@db.luqbgnizyvfalmtzwdlw.supabase.co:5432/postgres` |
   | `SECRET_KEY` | *(Generate a 32+ character secret string)* |
   | `CORS_ORIGINS` | `["https://your-frontend.vercel.app","http://localhost:5173"]` |
   | `SARVAM_API_KEY` | *(Optional: Sarvam AI API Key for Indic speech & neural translation)* |
   | `PYTHON_VERSION` | `3.11.9` |

### Option B: Docker Container (Any Cloud Host)
You can build and run the included `backend/Dockerfile`:
```bash
docker build -t jansahayak-backend ./backend
docker run -p 8000:8000 \
  -e DATABASE_URL="postgresql+psycopg2://postgres:Namdasom2257@db.luqbgnizyvfalmtzwdlw.supabase.co:5432/postgres" \
  -e SECRET_KEY="your-secret-key" \
  jansahayak-backend
```

---

## 5. Pre-Configured Demo Accounts

Use these accounts to test all 4 government portal roles on production:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@jansahayak.gov.in` | `CitizenPassword@2026` | File complaints, live audio recording, track status |
| **Field Officer** | `officer.water@jansahayak.gov.in` | `StaffPassword@2026` | View assigned department tickets, update status, add comments |
| **Department Head** | `head.water@jansahayak.gov.in` | `StaffPassword@2026` | Department SLA metrics, escalate overdue grievances |
| **System Admin** | `admin@jansahayak.gov.in` | `AdminPassword@2026` | Platform analytics, manage departments, view audit logs |

---

## 6. Verification & Smoke Test Checklist

Once deployed, verify your live system with these checks:
- [x] **API Health**: `GET /health` returns `{"status": "healthy"}`.
- [x] **Database Readiness**: `GET /ready` returns `{"status": "ready", "database": "connected"}`.
- [x] **Citizen Grievance Submission**: Submit a complaint with voice recording; verify ticket ID (e.g. `JSA-2026-XXXXXX`) generates and saves to Supabase.
- [x] **Public Tracking**: Visit `/track?ticket=JSA-2026-XXXXXX` and verify non-PII timeline updates.
- [x] **SLA Countdown**: Check that high-priority complaints reflect the 48-hour SLA deadline.
