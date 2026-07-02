import { useMemo, useState } from "react";
import {
  DollarSign,
  ShoppingCart,
  Box,
  BarChart3,
  UserCheck,
  MessageCircle,
  Percent,
  CarTaxiFront,
  CarTaxiFrontIcon,
} from "lucide-react";

import { Card } from "@components/ui/card";
import { useCountUp } from "@hooks/useCountUp";
import { PieChart as PieChartComponent } from "@/components/PieChart";
import { formatPrice } from "@/utils/formatUtils";
import SummaryCard from "@/components/SummaryCard";
import { useTranslation } from "@hooks/useTranslation";
import { Button } from "@/components/ui/button";
import TopStaffByChatRooms from "@/pages/dashboard/components/TopStaffByChatRooms";
import TopStaffByArticles from "@/pages/dashboard/components/TopStaffByArticles";

const buildLinePath = (data, width, height, padding = 20, key = "value") => {
  if (!data || data.length === 0) return "";
  const values = data.map((d) => d[key]);
  const maxV = Math.max(...values);
  const minV = Math.min(...values);
  const range = maxV - minV || 1;
  const stepX = (width - padding * 2) / (data.length - 1);
  return data
    .map((d, i) => {
      const x = padding + i * stepX;
      const y =
        height - padding - ((d[key] - minV) / range) * (height - padding * 2);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
};

const buildAreaPath = (data, width, height, padding = 20, key = "value") => {
  if (!data || data.length === 0) return "";
  const linePath = buildLinePath(data, width, height, padding, key);
  const stepX = (width - padding * 2) / (data.length - 1);
  const lastX = padding + (data.length - 1) * stepX;
  const firstX = padding;
  return `${linePath} L ${lastX} ${height - padding} L ${firstX} ${height - padding} Z`;
};

// Widgets Section
const WidgetsSection = ({ widgets }) => {
  const {
    abandonedCartRate,
    averageOrderValue,
    totalAbandonedCarts,
    totalActiveCarts,
    totalCompletedOrders,
    totalRevenue,
    totalArticleViews,
  } = widgets;

  const { t } = useTranslation();

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          label={t("dashboard.totalRevenue")}
          value={formatPrice(useCountUp(totalRevenue))}
          icon={DollarSign}
          color="from-amber-500 to-orange-500"
        />

        <SummaryCard
          label={t("dashboard.completedOrders")}
          value={useCountUp(totalCompletedOrders)}
          icon={ShoppingCart}
          color="from-emerald-500 to-teal-500"
        />

        <SummaryCard
          label={t("dashboard.avgOrderValue")}
          value={formatPrice(useCountUp(averageOrderValue))}
          icon={BarChart3}
          color="from-purple-500 to-pink-500"
        />

        <SummaryCard
          label={t("dashboard.abandonedCartRate")}
          value={`${useCountUp(abandonedCartRate)} %`}
          icon={Percent}
          color="from-rose-500 to-red-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
        <SummaryCard
          label={t("dashboard.activeCarts")}
          value={useCountUp(totalActiveCarts)}
          icon={CarTaxiFront}
          color="from-rose-500 to-red-500"
        />
        <SummaryCard
          label={t("dashboard.abandonedCarts")}
          value={useCountUp(totalAbandonedCarts)}
          icon={CarTaxiFrontIcon}
          color="from-rose-500 to-red-500"
        />
        <SummaryCard
          label={t("dashboard.totalArticleViews")}
          value={useCountUp(totalArticleViews)}
          icon={MessageCircle}
          color="from-blue-500 to-indigo-500"
        />
      </div>
    </>
  );
};

// Charts Section
const ChartsSection = ({ charts }) => {
  const { t } = useTranslation();
  const [chartView, setChartView] = useState("revenue");
  const timeSeries = charts?.timeSeries30Days || [];
  const revenueByType = charts?.revenueByProductType || [];

  // Transform revenueByProductType to pie data
  const pieData = useMemo(() => {
    if (revenueByType.length === 0) return [];
    const colors = {
      MODEL: "#f59e0b",
      MATERIAL: "#10b981",
      TOOL: "#3b82f6",
    };
    return revenueByType.map((d) => ({
      name: d.name,
      value: Number(d.value) || 0,
      color: colors[d.name] || "#a855f7",
    }));
  }, [revenueByType]);

  // Time series line data
  const lineSeries = useMemo(() => {
    if (timeSeries.length === 0) return [];
    return timeSeries.map((d) => ({
      label: d.date?.slice(5) || "",
      value: chartView === "revenue" ? d.revenue || 0 : d.newCustomers || 0,
    }));
  }, [timeSeries, chartView]);
  const hasTimeSeries = lineSeries.length > 0;
  const hasPieChart = pieData.length > 0;

  if (!hasTimeSeries && !hasPieChart) return null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Time Series Chart */}
      <Card className="xl:col-span-7 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="font-title text-lg font-bold ">
              {t("dashboard.thirtyDayTrend")}
            </div>
            <div className="text-sm text-slate-500 dark:text-white mt-1">
              {chartView === "revenue"
                ? t("dashboard.revenue")
                : t("dashboard.customers")}
            </div>
          </div>
          <div className="flex  p-0.5 rounded-xl">
            <Button
              variant={chartView === "revenue" ? "primary" : "ghost"}
              onClick={() => setChartView("revenue")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition ${chartView === "revenue" ? "shadow-sm " : ""}`}
            >
              {t("dashboard.revenue")}
            </Button>
            <Button
              variant={chartView === "customers" ? "primary" : "ghost"}
              onClick={() => setChartView("customers")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition ${chartView === "customers" ? " shadow-sm " : ""}`}
            >
              {t("dashboard.customers")}
            </Button>
          </div>
        </div>
        <div className="w-full overflow-x-auto pb-2">
          <div className="min-w-150">
            <svg
              viewBox="0 0 600 200"
              className="w-full h-auto"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3, 4].map((i) => {
                const y = 20 + (i / 4) * (200 - 40);
                return (
                  <line
                    key={i}
                    x1="20"
                    y1={y}
                    x2={600 - 20}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                );
              })}
              <path
                d={buildAreaPath(lineSeries, 600, 200)}
                fill="url(#areaGrad)"
              />
              <path
                d={buildLinePath(lineSeries, 600, 200)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {lineSeries.map((d, i) => {
                if (lineSeries.length < 2) return null;
                const values = lineSeries.map((r) => r.value);
                const maxV = Math.max(...values);
                const minV = Math.min(...values);
                const range = maxV - minV || 1;
                const stepX = (600 - 40) / (lineSeries.length - 1);
                const x = 20 + i * stepX;
                const y = 200 - 20 - ((d.value - minV) / range) * (200 - 40);
                return (
                  <circle
                    key={d.label}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#fff"
                    stroke="#f59e0b"
                    strokeWidth="2"
                  />
                );
              })}
              {lineSeries
                .filter((_, i) => i % 5 === 0 || i === lineSeries.length - 1)
                .map((d, i, arr) => {
                  if (lineSeries.length < 2) return null;
                  const stepX = (600 - 40) / (lineSeries.length - 1);
                  const idx = lineSeries.indexOf(d);
                  const x = 20 + idx * stepX;
                  return (
                    <text
                      key={d.label}
                      x={x}
                      y={200 - 4}
                      textAnchor="middle"
                      className="text-[10px] fill-slate-500"
                    >
                      {d.label}
                    </text>
                  );
                })}
            </svg>
          </div>
        </div>
      </Card>

      {/* Category Revenue Pie Chart */}
      <Card className="p-6 xl:col-span-5">
        <div className="font-title text-lg font-bold  mb-1">
          {t("dashboard.revenueByProductType")}
        </div>
        <div className="text-sm text-slate-500 dark:text-white mb-6">
          {t("dashboard.breakdownByCategory")}
        </div>
        <div className="overflow-x-auto pb-2">
          <div className="flex flex-col lg:flex-row gap-6 md:gap-10 items-center min-w-100">
            <div className="flex-1 max-w-xs shrink-0">
              <PieChartComponent data={pieData} width={320} height={320} />
            </div>
            <div className="flex-1 gap-2 sm:gap-4 flex flex-row md:flex-col md:items-start shrink-0">
              {pieData.map((c) => (
                <div key={c.name} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-sm font-medium ">{c.name}</span>
                  <span className="text-xs text-slate-500 dark:text-white">
                    {formatPrice(c.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Tables Section
const TablesSection = ({ tables }) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Staff Performance Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="font-title text-lg font-bold ">
                {t("dashboard.topStaffByArticles")}
              </div>
              <div className="text-sm text-slate-500 dark:text-white mt-1">
                {t("dashboard.mostPublishedArticles")}
              </div>
            </div>
            <UserCheck className="h-5 w-5 text-slate-400" />
          </div>
          <div className="overflow-x-auto pb-2">
            <div className="min-w-150 space-y-3">
              {(tables?.topStaffByArticles || []).map((staff, i) => (
                <TopStaffByArticles staff={staff} index={i} key={staff.id} />
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="font-title text-lg font-bold ">
                {t("dashboard.topStaffByChat")}
              </div>
              <div className="text-sm text-slate-500 dark:text-white mt-1">
                {t("dashboard.mostActiveInSupport")}
              </div>
            </div>
            <MessageCircle className="h-5 w-5 text-slate-400" />
          </div>
          <div className="overflow-x-auto pb-2">
            <div className="min-w-150 space-y-3">
              {(tables.topStaffByChatRooms || []).map((staff, i) => (
                <TopStaffByChatRooms staff={staff} index={i} key={staff.id} />
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Top Selling Products */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="font-title text-lg font-bold ">
              {t("dashboard.topProducts")}
            </div>
            <div className="text-sm text-slate-500 dark:text-white mt-1">
              {t("dashboard.bestSelling")}
            </div>
          </div>
          <Box className="h-5 w-5 text-slate-400" />
        </div>
        <div className="overflow-x-auto pb-2">
          <div className="min-w-125 space-y-3">
            {(tables.topProductsWithDetails || []).map((p, i) => (
              <div
                key={p.productId || i}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl  text-slate-700 font-bold text-sm shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-title text-sm font-semibold  truncate">
                    {p.name || t("common.unknownProduct")}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-white">
                    {p.totalSold || 0} {t("dashboard.sold")} -{" "}
                    {p.type || t("common.na")}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-title text-sm font-bold ">
                    {formatPrice(p.estimatedRevenue)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-white">
                    {t("dashboard.revenueLabel")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </>
  );
};

export { WidgetsSection, ChartsSection, TablesSection };
