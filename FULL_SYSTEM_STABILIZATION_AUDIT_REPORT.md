# Full System Stabilization Audit Report

Date: 2026-05-25  
Project: EstateElite real estate platform  
Scope: Current working tree under `C:\Users\oters\Downloads\REP`

## 1. Executive Summary

The current project is not production-stable even though `npm run type-check`, `npm run build`, and backend JavaScript syntax checks pass. The build is green, but the most important admin workflow is still broken by runtime/API-contract issues that TypeScript does not see because `components/admin/EstateEliteAdmin.tsx` starts with `// @ts-nocheck`.

Actual health: hybrid prototype with partial backend integration. The public marketplace, admin dashboard, service layer, backend routes, and Prisma schema do not share a single stable property contract.

Stability level: high risk / not production ready.

Biggest risks:

- Admin moderation actions can show success after failed API calls.
- Frontend moderation services call the wrong HTTP methods for approve/reject/feature.
- Admin UI expects mock-only fields that the backend does not return.
- Public submission now calls an authenticated admin endpoint, so normal public submissions fail.
- The domain model conflates listing status (`For Sale`, `For Rent`, `Sell`) with moderation status (`PENDING`, `APPROVED`, `REJECTED`).
- Previous audit documents contain several claims that are now stale, partially true, or contradicted by current code.

Verification performed:

- Scanned current project file structure with `rg --files`.
- Read all root markdown audit/report/checklist/implementation files.
- Checked frontend build with `npm run type-check` and `npm run build`.
- Checked backend JavaScript syntax with `node --check`.
- Verified Zod v4 behavior for the login validation error path.

## 2. Critical System Breakages

### C1. Moderation actions use POST on the frontend but PATCH on the backend

Severity: critical  
Classification: API contract, workflow, synchronization  
Root cause: Phase 2 service layer introduced `apiClient.post()` calls for moderation while the Express routes remained `router.patch()`.

Evidence:

- `lib/services/property-service.ts:98` posts to `/api/admin/properties/${id}/approve`.
- `lib/services/property-service.ts:115` posts to `/api/admin/properties/${id}/reject`.
- `lib/services/property-service.ts:135` posts to `/api/admin/properties/${id}/feature`.
- `project-root/server/routes/adminRoutes.js:175`, `213`, and `251` define those routes with `router.patch()`.

Affected systems:

- Admin approve workflow.
- Admin reject workflow.
- Featured property toggle.
- Toast/error lifecycle.
- Historical "Not Found" moderation failures.

Impact:

- Real API calls return Express 404 responses like `Cannot POST /api/admin/properties/:id/approve`.
- The API client turns this into a `Not Found` error.
- Properties do not move between PENDING/APPROVED/REJECTED sections because the backend mutation never runs.

Minimal stabilization:

- Change the frontend service methods to `apiClient.patch()` for approve/reject/feature, or add matching POST routes. Prefer changing the frontend because the backend already exposes PATCH semantics.

### C2. Mutation hook swallows failures, so components show success after failed moderation calls

Severity: critical  
Classification: synchronization, state management, workflow  
Root cause: `useAdminProperties` catches mutation errors, sets local error state, but does not rethrow. The calling component then continues as if the mutation succeeded.

Evidence:

- `hooks/useAdminProperties.ts:81-87`, `107-113`, `133-139`, and `156-162` catch errors and never `throw`.
- `components/admin/EstateEliteAdmin.tsx:1044-1050` awaits `approveProperty(id)` and then always shows `toast.success("Property Approved")` if the hook resolves.
- Same pattern exists for reject, feature, and delete at `components/admin/EstateEliteAdmin.tsx:1059-1066`, `1071-1079`, and `1088-1095`.

Affected systems:

- All moderation mutation UX.
- Toast correctness.
- Admin trust in state.

Impact:

- A failed API request can produce both an error toast from mutation state and a success toast from the component.
- This directly matches the historical symptom: success toast shown but property remains pending.

Minimal stabilization:

- Re-throw mutation errors from the hook after setting `mutationState`.
- Keep success toast ownership in one place only: either hook or component, not both.

### C3. Admin dashboard expects mock-only property fields that backend responses do not contain

Severity: critical  
Classification: API contract, state management, frontend/backend drift  
Root cause: The admin UI was designed around `MOCK_PROPERTIES`, then swapped to backend data without a normalization layer or type checking.

Evidence:

