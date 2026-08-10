# 🚀 Manish Properties cPanel Deployment Guide

This guide provides the exact steps to deploy the application to your cPanel hosting.

## 🏗️ Architecture Overview
*   **Frontend**: Next.js 15 Standalone Mode (Node.js Application Manager) at `manishpropertyconsultant.in`
*   **Backend**: Flask (Python Application Manager) at `api.manishpropertyconsultant.in`
*   **Database**: Supabase PostgreSQL (Managed externally)
*   **Node Version**: Node >=20 (as specified in `.nvmrc`)

## 📁 1. Automated Deployment Preparation

Deployment is now 100% automated. You do not need to manually copy files.

From your local machine or build server, open your terminal (Windows PowerShell or Linux/macOS bash) in the project root and run the deployment packaging script:

### Windows:
```powershell
.\scripts\build-production.ps1
```

### Linux / macOS:
```bash
./scripts/build-production.sh
```

**What this script does:**
1. Calls `cleanup.py` to remove old builds.
2. Calls `prepare-backend.py` to copy only necessary Python production files.
3. Calls `prepare-frontend.js` to install npm dependencies, build the Next.js standalone app, and package the files.
4. Calls `verify-deployment.py` to ensure all required files are present and no `.env` development secrets have leaked.

Once the script finishes, your fully packaged, cPanel-ready files will be located in the `deploy_packages/` directory.

---

## 🛠️ Step 2: Backend Deployment (Python API)

1. **Subdomain Setup**
   *   In cPanel, go to **Domains** or **Subdomains**.
   *   Create `api.manishpropertyconsultant.in` with Document Root `/home/esaptars/public_html/api.manishpropertyconsultant.in`.

2. **Upload Files**
   *   Upload the contents of `deploy_packages/backend` to `/home/esaptars/manish_backend/` (create the folder outside `public_html`).

3. **Create Python Application**
   *   Go to **Python Application Manager** in cPanel.
   *   Click **Create Application**.
   *   **Python version**: `3.12.13+` (or latest available)
   *   **Application root**: `manish_backend`
   *   **Application URL**: `api.manishpropertyconsultant.in`
   *   **Application startup file**: `passenger_wsgi.py`
   *   **Application Entry point**: `application`
   *   **Passenger log file**: `/home/esaptars/logs/manish_backend.log` (create the `logs` folder if missing)

4. **Environment Variables**
   Add these in the cPanel Python App Manager UI (do not upload `.env`):
   *   `FLASK_ENV=production`
   *   `PORT=5000`
   *   `SECRET_KEY=<generate a random 32+ char string>`
   *   `JWT_SECRET_KEY=<generate a random 32+ char string>`
   *   `CORS_ORIGINS=https://manishpropertyconsultant.in,https://www.manishpropertyconsultant.in`
   *   `DATA_BACKEND=supabase`
   *   `SUPABASE_URL=<your-supabase-url>`
   *   `SUPABASE_KEY=<your-anon-key>`
   *   `SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>`

5. **Install Requirements & Start**
   *   Click **Save**.
   *   At the top of the app settings, copy the virtual environment activation command (e.g., `source /home/esaptars/virtualenv/manish_backend/3.12/bin/activate`).
   *   Open **Terminal** in cPanel or SSH into your server.
   *   Run the copied activation command.
   *   Run: `cd /home/esaptars/manish_backend && pip install -r requirements.txt`
   *   Go back to Python App Manager and click **Restart**.

6. **Verify Backend**
   *   Visit `https://api.manishpropertyconsultant.in/health` in your browser. You should see `{"status":"healthy",...}`.

---

## 🎨 Step 3: Frontend Deployment (Next.js)

1. **Upload Files**
   *   Upload the contents of `deploy_packages/frontend` to `/home/esaptars/manish_frontend/`.

2. **Create Node.js Application**
   *   Go to **Node.js Application Manager** in cPanel.
   *   Click **Create Application**.
   *   **Node.js version**: `20.x` (Requires Node >= 20)
   *   **Application mode**: `Production`
   *   **Application root**: `manish_frontend`
   *   **Application URL**: `manishpropertyconsultant.in`
   *   **Application startup file**: `app.js`

3. **Install & Start**
   *   Click **Save**.
   *   Click **Run NPM Install** (Wait for it to finish).
   *   Ensure the `NODE_ENV=production` environment variable is set.
   *   Click **Restart**.

4. **Verify Frontend**
   *   Visit `https://manishpropertyconsultant.in/api/health` to verify the frontend health endpoint.
   *   Visit `https://manishpropertyconsultant.in` to verify the main site.

---

## 🔒 Step 4: Security & Post-Deployment

1.  **SSL**: Ensure AutoSSL is active for both domains in cPanel.
2.  **Logs**: Check `/home/esaptars/logs/` for backend application errors if anything goes wrong. Frontend logs will be printed to Passenger's log output as structured JSON.
3.  **Permissions**: Ensure all uploaded files are owned by `esaptars` with permissions `644` for files and `755` for directories.
