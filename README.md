# EstateElite

EstateElite is a premium real estate marketplace platform featuring a polished, interactive frontend built with **Next.js 15** and **React 19**, integrated with a lightweight and robust **Python Flask API** backend. The system utilizes a flat-file **JSON-based database** with thread-safe file operations for simple, portable, and secure persistence.

The application includes a fully wired-up public marketplace (home, property lists, and detail page views), an authenticated multi-step property submission flow, and an administrative dashboard for property moderation, statistics tracking, and role-based actions.

---

## Table of Contents

- [Project Architecture](#project-architecture)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Directory Structure](#directory-structure)
- [Application Routes](#application-routes)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
- [Environment Variables](#environment-variables)
- [Data Model & Normalization](#data-model--normalization)
- [API Reference](#api-reference)
- [System Synchronization & State](#system-synchronization--state)

---

## Project Architecture

```
                 +-----------------------+
                 |    Public & Admin     |
                 |      Next.js UI       |
                 +-----------+-----------+
                             |
                     apiClient (HTTP/JSON)
                             |
                             v
                 +-----------+-----------+
                 |   Python Flask API    |
                 +-----------+-----------+
                             |
                   json_service (RLock)
                             |
                             v
                 +-----------+-----------+
                 |    JSON DB Storage    |
                 |  (database/*.json)    |
                 +-----------------------+
```

EstateElite is designed with a decoupled frontend-backend architecture:
1. **Frontend Layer**: Built using the Next.js App Router. Communicates with the backend using a centralized, type-safe custom API client (`apiClient`) with built-in token-handling and timed requests.
2. **Backend API Layer**: Built on Python/Flask. Exposes REST blueprints with token-based security and custom permission middleware.
3. **Database Layer**: Comprises independent flat-file JSON collections. Read/write concurrency is managed securely on the backend using Python's `threading.RLock`.

---

## Key Features

### Public Marketplace
- **Premium Home Page**: Features a hero search, property category listings, featured homes, trending destinations, testimonials, and dynamic animation transitions.
- **Interactive Listings Page**: Supported by URL search parameters. Features real-time multi-criteria filtering (by location state/city/area, price range, bedrooms, property type) and grid/list view toggling.
- **Detailed Property Views**: Displays photo galleries, agent contact cards, site visit schedulers, a real EMI calculator widget, and a list of similar properties.
- **Saved Properties**: Allows users to save properties locally with count badge indicators, persistent in `localStorage`.
- **Public Post Property**: A step-by-step form (listing details, location selectors, custom amenities checklist, photo upload mockup, and summary verification) that creates a `PENDING` property moderation record on the backend.
- **Unified Auth Portal**: Auth screen with sign-in, signup, simulated phone OTP registration/login verification, and Google OAuth UI placeholder.

### Admin & Moderation Experience
- **Central Layout Protection**: Automatic route guarding checks authentication state client-side. Invalid or expired tokens trigger redirection to the Admin Login path.
- **Dashboard Hub**: Displays real-time statistics (total listings, pending reviews, approved, rejected, and featured properties) based directly on backend status metrics.
- **Property Moderation Portal**:
  - Filterable listings table.
  - Approve, reject (with custom message), and delete capabilities.
  - Optimistic updates: changes reflect immediately in the UI and automatically roll back with an error toast message if the API call fails.
- **User & Agent Management**: Displays accounts registered under `users.json` and `agents.json` with filtering and status breakdown gauges.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router) & React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3 & Vanilla CSS tokens
- **Icons**: Lucide React
- **Client State**: Centralized services and custom hooks

### Backend
- **Framework**: Python 3.10+ & Flask 3
- **Authentication**: Flask-JWT-Extended
- **Middleware**: Custom Python decorators for role-checking (`@admin_required`, `@role_required`)
- **CORS Handling**: Flask-CORS

### Database
- **Type**: JSON flat-file collections
- **Thread Safety**: Multithreaded safety via standard `threading.RLock`
- **Location**: `/database/*.json`

---

## Directory Structure

```text
.
├── backend/                       # Python Flask API Application
│   ├── app.py                     # App factory & route registrations
│   ├── config.py                  # Configurations & environment loading
│   ├── middleware/                # Custom auth & permissions decorators
│   ├── routes/                    # API route blueprints
│   │   ├── auth.py                # OTP, logins, registrations, token refreshes
│   │   ├── properties.py          # Public submission & admin property moderation
│   │   ├── users.py / agents.py   # Admin management of accounts
│   │   └── messages.py / messages # Core user interactions
│   ├── services/                  # Business logic services
│   │   ├── auth_service.py        # Token issue, password hash checks, OTP storage
│   │   ├── json_service.py        # Thread-safe JSON CRUD operations
│   │   └── property_service.py    # Sanitization, creation & state updates
│   ├── utils/                     # Helpers and request body validators
│   └── requirements.txt           # Python backend dependencies
│
├── database/                      # Persistent JSON files (flat-file DB)
│   ├── properties.json            # Property listing documents
│   ├── users.json                 # Standard user records
│   ├── admins.json                # Admin user credentials (seeded rootadmin)
│   ├── agents.json                # Registered property agents
│   └── (appointments / messages)  # Messaging & booking collections
│
└── frontend/                      # Next.js App Router Frontend
    ├── app/                       # Application Routes & Pages
    │   ├── (public)/              # Public routes (Home, Properties, Submit)
    │   └── admin/                 # Admin routes (Dashboard, Login)
    ├── components/                # Modular React UI components
    │   ├── admin/                 # EstateEliteAdmin dashboard components
    │   ├── forms/                 # SubmitPropertyForm and Auth components
    │   └── ui/                    # Badges, toasts, and buttons
    ├── hooks/                     # Custom React Hooks
    │   └── useAdminProperties.ts  # Properties state, mutations, & optimistic updates
    ├── lib/                       # Utility and API services
    │   ├── api/                   # Core apiClient and route configs
    │   ├── services/              # Property and Authentication client service layers
    │   └── utils/                 # Singleton Toast Manager
    ├── types/                     # Centralized TypeScript declarations
    └── package.json               # Frontend dependencies & npm scripts
```

---

## Application Routes

### Frontend Public Routes
| Route | Description |
| --- | --- |
| `/` | Interactive home page |
| `/properties` | Marketplace listings, search, and dynamic filters |
| `/properties/[id]` | Detailed view page for specific listing |
| `/submit-property` | Property poster workflow (saves as `PENDING`) |
| `/auth` | Public login, signup, and phone OTP verification UI |

### Frontend Admin Routes
| Route | Description |
| --- | --- |
| `/admin/login` | Administrator credentials sign-in portal |
| `/admin/dashboard` | Interactive moderation dashboard (guarded) |

---

## Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **Python**: `v3.10.0` or higher

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend will start at: `http://localhost:3000`

4. Build for production:
   ```bash
   npm run build
   ```

5. Type-check TypeScript files:
   ```bash
   npm run type-check
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   
   # Windows:
   venv\Scripts\activate
   
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the API server:
   ```bash
   python app.py
   ```
   The API server will run at: `http://localhost:5000`

---

## Environment Variables

### Frontend Configuration (`frontend/.env.local`)
Create `.env.local` inside the `frontend/` folder:
```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-oauth-client-id"
JWT_SECRET="your-local-development-jwt-key"
```

### Backend Configuration (`backend/.env`)
Create `.env` inside the `backend/` folder:
```env
SECRET_KEY=change-me-in-production
JWT_SECRET_KEY=change-me-in-production
PORT=5000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

---

## Data Model & Normalization

The JSON database contains distinct schemas that are parsed and normalized on both ends.

### Property Document
Properties in the database support both legacy properties from mocks and real backend submissions through fields normalization (`property_service.py`):
```json
{
  "id": "prop_89b2512a...",
  "title": "Luxury Sea-View Apartment",
  "subtitle": "High-rise tower with panoramic views",
  "description": "Premium 3BHK flat located in Worli...",
  "price": "₹2.85 Cr",
  "priceNum": 28500000.0,
  "city": "Mumbai",
  "location": "Worli, South Mumbai",
  "pincode": "400018",
  "type": "Apartment",
  "listingType": "For Sale",
  "beds": 3,
  "bathrooms": 3,
  "baths": 3,
  "area": 1850,
  "furnishing": "Fully Furnished",
  "amenities": ["Swimming Pool", "Gymnasium", "24/7 Security"],
  "images": ["https://images.unsplash.com/..."],
  "imgs": ["https://images.unsplash.com/..."],
  "image": "https://images.unsplash.com/...",
  "img": "https://images.unsplash.com/...",
  "builder": "Lodha Group",
  "rating": 4.8,
  "reviews": 24,
  "featured": false,
  "isNew": true,
  "status": "APPROVED",
  "moderationStatus": "APPROVED",
  "createdAt": "2026-06-05T06:05:16.101742+00:00",
  "updatedAt": "2026-06-05T06:27:00.262234+00:00"
}
```

### User & Agent Document
```json
{
  "id": "user_74bfd9...",
  "username": "client@estateelite.com",
  "email": "client@estateelite.com",
  "passwordHash": "pbkdf2:sha256:...",
  "role": "USER",
  "name": "Deepak Kumar",
  "phone": "9876543210",
  "savedProperties": ["prop_89b2512a..."],
  "status": "ACTIVE"
}
```

---

## API Reference

### Public API Endpoints
- `GET /` — Health status check.
- `GET /api/public/properties` — Fetch all properties marked as `APPROVED`.
- `GET /api/public/properties/<id>` — Fetch details of a specific approved property.
- `POST /api/public/properties/submit` — Submit a new property listing (defaults to status `PENDING`).
- `GET /api/public/content/cities` — Fetch list of available cities.
- `GET /api/public/content/testimonials` — Get testimonials.

### Authentication Endpoints
- `POST /api/auth/login` — Sign in with email & password. Expects user role verification.
- `POST /api/auth/register` — Standard registration route.
- `POST /api/auth/otp/send` — Triggers a 6-digit verification code to the phone (printed to console logs).
- `POST /api/auth/otp/verify` — Validates the phone OTP.
- `POST /api/auth/refresh` — Issue a fresh JWT access token using the refresh token.
- `POST /api/auth/logout` — Invalidates/logs out the active session.

### Protected Admin & Moderation Endpoints (Requires `Bearer` token)
- `GET /api/admin/properties` — Get all properties (pending, approved, rejected).
- `POST /api/admin/properties/create` — Create a property as an admin action.
- `PATCH /api/admin/properties/<id>/approve` — Change moderation status of property to `APPROVED`.
- `PATCH /api/admin/properties/<id>/reject` — Change moderation status of property to `REJECTED`.
- `PATCH /api/admin/properties/<id>/feature` — Set featured boolean parameter.
- `DELETE /api/admin/properties/<id>` — Delete a property document permanently.

---

## System Synchronization & State

EstateElite implements high-reliability data synchronization patterns in the front-end to ensure structural consistency:
1. **Service Abstraction**: `auth-service`, `property-service`, and `admin-service` separate component view structures from raw apiClient request calls.
2. **Central Hooks**: The `useAdminProperties` hook acts as the dashboard's property store, offering global actions (`approveProperty`, `rejectProperty`, `featureProperty`, `deleteProperty`).
3. **Optimistic Updates & Rollbacks**: Actions like property deletion, status switches, or featured updates run optimistically. The UI updates instantly. If the network drops or backend returns an error code, the hook automatically reverts to the previous snapshot state and notifies the user via toast.
4. **Toast Manager**: A singleton notification service triggers success, info, warning, and error toasts with dismiss indicators.
