# Backend Authentication & Authorization Audit Report
**Date:** 2026-05-23  
**Backend Root:** `project-root/server`  
**Routes File:** `project-root/server/routes/adminRoutes.js`  
**Route Mount Point:** `/api/admin` (from index.js line 21)

---

## Executive Summary

**CRITICAL ISSUES FOUND: 2**
- Unauthenticated property creation endpoint
- Unauthenticated access to all properties data

**SECURITY GAPS: 5**
- Missing authentication on property listing
- Missing role-based authorization checks
- No ownership/user model for data isolation
- Test route left in production code
- Authentication middleware lacks granular permissions

---

## Current Authentication Infrastructure

### authMiddleware (project-root/server/middleware/authMiddleware.js)
**Lines 1-36**

**Current Capabilities:**
- ✅ Validates JWT token presence
- ✅ Verifies JWT signature using `process.env.JWT_SECRET`
- ✅ Extracts admin data from JWT payload
- ✅ Attaches decoded data to `req.admin`

**Limitations:**
- ❌ Does NOT validate admin role
- ❌ Does NOT check user permissions
- ❌ Does NOT verify admin still exists in database
- ❌ Does NOT provide granular authorization
- ❌ No method for role-based access control

### JWT Token Structure (adminRoutes.js lines 65-74)
```javascript
{
  adminId: admin.id,
  role: admin.role,        // Populated but not validated by middleware
  expiresIn: "7d"
}
```

---

## Complete Route Inventory & Analysis

### Mount Path: `/api/admin`

| # | Method | Route | Line | Auth Required | Status | Category | Security Issues |
|----|--------|-------|------|---------------|--------|----------|-----------------|
| 1 | POST | `/login` | 25 | ❌ No | ✅ SAFE | Public | Rate-limited (15 min, 5 attempts) |
| 2 | GET | `/dashboard` | 101 | ✅ Yes | ✅ SAFE | Admin | Protected by authMiddleware |
| 3 | POST | `/properties/create-dummy` | 117 | ✅ Yes | ⚠️ WARNING | Admin | Test route - should not be in production |
| 4 | PATCH | `/properties/:id/approve` | 175 | ✅ Yes | ✅ SAFE | Admin | Protected by authMiddleware |
| 5 | PATCH | `/properties/:id/reject` | 213 | ✅ Yes | ✅ SAFE | Admin | Protected by authMiddleware |
| 6 | PATCH | `/properties/:id/feature` | 251 | ✅ Yes | ✅ SAFE | Admin | Protected by authMiddleware |
| 7 | DELETE | `/properties/:id` | 295 | ✅ Yes | ✅ SAFE | Admin | Protected by authMiddleware |
| 8 | GET | `/public/properties` | 330 | ❌ No | ✅ SAFE | Public | Returns only APPROVED properties |
| 9 | GET | `/public/properties/:id` | 365 | ❌ No | ✅ SAFE | Public | Returns single property, no role check needed |
| 10 | GET | `/properties` | 406 | ❌ No | 🔴 CRITICAL | Admin | **SECURITY GAP: Exposes all properties including PENDING/REJECTED** |
| 11 | POST | `/properties/create` | 438 | ❌ No | 🔴 CRITICAL | User/Admin | **SECURITY GAP: Anyone can create properties without authentication** |

---

## Detailed Security Findings

### 🔴 CRITICAL VULNERABILITIES

#### 1. Unauthenticated Property Creation (Line 438-534)
```javascript
// VULNERABLE: NO AUTHENTICATION
router.post("/properties/create", async (req, res) => {
```

**Risk Level:** CRITICAL  
**Impact:** 
- Any unauthenticated user can create properties
- No ownership tracking
- Potential for spam/abuse
- Bypasses approval workflow

**Current Behavior:**
- Creates property with `status: "APPROVED"` immediately
- No user/owner association
- No audit trail of who created what

**Severity:** HIGH - Data integrity compromise

---

