# BachatKhata — PWA Share Target Proof of Concept

Minimal React + Vite + TypeScript Progressive Web App used to answer **one** question:

> Can Google Pay share coupon text directly into our installed PWA?

This project does **not** include a real dashboard, coupon parsing, auth, backend, or APIs.
Success means: Google Pay → Share → **BachatKhata** appears in the Android Share Sheet → shared text is shown on `/share`.

## Stack

- React + TypeScript
- Vite
- `vite-plugin-pwa` (custom service worker via `injectManifest`)
- React Router (two routes only: `/` and `/share`)

## Routes

| Path     | Purpose                                      |
|----------|----------------------------------------------|
| `/`      | Home — install CTA + install status          |
| `/share` | Share Target receiver — displays payload     |

## How to run locally

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

Notes:

- Service worker registration is enabled in dev (`devOptions.enabled`).
- Android Share Sheet verification **will not** work reliably against `localhost`. Use a public HTTPS deploy (Vercel) for the real test.
- You can still manually open `/share?text=hello&url=https://example.com` to preview the UI.

## How to build

```bash
npm run build
```

Production assets are written to `dist/`.

Preview the production build locally:

```bash
npm run preview
```

## How to deploy on Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts. Framework preset: **Vite**. Build command: `npm run build`. Output: `dist`.

### Option B — GitHub integration

1. Push this repo to GitHub.
2. Import the repo in the [Vercel dashboard](https://vercel.com/new).
3. Keep defaults (Vite). Deploy.
4. Open the HTTPS URL Vercel assigns (required for installable PWAs).

`vercel.json` is included so SPA deep links (including `/share`) rewrite to `index.html`. The installed service worker still intercepts Share Target **POST** `/share` before the network.

## How to install the PWA on Android

1. Open the **HTTPS** deployment in **Chrome** on Android.
2. Wait until the app is installable (manifest + service worker + icons OK).
3. Either:
   - Tap **Install BachatKhata** on the home page, or
   - Chrome menu → **Install app** / **Add to Home screen**.
4. Launch BachatKhata from the home screen (standalone window).
5. Confirm Installation Status shows installed / standalone.

## How to verify BachatKhata appears in the Android Share Sheet

1. Install BachatKhata as above (Share Target only applies to **installed** PWAs).
2. Open **Google Pay**.
3. Open a coupon / offer / text you can share.
4. Tap **Share**.
5. In the Android Share Sheet, look for **BachatKhata**.
6. Share into BachatKhata.
7. The app should open `/share` and show:
   - Received Text
   - Received URL
   - Received Files Count
   - Raw Payload (readonly textarea)
8. If nothing arrived, the page shows: `No shared content received.`

### Debugging tips

- Chrome on desktop: `chrome://inspect` → inspect the Android tab / WebView and watch console logs prefixed with `[BachatKhata PoC]` and `[SW]`.
- Expected logs include: Install Prompt Available, App Installed, Share Payload, Navigation Events.
- Confirm the live manifest contains `share_target` (open `/manifest.webmanifest` on the deployed site).
- After redeploys, close all BachatKhata tasks and reopen from the home screen so the updated service worker activates.

## Project layout

```
src/
  components/     InstallButton, SharePayloadDisplay
  hooks/          useInstallPrompt, useSharePayload
  pages/          HomePage, SharePage
  types/          share payload types
  utils/          console logger
  sw.ts           Share Target POST interceptor + precache
public/icons/     Placeholder PWA icons (192 / 512, maskable)
```

## Manifest highlights

- Name / Short name: `BachatKhata`
- Description: `AI Financial Memory Agent`
- Display: `standalone`
- Theme color: `#4F46E5`
- Background: `#ffffff`
- `share_target.action`: `/share` (POST `multipart/form-data`)

## Out of scope (intentionally)

- Real BachatKhata dashboard
- Coupon parsing / NLP
- Backend or database
- Authentication
- Redux / API calls
