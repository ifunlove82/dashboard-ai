# URD Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the single-page Customs Dashboard MVP into a multi-tab API Hub and Executive Dashboard with progressive disclosure.

**Architecture:** We are creating a RESTful `/api/v1/*` layer to serve both our Next.js frontend (now split into 5 layout-based routes) and external systems. The SQL Server schema is expanded to track Infrastructure Fees (Phí CSHT), Officer performance, and separate statistical goods.

**Tech Stack:** Next.js 16 (App Router), `mssql` (SQL Server), Tailwind CSS v4, shadcn/ui.

**Spec:** `docs/superpowers/specs/2026-09-12-urd-dashboard-design.md`

## Global Constraints
- Only use standard SQL aggregations where possible.
- Adhere to UI/UX Pro Max principles: no more than 2 comparisons exposed by default per flashcard.
- Testing is done via `curl` or manual node scripts against the dev server (`localhost:3050`).

---

### Task 1: Expand SQL Schema & Seed Data

**Files:**
- Modify: `Table.sql`
- Modify: `scripts/seed.js`
- Modify: `src/lib/mockData.ts`

**Interfaces:**
- Produces: Updated `Table.sql` with `Trong_Thong_Ke`, timestamps, and new tables. Updated mock data for fallback.

- [ ] **Step 1: Modify `Table.sql`**
Add `Trong_Thong_Ke` (BIT), `Thoi_diem_dang_ky` (datetime), `Thoi_diem_phan_luong` (datetime), `Thoi_diem_thong_quan` (datetime), `Ma_Cong_Chuc` (varchar) to `rpToKhai`. Create table `rpPhiCSHT` (ID, Ngay_dang_ky, So_tien). Create table `rpHieuSuatCongChuc` (ID, Ma_Cong_Chuc, Ngay, To_khai_xanh, To_khai_vang, To_khai_do, Vi_pham).

- [ ] **Step 2: Update `scripts/seed.js`**
Update the seed script to insert random values for these new columns and tables so the backend has realistic test data.

- [ ] **Step 3: Update `src/lib/mockData.ts`**
Add mock data arrays for the new tables and columns to ensure fallback mode works without DB connection.

- [ ] **Step 4: Run script to verify no syntax errors**
Run `node scripts/seed.js` and verify it connects/seeds or fails gracefully if no DB. 

- [ ] **Step 5: Commit**
```bash
git add Table.sql scripts/seed.js src/lib/mockData.ts
git commit -m "feat(db): expand schema for URD tracking requirements"
```

### Task 2: Implement API Hub (Revenue & Clearance)

**Files:**
- Create: `src/app/api/v1/revenue/route.ts`
- Create: `src/app/api/v1/clearance/route.ts`

**Interfaces:**
- Consumes: Database schema from Task 1.
- Produces: JSON payload `{ meta: { status: 200 }, data: { ... } }`.

- [ ] **Step 1: Create `src/app/api/v1/revenue/route.ts`**
Implement a GET endpoint that queries `rpHang`, `rpToKhai`, and `rpPhiCSHT`. It must support query params (e.g. `timeframe`, `branch`).

- [ ] **Step 2: Create `src/app/api/v1/clearance/route.ts`**
Implement a GET endpoint that queries `rpToKhai` using `Trong_Thong_Ke = 1` logic to fetch clearance statistics.

- [ ] **Step 3: Test via curl**
Run Next dev server `npx next dev -p 3050`.
```bash
curl http://localhost:3050/api/v1/revenue
curl http://localhost:3050/api/v1/clearance
```
Expect HTTP 200 and valid JSON data wrappers.

- [ ] **Step 4: Commit**
```bash
git add src/app/api/v1
git commit -m "feat(api): implement v1 revenue and clearance endpoints"
```

### Task 3: Setup Next.js Tab-Based Architecture

**Files:**
- Create: `src/app/dashboard/layout.tsx`
- Create: `src/app/dashboard/overview/page.tsx`
- Create: `src/app/dashboard/revenue/page.tsx`
- Create: `src/app/dashboard/clearance/page.tsx`
- Create: `src/app/dashboard/enterprises/page.tsx`
- Create: `src/app/dashboard/officer-performance/page.tsx`

**Interfaces:**
- Produces: The core UI skeleton for the dashboard.

- [ ] **Step 1: Create `src/app/dashboard/layout.tsx`**
Implement a Left Sidebar with navigation links to the 5 routes using `next/link`.

- [ ] **Step 2: Scaffold empty pages**
Create simple React components in each `page.tsx` that output a title (e.g., `<h1>Revenue</h1>`) to verify routing.

- [ ] **Step 3: Test routing manually**
Visit `http://localhost:3050/dashboard/revenue` in browser and confirm navigation works without page reloads.

- [ ] **Step 4: Commit**
```bash
git add src/app/dashboard
git commit -m "feat(ui): setup dashboard tab routing architecture"
```

### Task 4: Implement Global AI Floating Drawer

**Files:**
- Create: `src/components/AIDrawer.tsx`
- Modify: `src/app/dashboard/layout.tsx`

**Interfaces:**
- Consumes: `/api/ai-insight` endpoint.
- Produces: A toggleable drawer providing context-aware AI analysis.

- [ ] **Step 1: Implement `AIDrawer.tsx`**
Create a Client Component that uses `usePathname()` to detect the current tab. It fetches AI insights dynamically based on the path. Use a sliding side-panel (drawer) UI.

- [ ] **Step 2: Mount Drawer in Layout**
Import and place `<AIDrawer />` inside `src/app/dashboard/layout.tsx` so it persists across all tabs.

- [ ] **Step 3: Test UI behavior**
Verify clicking the AI button opens the drawer and displays path-specific analysis.

- [ ] **Step 4: Commit**
```bash
git add src/components/AIDrawer.tsx src/app/dashboard/layout.tsx
git commit -m "feat(ai): integrate global context-aware AI drawer"
```
