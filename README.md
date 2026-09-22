# Kotadiya Industries

This repo is now split into:

## Frontend
- Root Vite app files
- `src/`
- `public/`
- `index.html`
- `vite.config.ts`

## Backend
- `backend/`
- Standalone Node API for Render

## Keep
- `src/start.ts` because the generated router still references its type
- `src/routeTree.gen.ts` because the router uses it

## Removed or no longer used
- old TanStack Start server entry: `src/server.ts`

## Run locally
- Frontend: `npm run dev`
- Backend: `npm run dev:backend`

## Environment
- Frontend uses `VITE_API_BASE_URL`
- Backend uses `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `ALLOWED_ORIGINS`
