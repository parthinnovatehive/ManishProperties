# 🔐 Google OAuth Setup Guide — Manish Properties

> Based on full analysis of the codebase. Your project already has all the code ready — you just need to configure Google Cloud Console correctly.

---

## How Your Project Uses Google OAuth

Your project uses the **`@react-oauth/google`** library with the **Implicit Flow** (no redirect URIs needed on the frontend side). Here's the flow:

1. User clicks "Continue with Google" on `/auth/login` or `/auth/register`
2. A Google popup opens → user picks their Google account
3. Google returns an **access token** directly to the browser (implicit flow)
4. Your frontend sends this token to your backend (`POST /api/auth/google-login`)
5. Backend verifies the token with Google's API using your **Client ID** and **Client Secret**

### Key files involved:
| File | Role |
|------|------|
| [`GoogleOAuthWrapper.tsx`](file:///c:/Users/Admin/Desktop/All%20websites/InnovateHive/RE%20deployed%20VPS/ManishProperties/frontend/components/auth/GoogleOAuthWrapper.tsx) | Wraps entire app with Google OAuth Provider |
| [`useGoogleAuth.ts`](file:///c:/Users/Admin/Desktop/All%20websites/InnovateHive/RE%20deployed%20VPS/ManishProperties/frontend/hooks/useGoogleAuth.ts) | Custom hook that handles login/register flow |
| [`auth-page.tsx`](file:///c:/Users/Admin/Desktop/All%20websites/InnovateHive/RE%20deployed%20VPS/ManishProperties/frontend/components/forms/auth-page.tsx) | Login/Register UI that calls the hook |
| [`auth.py`](file:///c:/Users/Admin/Desktop/All%20websites/InnovateHive/RE%20deployed%20VPS/ManishProperties/backend/routes/auth.py) | Backend routes: `/google-login` and `/google-register` |

---

## Step-by-Step Setup in Google Cloud Console

### Step 1: Open Your Existing Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the **project dropdown** at the top → select your existing project (the one with Places API enabled)

---

### Step 2: Configure the OAuth Consent Screen

1. In the left sidebar: **APIs & Services** → **OAuth consent screen**
2. If not already set up:
   - Select **External** → Click **Create**
   - Fill in:
     - **App Name:** `Manish Properties`
     - **User Support Email:** Your email
     - **Developer Contact Email:** Your email
   - Click **Save and Continue** through the remaining screens (Scopes, Test Users)
3. **IMPORTANT:** Once done, click **PUBLISH APP** to move out of "Testing" mode. Otherwise, only test users can log in and everyone else will see a scary warning.

---

### Step 3: Create OAuth 2.0 Credentials

1. In the left sidebar: **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. **Application type:** `Web application`
4. **Name:** `Manish Properties Web Client`

---

### Step 4: Add the Exact URLs

This is the critical step. Since your project uses the **implicit flow** (popup-based, no server-side redirect), you only need **Authorized JavaScript Origins**. No redirect URIs are needed for the frontend OAuth flow.

#### ✅ Authorized JavaScript Origins

Click **+ ADD URI** and add these **4 URIs** one by one:

| # | URI | Purpose |
|---|-----|---------|
| 1 | `http://localhost:3000` | Local development (Next.js dev server) |
| 2 | `http://localhost:5000` | Local backend (Flask dev server) |
| 3 | `https://manishpropertyconsultant.in` | Live frontend domain |
| 4 | `https://www.manishpropertyconsultant.in` | Live frontend domain (www variant) |
| 5 | `https://api.manishpropertyconsultant.in` | Live backend API domain |

> [!WARNING]
> **Do NOT add trailing slashes.** Google will reject `http://localhost:3000/` — it must be `http://localhost:3000`

#### ✅ Authorized Redirect URIs

Even though the implicit flow doesn't technically use redirect URIs, some Google flows still need them. Add these to be safe:

| # | URI | Purpose |
|---|-----|---------|
| 1 | `http://localhost:3000` | Local dev fallback |
| 2 | `https://manishpropertyconsultant.in` | Production fallback |
| 3 | `https://api.manishpropertyconsultant.in` | Backend fallback |

---

### Step 5: Click Create & Copy Your Keys

After clicking **Create**, a popup shows:
- **Client ID** (looks like `1039372182218-xxxxx.apps.googleusercontent.com`)
- **Client Secret** (looks like `GOCSPX-xxxxx`)

Your project already has these configured:

**Frontend** ([`.env.local`](file:///c:/Users/Admin/Desktop/All%20websites/InnovateHive/RE%20deployed%20VPS/ManishProperties/frontend/.env.local)):
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

**Backend** ([`.env`](file:///c:/Users/Admin/Desktop/All%20websites/InnovateHive/RE%20deployed%20VPS/ManishProperties/backend/.env)):
```env
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

> [!IMPORTANT]
> Both frontend and backend must use the **same Client ID**. Only the backend needs the Client Secret.

---

### Step 6: Publish the App

1. Go back to **APIs & Services** → **OAuth consent screen**
2. Under "Publishing status", click **PUBLISH APP**
3. Confirm on the popup

Without this, users will see an "Unverified app" warning and only test users you've explicitly added can log in.

---

## Quick Checklist

- [ ] OAuth consent screen configured with app name "Manish Properties"
- [ ] OAuth consent screen is **Published** (not in Testing)
- [ ] OAuth 2.0 Client ID created as **Web application**
- [ ] Added `http://localhost:3000` to Authorized JavaScript Origins
- [ ] Added `http://localhost:5000` to Authorized JavaScript Origins
- [ ] Added `https://manishpropertyconsultant.in` to Authorized JavaScript Origins
- [ ] Added `https://www.manishpropertyconsultant.in` to Authorized JavaScript Origins
- [ ] Added `https://api.manishpropertyconsultant.in` to Authorized JavaScript Origins
- [ ] Added `http://localhost:3000` to Authorized Redirect URIs
- [ ] Added `https://manishpropertyconsultant.in` to Authorized Redirect URIs
- [ ] Added `https://api.manishpropertyconsultant.in` to Authorized Redirect URIs
- [ ] Client ID matches in both frontend `.env.local` and backend `.env`
- [ ] Client Secret is set in backend `.env`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Popup opens but shows "Error 400: redirect_uri_mismatch" | Double-check Authorized JavaScript Origins — exact match, no trailing slash |
| Popup opens but immediately closes | Client ID is wrong or not set in `.env.local` |
| "Access blocked: This app's request is invalid" | Your domain is not in Authorized JavaScript Origins |
| Login works on localhost but not on production | Add `https://manishpropertyconsultant.in` to Origins |
| "This app isn't verified" warning | Publish the OAuth consent screen (Step 6) |
