# C-Vault UI

React + Vite frontend for the Share → Import → Vault journey.

## Env

```
VITE_API_BASE_URL=http://localhost:3000
```

Swagger: `{BASE_URL}/api/docs`

## Routes

| Path | Screen |
|------|--------|
| `/` | Dashboard — `GET /benefits?sort=&category=` |
| `/ask` | Ask results — from `POST /benefits/ask` |
| `/benefits/:id` | Offer details — `GET /benefits/:id` |
| `/import/image` | Image extract → save |
| `/import/text` | Text import |
| `/share` | Android Share Target → import |

## Run

```bash
npm install
npm run dev
```
