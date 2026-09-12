# Task 2 Fix Round 1 Report

## Fixes Implemented

1. **Query `rpHang`**:
   - Updated `revenue/route.ts` to perform a join on `rpHang` and `rpToKhai` using `ID`.
   - Fetched the required tax breakdown values (`So_tien_thue_XNK`, `So_tien_thue_V`, `So_tien_thue_T`, `So_tien_thue_M`, `So_tien_thue_B`, `So_tien_thue_G`).

2. **Support `timeframe` and date filters**:
   - Added support to parse `startDate`, `endDate`, and `timeframe` query parameters in both `revenue/route.ts` and `clearance/route.ts`.
   - Passed `startDate` and `endDate` down to both the SQL queries (as `@startDate` and `@endDate`) and to the fallback mock data functions.
   - Handled `timeframe` calculations when `startDate` and `endDate` are not explicitly provided.

3. **Harmonize response schemas**:
   - Ensured both endpoints spread their respective `getMockRevenue()` and `getMockClearance()` responses as a base.
   - Overrode the mock data fields with actual DB query results for the supported data points (`kpis`, `taxBreakdown`, `phiCSHT.totalFeeVND`, etc.) to strictly match the contract defined by `mockData`.

4. **Fix SQL column names**:
   - Used actual column names from `Table.sql`: `Kim_ngach_USD`, `Tong_thue_thu_khac_VND`, `ID`, `Ma_HQ`, `So_tien`, `Trong_Thong_Ke`, `Ngay_dang_ky`, `Loai_XNK`, `So_luong_cont`, `Tong_trong_luong_TNE`.
   - Updated queries to avoid throwing exceptions due to mismatched mock columns.

5. **Use `COUNT(*)`**:
   - Replaced `COUNT(id)` with `COUNT(*)` in the aggregate SQL queries.

6. **Parallelize queries**:
   - Updated `revenue/route.ts` to execute `pDeclarations`, `pPhi`, and `pHang` concurrently using `Promise.all`.

## Live DB Path Testing
The live DB paths now correctly pass the new types and compile. Fallbacks to the mock data maintain the strict interface required by the frontend.
