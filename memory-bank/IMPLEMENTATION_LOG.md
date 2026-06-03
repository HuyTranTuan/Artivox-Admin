# IMPLEMENTATION LOG

**Updated:** Jun 4, 2026

## ✅ DONE

- Routing: `/articles`, `/articles/:slug`, `/articles/create`, sidebar groups
- Header: compact (h-9, py-2.5), dark mode, EN/VN toggle in dropdown
- Catalog CRUD: Models, Materials, Tools — full pages with real API
- `usePaginatedApi`: URL ?page= sync, loading/error/retry
- Dashboard: admin (`/admin/dashboard`) + staff (`/admin/staff/dashboard`) — real data
- PieChart: donut style, gap, accurate % calc
- Notifications: socket service, detail page, `useNotificationSocket` (AbortController fix)
- Articles: CRUD + approve/reject
- Collections: CRUD
- Order Approval: PENDING → PAID / REFUND_PENDING
- Settings: profile update, password change, notification prefs
- Chat: customer support rooms, staff-to-staff internal chat
- ImageViewer: zoom/pan/download modal
- File upload: Base64, <15MB validation
- i18n: EN/VN keys for all catalog + customer pages
- `productService.js`: PATCH /catalog/products/:id (collection + discount)

## 📅 PLANNED

- Notification list with real-time filter
- Product management: full collection/discount assignment UI
- Mobile responsive pass
- Deployment
