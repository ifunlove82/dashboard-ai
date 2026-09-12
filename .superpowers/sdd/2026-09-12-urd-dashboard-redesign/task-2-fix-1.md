# Task 2 Fix Round 1

## The Original Task Brief
`d:/DashboardAI/.superpowers/sdd/2026-09-12-urd-dashboard-redesign/task-2-brief.md`

## The Reviewer's Findings (Must Fix)
1. **Query `rpHang`** in `src/app/api/v1/revenue/route.ts` as required by the specification.
2. **Support `timeframe`** (and date filters) query parameters in both `revenue` and `clearance` endpoints, passing them through to both DB queries and fallback functions.
3. **Harmonize response schemas**: Ensure the live DB data payload structure strictly matches the contract defined by `mockData` (or define a shared interface for both).
4. **Fix SQL column names**: Check the actual Task 1 schema for `rpToKhai` and `rpPhiCSHT` (replace assumed column names like `id`, `kimNgachUSD`, `tongThueThuKhacVND` with actual column names) so the live DB query executes without throwing exceptions.
5. **Use `COUNT(*)`** instead of `COUNT(id)`.
6. **Parallelize queries** in `revenue/route.ts` using `Promise.all`.

Your job is to fix these specific issues. You must read `Table.sql` to get the actual column names (e.g. `Kim_ngach_USD`, `Tong_thue_thu_khac_VND`, `ID`).
Make sure your live DB payload format strictly mirrors `getMockRevenue()` and `getMockClearance()` schemas in `src/lib/mockData.ts`.

After fixing, run local `curl` tests to verify the live DB path does NOT fail into fallback anymore.

**Write your report to:** `d:/DashboardAI/.superpowers/sdd/2026-09-12-urd-dashboard-redesign/task-2-fix-1-report.md`