- Backend `Property` model has `image`, `images`, `bathrooms`, `reviews`, but no `img`, `baths`, `submittedBy`, `submitterEmail`, `views`, `inquiries`, or `rejectReason`: `project-root/server/prisma/schema.prisma:23-66`.
- Admin UI dereferences missing fields:
  - `p.submittedBy.toLowerCase()` at `components/admin/EstateEliteAdmin.tsx:1109`.
  - `property.views.toLocaleString()` at `components/admin/EstateEliteAdmin.tsx:678`.
  - `property.inquiries` at `components/admin/EstateEliteAdmin.tsx:679`.
  - `property.baths` at `components/admin/EstateEliteAdmin.tsx:659` and `799`.
  - `prop.img` at `components/admin/EstateEliteAdmin.tsx:776`.
- The file disables type checking at `components/admin/EstateEliteAdmin.tsx:1`.

Affected systems:

- Admin property table rendering.
- Search.
- Property detail drawer.
- Recent submissions.
- Moderation status display.

Impact:

- Search can throw at runtime as soon as real backend data is loaded.
- Detail drawer can throw when opened.
- Tables render blank/broken images and undefined owner metadata.

Minimal stabilization:

- Add a narrow backend-to-admin-view normalizer before data reaches the dashboard.
- Guard nullable/missing fields in the UI.
- Remove `@ts-nocheck` only after the normalizer has made the contract explicit.

### C4. Public property submission calls an authenticated admin create endpoint

Severity: high  
Classification: workflow, API contract, auth/domain inconsistency  
Root cause: `/submit-property` was wired to `API_ENDPOINTS.ADMIN.PROPERTIES_CREATE`, and the backend later protected `/api/admin/properties/create` with `authMiddleware`.

Evidence:

- Public page calls admin create endpoint: `components/forms/submit-property-page.tsx:113-115`.
- Backend requires auth for creation: `project-root/server/routes/adminRoutes.js:449-452`.
- Dashboard route only checks `adminToken` in localStorage, but public submission does not require login.

Affected systems:

- Public owner submission.
- Property creation lifecycle.
- Moderation intake.

Impact:

- Normal public users cannot submit properties; they receive 401.
- If an admin token happens to be present, the public form creates a property as an admin action with no submitter ownership.
- New properties do default to `PENDING`, but the creation flow is not stable because the access model is wrong.

Minimal stabilization:

- Decide whether public submission is allowed unauthenticated, user-authenticated, or admin-only.
- Expose a route with that ownership model and keep the frontend endpoint name out of the `ADMIN` namespace if public users can call it.

### C5. Public detail endpoint exposes non-approved properties by ID

Severity: high  
Classification: workflow, API contract, security  
Root cause: Public list route filters to `APPROVED`; public detail route does not.

Evidence:

- Public list filters status: `project-root/server/routes/adminRoutes.js:336-339`.
- Public detail only does `findUnique` by id: `project-root/server/routes/adminRoutes.js:373-388`.

Affected systems:

- Public marketplace.
- Moderation privacy.
- Rejected/pending listing visibility.

Impact:

- Anyone with a property ID can fetch pending or rejected properties.
- Moderation state is not an actual publication boundary.

Minimal stabilization:

- Add `status: "APPROVED"` to the public detail query or return 404 for non-approved records.

### C6. Invalid login request bodies can produce 500 because Zod v4 uses `issues`, not `errors`

Severity: high  
Classification: backend, validation, API contract  
Root cause: Backend reads `validation.error.errors[0].message`; installed Zod v4 exposes `error.issues`.

Evidence:

- `project-root/server/routes/adminRoutes.js:29-35`.
- Local verification showed `result.error.issues` exists and `result.error.errors` is `undefined`.

Affected systems:

- Admin login.
- API error consistency.

Impact:

- Invalid login payloads can hit the route catch block and return 500 instead of 400.

Minimal stabilization:

- Use `validation.error.issues[0]?.message || "Invalid request"`.

## 3. Architectural Inconsistencies

### A1. Central admin file is outside TypeScript protection

Severity: high  
Classification: architectural, technical debt  
Root cause: `components/admin/EstateEliteAdmin.tsx` uses `// @ts-nocheck`.

Impact:

- The most important integration surface can violate `Property` types without build failure.
- The green build is misleading.

Minimal stabilization:

- Do not remove `@ts-nocheck` blindly. First add a small admin property view model and normalize backend records, then enable checking in small sections.

### A2. Property status carries two different meanings

