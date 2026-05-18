import { useState } from "react";
import { BookText, CircleDollarSign, Cuboid, LayoutDashboard, MessageCircleMore, ShoppingCart, Users, Box, Layers, Wrench, UserCog, ClipboardCheck } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@utils/cn";
import { useUiStore } from "@store/uiStore";
import { useAuth } from "@hooks/useAuth";
import { useTranslation } from "react-i18next";

const adminNavItems = [
  { to: "/", labelKey: "nav.dashboard", icon: LayoutDashboard, end: true },
  { to: "/staff/dashboard", labelKey: "nav.staffDashboard", icon: UserCog },
  {
    labelKey: "nav.articles",
    icon: BookText,
    children: [{ to: "/articles", labelKey: "nav.allArticles", icon: BookText }],
  },
  { to: "/campaigns/discount", labelKey: "nav.discounts", icon: CircleDollarSign },
  {
    labelKey: "nav.products",
    icon: Cuboid,
    children: [
      { to: "/products/models", labelKey: "nav.models", icon: Box },
      { to: "/products/materials", labelKey: "nav.materials", icon: Layers },
      { to: "/products/tools", labelKey: "nav.tools", icon: Wrench },
    ],
  },
  { to: "/orders", labelKey: "nav.orders", icon: ShoppingCart, end: true },
  { to: "/orders/approval", labelKey: "nav.orderApproval", icon: ClipboardCheck },
  { to: "/customers", labelKey: "nav.customers", icon: Users },
  { to: "/support/chat", labelKey: "nav.supportChat", icon: MessageCircleMore },
];

const staffNavItems = [
  { to: "/staff/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, end: true },
  {
    labelKey: "nav.articles",
    icon: BookText,
    children: [{ to: "/articles", labelKey: "nav.allArticles", icon: BookText }],
  },
  { to: "/campaigns/discount", labelKey: "nav.discounts", icon: CircleDollarSign },
  {
    labelKey: "nav.products",
    icon: Cuboid,
    children: [
      { to: "/products/models", labelKey: "nav.models", icon: Box },
      { to: "/products/materials", labelKey: "nav.materials", icon: Layers },
      { to: "/products/tools", labelKey: "nav.tools", icon: Wrench },
    ],
  },
  { to: "/orders/approval", labelKey: "nav.orderApproval", icon: ClipboardCheck },
  { to: "/orders", labelKey: "nav.orders", icon: ShoppingCart, end: true },
  { to: "/customers", labelKey: "nav.customers", icon: Users },
  { to: "/support/chat", labelKey: "nav.supportChat", icon: MessageCircleMore },
];

const resolveLabel = (item, t) => {
  if (item.children) {
    return { ...item, label: t(item.labelKey), children: item.children.map((c) => ({ ...c, label: t(c.labelKey) })) };
  }
  return { ...item, label: t(item.labelKey) };
};

export const Sidebar = ({ forcedOpen }) => {
  const { sidebarOpen, closeMobileSidebar, theme, currentLanguage: lang } = useUiStore();
  const { user } = useAuth();
  const location = useLocation();
  const isOpen = forcedOpen || sidebarOpen;
  const isAdmin = user?.role === "ADMIN";
  const { t } = useTranslation();

  const navItems = (isAdmin ? adminNavItems : staffNavItems).map((item) => resolveLabel(item, t));

  const handleNavClick = () => {
    if (forcedOpen) closeMobileSidebar();
  };

  // Track which group sections are expanded (default open based on current route)
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const groups = {};
    navItems.forEach((item) => {
      if (item.children) {
        const isActive = item.children.some((child) => location.pathname.startsWith(child.to));
        groups[item.label] = isActive;
      }
    });
    return groups;
  });

  const toggleGroup = (label) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen border-r p-5 transition-all flex flex-col",
        isOpen ? "w-72" : "w-24",
        theme === "dark" ? "border-slate-800 bg-slate-900" : "border-slate-200/70 bg-white",
      )}
    >
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <NavLink to="/" onClick={handleNavClick} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 overflow-hidden">
            <img src="/artivox-logo.png" alt="Artivox" className="h-full w-full object-cover" />
          </div>
          {isOpen ? (
            <div>
              <div className={cn("font-title text-lg font-bold", theme === "dark" ? "text-slate-50" : "text-slate-900")}>Artivox</div>
              <div className="text-xs text-slate-500">{isAdmin ? t("sidebar.admin") : t("sidebar.staff")}</div>
            </div>
          ) : null}
        </NavLink>
      </div>

      <nav className="space-y-1 flex-1 overflow-y-auto scrollbar-soft">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isGroup = item.children;

          if (isGroup) {
            const isGroupExpanded = expandedGroups[item.label];
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleGroup(item.label)}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-500 hover:text-slate-700 transition cursor-pointer"
                >
                  <Icon className="h-6 w-6 shrink-0" />
                  {isOpen ? (
                    <>
                      <span className="font-title font-medium flex-1 text-left">{item.label}</span>
                      <svg className={`h-4 w-4 transition-transform ${isGroupExpanded ? "rotate-90" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </>
                  ) : null}
                </button>
                {isOpen && isGroupExpanded && (
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
                              isActive ? "bg-amber-500 text-white font-semibold" : theme === "dark" ? "text-slate-400 hover:bg-slate-800" : "text-slate-600 hover:bg-gray-200",
                            )
                          }
                        >
                          {ChildIcon && <ChildIcon className="h-4 w-4 shrink-0" />}
                          <span className="font-title font-medium">{child.label}</span>
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
                  isActive ? "bg-amber-500 text-white font-semibold" : theme === "dark" ? "text-slate-400 hover:bg-slate-800" : "text-slate-600 hover:bg-gray-200",
                )
              }
            >
              <Icon className="h-6 w-6 shrink-0" />
              {isOpen ? <span className="font-title font-medium">{item.label}</span> : null}
            </NavLink>
          );
        })}
      </nav>

      {isOpen && (
        <div className={cn("border-t pt-4 mt-4", theme === "dark" ? "border-slate-800" : "border-slate-200")}>
          <div className="text-xs text-slate-500 text-center">
            <p>{t("footer.copyright")}</p>
          </div>
        </div>
      )}
    </aside>
  );
};
