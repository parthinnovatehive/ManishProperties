# State Architecture: Before vs After

## BEFORE (Problematic)

```
properties (single source)
    ↓
filteredProperties = search + location ONLY
    ↓ (Missing status filter!)
    ├─→ PropertyTable.filter(filterStatus) [DUPLICATE #1]
    │       ↓
    │       displayed array
    │
    └─→ sectionTitles[pending].filter(status) [DUPLICATE #2]
            ↓
            count shown in subtitle

BUG: Status filtering happens in 2 places
RESULT: State transitions unreliable, double-filtering on every render
```

**State Mutation Issues:**
```
approveProperty(id):
  1. setProperties([...]) with status="APPROVED"  ← optimistic update
  2. await API call
  3. setProperties(prev.map(...))                  ← overwrites #1 immediately
  = 2 state writes, first one wasted
```

**Problems:**
- ✗ Status filter not in single place
- ✗ Double-filtering on section display
- ✗ PropertyTable and parent both filtering by status
- ✗ Redundant state updates in mutations
- ✗ Section subtitles derived from derived state

---

## AFTER (Fixed)

```
properties (ONLY source of truth)
    ↓
filteredProperties = search + location + status
    ├─ if (currentFilter !== "all") filter by status
    ├─ if (currentFilter === "featured") filter by featured
    ↓ (Status filter COMPLETE here)
    ├─→ PropertyTable
    │       const displayed = properties  ← No filtering!
    │       ↓
    │       Just display
    │
    └─→ sectionTitles[pending].length
            ↓
            Use filteredProperties length directly

FIXED: Status filtering happens in ONE place
RESULT: Consistent state, predictable transitions
```

**State Mutation Pattern:**
```
approveProperty(id):
  1. originalProperties = properties  ← backup for rollback
  2. await propertyService.approveProperty(id)
  3. setProperties(prev.map(...))     ← single update with API result
  = 1 state write, clean flow
```

**Benefits:**
- ✓ Status filter applied in ONE calculation
- ✓ No double-filtering
- ✓ PropertyTable just displays
- ✓ Single state update per mutation
- ✓ Derived state consistent (all from source)
- ✓ Transitions work: PENDING → APPROVED auto-moves
- ✓ Rollback on error is predictable

---

## State Derivation Comparison

### PENDING Section Example

**BEFORE:**
```
properties[0] = { id: 1, status: "PENDING", title: "House 1" }
    ↓ (parent filter)
filteredProperties[0] = { id: 1, status: "PENDING", ... }  ← only search+location
    ↓ (PropertyTable filter)
displayed = filteredProperties.filter(p => p.status === "PENDING") ← [House 1]
    ↓ (section subtitle filter)
sectionTitles.pending.sub = `${filteredProperties.filter(p => p.status === "PENDING").length}` ← "1 awaiting"

After approve:
properties[0].status = "APPROVED"
    ↓ BUT PropertyTable still sees old status? NO—re-renders trigger new filter
    ← This works but relies on re-render timing
```

**AFTER:**
```
properties[0] = { id: 1, status: "PENDING", title: "House 1" }
    ↓ (parent filter with status)
if (currentFilter === "PENDING") {
  filteredProperties[0] = { id: 1, status: "PENDING", ... }
} ← [House 1] shown in PENDING table

After approve:
properties[0].status = "APPROVED"
    ↓ (parent filter with status)
if (currentFilter === "PENDING") {
  // Property doesn't match anymore
  filteredProperties = []  ← auto-empty, no item shown
}
if (currentFilter === "APPROVED") {
  filteredProperties[0] = { id: 1, status: "APPROVED", ... }  ← auto-appear
}

Result: Instant, guaranteed transition ✓
```

---

## Impact Summary

| Issue | Before | After |
|-------|--------|-------|
| Status filter locations | 2 places (PropertyTable + subtitles) | 1 place (parent calc) |
| Double-filtering | Yes, every render | No |
| Mutations per action | 2 state writes | 1 state write |
| Section transitions | Timing-dependent | Guaranteed |
| Rollback on error | Works but indirect | Direct |
| Code clarity | Scattered logic | Centralized |
| Performance | Multiple filter calls | Single filter pass |
| Debugging | State spread across | Single source trace |

