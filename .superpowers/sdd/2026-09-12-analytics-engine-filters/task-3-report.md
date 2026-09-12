# Task 3 Report: Global Filter Bar UI & Context Integration

## Status
DONE

## Changes Made
- **DashboardContext**: Modified `src/context/DashboardContext.tsx` to add `unit`, `timeframe`, and `tradeType` state variables. 
  - Exposed them via `DashboardContextType`.
  - Initialized with `searchParams` defaults (`unit` defaults to "ALL", `timeframe` to "Tháng", `tradeType` to "Tất cả").
  - Modified `updateQueryParams` to also persist these new fields in the URL.
  - Modified the `fetchData` call in `DashboardContext` to include `&unit=${unit}&timeframe=${timeframe}&tradeType=${tradeType}` to the `/api/stats` endpoint.
- **GlobalFilterBar**: Created `src/components/dashboard/GlobalFilterBar.tsx` containing:
  - A `<select>` for `unit` mapping to `BRANCH_OPTIONS`.
  - A group of segmented `<button>` elements for `timeframe` options (`T-1`, `Tuần`, `Tháng`, `Quý`, `Năm`).
  - A group of segmented `<button>` elements for `tradeType` options (`Tất cả`, `Nhập khẩu`, `Xuất khẩu`).
  - The UI uses Tailwind CSS, styled consistently with the rest of the application (similar styling to `DashboardHeader.tsx`).
- **Layout Integration**: Added `<GlobalFilterBar />` directly below `<DashboardHeader />` in `src/app/dashboard/layout.tsx`.

## Testing
- **Compilation**: Ran `npm run build` which verified that there were no TypeScript errors and the build finished successfully.
- **Manual verification**: Looked at the codebase changes to confirm context wiring handles the new variables properly and sends them to the `/api/stats` endpoint. 

## Concerns
- Since the old fields (`branch`, `datePreset`, `loaiXNK`) are still in the application state and rendered in `DashboardHeader`, we technically now have overlapping states. A future task should ideally deprecate or remove the older filters in `DashboardHeader` to avoid user confusion (having two branch selectors, for example).

## Fixes After Review
- Updated `GlobalFilterBar.tsx` to use Shadcn UI components `Select` and `Button` instead of native `<select>` and `<button>`.
- Updated the type for `onValueChange` in `Select` to correctly match `(value: string | null) => void` resolving the TypeScript error.
- Verified that `npm run build` succeeds after the changes.
