### Task 2: Implement API Hub (Revenue & Clearance)

**Files:**
- Create: `src/app/api/v1/revenue/route.ts`
- Create: `src/app/api/v1/clearance/route.ts`

**Interfaces:**
- Consumes: Database schema from Task 1 (`rpToKhai` with `Trong_Thong_Ke`, `rpHang`, `rpPhiCSHT`).
- Produces: JSON payload `{ meta: { status: 200 }, data: { ... } }`.

- [ ] **Step 1: Create `src/app/api/v1/revenue/route.ts`**
Implement a GET endpoint that queries `rpHang`, `rpToKhai`, and `rpPhiCSHT`. It must support query params (e.g. `timeframe`, `branch`). Incorporate robust error handling and fallback to `getMockRevenue()` from `src/lib/mockData.ts` if DB fails. Ensure response is wrapped in standard `{ meta: { ... }, data: { ... } }`.

- [ ] **Step 2: Create `src/app/api/v1/clearance/route.ts`**
Implement a GET endpoint that queries `rpToKhai` using `Trong_Thong_Ke = 1` logic to fetch clearance statistics. Support query params. Incorporate fallback to `getMockClearance()` from `src/lib/mockData.ts`. Wrap response.

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