#### 2. Unauthenticated Property List Access (Line 406-435)
```javascript
// VULNERABLE: NO AUTHENTICATION
router.get("/properties", async (req, res) => {
```

**Risk Level:** CRITICAL  
**Impact:**
- Returns ALL properties regardless of status (PENDING, REJECTED, APPROVED)
- Exposes internal admin workflow state
- Information disclosure vulnerability
- Allows enumeration of all properties

**Current Behavior:**
- No status filter applied
- Returns all 15+ property fields including internal IDs
- Compare to `/public/properties` which filters `status: "APPROVED"`

**Severity:** HIGH - Information disclosure

---

### ⚠️ AUTHENTICATION GAPS

#### 3. Missing Role-Based Authorization
**Issue:** authMiddleware doesn't validate role field

**Current Problem:**
```javascript
// authMiddleware extracts role but never uses it
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.admin = decoded;  // { adminId, role } attached to req
// But role is never checked anywhere
```

**Impact:**
- Any authenticated user could theoretically perform admin actions
- No way to create read-only or limited-access admin roles
- Cannot restrict specific operations by role

---

#### 4. Test Route in Production (Line 117-172)
```javascript
// CREATE DUMMY PROPERTY - FOR TESTING PURPOSES ONLY
router.post("/properties/create-dummy", authMiddleware, async (req, res) => {
```

**Issues:**
- Marked as "FOR TESTING PURPOSES ONLY" but deployed
- Creates hardcoded luxury property
- Should not be accessible in production
- No parameters - endpoint behavior fixed in code

**Risk:** Information disclosure, testing artifact exposure

---

### ⚠️ DESIGN GAPS

#### 5. No Ownership/User Model
**Current Data Model Issues:**

From `schema.prisma`:
- `Admin` model has no relationship to `Property`
- `Property` model has no `ownerId` or `creatorId` field
- No way to track who created/owns a property
- All properties are global, no user data isolation

**Implications:**
- Cannot implement per-user property management
- Cannot prevent users from deleting others' properties
- No audit trail of who performed actions
- Multi-tenant features impossible

---

### ⚠️ AUTHORIZATION INCONSISTENCIES

#### Route Classification Analysis

**Properly Protected (✅ SAFE):**
- POST `/login` - Public, rate-limited
- GET `/dashboard` - Admin-only with auth
- PATCH `/properties/:id/approve` - Admin-only with auth
- PATCH `/properties/:id/reject` - Admin-only with auth  
- PATCH `/properties/:id/feature` - Admin-only with auth
- DELETE `/properties/:id` - Admin-only with auth
- GET `/public/properties` - Public, filtered to APPROVED only
- GET `/public/properties/:id` - Public, single property view

**Inconsistently Protected (⚠️):**
- POST `/properties/create-dummy` - Has auth but marked for testing
- GET `/properties` - **Should be admin-only, currently public**
- POST `/properties/create` - **Should be authenticated, currently public**

---

## Recommended Route Classification

### Category A: Public Routes (No Authentication Required)
✅ Already Correct

1. **POST `/login`** (Line 25)
   - Current: Rate-limited
   - Recommendation: ✅ Keep as-is
   - Middleware: `loginLimiter` only

2. **GET `/public/properties`** (Line 330)
   - Current: No auth required, filtered to APPROVED
   - Recommendation: ✅ Keep as-is
   - Middleware: None

3. **GET `/public/properties/:id`** (Line 365)
   - Current: No auth required
   - Recommendation: ✅ Keep as-is (or add role-based feature filtering if needed)
   - Middleware: None

---

### Category B: Admin-Only Routes (Authentication Required + Role Validation)
✅ Mostly Correct, but need role validation

1. **GET `/dashboard`** (Line 101)
   - Current: Has `authMiddleware`
   - Recommendation: ✅ Add role validation middleware
   - Required Middleware: `authMiddleware` + `roleMiddleware('admin')`
   - Route Structure:
   ```javascript
   router.get("/dashboard", authMiddleware, roleMiddleware('admin'), async (req, res) => {
   ```

