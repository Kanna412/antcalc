# AntCalc – Antenna Length Calculator

Web port of the Tkinter AntCalc desktop app.

**Stack:**
- **Frontend** – React + Vite + Recharts (deploy on Vercel)
- **Backend** – FastAPI + NumPy (deploy on Render)

---

## Project structure

```
antcalc/
├── backend/
│   ├── main.py            ← FastAPI app (your original physics, unchanged)
│   ├── requirements.txt
│   └── render.yaml        ← Render deploy config
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── api.js          ← points to VITE_API_URL env var
    │   └── components/
    │       ├── Sidebar.jsx
    │       ├── TabViz.jsx
    │       ├── TabSweep.jsx
    │       └── TabReport.jsx
    ├── vercel.json
    └── package.json
```

---

## Step 1 – Deploy backend on Render (free)

1. Push the **whole repo** to GitHub.
2. Go to [render.com](https://render.com) → **New → Web Service**.
3. Connect your GitHub repo, set **Root Directory** to `backend`.
4. Render auto-detects `render.yaml` and configures everything.
5. Click **Deploy**. Note the URL (e.g. `https://antcalc-api.onrender.com`).

> Free Render instances spin down after inactivity; first request after idle takes ~30 s.

---

## Step 2 – Deploy frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project → Import Git Repo**.
2. Set **Root Directory** to `frontend`.
3. Under **Environment Variables**, add:
   ```
   VITE_API_URL = https://antcalc-api.onrender.com
   ```
   (replace with your actual Render URL)
4. Click **Deploy**.

---

## Local development

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# runs on http://localhost:8000
```

**Frontend:**
```bash
cd frontend
npm install
# create .env.local
echo "VITE_API_URL=http://localhost:8000" > .env.local
npm run dev
# runs on http://localhost:5173
```

---

## API reference

### `POST /calculate`
```json
{ "freq_mhz": 146, "velocity_factor": 0.95, "antenna": "dipole" }
```

### `POST /sweep`
```json
{ "start_mhz": 100, "stop_mhz": 500, "velocity_factor": 0.95, "antenna": "dipole" }
```
