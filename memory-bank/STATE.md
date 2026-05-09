# STATE: Current Progress

## Focus: UI Polish + Auth Protected Routes

- **Current task**: ProtectedRoute covers all app routes. Orders/Tools/Materials/Models pages fixed with mock data, DD/MM/YYYY dates, Name/Date/Author columns, Add New toggle forms. Header revamped.

## Completed Checklist

- [x] **Project Foundation:** Vite + React + Tailwind setup.
- [x] **Auth:** Sign-in / Register mock pages.
- [x] **Navigation:** Article and discount campaign routes active.
- [x] **Sidebar:** Orders link now points to `/orders`.
- [x] **Routes:** Lazy-loaded all route pages except `DashboardLayout`, `AuthLayout`, `SignInPage`, `DashboardPage`.
- [x] **Protected Route:** All app routes wrapped. On mount: check token expiry → auto-refresh if expired → redirect to /signin if no token.
- [x] **Auth Store:** Added `refreshToken` state + `refreshAuth` action. Persisted to localStorage.
- [x] **Auth Service:** Added `refreshToken()` mock endpoint returning refreshed tokens.
- [x] **useAuth Hook:** Exposes `handleRefreshToken` that calls service + updates store.
- [x] **Axios Interceptors:** On 401, attempt refresh via fetch. Queues concurrent requests until refresh completes.
- [x] **Orders Page:** Switched to mock data, added Date column with DD/MM/YYYY format.
- [x] **Header:** Removed "A" badge, added email under avatar, theme toggle (light/dark), bigger Search/Notification icons.
- [x] **Tools Page:** Bigger "Add New +" button, toggle form (modal) with Cancel/Create, table columns: Name, Category, Status, Created At, Author, Actions. DD/MM/YYYY dates.
- [x] **Materials Page:** Same pattern as Tools: Add New + toggle form, Name/Type/Status/Created At/Author columns, DD/MM/YYYY.
- [x] **Models Page:** Same pattern: Add New + toggle form, Name/Category/Status/Created At/Author columns, DD/MM/YYYY.
- [x] **Dashboard:** 6 stats cards (added Active Products, Pending Orders), mini sparkline charts per card, summary metrics row (Avg Order, Conversion, Churn, Growth, Active Products, Total Customers), Week/Month chart toggle.
- [x] **Build Validation:** Production build passes with zero errors.

## Remaining Checklist

- [ ] Replace static campaign stats with live summary metrics.
- [ ] Add dedicated article/discount detail pages for slug routes.
- [ ] Connect Real API (Prisma/Node.js).

## UI Standard

- **Radius:** 16px (`rounded-2xl`).
- **Table Buttons:** h-8 w-8, 5px radius, thin border.
- **Colors:** Blue (View), Emerald (Edit), Rose (Delete), Orange (Hover).
- **Dates:** DD/MM/YYYY throughout.
- **Table Columns:** Name, [Type/Category/Status], Created At, Author, Actions.
