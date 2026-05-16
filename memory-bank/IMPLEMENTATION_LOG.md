# 📝 UI/UX UPDATE LOG

**Status:** BUILDING | **Last Sync:** May 17, 2026

## ✅ DONE

- **Routing:** `/articles` live. `/campaigns/article` removed. Sidebar grouping for 3D categories.
- **Header:** Revamped — compact horizontal layout (h-9 buttons, py-2.5), dark mode support.
- **Models Page:** Full CRUD UI. 45 mock items. Search/Filter/Paging.
- **Tools:** `useClickOutsideClose` (Dialogs), `useDebounce` (Search 300ms).
- **Standards:** ESM Imports. Memory Bank synced.
- **Dashboard Stats:** Animated counter effect with `useCountUp` hook.
- **Category Sales:** Pie chart visualization (interactive legend).
- **Theme System:** Persistence using localStorage + browser preference detection. Dark mode applies to Sidebar, Header via CSS variables + theme state.
- **API Integration:** Dashboard service with `/admin/dashboard` and `/staff/dashboard` endpoints.
- **Socket Service:** Notification channels (`staffId-userId` chat, `staffId-notification` alerts).
- **Notification Detail:** Full page at `/notifications/:id`.
- **Socket Bugfix:** Fixed `useNotificationSocket` — socket never connected because `fetchedRef.current` is a ref. Replaced with `initialFetchDone` state + AbortController.
- **Header Bugfix:** `initialNotifications` dead code — now used as initial state. Socket merge deduplicates by ID.
- **Admin Dashboard Rewrite:** Now consumes real `/admin/dashboard` response structure.
- **Staff Dashboard:** Created `StaffDashboardPage.jsx` — personal stats card + quick actions.
- **Role-based Sidebar:** Admin nav items include "Staff Dashboard". Staff nav items do not.
- **Role-based Index Route:** `DashboardRedirect` checks `user.role` — Admin sees DashboardPage, Staff sees StaffDashboardPage.
- **Article Routes:** Fixed — `/articles`, `/articles/:slug`, `/articles/create`. Removed `/campaigns/article`.
- **Article Detail Page:** Created at `/articles/:slug` — meta, content, approve/reject for Admin.
- **Dark Mode:** All components now use `theme` from uiStore. Sidebar + Header dynamically switch bg/border/text colors.
- **Overlay Removed:** `ArticleCampaignsPage`, `CreateArticlePage`, `OrderApprovalPage`.
- **Order Approval:** Approve (→ PAID) and Reject (→ REFUND_PENDING) for PENDING orders.
- **DashboardService:** Cleaned up — removed `useAuth` import.
- **SettingsService:** Created `src/services/settingsService.js` — personal settings, password, notification prefs.
- **Header Compact:** Reduced height (py-2.5), smaller icons (w-20), smaller buttons (h-9 w-9).
- **Header SVGs:** All icon buttons (Menu, Search, Bell) now use width/height 30.
- **Language Switch:** EN/VN toggle slider added to user dropdown, connected to `useUiStore.setCurrentLanguage`.
- **API Services Updated:** `modelsService`, `materialsService`, `toolsService`, `orderService`, `customerService`, `discountService` — all use correct API endpoints (`/catalog/*`) with `limit`/`skip` params.
- **usePaginatedApi Hook:** Created — reads `?page=` from URL, syncs pagination, handles loading/error, prev/next/setPage.
- **ModelsPage:** Real API data with URL pagination, loading spinner, error state with retry.
- **MaterialsPage:** Real API data with URL pagination, loading spinner, error state with retry.
- **ToolsPage:** Real API data with URL pagination, loading spinner, error state with retry.
- **ImageViewer Component:** Full-screen image modal with zoom (scroll/buttons), pan on drag, download, ESC close.
- **ChatPage Redesign:** Customer list merged into chat container. Toggleable sidebar (max 250px). Container min-width 500px. Customer items: name + last message + isActive only.
- **File Upload:** Files/images read as Base64, validated under 15MB, downloadable with correct filename.
- **Image Preview:** Click image in chat → ImageViewer modal with zoom + download.
- **Build Verified:** Zero errors on `vite build`.

## 📅 PLANNED

- Create Staff dashboard BE endpoint.
- Notification list page with real-time updates.
- Mobile responsive refinement.
- Connect remaining pages (OrdersPage, CustomersPage, DiscountCampaignsPage) to real APIs.
- Real backend API endpoints testing.
