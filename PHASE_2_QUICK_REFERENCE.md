# Phase 2 Quick Reference Guide

## Project Structure

```
frontend/
├── lib/
│   ├── api/
│   │   ├── config.ts (endpoints, base URL)
│   │   └── client.ts (HTTP client)
│   ├── services/ ← NEW
│   │   ├── auth-service.ts (login, logout)
│   │   ├── property-service.ts (CRUD + approve/reject/feature)
│   │   └── admin-service.ts (dashboard, admins)
│   └── utils/
│       ├── token.ts (localStorage management)
│       └── toast.ts (notification system) ← NEW
├── hooks/ ← NEW
│   ├── useAuth.ts (auth state)
│   └── useAdminProperties.ts (properties + mutations)
├── types/
│   ├── api.ts (API response types) ← NEW
│   └── property.ts (Property type)
└── components/
    ├── admin/
    │   └── EstateEliteAdmin.tsx (uses hooks)
    └── ui/
        └── toast.tsx (toast display) ← NEW
```

---

## Import Examples

### Using Auth Service
```typescript
import { authService } from "@/lib/services/auth-service";

const response = await authService.login("user", "pass");
authService.getToken(); // Returns token or null
```

### Using Property Service
```typescript
import { propertyService } from "@/lib/services/property-service";

const props = await propertyService.getAdminProperties();
await propertyService.approveProperty(id);
await propertyService.rejectProperty(id, "reason");
await propertyService.featureProperty(id, true);
```

### Using Auth Hook
```typescript
import { useAuth } from "@/hooks/useAuth";

const { admin, loading, error, login, logout } = useAuth();
```

### Using Properties Hook
```typescript
import { useAdminProperties } from "@/hooks/useAdminProperties";

const { 
  properties,      // Property[]
  loading,         // boolean
  error,           // string | null
  mutationState,   // Record<id, {loading, error}>
  approveProperty,    // (id) => Promise<void>
  rejectProperty,     // (id, reason?) => Promise<void>
  featureProperty,    // (id, featured) => Promise<void>
  deleteProperty,     // (id) => Promise<void>
  fetchProperties     // () => Promise<void> (manual refresh)
} = useAdminProperties();
```

### Using Toast
```typescript
import { useToast } from "@/lib/utils/toast";

const toast = useToast();
toast.success("Done!");
toast.error("Failed");
toast.info("Info");
toast.warning("Warning");
```

---

## Common Patterns

### Pattern 1: Simple Mutation with Error Handling
```typescript
const { approveProperty } = useAdminProperties();
const toast = useToast();

const handleApprove = async (id) => {
  try {
    await approveProperty(id);
    toast.success("Approved");
  } catch (err) {
    toast.error("Failed");
  }
};
```

### Pattern 2: Check Loading State
```typescript
const { properties, loading } = useAdminProperties();

if (loading) return <div>Loading...</div>;
return <PropertyTable properties={properties} />;
```

### Pattern 3: Check Per-Property Error
```typescript
const { mutationState } = useAdminProperties();

const errors = Object.entries(mutationState)
  .filter(([_, state]) => state.error)
  .map(([id, state]) => ({ id, error: state.error }));
```

### Pattern 4: Manual Refresh
```typescript
const { fetchProperties } = useAdminProperties();

const handleRefresh = async () => {
  await fetchProperties();
  toast.success("Refreshed");
};
```

---

## API Endpoints Used

| Operation | Method | Endpoint | Service |
|-----------|--------|----------|---------|
| Login | POST | /api/admin/login | authService |
| Logout | POST | /api/admin/logout | authService |
| Get Properties | GET | /api/admin/properties | propertyService |
| Approve Property | POST | /api/admin/properties/{id}/approve | propertyService |
| Reject Property | POST | /api/admin/properties/{id}/reject | propertyService |
| Feature Property | POST | /api/admin/properties/{id}/feature | propertyService |
| Delete Property | DELETE | /api/admin/properties/{id} | propertyService |
| Dashboard Stats | GET | /api/admin/dashboard | adminService |

---

## Type Definitions

### Property Type
From `@/types/property.ts`
```typescript
type Property = {
  id: PropertyId;
  title: string;
  location: string;
  price: string;
  type: PropertyType;
  status: PropertyStatus;  // "PENDING" | "APPROVED" | "REJECTED"
  featured: boolean;
  // ... more fields
};
```

### API Response Types
From `@/types/api.ts`
```typescript
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface LoginResponse extends ApiResponse<never> {
  success: boolean;
  token: string;
  admin: AdminData;
}

interface PropertyApproveResponse extends ApiResponse<Property> {
  success: boolean;
  property?: Property;
  data?: Property;
}
```

---

## Error Handling

### Automatic Error Handling
Errors are automatically handled by:
1. `useAdminProperties` hook - stores in `mutationState[id].error`
2. Effect hook watches `mutationState` and shows toast
3. OR catch error manually and show custom message

### Manual Error Handling
```typescript
try {
  await propertyService.approveProperty(id);
} catch (err) {
  const apiError = err as ApiError;
  console.log(apiError.status);   // HTTP status code
  console.log(apiError.message);  // Error message
  console.log(apiError.data);     // Response data
}
```

---

## Optimization: Optimistic Updates

Every mutation in `useAdminProperties` uses optimistic update pattern:

```typescript
// 1. Update UI immediately
setProperties(optimisticUpdate);

// 2. Make API call
try {
  const result = await api();
  // 3. Update with real response
  setProperties(prev => prev.map(p => p.id === id ? result : p));
} catch (err) {
  // 4. Rollback if error
  setProperties(originalState);
  throw err;
}
```

**Benefits:**
- Instant user feedback
- Automatic error recovery
- No flicker or loading states (unless you want them)
- Transparent to component

---

## Testing Checklist

- [ ] Admin can approve PENDING property → status changes to APPROVED
- [ ] Admin can reject APPROVED property → status changes to REJECTED
- [ ] Admin can feature/unfeature property → featured flag toggles
- [ ] Admin can delete property → removed from list
- [ ] Refresh page → changes persist (from DB)
- [ ] Network error → UI reverts, error toast shown
- [ ] Multiple mutations → each independent loading/error state
- [ ] Toast notifications → display correctly with right icons
- [ ] Search/filter → works with backend-fetched properties

---

## Troubleshooting

### Properties not loading
- Check: Backend /api/admin/properties returns array
- Check: Network tab for 401 (needs auth)
- Check: ToastContainer visible for error messages

### Mutations not working
- Check: Backend endpoints exist
- Check: Request body format matches API
- Check: Authorization header sent (via apiClient)
- Check: Backend returns proper Property object

### Toasts not showing
- Check: ToastContainer in component render
- Check: useToast hook imported correctly
- Check: Browser console for JS errors

### Stale state after mutation
- Check: API response includes updated property
- Check: Hook properly maps response to state
- Check: No manual state management competing with hook

---

## Next Phase: Optional Enhancements

- Add optimized revalidation (SWR/React Query)
- Add offline support with local sync queue
- Add multi-select for bulk actions
- Add audit logging
- Add real-time WebSocket updates
- Add analytics tracking
