# Hostinger Node.js deployment

## 1. Prepare the app

Set the API URL in Hostinger **Environment variables** (required at build time):

```env
VITE_API_URL=https://app.trixam.com
```

Or copy locally before building:

```bash
cp .env.production.example .env.production
# edit .env.production if needed
```

## 2. Hostinger hPanel settings

Create a **Node.js Web Application** and use:

| Setting | Value |
|---------|--------|
| Application root | `frontend` (if deploying from repo root) or `.` (if zip is only the frontend folder) |
| Node.js version | 20.x |
| Install command | `npm install` |
| Build command | `npm run build` |
| Start command | `npm start` |

Add environment variable:

```env
VITE_API_URL=https://app.trixam.com
```

`PORT` is assigned by Hostinger automatically — do not hardcode it.

## 3. Deploy via zip upload

Zip the **frontend** folder contents:

- Include: `package.json`, `package-lock.json`, `src/`, `public/`, `index.html`, `vite.config.js`
- Exclude: `node_modules/`, `dist/`

Upload in hPanel → extract → run deploy.

## 4. Deploy via GitHub (recommended)

1. Connect your GitHub repo in Hostinger Node.js deploy
2. Set application root to `frontend`
3. Use the build/start commands above
4. Add `VITE_API_URL` in the Hostinger env panel

## 5. Connect trixam.com

In Hostinger: **Domains** → attach `trixam.com` to this Node app → enable SSL.

## 6. Verify

1. Open `https://trixam.com` — dashboard loads
2. Browser DevTools → Network — API calls go to `https://app.trixam.com/api/...`
3. Refresh `https://trixam.com/terms` — should not 404 (`serve -s` handles SPA routes)

## Local production test

```bash
npm install
cp .env.production.example .env.production
npm run build
npm start
```

Open `http://localhost:4173`
