import {
  BookText,
  CircleDollarSign,
  Cuboid,
  LayoutDashboard,
  MessageCircleMore,
  ShoppingCart,
  Users,
  Box,
  Layers,
  Wrench,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@utils/cn";
import { useUiStore } from "@store/uiStore";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/campaigns/article", label: "Article Campaigns", icon: BookText },
  { to: "/campaigns/discount", label: "Discounts", icon: CircleDollarSign },
  {
    label: "Products",
    icon: Cuboid,
    children: [
      { to: "/products/models", label: "Models", icon: Box },
      { to: "/products/materials", label: "Materials", icon: Layers },
      { to: "/products/tools", label: "Tools", icon: Wrench },
    ],
  },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/support/chat", label: "Support Chat", icon: MessageCircleMore },
];

export const Sidebar = ({ forcedOpen }) => {
  const { sidebarOpen, closeMobileSidebar } = useUiStore();
  const isOpen = forcedOpen || sidebarOpen;

  const handleNavClick = () => {
    // Close mobile sidebar on nav click
    if (forcedOpen) closeMobileSidebar();
  };

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen border-r border-slate-200/70 bg-white p-5 transition-all flex flex-col",
        isOpen ? "w-72" : "w-24",
      )}
    >
      <div className="mb-8 flex items-center gap-3">
        <NavLink
          to="/"
          onClick={handleNavClick}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-slate-950">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          {isOpen ? (
            <div>
              <div className="font-title text-lg font-bold text-slate-900">
                Artivox
              </div>
            </div>
          ) : null}
        </NavLink>
      </div>

      <nav className="space-y-1 flex-1 overflow-y-auto scrollbar-soft">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isGroup = item.children;

          if (isGroup) {
            return (
              <div key={item.label}>
                <div className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-600">
                  <Icon className="h-5 w-5 shrink-0" />
                  {isOpen ? (
                    <span className="font-title font-medium">{item.label}</span>
                  ) : null}
                </div>
                {isOpen && (
                  <div className="space-y-1 pl-4">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      return (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          onClick={handleNavClick}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition",
                              isActive
                                ? "bg-amber-500 text-white font-semibold"
                                : "text-slate-600 hover:bg-gray-200",
                            )
                          }
                        >
                          {ChildIcon && (
                            <ChildIcon className="h-4 w-4 shrink-0" />
                          )}
                          <span className="font-title font-medium">
                            {child.label}
                          </span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={handleNavClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition",
                  isActive
                    ? "bg-amber-500 text-white font-semibold"
                    : "text-slate-600 hover:bg-gray-200",
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {isOpen ? (
                <span className="font-title font-medium">{item.label}</span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      {isOpen && (
        <div className="border-t border-slate-200 pt-4 mt-4">
          <div className="text-xs text-slate-500 text-center">
            <p>© 2026 Artivox</p>
          </div>
        </div>
      )}
    </aside>
  );
};
