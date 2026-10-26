# Portfolio (React + Vite) with owner-only admin

Live site: `/`   Admin panel: `/admin` (password protected)

## Deploy (GitHub → Vercel)
1. Push this whole folder to a GitHub repo.
2. vercel.com → Add New → Project → import the repo → Deploy (Vite is auto-detected).
3. Project → Settings → Environment Variables → add `ADMIN_PASSWORD` (a long, strong password).
4. Project → Storage → Marketplace → add **Upstash Redis** (free plan) → connect it to this project.
   Vercel adds its connection variables automatically.
5. Redeploy once (Deployments → ⋯ → Redeploy).

## Updating projects
Open `https://YOUR-SITE.vercel.app/admin`, log in, then add / edit / reorder / delete projects
(name, tagline, description, tech stack, live link, screenshot URL, year, emoji, accent color)
and press **Save & publish**. Changes are live instantly — no redeploy.

## Security
Visitors can only read projects. Saving requires `ADMIN_PASSWORD`, checked on the server.
Never put the password in any file.

## Run locally
npm install && npm run dev   (the admin save needs the deployed API; locally it shows the starter projects)
"# port" 
