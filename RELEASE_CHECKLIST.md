# ✅ Production Release Checklist

Run through this checklist immediately after deploying to cPanel to verify full system functionality.

## 1. Infrastructure & Security
- [ ] Both domains (`manishpropertyconsultant.in` and `api.manishpropertyconsultant.in`) have valid SSL certificates.
- [ ] Navigating to `http://` redirects to `https://`.
- [ ] No exposed `.env` files accessible via browser.
- [ ] API routes enforce CORS correctly (reject cross-origin requests from unauthorized domains).
- [ ] `https://api.manishpropertyconsultant.in/health` returns `200 OK`.

## 2. Authentication Flow
- [ ] User can register via email/password.
- [ ] Agent can register via email/password (Account goes to 'PENDING').
- [ ] User can log in with Google OAuth.
- [ ] Agent can log in with Google OAuth.
- [ ] JWT token is stored securely in cookies/localStorage.
- [ ] Logout clears all tokens and redirects properly.

## 3. Data Integrity & Forms
- [ ] Homepage fetches and displays active subareas.
- [ ] Properties list page fetches data from Supabase backend.
- [ ] Filtering properties (Buy/Rent, City, Area) works correctly.
- [ ] Single property detail page loads correctly.

## 4. Admin & Agent Capabilities
- [ ] Admin dashboard loads correctly without 403 errors.
- [ ] Admin can approve pending agents.
- [ ] Agent dashboard loads correctly.
- [ ] Agent can create a new property listing.
- [ ] Image upload via Cloudinary works (uploading a property photo).

## 5. Performance & SEO
- [ ] `robots.txt` is accessible at `https://manishpropertyconsultant.in/robots.txt`.
- [ ] `sitemap.xml` is accessible at `https://manishpropertyconsultant.in/sitemap.xml`.
- [ ] Lighthouse score for SEO is 90+.
- [ ] Images are loading via Next.js optimized loader (or Cloudinary directly).
- [ ] Initial page load feels fast (Standalone Node.js response time < 500ms).

## 6. Error Handling
- [ ] Requesting a non-existent route (`/does-not-exist`) shows a proper 404 page, not a raw error stack trace.
- [ ] API errors return standard JSON format without exposing Python stack traces.
