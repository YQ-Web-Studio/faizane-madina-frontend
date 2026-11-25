# 🌐 Faizane Madina Masjid Southend | Frontend Deployment Runbook

**Live Domain:** `https://faizanemadinasouthend.co.uk`  
**CNAME:** `public/CNAME`  
**Hosting Provider:** GitHub Pages  
**Backend API URL:** `https://portal.faizanemadinasouthend.co.uk`  
**Framework:** React 19 + Vite

---

## 1. Automated Continuous Deployment (GitHub Actions)

When a Pull Request is approved and merged into `main`:
1. The GitHub Actions workflow `.github/workflows/deploy.yml` runs automatically.
2. It installs dependencies, runs `npm run build`, and deploys the generated `dist/` output to the `gh-pages` branch.
3. The custom domain `faizanemadinasouthend.co.uk` is preserved via the committed `public/CNAME` file.

---

## 2. Manual Deployment Option

If needed, the developer can deploy manually from their local machine:
```bash
npm run deploy
```
*(This runs `predeploy` which compiles `npm run build` and executes `gh-pages -d dist` to push directly to the `gh-pages` branch).*

---

## 3. Environment Variables

- `VITE_STRAPI_API_URL`: Base URL of the Strapi backend instance.
  - Development (`.env.development`): `http://localhost:1337`
  - Production (`.env.production`): `https://portal.faizanemadinasouthend.co.uk`

---

## 4. DNS Configuration

The custom domain is configured with the following DNS records pointing to GitHub Pages:
- **A Records:**
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`
- **HTTPS Enforcement:** Enabled in repository Settings > Pages.
