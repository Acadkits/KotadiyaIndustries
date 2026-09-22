# Backend

This folder contains the standalone API server for Render.

## Environment variables

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `ALLOWED_ORIGINS` — comma-separated frontend origins, for example `https://your-frontend.vercel.app,http://localhost:5173`
- `PORT` — optional, defaults to `3001`

Frontend Vite app:

- `VITE_API_BASE_URL` — backend base URL, for example `https://your-backend.onrender.com`

## Run locally

From the backend folder:

- `npm install`
- `npm run dev`

For Render, set the root directory to `backend` so it installs the backend package only.

## Endpoints

- Public: `/api/public/*`
- Admin: `/api/admin/*`
