import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  ShoppingCart,
  Clock,
  MessageCircle,
  CheckCircle,
  ListOrdered,
} from "lucide-react";

import { Card } from "@components/ui/card";
import { useAuth } from "@hooks/useAuth";
import { dashboardService } from "@services/dashboardService";
import { useCountUp } from "@hooks/useCountUp";
import { useTranslation } from "@hooks/useTranslation";
import { formatPrice } from "@/utils/formatUtils";
import SummaryCard from "@/components/SummaryCard";

const STATUS_COLORS = {
  COMPLETED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-rose-100 text-rose-700",
  PROCESSING: "bg-blue-100 text-blue-700",
};

const StaffDashboardPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchDashboard = async () => {
      try {
        const result = await dashboardService.getStaffDashboard();
        if (mounted && result) setData(result);
      } catch (e) {
        console.warn("Staff dashboard fetch failed:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  const widgets = data?.widgets || {};
  const profile = data?.profile || {};
  const tables = data?.tables || {};
  const charts = data?.charts || {};

  const myRevenue = useCountUp(widgets.myRevenue || 0);
  const myOrders = useCountUp(widgets.myOrders || 0);
  const myApproved = useCountUp(widgets.myApprovedOrders || 0);
  const myPending = useCountUp(widgets.myPendingApprovals || 0);
  const myChats = useCountUp(widgets.myChatRooms || 0);

  const orderStatus = charts.myOrderStatus || {};
  const recentOrders = tables.myRecentOrders || [];
  const topCustomers = tables.myTopCustomers || [];

  if (loading) {
    return (
      <section className="space-y-6">
        <h1 className="font-title text-2xl font-bold text-slate-900 theme-mode-dark">
          {t("dashboard.staffTitle")}
        </h1>
        <p className="text-sm text-slate-500">{t("dashboard.loading")}</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h1 className="font-title text-2xl font-bold">
          {t("dashboard.staffTitle")}
        </h1>
      </div>

      {/* ── Basic Info ── */}
      <Card className="p-6 bg-slate-50 border border-slate-100">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-title text-2xl font-bold">
            {profile.fullName?.charAt(0)?.toUpperCase() || "S"}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 w-full">
            <div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                {t("common.user", "User")}
              </div>
              <div className="text-sm font-semibold text-slate-900 mt-1">
                {profile.fullName || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                {t("common.email", "Email")}
              </div>
              <div className="text-sm font-semibold text-slate-900 mt-1">
                {profile.email || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                {t("common.phone", "Phone")}
              </div>
              <div className="text-sm font-semibold text-slate-900 mt-1">
                {profile.phone || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                {t("dashboard.approvalRate", "Approval Rate")}
              </div>
              <div className="text-sm font-semibold text-emerald-600 mt-1">
                {profile.approvalRate ?? 0}%
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Section 1: KPI Widgets ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <SummaryCard
          label={t("dashboard.totalRevenue")}
          value={formatPrice(myRevenue)}
          icon={DollarSign}
          color="from-amber-500 to-orange-500"
        />
        <SummaryCard
          label={t("dashboard.myOrders", "My Orders")}
          value={myOrders}
          icon={ListOrdered}
          color="from-sky-500 to-blue-500"
        />
        <SummaryCard
          label={t("dashboard.approvedOrders", "Approved")}
          value={myApproved}
          icon={CheckCircle}
          color="from-emerald-500 to-teal-500"
        />
        <SummaryCard
          label={t("dashboard.pendingApprovals", "Pending")}
          value={myPending}
          icon={Clock}
          color="from-rose-500 to-red-500"
        />
        <SummaryCard
          label={t("dashboard.chatRooms", "Chat Rooms")}
          value={myChats}
          icon={MessageCircle}
          color="from-purple-500 to-pink-500"
        />
      </div>

      {/* ── Section 2: Order Status + Top Customers ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Order Status Breakdown */}
        {Object.keys(orderStatus).length > 0 && (
          <Card className="p-6">
            <div className="font-title text-lg font-bold text-slate-900 mb-1">
              {t("dashboard.orderStatusBreakdown", "Order Status")}
            </div>
            <div className="text-sm text-slate-500 mb-4">
              {t(
                "dashboard.myOrderDistribution",
                "Distribution of my handled orders",
              )}
            </div>
            <div className="space-y-3">
              {Object.entries(orderStatus).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status] || "bg-slate-100 text-slate-600"}`}
                  >
                    {status}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-amber-400"
                      style={{
                        width: `${Math.min((count / (widgets.myOrders || 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-900 w-6 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Top Customers */}
        {topCustomers.length > 0 && (
          <Card className="p-6">
            <div className="font-title text-lg font-bold text-slate-900 mb-1">
              {t("dashboard.myTopCustomers", "Top Customers")}
            </div>
            <div className="text-sm text-slate-500 mb-4">
              {t("dashboard.highestSpending", "Highest spending customers")}
            </div>
            <div className="space-y-3">
              {topCustomers.map((c, i) => (
                <div
                  key={c.customerId || i}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700 font-bold text-sm shrink-0">
                    {c.customerName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {c.customerName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {c.orderCount} orders
                    </div>
                  </div>
                  <div className="text-sm font-bold text-slate-900 shrink-0">
                    {formatPrice(c.totalSpent)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* ── Section 3: Recent Orders ── */}
      {recentOrders.length > 0 && (
        <Card className="p-6">
          <div className="font-title text-lg font-bold text-slate-900 mb-1">
            {t("dashboard.myRecentOrders", "Recent Orders")}
          </div>
          <div className="text-sm text-slate-500 mb-4">
            {t("dashboard.lastFiveOrders", "Last 5 orders I handled")}
          </div>
          <div className="space-y-3">
            {recentOrders.map((order, i) => (
              <div
                key={order.id || i}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-bold text-sm shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {order.customerName}
                  </div>
                  <div className="text-xs text-slate-500">
                    {order.customerEmail}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] || "bg-slate-100 text-slate-600"}`}
                  >
                    {order.status}
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">
                      {formatPrice(order.totalAmount)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {order.itemCount} items
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Section 4: Quick Actions ── */}
      <Card className="p-6">
        <div className="font-title text-lg font-bold text-slate-900 mb-2">
          {t("dashboard.quickActions")}
        </div>
        <p className="text-sm text-slate-500 mb-4">
          {t("dashboard.manageTasks")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => navigate("/orders/approval")}
            className="rounded-xl border border-slate-200 p-4 hover:border-amber-400 transition cursor-pointer"
          >
            <div className="font-title text-sm font-semibold text-slate-900">
              {t("nav.orders")}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {t("dashboard.approveOrders")}
            </div>
          </div>
          <div
            onClick={() => navigate("/articles")}
            className="rounded-xl border border-slate-200 p-4 hover:border-amber-400 transition cursor-pointer"
          >
            <div className="font-title text-sm font-semibold text-slate-900">
              {t("nav.articles")}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {t("dashboard.createEditArticles")}
            </div>
          </div>
          <div
            onClick={() => navigate("/support/chat")}
            className="rounded-xl border border-slate-200 p-4 hover:border-amber-400 transition cursor-pointer"
          >
            <div className="font-title text-sm font-semibold text-slate-900">
              {t("nav.supportChat")}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {t("dashboard.respondToCustomers")}
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default StaffDashboardPage;
