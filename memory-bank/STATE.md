# STATE: ARTIVOX ADMIN

**Updated:** Jun 29, 2026 | **Status:** 🟡 ACTIVE DEVELOPMENT

## ✅ DONE

- Vite/Tailwind/Shadcn foundation
- Auth store (persistence + refresh token)
- Axios interceptor (401 queue)
- Protected routes (role-based)
- MainLayout + AuthLayout
- Dark mode (CSS vars + uiStore)
- Theme persistence (localStorage + browser pref)
- i18n EN/VN toggle in user dropdown
- CRUD pages: Models, Materials, Tools (real API, pagination, search, filter)
- `usePaginatedApi` hook — URL ?page= sync, prev/next/setPage
- `useDebounce` (300ms), `useClickOutsideClose`, `useCountUp`, `useExpandableSearch`
- Dashboard (admin + staff) — real `/admin/dashboard`, `/admin/staff/dashboard` APIs
- Notification socket service + detail page `/notifications/:id`
- `useNotificationSocket` — AbortController + initialFetchDone state (not ref)
- Article CRUD — list `/articles`, detail `/articles/:slug`, create `/articles/create`
- Article approve/reject (Admin/Manager only)
- Collections CRUD — list, detail, create
- Order approval page — PENDING → PAID / REFUND_PENDING
- Settings service — profile, password, notification prefs
- Chat page — customer support rooms, toggleable sidebar, file/image upload (Base64, <15MB)
- Chat: ImageViewer modal (zoom/pan/download), internal staff-to-staff chat
- `aiChatService.js` — AI chat for admin panel
- `notificationSocket.js` + `supportChatSocket.js`
- Role-based sidebar (Admin sees Staff Dashboard; Staff does not)
- Role-based index route (Admin → DashboardPage, Staff → StaffDashboardPage)

## 🟡 IN PROGRESS

- Real API testing / bug fixes on catalog pages
- Notification list page with real-time filtering

## 🔴 TODO

- Mobile responsive refinement
- Deployment setup
- Analytics/reporting enhancements
- Product update flow (collection assign + discount assign)
