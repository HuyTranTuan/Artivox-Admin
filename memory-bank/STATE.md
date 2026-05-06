# STATE: Current Progress

## Focus: Campaign/Table UX Polish, Article Create Page, Order Approval Table

- **Current task**: Article campaigns - New button navigates to create page, Refresh icon button, all table th bold black. Customers - 3 visible action buttons, orange row hover, orange checkbox. Order approval - proper table with columns, filter/sort/search.

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
- [x] ArticleCampaignsPage: Refresh replaced with RefreshCw icon button, "New campaign" → "New", navigates to create page
- [x] CreateArticlePage: full-screen overlay with title input, locale select, status select, ReactQuill rich text editor
- [x] All table headers (th): bold black text (font-bold text-slate-900)
- [x] CustomersPage: 3 action buttons visible (Eye/Pencil/Trash2), orange row hover (hover:bg-orange-50), orange checkbox accent
- [x] OrderApprovalPage: rebuilt as proper table with checkbox/Code/Customer/Amount/Status/Actions columns, sort/filter/search

## Remaining Checklist

- [ ] CRUD Materials UI
- [ ] CRUD Tools UI
- [ ] Discount Campaigns List
- [ ] Personal setting UI
- [ ] Real support chat channel wiring

## Action Button Standard

```text
h-8 w-8, rounded-[5px], border border-slate-200, padding: 5px
Icon: 18x18px via inline style
Colors: blue-600 (view), emerald-600 (edit), rose-600 (delete)
Hover: bg-blue-50, bg-emerald-50, bg-rose-50
```