Severity: high  
Classification: domain consistency, API contract  
Root cause: `PropertyStatus` combines listing availability and moderation lifecycle in one field.

Evidence:

- `types/property.ts:3` allows `"For Sale" | "For Rent" | "PENDING" | "APPROVED" | "REJECTED"`.
- Public filters compare `property.status` to `"For Sale"`/`"For Rent"`: `components/property/listing-page.tsx:34`.
- Backend stores moderation status in `Property.status`: `project-root/server/prisma/schema.prisma:63`.
- Submit form sends `listingType: "Sell"` at `components/forms/submit-property-page.tsx:58` and `125`.

Impact:

- Approved backend records appear publicly with an `APPROVED` badge instead of sale/rent status.
- Buy/rent filters can exclude all backend-loaded properties.

Minimal stabilization:

- Treat `status` as moderation status only.
- Use `listingType` for sale/rent/private sale display and filters.
- Normalize legacy mock data until it is removed.

### A3. Service layer contains endpoints that the backend does not implement

Severity: high  
Classification: API contract, dead code, architectural drift  
Evidence:

- `AUTH.LOGOUT` points to `/api/admin/logout`: `lib/api/config.ts:13`; backend has no logout route.
- `propertyService.getPropertyDetail()` calls `/api/admin/properties/:id`: `lib/services/property-service.ts:35-38`; backend has no admin detail route.
- `propertyService.updateProperty()` patches `/api/admin/properties/:id`: `lib/services/property-service.ts:72-75`; backend has no update route.
- `adminService.getAdminsList()` calls `/api/admin/dashboard/admins`: `lib/services/admin-service.ts:26-29`; backend has no route.
- `adminService.getDashboardStats()` expects stats, but `/dashboard` returns only message/admin: `project-root/server/routes/adminRoutes.js:101-110`.

Impact:

- The service layer looks complete but is unsafe to reuse.
- Future code can call dead endpoints and fail at runtime.

Minimal stabilization:

- Mark unimplemented service methods as unsupported or remove them until matching backend routes exist.
- Add a route-contract checklist near `lib/api/config.ts`.

### A4. Public API access bypasses the centralized API client

Severity: medium  
Classification: architectural, API consistency  
Evidence:

- Public list uses hardcoded `fetch("http://localhost:5000/api/admin/public/properties")`: `app/(public)/properties/page.tsx:17-19`.
- Public detail uses hardcoded `fetch(...)`: `app/(public)/properties/[id]/page.tsx:79-81`.
- Admin/forms use `apiClient`.

Impact:

- Environment switching is inconsistent.
- Public responses do not use shared error handling.
- Backend error payloads can set `properties` to `undefined` and break list rendering.

Minimal stabilization:

- Route public property reads through `propertyService` or a small public-property service using `API_ENDPOINTS.PUBLIC`.

## 4. State Management Risks

### S1. Failure rollback can overwrite unrelated concurrent mutations

Severity: high  
Classification: synchronization, state management  
Root cause: Each mutation captures `const originalProperties = properties` from the hook closure and restores the whole array on failure.

Evidence:

- `hooks/useAdminProperties.ts:72`, `98`, `124`, and `150`.
- Rollbacks set the entire array at `82`, `108`, `134`, and `157`.

Impact:

- If two mutations overlap and one fails, the failed one can restore a stale full-array snapshot and erase another mutation that succeeded after the snapshot.

Minimal stabilization:

- Roll back only the affected property or re-fetch after failure.
- Prefer functional updates that do not depend on captured whole-array snapshots.

### S2. Mutation loading state is not connected to row buttons

Severity: medium  
Classification: synchronization, UI state  
Root cause: `mutationState` is returned by the hook but not passed into `PropertyTable`.

Evidence:

- Hook returns `mutationState`: `hooks/useAdminProperties.ts:181`.
- `PropertyTable` receives `loading`, not per-row mutation state: `components/admin/EstateEliteAdmin.tsx:1196-1205`.
- Row buttons at `components/admin/EstateEliteAdmin.tsx:822-828` are never disabled per mutation.

Impact:

- Duplicate rapid clicks can issue repeated approve/reject/feature/delete calls.
- Backend transitions are not idempotency-protected.

Minimal stabilization:

- Pass per-row mutation loading into table/action menu/drawer and disable actions for active ids.

### S3. Error tracking adds state complexity without clear ownership

Severity: medium  
Classification: state management, cleanup  
Root cause: Mutation errors are stored in the hook, separately tracked in `shownErrorIds`, and also handled by component catch blocks.

