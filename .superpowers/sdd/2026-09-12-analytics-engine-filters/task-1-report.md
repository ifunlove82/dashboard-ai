# Task 1 Implementation Report: Database Setup for Targets (Budget vs Actual)

**Project:** Analytics Engine & Global Filters  
**Task:** Task 1 - Database setup for Targets (Budget vs Actual)  
**Commit:** `d41151a` (`feat(db): add targets table and seed script for budget vs actual`)  
**Status:** DONE  
**Date:** 2026-09-12  

---

## 1. Summary of Changes

In accordance with `task-1-brief.md`, the SQL schema and database seeding script for revenue and performance targets (`rpTargets`) were created to support the Budget vs Actual metrics in the Analytics Engine.

### A. SQL Schema (`Table_Targets.sql`)
Created `Table_Targets.sql` defining the `rpTargets` table schema:
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

### B. Database Seed Script (`scripts/seed-targets.js`)
Created `scripts/seed-targets.js`:
- Loads database credentials from `.env.local` or environment variables.
- Connects to SQL Server via `mssql`.
- Ensures table `rpTargets` exists.
- Inserts mock target records for September 2024:
  - Unit `HQHN`: ChiTieu_Thu = 15,000,000,000.00, ChiTieu_ToKhai = 5,000, ChiTieu_KimNgach = 100,000,000.00
  - Unit `HQHP`: ChiTieu_Thu = 20,000,000,000.00, ChiTieu_ToKhai = 8,000, ChiTieu_KimNgach = 200,000,000.00
- Closes the connection pool cleanly.

---

## 2. Verification & Testing

1. **Seed Script Execution**:
   - Command: `node scripts/seed-targets.js`
   - Output:
     ```
     Connected to DB. Creating and seeding targets...
     Targets seeded successfully!
     ```
   - Exit code: 0

2. **Database Verification**:
   - Inspected `INFORMATION_SCHEMA.COLUMNS` for `rpTargets`:
     - `ID`: `int`, primary key identity
     - `Ma_HQ`: `nvarchar(50)`
     - `Thang`: `int`
     - `Nam`: `int`
     - `ChiTieu_Thu`: `decimal(18,2)`
     - `ChiTieu_ToKhai`: `int`
     - `ChiTieu_KimNgach`: `decimal(18,2)`
   - Queried `SELECT * FROM rpTargets`:
     - Row 1: `ID=1`, `Ma_HQ='HQHN'`, `Thang=9`, `Nam=2024`, `ChiTieu_Thu=15000000000.00`, `ChiTieu_ToKhai=5000`, `ChiTieu_KimNgach=100000000.00`
     - Row 2: `ID=2`, `Ma_HQ='HQHP'`, `Thang=9`, `Nam=2024`, `ChiTieu_Thu=20000000000.00`, `ChiTieu_ToKhai=8000`, `ChiTieu_KimNgach=200000000.00`

3. **Git Version Control**:
   - Staged files: `Table_Targets.sql`, `scripts/seed-targets.js`
   - Commit: `d41151a`
   - Commit message: `"feat(db): add targets table and seed script for budget vs actual"`

---

## 3. Concerns / Notes
- None.
