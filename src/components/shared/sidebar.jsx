import {
  BookText,
  CircleDollarSign,
  Cuboid,
  LayoutDashboard,
  MessageCircleMore,
  Settings2,
  ShoppingCart,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@utils/cn";
import { useUiStore } from "@store/uiStore";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/campaigns/article", label: "Article Campaigns", icon: BookText },
  { to: "/campaigns/discount", label: "Discounts", icon: CircleDollarSign },
  {
    label: "Products",
    icon: Cuboid,
    children: [
      { to: "/products/models", label: "Models" },
      { to: "/products/materials", label: "Materials" },
      { to: "/products/tools", label: "Tools" },
    ],
  },
  { to: "/orders/approval", label: "Orders", icon: ShoppingCart },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/settings/personal", label: "Settings", icon: Settings2 },
  { to: "/support/chat", label: "Support Chat", icon: MessageCircleMore },
];

export const Sidebar = () => {
  const { sidebarOpen } = useUiStore();

  return (
    <aside
      className={cn(
        "border-r border-slate-200/70 bg-white/80 p-5 backdrop-blur transition-all flex flex-col",
        sidebarOpen ? "w-72" : "w-24",
      )}
    >
      <div className="mb-8 flex items-center gap-3">
        <NavLink
          to="/"
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-slate-950">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          {sidebarOpen ? (
            <div>
              <div className="font-title text-lg font-bold text-slate-900">
                Artivox
              </div>
              <div className="text-xs text-slate-500">Admin Dashboard</div>
            </div>
          ) : null}
        </NavLink>
      </div>

      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isGroup = item.children;

          if (isGroup) {
            return (
              <div key={item.label}>
                <div className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-600">
                  <Icon className="h-5 w-5 shrink-0" />
                  {sidebarOpen ? (
                    <span className="font-title font-medium">{item.label}</span>
                  ) : null}
                </div>
                {sidebarOpen && (
                  <div className="space-y-1 pl-4">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 rounded-2xl px-4 py-2 text-sm transition",
                            isActive
                              ? "bg-slate-900 text-white"
                              : "text-slate-600 hover:bg-amber-50 hover:text-slate-900",
                          )
                        }
                      >
                        <span className="font-title font-medium">
                          {child.label}
                        </span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-amber-50 hover:text-slate-900",
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {sidebarOpen ? (
                <span className="font-title font-medium">{item.label}</span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      {sidebarOpen && (
        <div className="border-t border-slate-200 pt-4 mt-4">
          <div className="text-xs text-slate-500 text-center">
            <p>© 2026 Artivox</p>
            <p>Admin Dashboard</p>
          </div>
        </div>
      )}
    </aside>
  );
};
