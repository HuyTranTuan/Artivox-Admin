import { useEffect, useState } from "react";
import { DollarSign, Clock, MessageCircle, CheckCircle, ListOrdered } from "lucide-react";

import { Card } from "@components/ui/card";
import { dashboardService } from "@services/dashboardService";
import { useCountUp } from "@hooks/useCountUp";
import { useTranslation } from "@hooks/useTranslation";
import { formatPrice } from "@/utils/formatUtils";
import SummaryCard from "@/components/SummaryCard";
import Loading from "@/components/Loading";
import QuickAction from "./components/QuickAction";
import RecentOrder from "./components/RecentOrder";
import TopCustomer from "./components/TopCustomer";
import OrderStatus from "./components/OrderStatus";

const quickActions = [
  { path: "/orders/approval", title: "nav.orders", text: "dashboard.approveOrders" },
  { path: "/articles", title: "nav.articles", text: "dashboard.createEditArticles" },
  { path: "/support/chat", title: "nav.supportChat", text: "dashboard.respondToCustomers" },
];

const StaffDashboardPage = () => {
  const { t } = useTranslation();
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
    return <Loading text={false} height={"20"} width={"20"} />;
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-title text-2xl font-bold">{t("dashboard.staffTitle")}</h1>
      </div>

      {/* Basic Info */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--color-primary) text-(--color-primary) font-title text-2xl font-bold overflow-hidden shrink-0">
            {profile.avatar ? <img src={profile.avatar} alt="Avatar" className="h-full w-full object-cover" /> : profile.fullName?.charAt(0)?.toUpperCase() || "S"}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 w-full">
            <div>
              <div className="text-xs   font-medium uppercase tracking-wider">{t("common.user", "User")}</div>
              <div className="text-sm font-semibold mt-1">{profile.fullName || "N/A"}</div>
            </div>
            <div>
              <div className="text-xs   font-medium uppercase tracking-wider">{t("common.email", "Email")}</div>
              <div className="text-sm font-semibold mt-1">{profile.email || "N/A"}</div>
            </div>
            <div>
              <div className="text-xs   font-medium uppercase tracking-wider">{t("common.phone", "Phone")}</div>
              <div className="text-sm font-semibold mt-1">{profile.phone || "N/A"}</div>
            </div>
            <div>
              <div className="text-xs   font-medium uppercase tracking-wider">{t("dashboard.approvalRate", "Approval Rate")}</div>
              <div className="text-sm font-semibold text-emerald-600 mt-1">{profile.approvalRate ?? 0}%</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Section 1: KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <SummaryCard label={t("dashboard.totalRevenue")} value={formatPrice(myRevenue)} icon={DollarSign} color="from-amber-500 to-orange-500" />
        <SummaryCard label={t("dashboard.myOrders")} value={myOrders} icon={ListOrdered} color="from-sky-500 to-blue-500" />
        <SummaryCard label={t("dashboard.approvedOrders")} value={myApproved} icon={CheckCircle} color="from-emerald-500 to-teal-500" />
        <SummaryCard label={t("dashboard.pendingApprovals")} value={myPending} icon={Clock} color="from-rose-500 to-red-500" />
        <SummaryCard label={t("dashboard.chatRooms")} value={myChats} icon={MessageCircle} color="from-purple-500 to-pink-500" />
      </div>

      {/* Section 2: Order Status + Top Customers */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Order Status Breakdown */}
        {Object.keys(orderStatus).length > 0 && (
          <Card className="p-6">
            <div className="font-title text-lg font-bold   mb-1">{t("dashboard.orderStatusBreakdown")}</div>
            <div className="text-sm   mb-4">{t("dashboard.myOrderDistribution")}</div>
            <div className="overflow-x-auto pb-2">
              <div className="min-w-100 space-y-3">
                {Object.entries(orderStatus).map(([status, count]) => (
                  <OrderStatus status={status} count={count} orders={widgets.myOrderStatus} />
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Top Customers */}
        {topCustomers.length > 0 && (
          <Card className="p-6">
            <div className="font-title text-lg font-bold   mb-1">{t("dashboard.myTopCustomers")}</div>
            <div className="text-sm   mb-4">{t("dashboard.highestSpending")}</div>
            <div className="overflow-x-auto pb-2">
              <div className="min-w-125 space-y-3">
                {topCustomers.map((c, i) => (
                  <TopCustomer customer={c} index={i} />
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="flex xl:flex-row xl:justify-between xl:items-between flex-col xl:space-x-6 space-y-6">
        {/* Section 3: Recent Orders */}
        {recentOrders.length > 0 && (
          <Card className="p-6 xl:w-1/2">
            <div className="font-title text-lg font-bold mb-1">{t("dashboard.myRecentOrders")}</div>
            <div className="text-sm mb-4">{t("dashboard.lastFiveOrders")}</div>
            <div className="overflow-x-auto pb-2">
              <div className="min-w-150 space-y-3">
                {recentOrders.map((order, i) => (
                  <RecentOrder order={order} index={i} />
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Section 4: Quick Actions */}
        <Card className="p-6 flex-1">
          <div className="font-title text-lg font-bold mb-2">{t("dashboard.quickActions")}</div>
          <p className="text-sm mb-4">{t("dashboard.manageTasks")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((quickAction) => (
              <QuickAction key={quickAction.path} path={quickAction.path} title={quickAction.title} text={quickAction.text} />
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
};

export default StaffDashboardPage;
