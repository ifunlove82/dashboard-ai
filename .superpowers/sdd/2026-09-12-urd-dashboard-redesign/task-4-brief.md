### Task 4: Implement Global AI Floating Drawer

**Files:**
- Create: `src/components/AIDrawer.tsx`
- Modify: `src/app/dashboard/layout.tsx`

**Interfaces:**
- Consumes: `/api/ai-insight` endpoint. (This endpoint already exists from previous implementation, but it expects JSON data. You should adapt the drawer to fetch the page's data or just send a context string).
- Produces: A toggleable drawer providing context-aware AI analysis.

- [ ] **Step 1: Implement `AIDrawer.tsx`**
Create a Client Component that uses `usePathname()` to detect the current tab. It should have a floating FAB (Floating Action Button) or a button in the header/sidebar to toggle the drawer open/close. 
The drawer should slide in from the right. It must fetch insights dynamically. Note: The existing `/api/ai-insight/route.ts` expects a POST request with `{ data, context }`. You should fetch data from the current route's API (e.g. `/api/v1/revenue` if on `/dashboard/revenue`), then send that data to `/api/ai-insight`.

- [ ] **Step 2: Mount Drawer in Layout**
Import and place `<AIDrawer />` inside `src/app/dashboard/layout.tsx` so it persists across all tabs. Ensure it overlays the layout correctly.

- [ ] **Step 3: Test UI behavior**
Run Next dev server `npx next dev -p 3050`. Verify clicking the AI button opens the drawer. Verify that navigating between tabs changes the `usePathname()` context and fetches the correct AI insights for that specific tab.

- [ ] **Step 4: Commit**
```bash
git add src/components/AIDrawer.tsx src/app/dashboard/layout.tsx
git commit -m "feat(ai): integrate global context-aware AI drawer"
```
