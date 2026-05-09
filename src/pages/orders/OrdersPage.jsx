import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUpDown,
} from "lucide-react";
import { Card } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { useClickOutsideClose } from "@hooks/useClickOutsideClose";
import { useDebounce } from "@hooks/useDebounce";
import { useExpandableSearch } from "@hooks/useExpandableSearch";

// Format date to DD/MM/YYYY
const fmtDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return dateStr;
  }
};

const statusColor = {
  PENDING: "text-amber-600",
  PAID: "text-emerald-600",
  REFUND_PENDING: "text-rose-600",
  PROCESSING: "text-blue-600",
  SHIPPED: "text-indigo-600",
  DELIVERED: "text-emerald-600",
  CANCELLED: "text-slate-500",
};

// Mock orders data
const MOCK_ORDERS = [
  {
    id: "ORD-1847",
    code: "ORD-1847",
    customer: { name: "Nguyen Minh" },
    totalAmount: 2400000,
    status: "DELIVERED",
    createdAt: "2026-05-05T10:30:00Z",
  },
  {
    id: "ORD-1846",
    code: "ORD-1846",
    customer: { name: "Tran Anh" },
    totalAmount: 1800000,
    status: "PROCESSING",
    createdAt: "2026-05-04T14:20:00Z",
  },
  {
    id: "ORD-1845",
    code: "ORD-1845",
    customer: { name: "Le Hieu" },
    totalAmount: 3200000,
    status: "SHIPPED",
    createdAt: "2026-05-03T09:15:00Z",
  },
  {
    id: "ORD-1844",
    code: "ORD-1844",
    customer: { name: "Pham Duc" },
    totalAmount: 1200000,
    status: "PENDING",
    createdAt: "2026-05-02T16:45:00Z",
  },
  {
    id: "ORD-1843",
    code: "ORD-1843",
    customer: { name: "Hoang Tuan" },
    totalAmount: 2800000,
    status: "DELIVERED",
    createdAt: "2026-05-01T11:00:00Z",
  },
  {
    id: "ORD-1842",
    code: "ORD-1842",
    customer: { name: "Vo Lan" },
    totalAmount: 5600000,
    status: "PAID",
    createdAt: "2026-04-28T08:30:00Z",
  },
  {
    id: "ORD-1841",
    code: "ORD-1841",
    customer: { name: "Dang Khoa" },
    totalAmount: 950000,
    status: "REFUND_PENDING",
    createdAt: "2026-04-25T13:10:00Z",
  },
  {
    id: "ORD-1840",
    code: "ORD-1840",
    customer: { name: "Bich Ngoc" },
    totalAmount: 4100000,
    status: "DELIVERED",
    createdAt: "2026-04-22T15:25:00Z",
  },
];

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const itemsPerPage = 20;
  const search = useExpandableSearch();
  const debouncedSearch = useDebounce(search.value, 300);
  const filterRef = useClickOutsideClose(() => setFilterOpen(false));

  // Load mock data
  useEffect(() => {
    const load = async () => {
      await new Promise((r) => setTimeout(r, 300));
      setOrders(MOCK_ORDERS);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedStatus, sortField, sortDir]);

  const statusOptions = [
    ...new Set(orders.map((o) => o.status).filter(Boolean)),
  ];

  const filtered = useMemo(() => {
    let result = [...orders];
    const keyword = debouncedSearch.toLowerCase();
    if (keyword) {
      result = result.filter(
        (o) =>
          (o.code || o.id || "").toLowerCase().includes(keyword) ||
          (o.customer?.name || o.customer || "")
            .toLowerCase()
            .includes(keyword),
      );
    }
    if (selectedStatus) {
      result = result.filter((o) => o.status === selectedStatus);
    }
    if (sortField) {
      result.sort((a, b) => {
        const va = a[sortField];
        const vb = b[sortField];
        if (typeof va === "string") {
          return sortDir === "asc"
            ? va.localeCompare(vb)
            : vb.localeCompare(va);
        }
        return sortDir === "asc" ? va - vb : vb - va;
      });
    }
    return result;
  }, [orders, debouncedSearch, selectedStatus, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIdx, startIdx + itemsPerPage);
  const fmtPrice = (v) =>
    v
      ? new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(v)
      : "—";

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handleView = (item) => {
    navigate(`/orders/${item.id || item.code}`);
  };

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-title text-2xl font-bold text-slate-950">
              Orders
            </h1>
            <p className="mt-1 text-sm text-slate-500">Manage all orders</p>
          </div>
          <div className="flex items-center gap-2">
            <div ref={search.containerRef} className="flex items-center gap-2">
              {search.isOpen ? (
                <div className="relative w-64">
                  <Input
                    ref={search.inputRef}
                    className="pl-4 pr-10"
                    placeholder="Search orders..."
                    value={search.value}
                    onChange={(e) => search.setValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") search.submit();
                    }}
                  />
                  {search.value ? (
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                      onClick={search.clear}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              ) : null}
              <Button
                variant="ghost"
                className="h-10 w-10 p-0"
                onClick={search.submit}
              >
                <Search style={{ width: 18, height: 18 }} />
              </Button>
            </div>
            <div className="relative">
              <Button
                variant={filterOpen ? "default" : "ghost"}
                className="h-10 w-10 p-0"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <Filter className="h-5 w-5" />
              </Button>
              {filterOpen && (
                <div
                  ref={filterRef}
                  className="absolute top-full mt-2 right-0 bg-white border border-slate-200 rounded-2xl shadow-lg p-4 w-64 z-10"
                >
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-semibold text-slate-900 mb-2">
                        Status
                      </div>
                      {statusOptions.map((st) => (
                        <label
                          key={st}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStatus === st}
                            onChange={() =>
                              setSelectedStatus(
                                selectedStatus === st ? null : st,
                              )
                            }
                            className="rounded"
                          />
                          <span className="text-sm text-slate-600">{st}</span>
                        </label>
                      ))}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSelectedStatus(null);
                        setFilterOpen(false);
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className="overflow-x-auto"
          style={{ maxHeight: "calc(100vh - 340px)" }}
        >
          <div className="min-w-[900px]">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-[1.2fr_1.5fr_1fr_1fr_1fr_180px] gap-3 border-b border-slate-300 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.2em] font-bold text-slate-900 sticky top-0 z-10">
                <div
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => toggleSort("code")}
                >
                  Code <ArrowUpDown className="h-3 w-3" />
                </div>
                <div
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => toggleSort("customer")}
                >
                  Customer <ArrowUpDown className="h-3 w-3" />
                </div>
                <div
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => toggleSort("totalAmount")}
                >
                  Amount <ArrowUpDown className="h-3 w-3" />
                </div>
                <div
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => toggleSort("status")}
                >
                  Status <ArrowUpDown className="h-3 w-3" />
                </div>
                <div>Date</div>
                <div>Actions</div>
              </div>

              <div
                className="overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 420px)" }}
              >
                {loading ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    Loading orders...
                  </div>
                ) : paginated.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    No orders found
                  </div>
                ) : (
                  paginated.map((item, idx) => (
                    <div
                      key={item.id || item.code || idx}
                      className={`grid grid-cols-[1.2fr_1.5fr_1fr_1fr_1fr_180px] gap-3 border-b border-slate-200 px-4 py-4 text-sm text-slate-600 items-center ${idx % 2 === 0 ? "bg-slate-50/50" : "bg-white"} hover:bg-orange-50 transition cursor-pointer`}
                      onClick={() => handleView(item)}
                    >
                      <div className="font-title text-sm font-semibold text-slate-900">
                        {item.code || item.id}
                      </div>
                      <div className="text-sm text-slate-700">
                        {item.customer?.name || item.customer || "—"}
                      </div>
                      <div className="font-semibold text-slate-900">
                        {fmtPrice(item.totalAmount || item.amount)}
                      </div>
                      <div>
                        <span
                          className={`text-xs font-medium ${statusColor[item.status] || "text-slate-500"}`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {fmtDate(item.createdAt)}
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(item);
                          }}
                          className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
                          style={{ padding: 5 }}
                        >
                          <Eye style={{ width: 18, height: 18 }} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-6">
          <div className="text-sm text-slate-600">
            Showing {filtered.length ? startIdx + 1 : 0}-
            {Math.min(startIdx + itemsPerPage, filtered.length)} of{" "}
            {filtered.length}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                let page;
                if (totalPages <= 5) page = index + 1;
                else if (currentPage <= 3) page = index + 1;
                else if (currentPage >= totalPages - 2)
                  page = totalPages - 4 + index;
                else page = currentPage - 2 + index;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default OrdersPage;
