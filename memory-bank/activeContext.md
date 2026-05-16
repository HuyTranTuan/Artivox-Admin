# ACTIVE CONTEXT

## 🎯 GOAL

- Stable Admin/Staff dashboard flows with real API integration.
- Responsive header with theme management.
- Real-time notifications via WebSocket.
- Role-based routing and sidebar (Admin vs Staff).
- Real API data fetching with URL-based pagination.
- Chat UI with file/image upload, zoom, download.

## 🛠 CURRENT STATUS

- Router: Lazy-loading active. Routes fixed: `/articles`, `/articles/:slug`, `/articles/create`. Removed `/campaigns/article`.
- Dashboard: Admin dashboard consumes real `/admin/dashboard` API (widgets, charts, top staff, top products). Staff dashboard created.
- Sidebar: Role-based — Admin sees "Staff Dashboard" + all modules. Staff sees only their modules (no Staff Dashboard link).
- Articles: List page (`/articles`), detail page (`/articles/:slug`), create page (`/articles/create`) — no overlays.
- Orders: Approval page with Approve/Reject actions (PENDING → PAID / REFUND_PENDING).
- Dark mode: Properly wired via CSS variables — `.dark` class toggles all colors. Connected to uiStore theme.
- Overlay modals: Removed from ArticleCampaignsPage, CreateArticlePage, OrderApprovalPage.
- DashboardService: Cleaned up — removed unused `useAuth` import.
- **Services updated**: `modelsService`, `materialsService`, `toolsService`, `orderService`, `customerService`, `discountService` — all now support `{ limit, skip }` params and call correct API endpoints (`/catalog/*`).
- **Pagination hook**: `usePaginatedApi` — reads `?page=` from URL, syncs pagination with search params, supports prev/next/setPage, loading/error states.
- **Pages updated**: ModelsPage, MaterialsPage, ToolsPage — now fetch real API data with URL-based pagination, loading spinners, error states with retry.
- **Chat page redesigned**: Customer list merged into chat container with toggle button (`PanelRightClose`/`PanelRightOpen`). Container `minWidth: 500px`, customer list `maxWidth: 250px`. Customer items simplified to name + last message + isActive.
- **Header**: SVG icons now 30x30px. Language switch (EN/VN slider) added to user dropdown, connected to `useUiStore.currentLanguage`.
- **ImageViewer**: New modal component for image zoom (scroll/buttons), pan on drag, download button, ESC close. Used in ChatPage for image preview.

## 🟢 DONE THIS SPRINT

- Admin Dashboard rewritten to consume real API structure from `/admin/dashboard`.
- Staff Dashboard created with personal stats (calls `/staff/dashboard`).
- Role-based sidebar: Admin links + Staff Dashboard. Staff links only.
- Article routes fixed: `/articles`, `/articles/:slug`, `/articles/create`.
- Article Detail page created at `/articles/:slug`.
- Dark mode connected to uiStore via CSS variables.
- Overlay modals removed from all pages.
- Order Approval with Approve/Reject for Staff.
- DashboardService cleaned up.
- All catalog services updated with correct `/catalog/*` endpoints and pagination params.
- `usePaginatedApi` hook created with URL query param sync.
- ModelsPage, MaterialsPage, ToolsPage connected to real APIs with loading/error/retry.
- Header: SVGs resized to 30x30, language slider added.
- ImageViewer component for zoom/download.
- ChatPage: Merged customer list, toggleable sidebar (max 250px), container min-width 500px.
- File upload validation (< 15MB), inline preview with download for images.
- Build verified — zero errors.

## 🔜 NEXT SPRINT

- Create Staff dashboard BE endpoint if missing.
- Notification list page with real-time updates.
- Mobile refinements (header, sidebar on small screens).
- Performance optimization (code splitting, lazy images).
- Real backend API endpoints testing (all services).
- Connect remaining pages (OrdersPage, CustomersPage, DiscountCampaignsPage) to real APIs.