2. **POST `/properties/create-dummy`** (Line 117)
   - Current: Has `authMiddleware`
   - Recommendation: ⚠️ Either remove for production or add role validation
   - Required Middleware: `authMiddleware` + `roleMiddleware('admin')`
   - **Alternative:** Delete this route from production

3. **PATCH `/properties/:id/approve`** (Line 175)
   - Current: Has `authMiddleware`
   - Recommendation: ✅ Add role validation middleware
   - Required Middleware: `authMiddleware` + `roleMiddleware('admin')`
   - Route Structure:
   ```javascript
   router.patch("/properties/:id/approve", authMiddleware, roleMiddleware('admin'), async (req, res) => {
   ```

4. **PATCH `/properties/:id/reject`** (Line 213)
   - Current: Has `authMiddleware`
   - Recommendation: ✅ Add role validation middleware
   - Required Middleware: `authMiddleware` + `roleMiddleware('admin')`
   - Route Structure:
   ```javascript
   router.patch("/properties/:id/reject", authMiddleware, roleMiddleware('admin'), async (req, res) => {
   ```

5. **PATCH `/properties/:id/feature`** (Line 251)
   - Current: Has `authMiddleware`
   - Recommendation: ✅ Add role validation middleware
   - Required Middleware: `authMiddleware` + `roleMiddleware('admin')`
   - Route Structure:
   ```javascript
   router.patch("/properties/:id/feature", authMiddleware, roleMiddleware('admin'), async (req, res) => {
   ```

6. **DELETE `/properties/:id`** (Line 295)
   - Current: Has `authMiddleware`
   - Recommendation: ✅ Add role validation middleware
   - Required Middleware: `authMiddleware` + `roleMiddleware('admin')`
   - Route Structure:
   ```javascript
   router.patch("/properties/:id", authMiddleware, roleMiddleware('admin'), async (req, res) => {
   ```

---

### Category C: User-Authenticated Routes (Authentication Required)
❌ Currently Missing - Proposed Addition

1. **POST `/properties/create`** (Line 438) - **NEEDS FIX**
   - Current: No authentication
   - **CRITICAL:** Requires immediate authentication
   - Recommended Classification: User or Admin
   - Required Middleware: `authMiddleware` + optionally `roleMiddleware('user')`
   - Route Structure (Option A - User can create):
   ```javascript
   router.post("/properties/create", authMiddleware, async (req, res) => {
   ```
   - Route Structure (Option B - Admin only):
   ```javascript
   router.post("/properties/create", authMiddleware, roleMiddleware('admin'), async (req, res) => {
   ```

2. **GET `/properties`** (Line 406) - **NEEDS FIX**
   - Current: No authentication
   - **CRITICAL:** Requires immediate authentication
   - Recommended Classification: Admin-only
   - Required Middleware: `authMiddleware` + `roleMiddleware('admin')`
   - Route Structure:
   ```javascript
   router.get("/properties", authMiddleware, roleMiddleware('admin'), async (req, res) => {
   ```

---

## Required Middleware Implementation

### New Middleware Needed: `roleMiddleware`

**Purpose:** Validate user role from JWT token

**Proposed Implementation:**

```javascript
// file: project-root/server/middleware/roleMiddleware.js

const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    try {
      // authMiddleware must run first to populate req.admin
      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: "No admin data found",
        });
      }

      if (req.admin.role !== requiredRole) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${requiredRole}`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Authorization error",
      });
    }
  };
};

module.exports = roleMiddleware;
```

---

## Authentication Flow Diagram

```
Request with JWT Token
        ↓
   authMiddleware
        ↓
   Token Valid?
   ├─ NO → 401 Unauthorized
   ├─ YES ↓
   Decode JWT, attach to req.admin
        ↓
   roleMiddleware (if applied)
        ↓
   req.admin.role === requiredRole?
   ├─ NO → 403 Forbidden
   ├─ YES ↓
   Route Handler Executes
