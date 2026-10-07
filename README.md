# ATS Score – Resume Checker & Builder

Free ATS resume checker, resume builder and cover letter writer. No accounts and no database:
resumes are stored in the visitor's browser, and the server only processes requests in memory.

```
client/   React + Vite + Bootstrap front end (static site)
server/   Express API: scoring, resume import, PDF/DOCX export (stateless)
```

## Run locally

Requires Node.js 20+.

```bash
cd server && npm install && cp .env.example .env && npm run dev   # http://localhost:5000
cd client && npm install && cp .env.example .env && npm run dev   # http://localhost:5173
```

Useful commands (in `client/`): `npm run lint`, `npm run build`, `npm run preview`.

## Deploy (free tiers)

Deploy the **server first**, because the client needs its URL.

### 1. Server → Render (or Railway)

1. Push this repo to GitHub.
2. On [render.com](https://render.com): **New → Web Service**, pick the repo.
3. Settings:
   - Root directory: `server`
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment variables: `NODE_ENV=production` and `CLIENT_ORIGIN` = your client URL from step 2
     (you can add it after the client is live; comma-separate several URLs).
4. Check `https://<your-server>/health` returns `{"ok":true}`.

Free Render services sleep after inactivity, so the first request after a while can take ~30–60 seconds.

### 2. Client → Vercel (or Netlify)

**Netlify:** `netlify.toml` already sets the base directory (`client`), build command and publish
directory, so just import the repo and add the environment variables below under
*Site configuration → Environment variables*. If you set build options in the Netlify UI, clear
them so they don't override the file.

**Vercel:**

1. On [vercel.com](https://vercel.com): **Add New → Project**, pick the repo.
2. Settings:
   - Root directory: `client`
   - Framework preset: Vite (build command `npm run build`, output `dist`)
   - Environment variables (see `client/.env.example`):
     - `VITE_API_BASE_URL` = your server URL from step 1
     - `VITE_SITE_URL` = your client URL (for the sitemap and social previews)
     - `VITE_CONTACT_EMAIL` = address for the Contact page (optional)
     - `VITE_ANALYTICS_PROVIDER` / `VITE_ANALYTICS_SITE_ID` (optional, see below)
3. Deploy, then set `CLIENT_ORIGIN` on the server to this URL and redeploy the server.

`client/vercel.json` and `client/public/_redirects` (Netlify) send in-app links such as
`/builder/…` to the app, so refreshing those pages works.

Vite bakes `VITE_*` values in at build time: after changing them, redeploy the client.

### 3. After deploying

- Submit `https://<your-site>/sitemap.xml` in [Google Search Console](https://search.google.com/search-console).
- Paste your URL into a LinkedIn or WhatsApp message to check the share preview.

## Analytics (optional)

Off unless configured. Free option: [Umami Cloud](https://cloud.umami.is) Hobby plan. Create a website
there and set `VITE_ANALYTICS_PROVIDER=umami` and `VITE_ANALYTICS_SITE_ID=<website id>`.
GoatCounter and Plausible are also supported. Only page paths and feature events are sent, never
resume content; Do Not Track is respected and visitors can opt out on the Privacy page.

## Server protections

- CORS: only origins in `CLIENT_ORIGIN` may call the API.
- Rate limits per visitor: 15 file uploads and 60 other requests per minute.
- Uploads: PDF/DOCX/TXT, max 5 MB, processed in memory and never written to disk.

## Where things live

| What | File |
|---|---|
| ATS scoring rules | `server/services/atsScorer.js` |
| Target-role keyword lists | `server/content/roles.js` |
| Resume import parser | `server/services/resumeParser.js` |
| PDF/DOCX templates | `server/services/templates.js` (+ `client/src/content/templates.js`, keep in sync) |
| Writing tips & summary templates | `client/src/content/writingTips.js` |
| Guides (help articles) | `client/src/content/guides.js` |
| Page titles & descriptions | `client/src/content/seo.js` |
| Landing page sections | `client/src/pages/Home.jsx`, `client/src/components/LandingSections.jsx` |
| Theme (colours, fonts, radii) | `client/src/styles/theme.scss`, `client/src/index.css` |