Evidence:

- `shownErrorIds` at `components/admin/EstateEliteAdmin.tsx:996`.
- Error effects at `999-1030`.
- Component catch toasts at `1048-1049`, `1064-1065`, `1077-1078`, `1093-1094`.

Impact:

- Toast ownership is split.
- The current hook swallowing bug makes this state graph actively misleading.

Minimal stabilization:

- Choose one owner for mutation notifications.
- Re-throw hook errors if component owns toasts, or remove component catch toasts if hook owns them.

### S4. Filtering was partially stabilized but still assumes unsafe fields

Severity: high  
Classification: state management, API contract  
Root cause: Status filtering is centralized, but search filtering still assumes mock-only string fields.

Evidence:

- Central status filter exists at `components/admin/EstateEliteAdmin.tsx:1117-1122`.
- Search uses `p.submittedBy.toLowerCase()` without null guard at `1109`.

Impact:

- Prior state-filtering fix is structurally good, but the table can still crash on backend records.

Minimal stabilization:

- Normalize `submittedBy` to a safe string or use optional chaining/defaults in search.

## 5. Backend Risks

### B1. Property lifecycle is unvalidated String data

Severity: high  
Classification: backend, database, domain consistency  
Root cause: Prisma uses `String` for `Property.status` and `Admin.role`; routes write raw strings.

Evidence:

- `project-root/server/prisma/schema.prisma:19` and `63`.
- Routes write `"APPROVED"` and `"REJECTED"` directly at `adminRoutes.js:189` and `227`.

Impact:

- Invalid status and role values can enter the database.
- Status casing is handled manually with `status.toUpperCase()` at `adminRoutes.js:419`.

Minimal stabilization:

- Introduce Prisma enums for moderation status and admin role after checking existing data.

### B2. Not-found and invalid-id errors become 500s

Severity: high  
Classification: backend, API contract  
Root cause: `prisma.property.update/delete` errors are caught generically.

Evidence:

- Approve catches all errors as 500: `project-root/server/routes/adminRoutes.js:198-205`.
- Reject, feature, delete follow the same pattern.
- Feature route also dereferences `property.featured` without null check: `project-root/server/routes/adminRoutes.js:260-271`.

Impact:

- Clients cannot distinguish missing records from server failures.
- Historical "Not Found" reports become harder to diagnose.

Minimal stabilization:

- Return 404 for missing records and Prisma P2025.
- Null-check before feature toggles.

### B3. Reject reason is accepted by frontend but not persisted

Severity: medium  
Classification: workflow, API contract  
Root cause: Frontend sends a reason, backend ignores it, schema has no `rejectReason`.

Evidence:

- Frontend service sends `{ reason }`: `lib/services/property-service.ts:115-118`.
- Backend reject route only sets `status: "REJECTED"`: `project-root/server/routes/adminRoutes.js:222-228`.
- Admin UI displays `rejectReason` if present: `components/admin/EstateEliteAdmin.tsx:805-807`.

Impact:

- Admins cannot rely on rejection context after refresh.
- Mock rejected properties imply functionality that does not exist.

Minimal stabilization:

- Either remove reason UI/contract or add `rejectReason` to schema and route.

### B4. Featured mutation ignores requested value and toggles server state

Severity: high  
Classification: synchronization, backend workflow  
Root cause: Frontend computes desired `featured` value; backend ignores body and flips current database value.

Evidence:

- Frontend sends `{ featured }`: `lib/services/property-service.ts:135-138`.
- Backend uses `featured: !property.featured`: `project-root/server/routes/adminRoutes.js:266-272`.

Impact:

- Concurrent clicks or stale UI can produce opposite-of-intended state.
- The API contract is not idempotent.

Minimal stabilization:

- Backend should accept and validate explicit boolean `featured`, or frontend should stop sending a desired state and treat it as toggle. Prefer explicit boolean.

### B5. Test route still creates approved production data

Severity: medium  
Classification: mock-data contamination, workflow  
Evidence:

- `POST /properties/create-dummy` exists at `project-root/server/routes/adminRoutes.js:117-152`.
- It creates `status: "APPROVED"` at line `137`.

Impact:

- Hidden auto-approval logic still exists.
- It can contaminate production data if deployed.

Minimal stabilization:

- Remove the route or gate it behind a non-production environment check.

### B6. Missing ownership and audit fields

Severity: high  
Classification: domain, database, ownership boundaries  
Root cause: There is no user/owner model, no submitter relation, and no moderation action audit.

