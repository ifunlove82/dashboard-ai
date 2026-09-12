### Task 2: Analytics Engine API (`/api/stats`)

**Files:**
- Create: `scripts/test-api.js`
- Modify: `src/app/api/stats/route.ts`
- Modify: `src/lib/db.ts` (if needed for new queries)

**Interfaces:**
- Consumes: `rpTargets` and `rpToKhai` tables.
- Produces: JSON response with `timeframe`, `tradeType`, and multi-dimensional metrics (actual, target, yoy, etc.).

- [ ] **Step 1: Write the failing test**
Create `scripts/test-api.js`:
```javascript
async function runTest() {
    try {
        const res = await fetch('http://localhost:3050/api/stats?unit=HQHN&timeframe=Tháng&tradeType=Tất cả');
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        
        if (!data.metrics) throw new Error('Missing metrics object');
        if (data.metrics.revenue.target === undefined) throw new Error('Missing target in response');
        if (data.metrics.revenue.yoy_change === undefined) throw new Error('Missing yoy_change in response');
        
        console.log('PASS: Analytics Engine API works');
    } catch (err) {
        console.error('FAIL:', err.message);
        process.exit(1);
    }
}
runTest();
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node scripts/test-api.js`
Expected: FAIL (missing target/yoy_change because API currently only returns raw totals).

- [ ] **Step 3: Write minimal implementation**
Modify `src/app/api/stats/route.ts` to parse query params and return the 6-dimension structure.
*Note to implementer: Read the request URL, extract `searchParams.get('unit')`, `searchParams.get('timeframe')`, `searchParams.get('tradeType')`. Use these to filter your SQL query. If SQL is too complex, calculate YoY/MoM in memory for the mock fallback.*
Ensure the returned object looks like this:
```typescript
{
  metrics: {
    revenue: {
      actual: 12500000000,
      target: 15000000000, // from rpTargets
      yoy_change: 5.2,
      mom_change: -1.1,
      time_avg: 12000000000,
      peer_avg: 13000000000
    },
    // ... same for declarations, weight, etc.
  }
}
```

- [ ] **Step 4: Run test to verify it passes**
Ensure dev server is running (`npm run dev`), then:
Run: `node scripts/test-api.js`
Expected: PASS: Analytics Engine API works

- [ ] **Step 5: Commit**
```bash
git add scripts/test-api.js src/app/api/stats/route.ts
git commit -m "feat(api): upgrade /api/stats to analytics engine with 6-dimension metrics"
```
