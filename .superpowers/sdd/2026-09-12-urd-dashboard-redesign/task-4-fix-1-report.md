# Task 4 Fix Round 1 Report

## Status
DONE

## Changes Made
- Updated `AIDrawer.tsx` to automatically trigger `fetchInsight()` when `isOpen` is true or `pathname` changes, satisfying ESLint `exhaustive-deps` by wrapping it in `useCallback` and listing appropriate dependencies.
- Added an `AbortController` using a `useRef` to cancel stale in-flight fetches when the route changes or drawer closes.
- Replaced the basic markdown rendering with `ReactMarkdown` imported from `react-markdown`.
- Improved accessibility: added `aria-label="Close drawer"`, `role="dialog"`, `aria-modal="true"`, and an `Escape` key listener to close the drawer.
- Checked `res.ok` and `aiRes.ok` to avoid syntax parsing errors on 500 responses before calling `.json()`.

## Commits
- `fecc0c5` fix: resolve AIDrawer issues from task 4 review

## Test Summary
Successfully compiled the project using `npm run build` and verified the logic addresses the issues. `npm run lint` reported 0 errors.

## Concerns
None.
