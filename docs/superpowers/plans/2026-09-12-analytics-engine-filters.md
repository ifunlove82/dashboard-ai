# Analytics Engine & Global Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the unified Analytics Engine backend and Global Filter Bar to support the 6 URD comparison rules across all dashboard tabs.

**Architecture:** A new `Targets` table is added to SQL. The `/api/stats` endpoint is expanded to parse query params (unit, timeframe, trade type) and return 6-dimensional metrics. The frontend gets a sticky `GlobalFilterBar` connected to `DashboardContext`, causing all tabs to auto-refresh when filters change.

**Tech Stack:** Next.js 16 (App Router), TypeScript, SQL Server (`mssql`), Tailwind CSS v4, shadcn/ui.

**Spec:** `docs/superpowers/specs/2026-09-12-urd-dashboard-design.md`

## Global Constraints

- Only use standard SQL aggregations where possible.
- Adhere to UI/UX Pro Max principles: no more than 2 comparisons exposed by default per flashcard.
- Testing is done via `curl` or manual node scripts against the dev server (`localhost:3050`).

---

### Task 1: Database Setup for Targets (Budget vs Actual)

**Files:**
- Create: `Table_Targets.sql`
- Create: `scripts/seed-targets.js`

**Interfaces:**
- Produces: `rpTargets` table in the database with columns for unit, month, year, and target metrics.

- [ ] **Step 1: Write the SQL schema**
Create `Table_Targets.sql` with the following content:
```sql
CREATE TABLE rpTargets (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    Ma_HQ NVARCHAR(50),
    Thang INT,
    Nam INT,
    ChiTieu_Thu DECIMAL(18,2),
    ChiTieu_ToKhai INT,
    ChiTieu_KimNgach DECIMAL(18,2)
);
```

- [ ] **Step 2: Write the database seed script**
Create `scripts/seed-targets.js` with the following content:
```javascript
import sql from 'mssql';
import { dbConfig } from '../src/lib/db.js'; // Adjust path if necessary, assuming ESM or change to require if CJS

async function seedTargets() {
    let pool;
    try {
        pool = await sql.connect(dbConfig);
        console.log('Connected to DB. Creating and seeding targets...');
        
        // Execute table creation
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='rpTargets' and xtype='U')
            BEGIN
                CREATE TABLE rpTargets (
                    ID INT IDENTITY(1,1) PRIMARY KEY,
                    Ma_HQ NVARCHAR(50),
                    Thang INT,
                    Nam INT,
                    ChiTieu_Thu DECIMAL(18,2),
                    ChiTieu_ToKhai INT,
                    ChiTieu_KimNgach DECIMAL(18,2)
                )
            END
        `);

        // Insert mock target data for 2024
        await pool.request().query(`
            INSERT INTO rpTargets (Ma_HQ, Thang, Nam, ChiTieu_Thu, ChiTieu_ToKhai, ChiTieu_KimNgach)
            VALUES 
            ('HQHN', 9, 2024, 15000000000.00, 5000, 100000000.00),
            ('HQHP', 9, 2024, 20000000000.00, 8000, 200000000.00)
        `);
        console.log('Targets seeded successfully!');
    } catch (err) {
        console.error('Seed failed:', err);
        process.exit(1);
    } finally {
        if (pool) pool.close();
    }
}

seedTargets();
```

- [ ] **Step 3: Run the seed script**
Run: `node scripts/seed-targets.js`
Expected: Output showing "Targets seeded successfully!"

- [ ] **Step 4: Commit**
```bash
git add Table_Targets.sql scripts/seed-targets.js
git commit -m "feat(db): add targets table and seed script for budget vs actual"
```

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

### Task 3: Global Filter Bar UI & Context Integration

**Files:**
- Create: `src/components/dashboard/GlobalFilterBar.tsx`
- Modify: `src/context/DashboardContext.tsx`
- Modify: `src/app/dashboard/layout.tsx`

**Interfaces:**
- Consumes: API from Task 2 via `DashboardContext`.
- Produces: A unified UI header across all tabs.

- [ ] **Step 1: Update Context to handle Filter State**
Modify `src/context/DashboardContext.tsx` to add `unit`, `timeframe`, and `tradeType` state variables. Pass them into the `fetchStats` function as query parameters.

- [ ] **Step 2: Create GlobalFilterBar Component**
Create `src/components/dashboard/GlobalFilterBar.tsx` containing:
- A `<select>` or Combobox for `unit` (Mã HQ).
- A group of `<button>`s for `timeframe` (T-1, Tuần, Tháng, Quý, Năm).
- A segmented control/toggle for `tradeType` (Tất Cả, Xuất, Nhập).
Bind these to the state from `useDashboardContext()`.

- [ ] **Step 3: Integrate into Layout**
Modify `src/app/dashboard/layout.tsx` to mount `<GlobalFilterBar />` just below the main `DashboardHeader`.

- [ ] **Step 4: Verify Compilation**
Run: `npm run build`
Expected: Successful build with no TypeScript errors.

- [ ] **Step 5: Commit**
```bash
git add src/context/DashboardContext.tsx src/components/dashboard/GlobalFilterBar.tsx src/app/dashboard/layout.tsx
git commit -m "feat(ui): add global filter bar and sync with dashboard context"
```
