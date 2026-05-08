# CRO Auditor — Frontend (Engineer B)

React 18 + Vite + Tailwind CSS UI for the CRO Auditor tool.

## Setup

```bash
npm install
npm run dev   # starts on http://localhost:5173
```

## Mock mode

`src/hooks/useAudit.ts` has `USE_MOCK = true` at the top.  
In mock mode the app loads `mock/audit-response.json` with simulated loading stages — no backend needed.

## Live mode

1. Start the backend: `cd ../engineer-a && npm run dev`
2. Set `USE_MOCK = false` in `src/hooks/useAudit.ts`
3. Run `npm run dev` here — the Vite proxy forwards `/api` calls to `:3001`
