### Task 3: Setup Next.js Tab-Based Architecture

**Files:**
- Create: `src/app/dashboard/layout.tsx`
- Create: `src/app/dashboard/overview/page.tsx`
- Create: `src/app/dashboard/revenue/page.tsx`
- Create: `src/app/dashboard/clearance/page.tsx`
- Create: `src/app/dashboard/enterprises/page.tsx`
- Create: `src/app/dashboard/officer-performance/page.tsx`
- Create/Modify: `src/app/page.tsx` (to redirect to `/dashboard/overview`)

**Interfaces:**
- Produces: The core UI skeleton for the dashboard.

- [ ] **Step 1: Create `src/app/dashboard/layout.tsx`**
Implement a Left Sidebar with navigation links to the 5 routes using `next/link`. The layout should use Tailwind CSS for styling and shadcn/ui components if appropriate. Ensure there's a main content area for the `children`.

- [ ] **Step 2: Scaffold empty pages**
Create simple React Server Components in each `page.tsx` that output a title (e.g., `<h1 className="text-2xl font-bold">Revenue</h1>`) to verify routing. 

- [ ] **Step 3: Setup Root Redirect**
Modify `src/app/page.tsx` to automatically redirect users to `/dashboard/overview` (using Next.js `redirect`).

- [ ] **Step 4: Test routing manually**
Run Next dev server `npx next dev -p 3050`. Visit `http://localhost:3050` in browser and confirm it redirects to `/dashboard/overview`. Confirm navigation via the sidebar works across all 5 tabs.

- [ ] **Step 5: Commit**
```bash
git add src/app/dashboard src/app/page.tsx
git commit -m "feat(ui): setup dashboard tab routing architecture"
```
