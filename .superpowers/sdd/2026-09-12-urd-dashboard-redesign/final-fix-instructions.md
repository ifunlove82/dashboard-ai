# Final Whole-Branch Fixes

The final code reviewer found the following issues that must be addressed:

## 1. Fix `rpHang` <-> `rpToKhai` Join (Critical)
- **Files:** `Table.sql`, `scripts/seed.js`, `src/app/api/v1/revenue/route.ts`
- **What to do:** In `Table.sql`, add `ID_ToKhai uniqueidentifier` to `rpHang`. In `scripts/seed.js`, when generating `rpHang` rows, assign `ID_ToKhai: toKhaiId` (the ID of the parent declaration). In `revenue/route.ts`, update the JOIN condition from `h.ID = t.ID` to `h.ID_ToKhai = t.ID`.

## 2. Preserve Query Params in AI Drawer
- **File:** `src/components/AIDrawer.tsx`
- **What to do:** Use `useSearchParams` from `next/navigation`. When constructing the `dataUrl` to fetch from the API (e.g. `/api/v1/revenue`), append the current query parameters (e.g. `?${searchParams.toString()}`) so the AI gets the filtered data.

## 3. Preserve Query Params in Sidebar Navigation
- **File:** `src/app/dashboard/layout.tsx`
- **What to do:** Use `useSearchParams`. Update the `href` in the sidebar links to append `?${searchParams.toString()}` so that switching tabs keeps the current timeframe/branch filters.

## 4. API Error Handling (Architectural Ruling)
- **Files:** `src/app/api/v1/revenue/route.ts`, `src/app/api/v1/clearance/route.ts`
- **What to do:** The reviewer noted that returning 200 OK with mock data when the DB fails is dangerous for an external API Hub. Remove the mock data fallback entirely. If the DB query fails, catch the error, log it, and return a `500 Internal Server Error` with ` NextResponse.json({ meta: { status: 500, error: err.message } }, { status: 500 })`. (Remove imports of `mockData.ts` in these files).

## 5. Clean up Primary Key
- **File:** `Table.sql`
- **What to do:** Change the primary key of `rpHieuSuatCongChuc` to just `(ID ASC)` instead of `(ID ASC, Ngay ASC)`.

Please implement all these fixes. Return a report detailing the commits you made. Write the report to: `d:/DashboardAI/.superpowers/sdd/2026-09-12-urd-dashboard-redesign/final-fix-report.md`.
