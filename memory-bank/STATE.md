# STATE: Current Progress

## Focus: Table Quick Edit, Header UX, Support Chat

- **Current task**: Customer table quick edit, header search/notification toggle, support chat workspace.
- **Next task**: Materials/Tools CRUD depth, discount campaigns, order approvals.

## Completed Checklist

- [x] Vite + React Project Init
- [x] Tailwind CSS Setup
- [x] Admin Shell Layout (Sidebar/Header)
- [x] Register Page
- [x] SignIn Page (Sign In Mock)
- [x] Article Campaigns List
- [x] Header with circular avatar, ADMIN badge, user dropdown
- [x] Sidebar: sticky h-screen, scroll items, product child icons, orange active
- [x] Models Page with table/grid views, search, filter, pagination
- [x] Badge component, useClickOutsideClose hook
- [x] CustomersPage + CustomerDetailPage
- [x] Default route / -> Dashboard
- [x] Header icons 22px, dropdown z-900, darker hover, more padding
- [x] DashboardPage: stat cards, revenue chart, category breakdown, top models, recent orders
- [x] ArticleCampaignsPage: horizontal stats, create button in table head, no header description
- [x] ModelsPage: "+" button, no "Product Management" header, scrollable table
- [x] All tables: action buttons 18px icons, thin border, 5px padding, 5px border radius, hover bg
- [x] All tables: maxHeight scroll, horizontal scroll < 1000px
- [x] CustomersPage: split Email/Phone columns, Name/Joined columns, row checkboxes
- [x] Sidebar footer: removed "Admin Dashboard"
- [x] Header: bigger search/notification icons, unread notification badge, z-900 notification box, tighter dropdown container padding
- [x] Tables: expandable search input + clear button + enter/search action
- [x] CustomersPage: export icon button, double-click inline quick edit with save/cancel, actions menu overlay scoped to table
- [x] Customer Support Chat: 2-column chat list + history + message/file/image send with WebSocket-ready mock transport

## Remaining Checklist

- [ ] CRUD Materials UI
- [ ] CRUD Tools UI
- [ ] Discount Campaigns List
- [ ] Personal setting UI
- [ ] Order Approval & Refund View
- [ ] Real support chat channel wiring

## Action Button Standard

```text
h-8 w-8, rounded-[5px], border border-slate-200, padding: 5px
Icon: 18x18px via inline style
Colors: blue-600 (view), emerald-600 (edit), rose-600 (delete)
Hover: bg-blue-50, bg-emerald-50, bg-rose-50
```
