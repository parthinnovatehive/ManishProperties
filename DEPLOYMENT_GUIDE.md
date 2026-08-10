# EstateElite - Production Deployment Guide

A complete, step-by-step guide to deploying the **EstateElite** full-stack real estate platform to production.

---

## 🏗️ Architecture Summary

| Component | Technology | Recommended Host | Free Tier Available? |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js 15 (App Router) + React 19 + Tailwind CSS | [Vercel](https://vercel.com) | ✅ Yes |
| **Backend API** | Python 3.11 / Flask 3 + Gunicorn + JWT | [Render](https://render.com) or [Railway](https://railway.app) | ✅ Yes |
| **Database** | Thread-safe CSV flat-file engine | Local storage on backend server | ✅ Built-in |
| **Media / Storage** | Cloudinary (Image uploads & transformations) | [Cloudinary](https://cloudinary.com) | ✅ Yes |

---

## 📋 Pre-Deployment Checklist

- [x] Backend CORS origin handler supports wildcard and comma-separated domains
- [x] Dedicated health checks added at `/health` and `/api/health`
- [x] Frontend Next.js production build verified (52/52 routes static/dynamic)
- [x] `remotePatterns` configured for Cloudinary, Google avatars, and cloud hosts
- [x] `.env.example` templates created for frontend and backend

---

## 🚀 Step 1: Deploy Backend on Render (Recommended)

### Option A: Using Render Blueprint (`render.yaml`) — Fastest

1. Push your repository to **GitHub**.
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → **Blueprint**.
4. Select your repository. Render will automatically read [`render.yaml`](render.yaml) and preconfigure:
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `gunicorn backend.wsgi:application`
   - **Health Check Path**: `/health`
   - Auto-generated secure `SECRET_KEY` and `JWT_SECRET_KEY`
5. Click **Apply**.

---

### Option B: Manual Web Service Setup on Render

1. Go to [Render Dashboard](https://dashboard.render.com) → **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `estateelite-api`
   - **Region**: Choose the region closest to your target users (e.g., Singapore, Frankfurt, Oregon).
   - **Branch**: `main`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `gunicorn backend.wsgi:application`
   - **Plan**: `Free`
4. Add **Environment Variables** in the "Environment" tab:
   | Key | Example Value | Description |
   | :--- | :--- | :--- |
   | `SECRET_KEY` | *(Generate a 64-char hex string)* | Flask session security key |
   | `JWT_SECRET_KEY` | *(Generate a 64-char hex string)* | JWT authentication token key |
   | `CORS_ORIGINS` | `https://estateelite.vercel.app,http://localhost:3000` | Allowed frontend domains |
   | `PORT` | `10000` | Port assigned by Render |
   | `PYTHON_VERSION` | `3.11.0` | Python version |
   | `CLOUDINARY_CLOUD_NAME` | *(Optional)* | Your Cloudinary Cloud Name |
   | `CLOUDINARY_API_KEY` | *(Optional)* | Your Cloudinary API Key |
   | `CLOUDINARY_API_SECRET` | *(Optional)* | Your Cloudinary API Secret |
5. Click **Deploy Web Service**.
6. Once deployed, note your backend URL:  
   `https://estateelite-api.onrender.com`

---

## ⚡ Step 2: Deploy Frontend on Vercel

1. Go to [Vercel Dashboard](https://vercel.com) → **Add New...** → **Project**.
2. Import your GitHub repository.
3. In the project configuration modal:
   - **Root Directory**: Click `Edit` and select `frontend` ⚠️ *(CRITICAL)*
   - **Framework Preset**: `Next.js` (automatically detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
4. Expand the **Environment Variables** section and add:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://estateelite-api.onrender.com` | Your backend URL from Step 1 |
   | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | *(Optional)* | Google OAuth Client ID |
5. Click **Deploy**.
6. When deployment finishes, copy your frontend URL:  
   `https://estateelite.vercel.app`

---

## 🔗 Step 3: Link CORS Origins

After Vercel assigns your production frontend URL:
1. Return to your **Render / Railway** dashboard.
2. Under **Environment Variables**, update `CORS_ORIGINS`:
   ```env
   CORS_ORIGINS=https://estateelite.vercel.app,http://localhost:3000
   ```
3. Trigger a redeploy on Render so the new CORS whitelist takes effect.

---

## 🧪 Step 4: Post-Deployment Smoke Test Checklist

- [ ] **Health Endpoint**: Visit `https://your-backend.onrender.com/health` in your browser. Should return:
  ```json
  {"status": "healthy", "service": "EstateElite API", "version": "1.0.0"}
  ```
- [ ] **Frontend Homepage**: Visit `https://your-frontend.vercel.app`. Verify that featured properties, categories, and hero banner render correctly.
- [ ] **Authentication**: Register a new user, log in, and verify JWT token cookies and auth state.
- [ ] **Admin / Agent Portal**: Log in as Admin/Agent and test the dashboard metrics and moderation queues.
- [ ] **Property Search & Filter**: Filter by city, price, and category to confirm search indexing works seamlessly.

---

## 💡 Troubleshooting & Best Practices

### 1. Backend Cold Starts on Free Tier
Render free instances spin down after 15 minutes of inactivity. The first request after sleep takes ~30–50 seconds to boot. To keep your API warm, you can use a free monitoring service like [UptimeRobot](https://uptimerobot.com) to ping `https://your-backend.onrender.com/health` every 10 minutes.

### 2. CORS Errors in Browser Console
If you see `Access to XMLHttpRequest has been blocked by CORS policy`:
- Ensure `NEXT_PUBLIC_API_URL` on Vercel matches your Render backend URL exactly (with `https://` and without trailing slash).
- Ensure `CORS_ORIGINS` on Render includes your Vercel URL (e.g. `https://estateelite.vercel.app`).

### 3. Image Uploads & Cloudinary
For production property images and receipts, configure Cloudinary credentials in Render environment variables. If Cloudinary credentials are omitted, the platform falls back to placeholder images and standard URLs gracefully.
