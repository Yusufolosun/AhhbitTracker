# Performance Optimization Documentation

## Overview
This document outlines performance optimizations implemented across the AhhbitTracker frontend and mobile layers, focusing on rendering efficiency and network optimization.

## Frontend Optimizations

### 1. Async Pool Concurrency Limiting
- **File**: `frontend/src/utils/asyncPool.ts`
- **Problem**: Unlimited concurrent requests when fetching habit details caused API flooding
- **Solution**: Implemented concurrency-limited async pool with maximum 6 simultaneous requests
- **Impact**: Reduced peak API load by controlling burst requests

### 2. Habit Window Summarization
- **File**: `frontend/src/utils/habitStatus.ts`
- **Problem**: Components independently filtering habits multiple times per render cycle
- **Solution**: Created `summarizeHabitsByWindow()` for single-pass categorization and aggregation
- **Impact**: Eliminated O(n) redundant iterations across multiple components

### 3. Block Subscription Consolidation
- **File**: `frontend/src/components/HabitList.tsx`, `HabitCard.tsx`
- **Problem**: Each HabitCard created independent subscription to block height updates
- **Solution**: Pass `currentBlock` as prop from parent; eliminated per-card hook calls
- **Impact**: Reduced subscription overhead from O(n) to O(1)

### 4. Memoization Strategy
- **File**: `frontend/src/components/HabitCard.tsx`
- **Problem**: Derived state (badge, eligibility, window state) recalculated every render
- **Solution**: Applied `useMemo()` for derived state, `useCallback()` for handlers
- **Impact**: Prevented unnecessary re-renders when props unchanged

### 5. Cache Time Extension
- **File**: `frontend/src/utils/constants.ts`
- **Before**: 120_000ms (2 minutes)
- **After**: 180_000ms (3 minutes)
- **Rationale**: Stacks blocks average ~10 minutes; 3-minute polling maintains freshness while reducing API quota pressure by 33%

### 6. Read-Through Cache TTL
- **File**: `frontend/src/services/contractReadCache.ts`
- **Change**: Extended TTL from `CACHE_TIME` to `POOL_CACHE_TIME` (300_000ms) for habit reads
- **Rationale**: Pool data changes infrequently; longer cache reduces redundant reads

### 7. Request Deduplication
- **File**: `frontend/src/utils/requestDeduplicator.ts`
- **Purpose**: In-flight request deduplication prevents duplicate simultaneous requests
- **Usage**: Applied to network layer to collapse duplicate requests

### 8. Query Retry Optimization
- **File**: `frontend/src/utils/queryConfig.ts`
- **Strategy**: 
  - Exponential backoff: delay = 500ms × (2 ^ attemptNumber)
  - Max 3 retries for retryable errors (429, 5xx, timeout)
  - Non-retryable errors (4xx except 429) fail immediately
- **Impact**: Improved resilience without excessive retries on permanent failures

## Mobile Optimizations

### 1. Async Pool Concurrency
- **File**: `mobile/src/utils/asyncPool.ts`
- **Similar to frontend**: Limits habit detail fetch concurrency to 6 simultaneous requests

### 2. Habit Window Summary
- **File**: `mobile/src/utils/habitStatus.ts`
- **Similar to frontend**: Single-pass habit categorization and aggregation

### 3. Polling Interval Extension
- **File**: `mobile/src/core/config/constants.ts`
- **Before**: 120_000ms (2 minutes)
- **After**: 180_000ms (3 minutes)
- **Rationale**: Reduce network overhead on battery and data-constrained devices

### 4. HabitCard Memoization
- **File**: `mobile/src/features/habits/components/HabitCard.tsx`
- **Changes**:
  - Wrapped with `React.memo()` to prevent re-renders on prop equality
  - Added `useCallback()` for handlers
  - Added `useMemo()` for derived state calculations
- **Impact**: Reduced unnecessary renders in FlatList

### 5. Mobile-Specific Query Strategy
- **File**: `mobile/src/core/config/queryConfig.ts`
- **Differences from web**:
  - More conservative: 2 retries (vs 3 on web)
  - Longer stale time: 60 seconds (vs 30 on web)
  - Longer retry delay: base 1000ms (vs 500ms on web)
  - `refetchOnReconnect: 'stale'` respects network conditions
- **Rationale**: Mobile devices have battery constraints and limited data plans

## Network Layer

### Cache Configuration
- **Frontend**: 180 seconds (3 minutes)
- **Mobile**: 180 seconds (3 minutes)
- **Pool Data**: 300 seconds (5 minutes) — rarely changes
- **Block Height**: Polled at intervals matching block times

### Retry Strategy
- **Retryable**: 429 (rate limit), 5xx (server errors), network timeouts
- **Non-retryable**: 4xx client errors (except 429)
- **Max Attempts**: 3 (web), 2 (mobile)
- **Backoff**: Exponential (2x multiplier per attempt)

### Concurrency Limits
- **Habit Detail Reads**: 6 concurrent requests maximum
- **Benefit**: Prevents API flooding while maintaining reasonable latency

## Performance Metrics (Expected)

### Before Optimization
- **Peak API Requests**: Potentially unlimited during habit data fetch
- **Redundant Calculations**: 6+ filter operations per HabitList render
- **Subscription Count**: O(n) with n HabitCard components
- **Cache Hit Efficiency**: 50% (frequent re-fetches within stale window)

### After Optimization
- **Peak API Requests**: Capped at 6 concurrent
- **Redundant Calculations**: 1 per HabitList render
- **Subscription Count**: O(1) with centralized block height
- **Cache Hit Efficiency**: 65%+ (longer TTL, deduplication)

## Testing Recommendations

1. **Concurrency**: Verify async pool limits to 6 concurrent requests under load
2. **Memoization**: Confirm HabitCard props cause re-renders only when necessary
3. **Cache**: Validate TTL-based expiration works correctly
4. **Retry**: Test exponential backoff and rate-limit detection
5. **Mobile**: Verify conservative retry strategy on degraded networks

## Future Optimization Opportunities

1. **Request Batching**: Combine multiple habit reads into single contract call
2. **Streaming**: Implement progressive habit loading with skeleton screens
3. **Service Worker**: Cache strategy for offline-first mobile experience
4. **Code Splitting**: Lazy-load Dashboard and HabitForm components
5. **Virtual Lists**: Implement virtualization for large habit lists

## Related Files

- Performance tracking: [CHANGELOG.md](../CHANGELOG.md)
- Network configuration: [frontend/src/utils/constants.ts](../frontend/src/utils/constants.ts)
- Contract service: [frontend/src/services/contractService.ts](../frontend/src/services/contractService.ts)
- Query hooks: [frontend/src/hooks/useHabits.ts](../frontend/src/hooks/useHabits.ts)