```

---

## Summary Table: Exact Middleware Placement

| Route | Current Auth | Current Line | Issue | Recommended Middleware | Additional Notes |
|-------|--------------|--------------|-------|----------------------|------------------|
| POST `/login` | Rate limit | 25 | None | `loginLimiter` | ✅ Keep as-is |
| GET `/dashboard` | authMiddleware | 101 | Missing role check | `authMiddleware, roleMiddleware('admin')` | Add role check |
| POST `/properties/create-dummy` | authMiddleware | 117 | Test route in prod | `authMiddleware, roleMiddleware('admin')` OR Remove | Consider removing |
| PATCH `/properties/:id/approve` | authMiddleware | 175 | Missing role check | `authMiddleware, roleMiddleware('admin')` | Add role check |
| PATCH `/properties/:id/reject` | authMiddleware | 213 | Missing role check | `authMiddleware, roleMiddleware('admin')` | Add role check |
| PATCH `/properties/:id/feature` | authMiddleware | 251 | Missing role check | `authMiddleware, roleMiddleware('admin')` | Add role check |
| DELETE `/properties/:id` | authMiddleware | 295 | Missing role check | `authMiddleware, roleMiddleware('admin')` | Add role check |
| GET `/public/properties` | None | 330 | None | None | ✅ Correctly public |
| GET `/public/properties/:id` | None | 365 | None | None | ✅ Correctly public |
| GET `/properties` | **NONE** ⚠️ | 406 | **No auth required** | `authMiddleware, roleMiddleware('admin')` | 🔴 CRITICAL - Add auth |
| POST `/properties/create` | **NONE** ⚠️ | 438 | **No auth required** | `authMiddleware` (minimum) or `authMiddleware, roleMiddleware('admin')` | 🔴 CRITICAL - Add auth |

---

## Implementation Priority

### Priority 1: CRITICAL (Security Vulnerabilities)
- [ ] Add `authMiddleware` to **POST `/properties/create`** (Line 438)
- [ ] Add `authMiddleware, roleMiddleware('admin')` to **GET `/properties`** (Line 406)

### Priority 2: HIGH (Missing Authorization)
- [ ] Create `roleMiddleware.js` 
- [ ] Add role validation to all admin routes that have `authMiddleware`

### Priority 3: MEDIUM (Code Cleanup)
- [ ] Remove or gate `POST /properties/create-dummy` test route
- [ ] Add database validation in authMiddleware (optional)

---

## Risk Assessment

| Vulnerability | Severity | Impact | Remediation |
|---------------|----------|--------|-------------|
| Unauthenticated POST `/properties/create` | CRITICAL | Anyone can inject data | Add authMiddleware |
| Unauthenticated GET `/properties` | CRITICAL | Information disclosure | Add authMiddleware + roleMiddleware |
| Missing role validation | HIGH | Privilege escalation risk | Implement roleMiddleware |
| Test route in production | MEDIUM | Code exposure | Remove or gate |
| No ownership model | HIGH | Data isolation impossible | Requires schema change |

---

## Notes for Implementation

1. **Do NOT apply changes yet** - This is audit only
2. **Preserve route structure** - All middleware changes are additive only
3. **No business logic changes** - Middleware is purely protective
4. **Route order matters** - Middleware must be between route path and handler
5. **Test after changes** - Include auth in test suite

---

## References

**Files Modified in Audit:**
- `project-root/server/routes/adminRoutes.js` (11 routes analyzed)
- `project-root/server/middleware/authMiddleware.js` (current capabilities reviewed)
- `project-root/server/index.js` (route mounting reviewed)
- `project-root/server/prisma/schema.prisma` (data model reviewed)

**Audit Scope:**
- All route definitions in adminRoutes.js
- All authentication mechanisms
- All CRUD operations on properties
- All admin-specific operations

**Out of Scope:**
- Frontend authentication
- Database-level permissions
- API rate limiting beyond login
- CORS configuration

