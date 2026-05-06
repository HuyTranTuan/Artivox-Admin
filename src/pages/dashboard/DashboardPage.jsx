import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  DollarSign,
  Box,
  ArrowUpRight,
  ArrowUpDown,
} from "lucide-react";

const stats = [
  { label: "Total Revenue", value: "₫248.5M", change: "+12.5%", up: true, icon: DollarSign, color: "from-amber-500 to-orange-500" },
  { label: "Models Sold", value: "1,847", change: "+8.2%", up: true, icon: Box, color: "from-blue-500 to-indigo-500" },
  { label: "Total Orders", value: "3,264", change: "+15.3%", up: true, icon: ShoppingCart, color: "from-emerald-500 to-teal-500" },
  { label: "New Customers", value: "482", change: "-2.4%", up: false, icon: Users, color: "from-purple-500 to-pink-500" },
];

const revenueData = [
  { month: "Jan", value: 18 }, { month: "Feb", value: 22 }, { month: "Mar", value: 19 },
  { month: "Apr", value: 28 }, { month: "May", value: 35 }, { month: "Jun", value: 32 },
  { month: "Jul", value: 38 }, { month: "Aug", value: 42 }, { month: "Sep", value: 36 },
  { month: "Oct", value: 45 }, { month: "Nov", value: 48 }, { month: "Dec", value: 52 },
];

const topModels = [
  { name: "Dragon Sculpture Pro", sales: 342, qty: 1026, revenue: "₫68.4M", trend: "+24%", img: "🐉" },
  { name: "Architectural Villa", sales: 289, qty: 867, revenue: "₫57.8M", trend: "+18%", img: "🏛️" },
  { name: "Mech Robot Alpha", sales: 256, qty: 768, revenue: "₫51.2M", trend: "+15%", img: "🤖" },
  { name: "Fantasy Sword Set", sales: 198, qty: 594, revenue: "₫39.6M", trend: "+9%", img: "⚔️" },
  { name: "Miniature Castle", sales: 176, qty: 528, revenue: "₫35.2M", trend: "+7%", img: "🏰" },
];

const recentOrders = [
  { id: "#ORD-1847", customer: "Nguyen Minh", model: "Dragon Sculpture Pro", amount: "₫2.4M", status: "Delivered", statusColor: "text-emerald-600 bg-emerald-50", createdAt: "May 5, 2026" },
  { id: "#ORD-1846", customer: "Tran Anh", model: "Mech Robot Alpha", amount: "₫1.8M", status: "Processing", statusColor: "text-amber-600 bg-amber-50", createdAt: "May 4, 2026" },
  { id: "#ORD-1845", customer: "Le Hieu", model: "Architectural Villa", amount: "₫3.2M", status: "Shipped", statusColor: "text-blue-600 bg-blue-50", createdAt: "May 3, 2026" },
  { id: "#ORD-1844", customer: "Pham Duc", model: "Fantasy Sword Set", amount: "₫1.2M", status: "Pending", statusColor: "text-slate-600 bg-slate-50", createdAt: "May 2, 2026" },
  { id: "#ORD-1843", customer: "Hoang Tuan", model: "Miniature Castle", amount: "₫2.8M", status: "Delivered", statusColor: "text-emerald-600 bg-emerald-50", createdAt: "May 1, 2026" },
];

const categoryBreakdown = [
  { name: "Electronics", pct: 38, color: "bg-blue-500" },
  { name: "Furniture", pct: 28, color: "bg-emerald-500" },
  { name: "Accessories", pct: 22, color: "bg-amber-500" },
  { name: "Art & Decor", pct: 12, color: "bg-purple-500" },
];

const maxVal = Math.max(...revenueData.map((d) => d.value));

