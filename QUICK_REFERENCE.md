# Quick Reference: New Patterns & Features

## 🔍 Search with Debounce Pattern

Use this pattern when you need searchable lists:

```jsx
import { useState } from "react";
import { Search, X } from "lucide-react";
import { useDebounce } from "@hooks/useDebounce";

export const SearchableList = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  return (
    <>
      {searchOpen ? (
        <Input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          autoFocus
        />
      ) : (
        <Button onClick={() => setSearchOpen(true)}>
          <Search className="h-5 w-5" />
        </Button>
      )}
      {/* Filter items using debouncedSearch */}
    </>
  );
};
```

## 🎯 Dialog with Click-Outside Close

Use this pattern for modals and dialogs:

```jsx
import { useClickOutsideClose } from "@hooks/useClickOutsideClose";

export const MyDialog = () => {
  const [open, setOpen] = useState(false);
  const dialogRef = useClickOutsideClose(() => setOpen(false));

  return (
    open && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div ref={dialogRef} className="bg-white rounded-2xl p-6">
          {/* Dialog content */}
        </div>
      </div>
    )
  );
};
```

## 🔘 Action Buttons in Tables

Standard pattern for row actions:

```jsx
import { Eye, Pencil, Trash2 } from "lucide-react";

<div className="flex gap-2">
  <Button
    variant="ghost"
    size="sm"
    className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
    onClick={() => handleView(item)}
  >
    <Eye className="h-4 w-4" />
  </Button>
  <Button
    variant="ghost"
    size="sm"
    className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700"
    onClick={() => handleEdit(item)}
  >
    <Pencil className="h-4 w-4" />
  </Button>
  <Button
    variant="ghost"
    size="sm"
    className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700"
    onClick={() => handleDelete(item)}
  >
    <Trash2 className="h-4 w-4" />
  </Button>
</div>;
```

## 📊 Table Structure

Proper table layout with straight line borders:

```jsx
<div className="overflow-hidden rounded-2xl border border-slate-200">
  {/* Header */}
  <div className="grid grid-cols-[2fr_1fr_1fr_1fr_120px] gap-4 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-500 border-b border-slate-300">
    <div>Column 1</div>
    <div>Column 2</div>
    {/* ... */}
  </div>

  {/* Rows */}
  {items.map((item) => (
    <div
      key={item.id}
      className="grid grid-cols-[2fr_1fr_1fr_1fr_120px] gap-4 border-b border-slate-200 px-4 py-4"
    >
      {/* Row content */}
    </div>
  ))}
</div>
```

## 📄 Pagination Pattern

Standard pagination for lists with 20 items per page:

```jsx
const itemsPerPage = 20;
const [currentPage, setCurrentPage] = useState(1);

const totalPages = Math.ceil(items.length / itemsPerPage);
const startIdx = (currentPage - 1) * itemsPerPage;
const paginatedItems = items.slice(startIdx, startIdx + itemsPerPage);

// Render pagination controls
<div className="flex items-center justify-between">
  <div className="text-sm text-slate-600">
    Showing {startIdx + 1}-{Math.min(startIdx + itemsPerPage, items.length)}
    of {items.length} items
  </div>
  <div className="flex gap-2">
    <Button
      variant="ghost"
      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
      disabled={currentPage === 1}
    >
      Previous
    </Button>
    {/* Page number buttons */}
    <Button
      variant="ghost"
      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
      disabled={currentPage === totalPages}
    >
      Next
    </Button>
  </div>
</div>;
```

## 🏷️ Status Badge (Text Only)

Always use for status display:

```jsx
import { Badge } from "@components/ui/badge";

<Badge>{item.status}</Badge> {/* Just text color, no background */}
```

## 🗂️ Sidebar Navigation Group

For nested navigation items:

```jsx
const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  {
    label: "Products",
    icon: Cuboid,
    children: [
      { to: "/products/models", label: "Models" },
      { to: "/products/materials", label: "Materials" },
      { to: "/products/tools", label: "Tools" },
    ],
  },
];

// Render in sidebar...
{
  navItems.map((item) => {
    if (item.children) {
      return (
        <div key={item.label}>
          <div className="flex items-center gap-3 px-4 py-3 text-sm">
            <Icon className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>{item.label}</span>}
          </div>
          {sidebarOpen && (
            <div className="space-y-1 pl-4">
              {item.children.map((child) => (
                <NavLink key={child.to} to={child.to}>
                  {child.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }
    // Regular item rendering...
  });
}
```

## 🎨 Header Circle Avatar

User avatar styling:

```jsx
<div className="flex flex-col items-center gap-2">
  <div className="h-12 w-12 rounded-full bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold">
    {user?.name?.charAt(0)?.toUpperCase() || "U"}
  </div>
  <div className="text-center">
    <div className="text-xs font-semibold">{user?.name}</div>
    <div className="text-xs text-slate-500">{user?.role}</div>
  </div>
</div>
```

## 📱 Responsive View Mode Toggle

For table/grid switching:

```jsx
const [viewMode, setViewMode] = useState("table");

<div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
  <Button
    variant={viewMode === "table" ? "default" : "ghost"}
    size="sm"
    onClick={() => setViewMode("table")}
  >
    <List className="h-4 w-4" />
  </Button>
  <Button
    variant={viewMode === "grid" ? "default" : "ghost"}
    size="sm"
    onClick={() => setViewMode("grid")}
  >
    <Grid3x3 className="h-4 w-4" />
  </Button>
</div>;
```

## 🔧 Using These Patterns

When creating new pages or components:

1. **For list pages**: Use SearchableList + Filter + Pagination + Action Buttons pattern
2. **For dialogs**: Always use useClickOutsideClose
3. **For tables**: Use straight line borders pattern
4. **For search**: Use debounce pattern (300ms)
5. **For status**: Use text-only Badge component
6. **For navigation**: Use nested groups for related items

See `IMPLEMENTATION_SUMMARY.md` for complete details on all changes.
