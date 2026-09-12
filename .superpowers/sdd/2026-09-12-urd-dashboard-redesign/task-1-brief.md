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
