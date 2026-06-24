import { useState } from "react";
import {
  BookText,
  Bot,
  CircleDollarSign,
  Cuboid,
  LayoutDashboard,
  MessageCircleMore,
  ShoppingCart,
  Users,
  Box,
  Layers,
  Wrench,
  ClipboardCheck,
  Container,
  Shield,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@utils/cn";
import { useUiStore } from "@store/uiStore";
import { useAuth } from "@hooks/useAuth";
import { useTranslation } from "@hooks/useTranslation";
import artivoxLogo from "@/assets/artivox-logo.png";
import artivoxSquareLogo from "@/assets/artivox-square-logo.png";

const adminNavItems = [
  { to: "/", labelKey: "nav.dashboard", icon: LayoutDashboard, end: true },
  { to: "/articles", labelKey: "nav.articles", icon: BookText },
  { to: "/discounts", labelKey: "nav.discounts", icon: CircleDollarSign },
  {
    labelKey: "nav.catalog",
    icon: Cuboid,
    children: [
      {
        to: "/catalog/collections",
        labelKey: "nav.collections",
        icon: Container,
      },
      { to: "/catalog/models", labelKey: "nav.models", icon: Box },
      { to: "/catalog/materials", labelKey: "nav.materials", icon: Layers },
      { to: "/catalog/tools", labelKey: "nav.tools", icon: Wrench },
    ],
  },
  { to: "/orders", labelKey: "nav.orders", icon: ShoppingCart, end: true },
  {
    to: "/orders/approval",
    labelKey: "nav.orderApproval",
    icon: ClipboardCheck,
  },
  { to: "/customers", labelKey: "nav.customers", icon: Users },
  { to: "/staff-permissions", labelKey: "Staff Permissions", icon: Shield },
  // { to: "/support/chat", labelKey: "nav.supportChat", icon: MessageCircleMore },
  // { to: "/support/admin-chat", labelKey: "nav.adminChat", icon: MessageCircleMore },
  { to: "/support/ai-chat", labelKey: "nav.aiChat", icon: Bot },
];

const staffNavItems = [
  { to: "/", labelKey: "nav.dashboard", icon: LayoutDashboard, end: true },
  { to: "/articles", labelKey: "nav.articles", icon: BookText },
  { to: "/discounts", labelKey: "nav.discounts", icon: CircleDollarSign },
  {
    labelKey: "nav.catalog",
    icon: Cuboid,
    children: [
      {
        to: "/catalog/collections",
        labelKey: "nav.collections",
        icon: Container,
      },
      { to: "/catalog/models", labelKey: "nav.models", icon: Box },
      { to: "/catalog/materials", labelKey: "nav.materials", icon: Layers },
      { to: "/catalog/tools", labelKey: "nav.tools", icon: Wrench },
    ],
  },
  {
    to: "/orders/approval",
    labelKey: "nav.orderApproval",
    icon: ClipboardCheck,
  },
  { to: "/orders", labelKey: "nav.orders", icon: ShoppingCart, end: true },
  { to: "/customers", labelKey: "nav.customers", icon: Users },
  { to: "/support/chat", labelKey: "nav.supportChat", icon: MessageCircleMore },
  // { to: "/support/admin-chat", labelKey: "nav.adminChat", icon: MessageCircleMore },
  { to: "/support/ai-chat", labelKey: "nav.aiChat", icon: Bot },
];

const resolveLabel = (item, t) => {
  if (item.children) {
    return {
      ...item,
      label: t(item.labelKey),
      children: item.children.map((c) => ({ ...c, label: t(c.labelKey) })),
    };
  }
  return { ...item, label: t(item.labelKey) };
};

export const Sidebar = ({ forcedOpen }) => {
  const {
    sidebarOpen,
    closeMobileSidebar,
    theme,
    currentLanguage: lang,
  } = useUiStore();
  const { user } = useAuth();
  const location = useLocation();
  const isOpen = forcedOpen || sidebarOpen;
  const isAdmin = user?.role === "ADMIN";
  const { t } = useTranslation();

  const navItems = (isAdmin ? adminNavItems : staffNavItems).map((item) =>
    resolveLabel(item, t),
  );

  const handleNavClick = () => {
    if (forcedOpen) closeMobileSidebar();
  };

  // Track which group sections are expanded (default open based on current route)
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const groups = {};
    navItems.forEach((item) => {
      if (item.children) {
        const isActive = item.children.some((child) =>
          location.pathname.startsWith(child.to),
        );
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
        theme === "dark"
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200/70 bg-white",
      )}
    >
      {/* Logo */}
      <div className="h-18 mb-8">
        <NavLink
          to="/"
          onClick={handleNavClick}
          className="block cursor-pointer hover:opacity-80 transition"
        >
          <div className="h-full w-full overflow-hidden">
            <img
              src={isOpen ? artivoxLogo : artivoxSquareLogo}
              alt="Artivox"
              className="h-full w-full object-center object-contain bg-transparent"
            />
          </div>
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
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition cursor-pointer ${theme === "dark" ? "text-white hover:text-white/80" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <Icon className="h-6 w-6 shrink-0" />
                  {isOpen ? (
                    <>
                      <span className="font-title font-medium flex-1 text-left">
                        {item.label}
                      </span>
                      <svg
                        className={`h-4 w-4 transition-transform ${isGroupExpanded ? "rotate-90" : ""}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
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
                              "flex items-center gap-3 rounded-xl px-4 py-2 text-sm transition",
                              isActive
                                ? "bg-amber-500 text-white font-semibold"
                                : theme === "dark"
                                  ? "text-white hover:bg-slate-800"
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
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition",
                  isActive
                    ? "bg-amber-500 text-white font-semibold"
                    : theme === "dark"
                      ? "text-white hover:bg-slate-800"
                      : "text-slate-600 hover:bg-gray-200",
                )
              }
            >
              <Icon className="h-6 w-6 shrink-0" />
              {isOpen ? (
                <span className="font-title font-medium">{item.label}</span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      {isOpen && (
        <div
          className={cn(
            "border-t pt-4 mt-4",
            theme === "dark" ? "border-slate-800" : "border-slate-200",
          )}
        >
          <div
            className={`text-xs text-center ${theme === "dark" ? "text-white/70" : "text-slate-500"}`}
          >
            <p>{t("footer.copyright")}</p>
          </div>
        </div>
      )}
    </aside>
  );
};
