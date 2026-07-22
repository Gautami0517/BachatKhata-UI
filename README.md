# BenefitAI — Share → Import → Dashboard

Production-ready vertical slice for the hackathon demo:

**Google Pay → Share → BenefitAI → Import experience → POST /benefits/import → Success → Dashboard**

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- TanStack React Query
- Axios
- Framer Motion
- vite-plugin-pwa (Web Share Target)

## Setup

```bash
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:3000
npm install
```

Start the Nest backend (BachatKhata) on port 3000 with CORS enabled, then:

```bash
npm run dev
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local Vite server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Routes

| Path | Screen |
|------|--------|
| `/` | Dashboard — `GET /benefits?sort=expiring_soon` |
| `/share` | Share Import — auto `POST /benefits/import` |

## Local share simulation

```
http://localhost:5173/share?text=Flat%2038%25%20OFF%20on%20Smart%20Gas%20Leak%20Detector%0AVoucher%20code%3A%20RIPPLESAFEG1
```

## Environment

Only `VITE_API_BASE_URL` must change when the backend is deployed. No other code changes.

## Out of scope

Search, AI Search, Recommendations, Auth, Notifications, Settings, Profile, Public Coupons.
