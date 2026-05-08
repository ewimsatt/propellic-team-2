# CRO Auditor — Backend (Engineer A)

Express + TypeScript API that audits URLs against travel-industry CRO benchmarks.

## Setup

```bash
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
npm install
```

## Development

```bash
npm run dev      # starts on http://localhost:3001
```

## Testing

```bash
npm test
```

## API

### POST /api/audit

```json
{ "url": "https://example.com", "goalType": "direct_booking" }
```

Returns `AuditResult` JSON.

### GET /health

Returns `{ "status": "ok" }`.

## Mock data

`mock/audit-response.json` — realistic sample output for frontend development without a live backend.
