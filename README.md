# EstateElite

EstateElite is a premium real estate marketplace project built with Next.js, React, Tailwind CSS, and a separate Express/Prisma backend for admin authentication and property moderation APIs.

The project currently contains a polished public marketplace UI, a listing and property-detail experience powered by local mock data, a multi-step property submission flow, an admin login flow, and an admin dashboard prototype. The backend under `project-root/server` provides JWT-based admin login plus protected property moderation endpoints backed by PostgreSQL through Prisma.

## Table of Contents

- [Project Status](#project-status)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Application Routes](#application-routes)
- [Getting Started](#getting-started)
- [Frontend Scripts](#frontend-scripts)
- [Backend Setup](#backend-setup)
- [Environment Variables](#environment-variables)
- [Backend API](#backend-api)
- [Data Model](#data-model)
- [Important Implementation Notes](#important-implementation-notes)
- [Known Limitations](#known-limitations)
- [Suggested Next Steps](#suggested-next-steps)

## Project Status

This repository is currently a hybrid prototype:

- The public marketplace is mostly frontend-driven and uses mock data from `data/`.
- Saved properties are stored in browser `localStorage`.
- The admin login form calls the backend at `http://localhost:5000/api/admin/login`.
- The admin dashboard UI currently uses internal mock data and local state for moderation actions.
- The backend has real Prisma models and protected admin/property routes, but the frontend dashboard is not fully wired to those API endpoints yet.

## Features

### Public Marketplace

- Premium home page with hero search, stats, property categories, featured properties, trending cities, market insights, testimonials, and owner CTA sections.
- Property listing page with:
  - URL-driven search query support.
  - Filters for property type, listing status, price range, bedrooms, and city.
  - Sort modes for relevance, price, newest, and popularity.
  - Grid/list view toggle.
  - Empty state and pagination UI.
- Property detail page with:
  - Image gallery.
  - Save/share controls.
  - Overview, amenities, and property details tabs.
  - Agent contact panel.
  - Site visit CTA.
  - Similar properties.
  - EMI calculator.
- Multi-step "Post Property" form with listing type, location, details/pricing, amenities, photo upload UI, and listing summary.
- Authentication screen with login/register UI, OTP-style register flow mockup, and admin login integration.
- Responsive navigation with mobile menu and saved-property count.
- Footer with quick links, city links, company links, and social icons.

### Admin Experience

- Admin login route at `/admin/login`.
- Protected dashboard route at `/admin/dashboard` that redirects to login if no `adminToken` is present in `localStorage`.
- Admin dashboard prototype with:
  - Sidebar navigation.
  - Overview stats.
  - Recent submissions.
  - Property moderation tables.
  - Pending, approved, rejected, and featured views.
  - Approve, reject, feature, delete, and view actions using local state.
  - User and agent management views.
  - Toasts, confirm modal, drawer, and placeholder analytics/settings screens.

### Backend API

- Express server on port `5000`.
- CORS and JSON request body parsing.
- Admin login with bcrypt password comparison.
- JWT token creation for authenticated admin sessions.
- Auth middleware for protected routes.
- Prisma-backed admin and property models.
- Protected endpoints for property listing, dummy property creation, approval, rejection, featuring, and deletion.
- Seed script that creates a root admin account.

## Tech Stack

### Frontend

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS 3
- Lucide React icons
- Unsplash remote images

### Backend

- Node.js
- Express 5
- Prisma 5
- PostgreSQL
- bcryptjs
- jsonwebtoken
- cors
- dotenv

## Project Structure

```text
.
+-- app/
|   +-- (public)/
|   |   +-- auth/page.tsx
|   |   +-- layout.tsx
|   |   +-- page.tsx
|   |   +-- properties/page.tsx
|   |   +-- properties/[id]/page.tsx
|   |   +-- submit-property/page.tsx
|   +-- admin/
|   |   +-- dashboard/page.tsx
|   |   +-- layout.tsx
|   |   +-- login/page.tsx
|   +-- globals.css
|   +-- layout.tsx
|   +-- not-found.tsx
+-- components/
|   +-- admin/
|   +-- forms/
|   +-- home/
|   +-- layout/
|   +-- property/
|   +-- ui/
+-- data/
|   +-- categories.ts
|   +-- cities.ts
|   +-- properties.ts
|   +-- testimonials.ts
+-- lib/
|   +-- saved-properties-context.tsx
|   +-- utils.ts
+-- types/
|   +-- content.ts
|   +-- index.ts
|   +-- property.ts
+-- project-root/
|   +-- server/
|       +-- index.js
|       +-- seed.js
|       +-- lib/prisma.js
|       +-- middleware/authMiddleware.js
|       +-- prisma/schema.prisma
|       +-- routes/adminRoutes.js
+-- next.config.ts
+-- package.json
+-- tailwind.config.ts
+-- tsconfig.json
```

## Application Routes

### Public Routes

| Route | Description |
| --- | --- |
| `/` | Home page |
| `/properties` | Property listing and filtering page |
| `/properties/[id]` | Property detail page generated from local property data |
| `/submit-property` | Multi-step property listing form |
| `/auth` | Public sign-in/register UI |

### Admin Routes

| Route | Description |
| --- | --- |
| `/admin/login` | Admin login screen |
| `/admin/dashboard` | Admin dashboard prototype, guarded by `adminToken` in localStorage |

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL database for the backend

### Install Frontend Dependencies

From the repository root:

```bash
npm install
```

### Run the Frontend

```bash
npm run dev
```

The Next.js app will usually start at:

```text
http://localhost:3000
```

### Build the Frontend

```bash
npm run build
```

### Run the Production Frontend Build

```bash
npm run start
```

### Type Check

```bash
npm run type-check
```

## Frontend Scripts

Defined in the root `package.json`:

| Script | Command | Purpose |
| --- | --- | --- |
| `dev` | `next dev` | Starts the Next.js development server |
| `build` | `next build` | Creates a production build |
| `start` | `next start` | Runs the production build |
| `type-check` | `tsc --noEmit` | Runs TypeScript checks without emitting files |

## Backend Setup

The backend lives in:

```text
project-root/server
```

### Install Backend Dependencies

```bash
cd project-root/server
npm install
```

### Create Backend Environment File

Create `project-root/server/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Run Database Migrations

```bash
npx prisma migrate dev
```

### Seed Root Admin

```bash
node seed.js
```

The seed script creates:

```text
username: rootadmin
password: admin123
role: SUPER_ADMIN
```

### Run Backend Server

```bash
node index.js
```

The API starts at:

```text
http://localhost:5000
```

Note: the backend `package.json` currently does not define `dev` or `start` scripts. Run the server directly with `node index.js`, or add scripts later if preferred.

## Environment Variables

### Frontend

The current frontend does not require a `.env.local` file. The admin login request is hardcoded to:

```text
http://localhost:5000/api/admin/login
```

### Backend

Required in `project-root/server/.env`:

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma |

Security note: JWT currently uses the hardcoded secret `SUPER_SECRET_KEY` in the backend source. Move this to an environment variable before production use.

## Backend API

Base URL:

```text
http://localhost:5000
```

### Health Check

```http
GET /
```

Returns:

```text
API Running
```

### Admin Login

```http
POST /api/admin/login
```

Request body:

```json
{
  "username": "rootadmin",
  "password": "admin123"
}
```

Successful response includes:

```json
{
  "success": true,
  "token": "jwt-token",
  "admin": {
    "id": "admin-id",
    "username": "rootadmin",
    "role": "SUPER_ADMIN"
  }
}
```

### Protected Dashboard

```http
GET /api/admin/dashboard
Authorization: Bearer <token>
```

### Get Properties

```http
GET /api/admin/properties
Authorization: Bearer <token>
```

### Create Dummy Property

```http
POST /api/admin/properties/create-dummy
Authorization: Bearer <token>
```

Creates a hardcoded test property in the database.

### Approve Property

```http
PATCH /api/admin/properties/:id/approve
Authorization: Bearer <token>
```

Sets the property status to `APPROVED`.

### Reject Property

```http
PATCH /api/admin/properties/:id/reject
Authorization: Bearer <token>
```

Sets the property status to `REJECTED`.

### Toggle Featured Property

```http
PATCH /api/admin/properties/:id/feature
Authorization: Bearer <token>
```

Toggles the property `featured` flag.

### Delete Property

```http
DELETE /api/admin/properties/:id
Authorization: Bearer <token>
```

Deletes the property from the database.

## Data Model

The Prisma schema currently defines two models.

### Admin

```prisma
model Admin {
  id           String   @id @default(uuid())
  username     String   @unique
  passwordHash String
  role         String
  createdAt    DateTime @default(now())
}
```

### Property

```prisma
model Property {
  id           String   @id @default(uuid())
  title        String
  description  String
  price        Float
  location     String
  propertyType String
  bedrooms     Int
  bathrooms    Int
  area         Float
  featured     Boolean  @default(false)
  status       String   @default("PENDING")
  createdAt    DateTime @default(now())
}
```

## Important Implementation Notes

- `next.config.ts` allows remote images from `images.unsplash.com`.
- The public frontend uses a route group under `app/(public)`.
- Public pages are wrapped by `SiteShell`, which includes the navbar, footer, animation wrapper, and saved-property provider.
- `SavedPropertiesProvider` persists saved listing IDs in `localStorage` under `estateelite:saved-properties`.
- The public property dataset lives in `data/properties.ts`.
- The admin dashboard component lives in `components/admin/EstateEliteAdmin.tsx`.
- Admin dashboard authentication is currently checked client-side by reading `adminToken` from `localStorage`.
- The backend auth middleware expects an `Authorization: Bearer <token>` header.
- The backend uses CommonJS modules.

## Known Limitations

- Public listings are not yet fetched from the backend database.
- The property submission form does not yet submit data to the backend.
- The admin dashboard moderation UI uses mock data instead of the Prisma property endpoints.
- Register, OTP, forgot password, Google, and Facebook flows are UI-only.
- JWT secret is hardcoded and should be moved to `.env`.
- There are no automated tests yet.
- Backend `package.json` has no dedicated `dev` or `start` script yet.
- File upload UI is present, but actual upload/storage is not implemented.
- Pagination controls are currently visual and not backed by paginated data.

## Suggested Next Steps

1. Connect the admin dashboard property table to `/api/admin/properties`.
2. Add a real property creation endpoint and wire it to `/submit-property`.
3. Move the JWT secret into an environment variable.
4. Add backend scripts such as `dev`, `start`, `seed`, and `prisma:migrate`.
5. Add validation for login, property submission, and backend route inputs.
6. Add loading and error states for API-connected UI.
7. Add automated tests for filters, saved properties, auth middleware, and admin moderation routes.
8. Replace hardcoded frontend API URLs with environment-driven configuration.
