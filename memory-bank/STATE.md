# STATE: PROGRESS

## 🟢 COMPLETED

- [x] Vite/Tailwind Foundation.
- [x] Auth Store (Persistence + Refresh Token).
- [x] Axios Interceptor (401 queue).
- [x] Protected Routes logic.
- [x] CRUD UI (Models, Tools, Materials) with mock data.
- [x] MainLayout Header responsive - compact horizontal layout, dark mode.
- [x] Theme persistence (browser preference + localStorage).
- [x] Dark mode connected to uiStore — Sidebar, Header, MainLayout all react.
- [x] Real API integration for dashboard (/admin/dashboard, /staff/dashboard).
- [x] Socket service for notifications (staffId-userId, staffId-notification channels).
- [x] Notification detail page (/notifications/:id).
- [x] Socket integration in notification components (useNotificationSocket fixed).
- [x] Admin Dashboard rewritten with real API structure (widgets, charts, top staff, top products).
- [x] Staff Dashboard created with personal stats.
- [x] Role-based sidebar (Admin sees Staff Dashboard, Staff does not).
- [x] Role-based index route (Admin → DashboardPage, Staff → StaffDashboardPage).
- [x] Article routes fixed: /articles, /articles/:slug, /articles/create (no /campaigns/article).
- [x] Article Detail page (/articles/:slug) with full meta + content.
- [x] Tailwind dark mode properly connected via CSS variables + uiStore theme.
- [x] Overlay modals removed from ArticleCampaignsPage, CreateArticlePage, OrderApprovalPage.
- [x] Order Approval page with Approve/Reject actions for Staff (PENDING → PAID / REFUND_PENDING).
- [x] DashboardService cleaned up (removed unused imports).
- [x] SettingsService created.

## 🟡 DOING

- [ ] Real backend API endpoints testing.
- [ ] Staff dashboard BE endpoint (create if missing).

## 🔴 TODO

- [ ] Deployment setup.
- [ ] Notification list page with filtering.
- [ ] Chat UI integration with socket service.
- [ ] Mobile responsive refinement.
- [ ] Analytics and reporting dashboard.