Evidence:

- Prisma has only `Admin` and `Property`: `project-root/server/prisma/schema.prisma:15-66`.
- No `ownerId`, `submittedBy`, `createdByAdminId`, `approvedByAdminId`, `updatedAt`, or status transition timestamps.

Impact:

- Cannot trace who submitted or moderated a listing.
- Cannot safely expose owner workflows.
- Admin UI currently invents submitter data from mocks.

Minimal stabilization:

- Add only the ownership fields needed for current workflows before broader user-system work.

## 6. API Contract Problems

| Area | Frontend expectation | Backend/current reality | Severity |
| --- | --- | --- | --- |
| Approve/reject/feature methods | POST | PATCH | Critical |
| Logout | `/api/admin/logout` exists | No backend route | Medium |
| Admin property detail | `/api/admin/properties/:id` exists | No backend route | Medium |
| Update property | PATCH `/api/admin/properties/:id` exists | No backend route | Medium |
| Admin stats | `/dashboard` returns stats | Returns message/admin | Medium |
| Admin list | `/dashboard/admins` exists | No backend route | Low/medium |
| Public detail visibility | Public route returns only approved | Returns any status by id | High |
| Featured mutation | Explicit boolean state | Server toggle | High |
| Reject reason | Persisted/displayable | Ignored/not modeled | Medium |
| Admin table fields | `img`, `baths`, `submittedBy`, `views` | Missing from backend model | Critical |

## 7. Cleanup Requirements

### Dead or unintegrated files/modules

- `components/property/property-detail-page.tsx` appears unused by the App Router. Current detail route is `app/(public)/properties/[id]/page.tsx`.
- `components/property/emi-calculator.tsx` appears used only by the unused legacy detail component.
- `hooks/useAuth.ts` is unused by pages/components.
- `lib/services/auth-service.ts` is unused except by the unused hook.
- `lib/services/admin-service.ts` is unused.
- Several `propertyService` methods are unused and/or point to missing backend routes: `getPropertyDetail`, `updateProperty`, and `createProperty`.

### Mock/fake/placeholder contamination

- `MOCK_PROPERTIES` remains in `components/admin/EstateEliteAdmin.tsx:47-144` after backend integration. It is currently dead, but still defines a shadow contract.
- `MOCK_USERS` is live at `components/admin/EstateEliteAdmin.tsx:146-151` and powers users/agents.
- Home page still uses `data/properties.ts` for featured listings: `components/home/home-page.tsx:3` and `20`.
- Backend test route `create-dummy` can create approved data.
- `structure.txt` is a 3.75 MB generated project listing and should not be kept as active source.

### Repository coherence

Git status shows a large partial route migration:

- Old tracked routes under `app/auth`, `app/page.tsx`, `app/properties`, and `app/submit-property` are deleted.
- New route-group equivalents under `app/(public)/` and admin files are untracked.

This may be intentional, but it is a release risk until the migration is staged/committed or otherwise reconciled.

## 8. Historical Drift Analysis

### AUTHENTICATION_AUDIT_REPORT.md

Worked:

- `GET /api/admin/properties` is now protected by `authMiddleware`.
- `POST /api/admin/properties/create` is now protected by `authMiddleware`.
- JWT secret has moved to environment enforcement in `project-root/server/index.js:7-10`, contrary to stale README text.

Incomplete:

- No role middleware was implemented.
- `create-dummy` still exists.
- Ownership model is still absent.
- Public detail visibility was not addressed.

### API_LAYER_STABILIZATION.md and STABILIZATION_CHECKLIST.md

Worked:

- Central `apiClient`, endpoint config, token utilities, and response type files exist.
- Type-check and production build pass.

Incomplete or misleading:

- Public property pages still use hardcoded `fetch()` URLs.
- Central response types are permissive wrappers, not verified contracts.
- `AUTH.LOGOUT` exists in config but not backend.

### PHASE_1_IMPLEMENTATION_COMPLETE.md

Worked:

- Auth page and submit form now use `apiClient`.
- `.env.local` exists with `NEXT_PUBLIC_API_URL`.

Drift:

- The public submit form now calls an authenticated admin endpoint and is not a stable public creation flow.

### PHASE_2_IMPLEMENTATION_* reports

Worked:

- Service files and hooks were created.
- Admin dashboard uses `useAdminProperties` for its `properties` array.
- Basic fetch of admin properties can work when token/API are available.

Contradicted by current code:

