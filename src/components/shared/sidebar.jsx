import {
  BookText,
  CircleDollarSign,
  Cuboid,
  LayoutDashboard,
  MessageCircleMore,
  Settings2,
  ShoppingCart
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@utils/cn";
import { useUiStore } from "@store/uiStore";

const navItems = [
  { to: "/campaigns/blog", label: "Blog Campaigns", icon: BookText },
  { to: "/campaigns/discount", label: "Discounts", icon: CircleDollarSign },
  { to: "/products/models", label: "Models", icon: Cuboid },
  { to: "/orders/approval", label: "Orders", icon: ShoppingCart },
  { to: "/settings/personal", label: "Settings", icon: Settings2 },
  { to: "/support/chat", label: "Support Chat", icon: MessageCircleMore }
];

export const Sidebar = () => {
  const { sidebarOpen } = useUiStore();

  return (
    <aside
      className={cn(
        "border-r border-slate-200/70 bg-white/80 p-5 backdrop-blur transition-all",
        sidebarOpen ? "w-72" : "w-24"
      )}
    >
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-slate-950">
          <LayoutDashboard className="h-6 w-6" />
        </div>
        {sidebarOpen ? (
          <div>
            <div className="font-title text-lg font-bold text-slate-900">Artivox</div>
            <div className="text-xs text-slate-500">Admin Dashboard</div>
          </div>
        ) : null}
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-amber-50 hover:text-slate-900"
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {sidebarOpen ? <span className="font-title font-medium">{item.label}</span> : null}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
