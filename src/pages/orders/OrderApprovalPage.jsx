import { useMemo, useState } from "react";
import {
  Eye,
  CircleCheckBig,
  XCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { Card } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { orderService } from "@services/orderService";
import { usePaginatedApi } from "@hooks/usePaginatedApi";
import { useClickOutsideClose } from "@hooks/useClickOutsideClose";
import { useDebounce } from "@hooks/useDebounce";
import { useExpandableSearch } from "@hooks/useExpandableSearch";
import { useAuth } from "@hooks/useAuth";
import { useUiStore } from "@store/uiStore";
import { useTranslation } from "@hooks/useTranslation";

const statusOptions = ["PENDING", "PAID", "REFUND_PENDING"];

const formatPrice = (amount) => {
  if (amount == null) return "—";
  return `₫${Number(amount).toLocaleString()}`;
};

const OrderApprovalPage = () => {
  const { user } = useAuth();
  const { currentLanguage: lang } = useUiStore();
  const {
    data: orders,
    loading,
    error,
    page: currentPage,
    totalPages,
    totalItems,
    setPage,
    nextPage,
    prevPage,
    refetch,
  } = usePaginatedApi((params) => orderService.listOrders({ ...params }), {
    defaultLimit: 20,
    pageParam: "page",
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const search = useExpandableSearch();
  const debouncedSearch = useDebounce(search.value, 300);
  const filterRef = useClickOutsideClose(() => setFilterOpen(false));
  const { t } = useTranslation();

  const isAdmin = user?.role === "ADMIN";

  const filtered = useMemo(() => {
    let result = [...orders];
    const keyword = debouncedSearch.toLowerCase();
    if (keyword) {
      result = result.filter((o) => {
        const custStr =
          typeof o.customer === "object"
            ? o.customer?.fullName || o.customer?.name || ""
            : o.customer || "";
        return (
          (o.id && o.id.toLowerCase().includes(keyword)) ||
          custStr.toLowerCase().includes(keyword)
        );
      });
    }
    if (selectedStatus) {
      result = result.filter((o) => o.status === selectedStatus);
    }
    if (sortField) {
      result.sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === "string") {
          return sortDir === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        return sortDir === "asc" ? valA - valB : valB - valA;
      });
    }
    return result;
  }, [orders, debouncedSearch, selectedStatus, sortField, sortDir]);

  const paginated = filtered;

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handleApprove = async (orderId) => {
    try {
      await orderService.approveOrder(orderId);
      refetch();
    } catch (err) {
      console.error("Failed to approve order:", err);
    }
  };

  const handleReject = async (orderId) => {
    try {
      await orderService.rejectOrder(orderId);
      refetch();
    } catch (err) {
      console.error("Failed to reject order:", err);
    }
  };

  const statusColor = {
    PENDING: "text-amber-600",
    PAID: "text-emerald-600",
    REFUND_PENDING: "text-rose-600",
  };

  if (error) {
    return (
      <section className="space-y-6">
        <Card className="p-6">
          <div className="text-center py-8">
            <div className="text-rose-500 font-semibold mb-2">
              {t("approval.failedToLoad")}
            </div>
            <div className="text-sm text-slate-500 mb-4">{error}</div>
            <Button onClick={refetch}>{t("approval.retry")}</Button>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-title text-2xl font-bold text-slate-950">
              {t("approval.title")}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {t("approval.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div ref={search.containerRef} className="flex items-center gap-2">
              {search.isOpen ? (
                <div className="relative w-64">
                  <Input
                    ref={search.inputRef}
                    className="pl-4 pr-10"
                    placeholder={
                      t("approval.searchPlaceholder") || "Search orders..."
                    }
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
                className="h-10 w-10 p-0!"
                onClick={search.submit}
              >
                <Search style={{ width: 18, height: 18 }} />
              </Button>
            </div>
            <div className="relative">
              <Button
                variant={filterOpen ? "default" : "ghost"}
                className="h-10 w-10 p-0!"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <Filter className="h-5 w-5" />
              </Button>
              {filterOpen && (
                <div
                  ref={filterRef}
                  className="absolute top-full mt-2 right-0 bg-white border border-slate-200 rounded-2xl shadow-lg p-4 w-64 z-40"
                >
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-semibold text-slate-900 mb-2">
                        {t("orders.filterStatus")}
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
                      {t("orders.clearFilters")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <span className="ml-3 text-sm text-slate-500">
              {t("approval.loading")}
            </span>
          </div>
        ) : (
          <>
            <div
              className="overflow-x-auto"
              style={{ maxHeight: "calc(100vh - 340px)" }}
            >
              <div className="min-w-[900px]">
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-[1.2fr_1.5fr_1fr_1fr_180px] gap-3 border-b border-slate-300 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.2em] font-bold text-slate-900 sticky top-0 z-10">
                    <div
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={() => toggleSort("id")}
                    >
                      {t("orders.code")} <ArrowUpDown className="h-3 w-3" />
                    </div>
                    <div
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={() => toggleSort("customer")}
                    >
                      {t("orders.customer")} <ArrowUpDown className="h-3 w-3" />
                    </div>
                    <div
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={() => toggleSort("amount")}
                    >
                      {t("orders.amount")} <ArrowUpDown className="h-3 w-3" />
                    </div>
                    <div
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={() => toggleSort("status")}
                    >
                      {t("orders.status")} <ArrowUpDown className="h-3 w-3" />
                    </div>
                    <div>{t("orders.actions")}</div>
                  </div>

                  <div
                    className="overflow-y-auto"
                    style={{ maxHeight: "calc(100vh - 420px)" }}
                  >
                    {paginated.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-slate-500">
                        {t("approval.noOrders")}
                      </div>
                    ) : (
                      paginated.map((item) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-[1.2fr_1.5fr_1fr_1fr_180px] gap-3 border-b border-slate-200 px-4 py-4 text-sm text-slate-600 items-center"
                        >
                          <div className="font-title text-sm font-semibold text-slate-900">
                            {item.id}
                          </div>
                          <div className="text-sm text-slate-700">
                            {typeof item.customer === "object"
                              ? item.customer?.fullName ||
                                item.customer?.name ||
                                "—"
                              : item.customer || "—"}
                          </div>
                          <div className="font-semibold text-slate-900">
                            {formatPrice(item.amount)}
                          </div>
                          <div>
                            <span
                              className={`text-xs font-medium ${statusColor[item.status] || "text-slate-500"}`}
                            >
                              {item.status}
                            </span>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
                              style={{ padding: 5 }}
                            >
                              <Eye style={{ width: 18, height: 18 }} />
                            </button>
                            {item.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleApprove(item.id)}
                                  className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition"
                                  style={{ padding: 5 }}
                                  title={t("approval.approve")}
                                >
                                  <CircleCheckBig
                                    style={{ width: 18, height: 18 }}
                                  />
                                </button>
                                <button
                                  onClick={() => handleReject(item.id)}
                                  className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
                                  style={{ padding: 5 }}
                                  title={t("approval.reject")}
                                >
                                  <XCircle style={{ width: 18, height: 18 }} />
                                </button>
                              </>
                            )}
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
                {totalItems > 0
                  ? t("approval.pageOf", {
                      page: currentPage,
                      total: totalPages,
                      count: totalItems,
                    })
                  : t("approval.noResults")}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevPage}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" /> {t("orders.previous")}
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, totalPages) },
                    (_, index) => {
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
                          className="h-8 w-8 p-0!"
                          onClick={() => setPage(page)}
                          disabled={loading}
                        >
                          {page}
                        </Button>
                      );
                    },
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextPage}
                  disabled={currentPage === totalPages || loading}
                >
                  {t("orders.next")} <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </section>
  );
};

export default OrderApprovalPage;
