# Spec: URD Dashboard Redesign & API Hub

## 1. Overview
The Customs & Import-Export Dashboard is evolving from a single-page prototype into a comprehensive, multi-tab enterprise data platform (based on the `URD Dashboard.md`). The system will provide data-dense visualizations with progressive disclosure to prevent cognitive overload. Additionally, the backend will be transformed into an "API Hub" designed to share data securely with external systems.

## 2. UI/UX Architecture
- **Tab-Based Routing:** The dashboard will be split into logical Next.js routes (pages) to maintain performance and mental clarity:
  - `/dashboard/overview`: High-level flashcards and macro trends.
  - `/dashboard/revenue`: Budget vs. Actual, tax breakdown, and Seaport Infrastructure Fees (Phí CSHT).
  - `/dashboard/clearance`: Import/Export declarations, commodity volume, and clearance lanes (Green/Yellow/Red).
  - `/dashboard/enterprises`: Top enterprise rankings and compliance metrics.
  - `/dashboard/officer-performance`: Customs officer performance (Workload, Lead Time, Hit Rate).
- **Progressive Disclosure:** To handle the 6 requested comparison types (YoY, MoM, YTD, Average, Structure, Budget), the default UI will surface only the **Top 2 most critical comparisons**. The remaining 4 will be accessible via Tooltips, Hover States, or Drill-down panels.
- **Context-Aware AI Assistant:** The AI insights feature will become a global floating Drawer (right side). It will read the current active route/tab and provide context-specific macro analysis for that domain.

## 3. Data Schema & Persistence Strategy
To support the URD requirements not present in the current MVP, the underlying SQL Server Schema will be expanded:
- **Statistical Filtering Flag:** Add a `Trong_Thong_Ke` (BIT) flag to declarations to separate trade volume (in statistics) from non-trade goods (excluded from statistics but included in revenue).
- **Officer Performance Tracking:** Add timestamp columns to track Service Level Agreements (SLA): `Thoi_diem_dang_ky`, `Thoi_diem_phan_luong`, `Thoi_diem_thong_quan`, and an identifier `Ma_Cong_Chuc`.
- **Infrastructure Fees (Phí CSHT):** Create a dedicated table `rpPhiCSHT` (or strictly define a tax code for it in `rpHang`) to track seaport infrastructure fees distinctly from standard import/export taxes.

## 4. API Hub Architecture (Data as a Service)
The Next.js Route Handlers (`src/app/api/*`) will be restructured into a standard RESTful API layer intended for consumption by both the Next.js frontend and external partner systems.
- **Versioning & Structure:** Endpoints will follow the `/api/v1/[resource]` convention.
- **Input/Output Standardization:** 
  - Standardized Query Params (e.g., `?timeframe=YTD&statistical=true&branch=HQHN`).
  - Unified JSON response wrapper containing `meta` (status, pagination) and `data` (payload).
- **Security:** External access will be gated by an API Key mechanism (e.g., validating `x-api-key` header against a stored hash or environment variables).

## 5. Development Strategy (Phases)
- **Phase 1: Database & API Hub (Backend):** Update `Table.sql`, generate new MockData/Seed script, and build the `/api/v1/` REST layer.
- **Phase 2: Frontend Architecture & Foundation:** Setup the Next.js nested layout for the 5 tabs and implement the Global AI Drawer.
- **Phase 3: Visualizations:** Implement the Data-Dense charts and Flashcards with progressive disclosure on each tab.
