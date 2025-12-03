# Vokaloka Full‑Stack Application

This repository contains both the **frontend** and **backend** for the Vokaloka language learning app.  The frontend is a TypeScript/React single‑page application built with Vite.  The backend is a simple FastAPI service that exposes endpoints to manage decks, cards, reviews, statistics, and a spaced‑repetition scheduler.

## Project Structure

```
vokaloka-fullstack/
├── backend/
│   ├── main.py           # FastAPI application with SRS logic
│   ├── data.json         # JSON storage for decks, cards and stats
│   └── requirements.txt  # Python dependencies
└── frontend/             # React/TypeScript frontend
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── src/
        ├── App.tsx
        ├── pages/
        │   ├── Home.tsx
        │   ├── Decks.tsx
        │   ├── Review.tsx
        │   └── Stats.tsx
        ├── components/
        │   ├── Flashcard.tsx
        │   └── ...
        ├── services/
        │   └── api.ts
        └── index.css
```

## Getting Started

### Backend

1. Create and activate a Python virtual environment (optional but recommended):

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. Install dependencies:

   ```bash
   pip install -r backend/requirements.txt
   ```

3. Run the API server:

   ```bash
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at `http://localhost:8000`.

### Frontend

1. Install Node.js dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

   Visit `http://localhost:5173` to view the app.  The frontend is configured to proxy API requests to the backend running on port 8000.

### Run Frontend and Backend Together (development)

To run both servers concurrently from the `frontend` workspace, first install Node and Python dependencies, then run the combined dev script from the `frontend` folder:

```powershell
cd frontend
npm install
pip install -r ../backend/requirements.txt
npm run dev
```

Notes:
- The `dev` script uses `concurrently` to launch Vite and the FastAPI server (via `uvicorn`).
- Ensure your Python environment has `uvicorn` installed (it's listed in `backend/requirements.txt`).
- If the backend fails to start, check the Python environment and run the backend manually with:

```powershell
cd backend
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

## Spaced Repetition Scheduler

The backend implements a simplified Spaced Repetition Algorithm inspired by SuperMemo SM‑2.  Each card tracks its ease factor (`EF`), review interval, and number of repetitions.  When a review is submitted, the algorithm updates these values and schedules the next review accordingly.  You can adjust the logic in `backend/main.py` to experiment with more sophisticated models or integrate the official FSRS implementation once available.
