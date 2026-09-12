# Task 1 Implementation Report: Expand SQL Schema & Seed Data

**Project:** URD Dashboard Redesign  
**Task:** Task 1 - Expand SQL Schema & Seed Data  
**Commit:** `9812b57` (`feat(db): expand schema for URD tracking requirements`)  
**Status:** DONE  
**Date:** 2026-09-12  

---

## 1. Summary of Changes

In accordance with `task-1-brief.md` and URD tracking specifications, the database schema, seeding engine, and TypeScript fallback layer were updated to support statistical trade filtering, seaport infrastructure fee management, and customs officer performance monitoring.

### A. Schema Expansion (`Table.sql`)
1. **`rpToKhai` Table Alterations**:
   - `[Trong_Thong_Ke] [bit] NULL DEFAULT 1`: Flag indicating whether a declaration is counted in official trade statistics (excluding samples, non-commercial transit, repair).
   - `[Thoi_diem_dang_ky] [datetime] NULL`: Timestamp when declaration was officially registered.
   - `[Thoi_diem_phan_luong] [datetime] NULL`: Timestamp when channel routing (Green/Yellow/Red) occurred.
   - `[Thoi_diem_thong_quan] [datetime] NULL`: Timestamp when customs clearance was granted.
   - `[Ma_Cong_Chuc] [varchar](50) NULL`: Customs officer ID assigned to handle/process the declaration.

2. **New Table: `rpPhiCSHT` (Seaport Infrastructure Fee)**:
   - `[ID] [uniqueidentifier] NOT NULL DEFAULT (newsequentialid())`
   - `[Ngay_dang_ky] [date] NOT NULL`
   - `[So_tien] [numeric](38, 2) NULL`
   - `[Ma_HQ] [char](4) NULL`
   - `[Loai_XNK] [nvarchar](4) NULL`
   - `[Ma_DN_XNK] [varchar](20) NULL`
   - `[Loai_hang] [nvarchar](50) NULL` (Container, Hàng rời, Hàng lỏng)
   - Primary Key: `(ID, Ngay_dang_ky)`

3. **New Table: `rpHieuSuatCongChuc` (Customs Officer Performance)**:
   - `[ID] [uniqueidentifier] NOT NULL DEFAULT (newsequentialid())`
   - `[Ma_Cong_Chuc] [varchar](50) NOT NULL`
   - `[Ngay] [date] NOT NULL`
   - `[To_khai_xanh] [int] NULL`
   - `[To_khai_vang] [int] NULL`
   - `[To_khai_do] [int] NULL`
   - `[Vi_pham] [int] NULL`
   - `[Thoi_gian_xu_ly_tb_phut] [numeric](10, 2) NULL`
   - Primary Key: `(ID, Ngay)`

---

## 2. Seed Data Script (`scripts/seed.js`)
- Implemented automatic schema synchronization and table alter checks to handle both fresh database deployments and incremental upgrades on existing DBs.
- Created officer pool of 8 customs officers (`CC01` to `CC08`).
- Generated realistic registration, channel routing, and customs clearance timestamps:
  - Registration during standard working hours.
  - Channel routing within 1-5 minutes of registration.
  - Clearance duration varied by lane (Green: 1-10 mins, Yellow: 15-90 mins, Red: 2-8 hours).
- Seeded `Trong_Thong_Ke` with 92% trade statistical compliance and 8% non-statistical trade.
- Seeded corresponding `rpPhiCSHT` infrastructure fees for all shipments based on container count and cargo type.
- Seeded daily officer performance records across officers with workload, hit rates on yellow/red inspections, and average processing lead times.
- Verified complete idempotency when running the script multiple times.

---

## 3. Mock Data Layer (`src/lib/mockData.ts`)
- Added TypeScript interfaces:
  - `MockPhiCSHT`
  - `MockHieuSuatCongChuc`
  - `MockDeclaration`
  - Extended `DashboardData` with `totalDeclarationsInStats`, `totalValueUSDInStats`, `totalPhiCSHTVND`, `targetPhiCSHTVND`, `phiCSHT`, `officerPerformance`, and `clearance` metrics.
- Exported static mock datasets:
  - `mockPhiCSHT`
  - `mockHieuSuatCongChuc`
  - `mockDeclarations`
  - `MOCK_OFFICERS`
- Updated `getMockStats()` and exported helper functions `getMockRevenue()`, `getMockClearance()`, and `getMockOfficerPerformance()` to ensure 100% offline fallback compatibility for upcoming tab APIs.

---

## 4. Verification & Testing

1. **Database Seeding Execution**:
   - Ran `node scripts/seed.js` on MS SQL Server (localhost:1433, DB `VNACCS_REPORT`).
   - Results:
     - 200 declarations inserted with timestamps and statistical flags.
     - 200 infrastructure fee rows inserted into `rpPhiCSHT`.
     - 224 officer performance rows inserted into `rpHieuSuatCongChuc`.
   - Re-ran `node scripts/seed.js` to verify clean table clearance and idempotent re-seeding.

2. **SQL Data Verification**:
   - Query verification confirmed:
     - `rpToKhai`: 200 total declarations (183 in-stats, 17 out-of-stats; 200/200 timestamps and officer IDs populated).
     - `rpPhiCSHT`: 200 total fees, 380,449,182 VND across 3 cargo types and 5 customs branches.
     - `rpHieuSuatCongChuc`: 224 records across 8 distinct officers (CC01-CC08), totaling 3,864 Green, 1,713 Yellow, 552 Red declarations, 131 violations, and ~41 mins average lead time.

3. **TypeScript & Static Analysis**:
   - Ran `npx tsc --noEmit` -> Clean exit (exit code 0, 0 errors).
   - Executed mock data validation via `tsx` -> Mock datasets and stats generators instantiated without errors.

4. **Git Version Control**:
   - Changes staged: `Table.sql`, `scripts/seed.js`, `src/lib/mockData.ts`.
   - Commit hash: `9812b57`
   - Commit message: `"feat(db): expand schema for URD tracking requirements"`.

---

## 5. Concerns / Notes
- None. Database schema, seed data, and fallback mock structures match URD specifications verbatim.
