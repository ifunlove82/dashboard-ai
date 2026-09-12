# Task 4 Fix Round 1

## The Original Task Brief
`d:/DashboardAI/.superpowers/sdd/2026-09-12-urd-dashboard-redesign/task-4-brief.md`

## The Reviewer's Findings (Must Fix)
1. **Fix Tab-Switching Insight Fetching (`src/components/AIDrawer.tsx`):**
   Combine or update the `useEffect` hooks so that whenever `isOpen` is true and `pathname` changes, `fetchInsight()` is triggered automatically. Satisfy ESLint's `exhaustive-deps`.
2. **Handle In-Flight Fetch Cancellation / Race Conditions:**
   Use an `AbortController` to ignore/cancel stale in-flight requests when the route changes or the drawer closes.
3. **Use Installed `react-markdown`:**
   Import `ReactMarkdown` from `"react-markdown"` to render `insight` properly instead of displaying raw Markdown syntax. (It is already in `package.json`).
4. **Accessibility Improvements:**
   Add `aria-label="Close drawer"` to the close button, add an `Escape` key listener to close the drawer, and add `role="dialog"` / `aria-modal="true"` to the drawer root.
5. **Robust Error Handling:**
   Check `res.ok` before calling `.json()` on fetch responses to avoid syntax parsing errors on 500s.

Your job is to fix these specific issues in `src/components/AIDrawer.tsx`.

After fixing, run `npx next dev -p 3050` and manually test switching tabs while the drawer is open to confirm it re-fetches without race conditions. Also confirm ESLint (`npm run lint`) is clean for this component.

**Write your report to:** `d:/DashboardAI/.superpowers/sdd/2026-09-12-urd-dashboard-redesign/task-4-fix-1-report.md`
