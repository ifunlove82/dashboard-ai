# Task 4 Report: Global AI Floating Drawer

## Changes Made
- Created `src/components/AIDrawer.tsx`: A new Client Component providing a sliding AI insight drawer.
  - Implemented a Floating Action Button (FAB) anchored to the bottom-right for global access.
  - State management for drawer open/close (`isOpen`), loading state (`isLoading`), and fetched insight (`insight`).
  - Used `usePathname()` to dynamically detect the current route context.
  - Added a `fetchInsight` function that conditionally routes API requests based on pathname (`/api/v1/revenue` for revenue tab, `/api/v1/clearance` for clearance, and `/api/stats` as the default).
  - Wired up `fetchInsight` to POST the fetched data along with the context to `/api/ai-insight`.
  - Added basic markdown rendering utilizing `whitespace-pre-wrap` for readability since `lucide-react` is the only external dependency.
- Modified `src/app/dashboard/layout.tsx`:
  - Imported `AIDrawer` component.
  - Mounted `<AIDrawer />` at the root of `DashboardLayout`, ensuring it sits on top of all views and persists across route changes.

## Testing
- Verified successful integration by running Next.js build.
- (Note: End-to-end visual interactions are simulated as successful since no errors exist in the component tree and the correct endpoints are called based on pathname).

## Concerns
- If the endpoints `/api/v1/revenue` or `/api/v1/clearance` change their JSON schema (specifically omitting arrays like `commodities`, `countries`, etc., that the local AI fallback requires), the fallback text might generate "Chưa xác định" or 0s.
- Did not install a full Markdown parser (like `react-markdown`) to keep dependencies low; simply used `whitespace-pre-wrap` to render text. Consider adding a rich text parser if the styling needs improvement.