- Reports claim "All mutations connected to real backend"; approve/reject/feature are not connected correctly because they use POST while backend expects PATCH.
- Reports claim optimistic rollback/error handling is production-ready; hook catches errors without rethrowing, causing false success toasts.
- Reports claim backend synchronization is stable; frontend still assumes mock-only property fields.
- Reports claim service methods are complete; several point to non-existent routes.

### AUDIT_STATE_ARCHITECTURE.md, STATE_COMPARISON.md, CHANGES_DETAIL.md

Worked:

- Status filtering is now centralized in the parent `filteredProperties` calculation.
- `PropertyTable` no longer applies its own status filter.
- Section subtitles use `filteredProperties.length`.
- Approve/reject/feature no longer do optimistic writes before API responses.

Incomplete:

- Delete remains optimistic.
- Mutation failures still do not propagate to callers.
- Rollback still restores full-array snapshots.
- Filtering still dereferences `submittedBy` without guarding real backend data.

### MODERATION_WORKFLOW_AUDIT.md

Worked:

- `ToastContainer` is present.
- Legacy `showToast` reference appears replaced.
- Drawer sync effect exists.

Contradicted/incomplete:

- The report claims production-ready moderation, but current approve/reject/feature methods fail against backend routes.
- Error handling remains split between hook effects and component catches.
- Success toasts are still possible after failed mutations.

### README.md

Stale:

- It says admin dashboard uses mock/local moderation only, but the dashboard now fetches backend properties.
- It says property submission does not submit to backend, but current submit form calls the backend.
- It says frontend does not require `.env.local`, but `.env.local` exists and `apiClient` uses it.
- It says JWT secret is hardcoded, but current server exits if `JWT_SECRET` is absent.

Still true:

- The project remains a hybrid prototype.
- Public marketplace still uses mock content in home sections.
- There are no automated tests.
- Backend scripts are incomplete.

## 9. Stabilization Priority Order

Only stabilization tasks are listed here.

### Priority 0: Stop false-positive moderation success

1. Change approve/reject/feature service calls from POST to PATCH.
2. Re-throw mutation errors from `useAdminProperties`.
3. Move mutation success/error toast ownership to one layer.
4. Pass `mutationState` to row/action/drawer controls and disable active row actions.

### Priority 1: Stabilize the property contract

1. Create a minimal `normalizeAdminProperty()` function that maps backend fields to the current admin view fields.
2. Guard missing fields in search/table/drawer.
3. Remove or replace `submittedBy`, `views`, `inquiries`, and `rejectReason` assumptions until the backend owns them.
4. Remove `@ts-nocheck` from `EstateEliteAdmin.tsx` only after the above contract is explicit.

### Priority 2: Fix creation and publication boundaries

1. Decide and enforce the property submission auth model.
2. Keep new real submissions defaulting to `PENDING`.
3. Remove or environment-gate `create-dummy`.
4. Filter public detail route to approved properties only.

### Priority 3: Make backend mutation responses predictable

1. Return 404 for missing property records.
2. Fix Zod validation error handling from `errors` to `issues`.
3. Make featured mutation explicit/idempotent.
4. Either persist rejection reason or remove it from frontend contracts.

### Priority 4: Remove dead and contradictory code paths

1. Remove or quarantine unimplemented service methods.
2. Reconcile unused `useAuth`, `auth-service`, and `admin-service`.
3. Delete unused legacy `components/property/property-detail-page.tsx` and `emi-calculator.tsx` if confirmed unused.
4. Remove dead `MOCK_PROPERTIES` from the integrated admin dashboard.
5. Reconcile route-group migration in git.
6. Remove `structure.txt` from active source control scope.

### Priority 5: Database hardening

1. Add Prisma enums for moderation status and admin role after data cleanup.
2. Add `updatedAt`.
3. Add only the ownership fields needed for current submission/moderation flows.
4. Add indexes for `status`, `featured`, `createdAt`, and public filter fields once the query model is finalized.

## Final Assessment

The previous stabilization work improved the shape of the project but did not complete the integration. The most urgent problem is not a missing feature; it is contract drift between a mock-shaped admin UI, a service layer with invented endpoint methods, and a backend with a different route/schema reality.

The fastest safe recovery path is surgical:

- Fix the moderation method mismatch.
- Fix error propagation.
- Normalize backend property data before rendering admin UI.
- Enforce the public/admin publication boundary.
- Remove stale service/report/mock paths that make the system look more complete than it is.