// SVG line chart helper
const buildLinePath = (data, width, height, padding = 20) => {
  const maxV = Math.max(...data.map((d) => d.value));
  const minV = Math.min(...data.map((d) => d.value));
  const range = maxV - minV || 1;
  const stepX = (width - padding * 2) / (data.length - 1);
  return data.map((d, i) => {
    const x = padding + i * stepX;
    const y = height - padding - ((d.value - minV) / range) * (height - padding * 2);
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");
};

const buildAreaPath = (data, width, height, padding = 20) => {
  const linePath = buildLinePath(data, width, height, padding);
  const stepX = (width - padding * 2) / (data.length - 1);
  const lastX = padding + (data.length - 1) * stepX;
  const firstX = padding;
  return `${linePath} L ${lastX} ${height - padding} L ${firstX} ${height - padding} Z`;
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState("desc"); // for recent orders

  const sortedOrders = [...recentOrders].sort((a, b) => {
    const da = new Date(a.createdAt);
    const db = new Date(b.createdAt);
    return sortOrder === "desc" ? db - da : da - db;
  });

  const chartW = 600;
  const chartH = 200;

  return (
    <section className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-5 flex items-center gap-5">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${s.color} text-white`}>
                <Icon className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{s.label}</div>
                <div className="font-title text-2xl font-bold text-slate-900 mt-1">{s.value}</div>
                <div className={`flex items-center gap-1 mt-1 text-xs font-semibold ${s.up ? "text-emerald-600" : "text-rose-500"}`}>
                  {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {s.change} vs last month
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Line Chart */}
        <Card className="xl:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="font-title text-lg font-bold text-slate-900">Revenue Overview</div>
              <div className="text-sm text-slate-500 mt-1">Monthly revenue for 2026</div>
            </div>
            <div className="text-right">
              <div className="font-title text-2xl font-bold text-slate-900">₫248.5M</div>
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                <TrendingUp className="h-3 w-3" /> +12.5% YoY
              </div>
            </div>
          </div>
          {/* SVG line chart */}
          <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => {
                const y = 20 + (i / 4) * (chartH - 40);
                return <line key={i} x1="20" y1={y} x2={chartW - 20} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
              })}
              {/* Area fill */}
              <path d={buildAreaPath(revenueData, chartW, chartH)} fill="url(#areaGrad)" />
              {/* Line */}
              <path d={buildLinePath(revenueData, chartW, chartH)} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {/* Dots */}
              {revenueData.map((d, i) => {
                const maxV = Math.max(...revenueData.map((r) => r.value));
                const minV = Math.min(...revenueData.map((r) => r.value));
                const range = maxV - minV || 1;
                const stepX = (chartW - 40) / (revenueData.length - 1);
                const x = 20 + i * stepX;
                const y = chartH - 20 - ((d.value - minV) / range) * (chartH - 40);
                return <circle key={d.month} cx={x} cy={y} r="4" fill="#fff" stroke="#f59e0b" strokeWidth="2" />;
              })}
              {/* X-axis labels */}
              {revenueData.map((d, i) => {
                const stepX = (chartW - 40) / (revenueData.length - 1);
                const x = 20 + i * stepX;
                return <text key={d.month} x={x} y={chartH - 4} textAnchor="middle" className="text-[10px] fill-slate-500">{d.month}</text>;
              })}
            </svg>
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card className="p-6">
          <div className="font-title text-lg font-bold text-slate-900 mb-1">Category Sales</div>
          <div className="text-sm text-slate-500 mb-6">Revenue by product category</div>
          <div className="space-y-5">
            {categoryBreakdown.map((c) => (
              <div key={c.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700">{c.name}</span>
                  <span className="font-semibold text-slate-900">{c.pct}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${c.color} transition-all`} style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Models */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="font-title text-lg font-bold text-slate-900">Top Selling Models</div>
              <div className="text-sm text-slate-500 mt-1">Best performers this month</div>
            </div>
          </div>
          <div className="space-y-3">
            {topModels.map((m) => (
              <div key={m.name} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xl shrink-0">{m.img}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-title text-sm font-semibold text-slate-900 truncate">{m.name}</div>
                  <div className="text-xs text-slate-500">{m.sales} orders · {m.qty} qty sold</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-title text-sm font-bold text-slate-900">{m.revenue}</div>
                  <div className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5 justify-end">
                    <ArrowUpRight className="h-3 w-3" />{m.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Orders */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="font-title text-lg font-bold text-slate-900">Recent Orders</div>
              <div className="text-sm text-slate-500 mt-1">Latest transactions</div>
            </div>
            <button
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-slate-500 hover:bg-slate-50 transition"
              title="Sort by date"
            >
              <ArrowUpDown style={{ width: 16, height: 16 }} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[500px]">
              <div className="grid grid-cols-[1fr_80px_90px_80px] gap-3 text-xs uppercase tracking-[0.15em] text-slate-400 pb-2 border-b border-slate-100 mb-2">
                <div>Order</div><div>Date</div><div>Status</div><div className="text-right">Amount</div>
              </div>
              <div className="space-y-1">
                {sortedOrders.map((o) => (
                  <div
                    key={o.id}
                    className="grid grid-cols-[1fr_80px_90px_80px] gap-3 items-center p-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                    onClick={() => navigate(`/orders/${o.id.replace("#", "")}`)}
                  >
                    <div className="min-w-0">
                      <div className="font-title text-sm font-semibold text-slate-900 hover:text-amber-600 transition truncate">{o.id}</div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate">{o.customer} · {o.model}</div>
                    </div>
                    <div className="text-xs text-slate-500">{o.createdAt.replace(", 2026", "")}</div>
                    <div><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${o.statusColor}`}>{o.status}</span></div>
                    <div className="font-title text-sm font-bold text-slate-900 text-right">{o.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default DashboardPage;
