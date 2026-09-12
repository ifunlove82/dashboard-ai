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
