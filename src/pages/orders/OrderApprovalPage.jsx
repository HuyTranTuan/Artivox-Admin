import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUpDown,
} from "lucide-react";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { orderService } from "@services/orderService";
import { formatPrice } from "@utils/formatUtils";
import { useClickOutsideClose } from "@hooks/useClickOutsideClose";
import { useDebounce } from "@hooks/useDebounce";
import { useExpandableSearch } from "@hooks/useExpandableSearch";

const statusOptions = ["PENDING", "PAID", "REFUND_PENDING"];

const OrderApprovalPage = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const itemsPerPage = 20;
  const search = useExpandableSearch();
  const debouncedSearch = useDebounce(search.value, 300);
  const filterRef = useClickOutsideClose(() => setFilterOpen(false));
  const dialogRef = useClickOutsideClose(() => setOpenDialog(null));

  useEffect(() => {
    let mounted = true;
    const loadOrders = async () => {
      const data = await orderService.listOrders();
      if (mounted) setOrders(data);
    };
    loadOrders();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedStatus, sortField, sortDir]);

  const filtered = useMemo(() => {
    let result = [...orders];

    // Search filter
    const keyword = debouncedSearch.toLowerCase();
    if (keyword) {
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(keyword) ||
          o.customer.toLowerCase().includes(keyword),
      );
    }

    // Status filter
    if (selectedStatus) {
      result = result.filter((o) => o.status === selectedStatus);
    }

    // Sort
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIdx, startIdx + itemsPerPage);

  const toggleCheck = (id) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (checkedIds.size === paginated.length) {
      setCheckedIds(new Set());
      return;
    }
    setCheckedIds(new Set(paginated.map((o) => o.id)));
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handleView = (item) => {
    setSelectedOrder(item);
    setOpenDialog("view");
  };
  const handleEdit = (item) => {
    setSelectedOrder(item);
    setOpenDialog("edit");
  };
  const handleDelete = (item) => {
    setSelectedOrder(item);
    setOpenDialog("delete");
  };

  const statusColor = {
    PENDING: "text-amber-600",
    PAID: "text-emerald-600",
    REFUND_PENDING: "text-rose-600",
  };

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-title text-2xl font-bold text-slate-950">
              Order approval
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Lifecycle: PENDING - PAID - REFUND_PENDING
            </p>
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
              <div className="grid grid-cols-[40px_1.2fr_1.5fr_1fr_1fr_180px] gap-3 border-b border-slate-300 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.2em] font-bold text-slate-900 sticky top-0 z-10">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={
                      checkedIds.size === paginated.length &&
                      paginated.length > 0
                    }
                    onChange={toggleAll}
                    className="rounded"
                  />
                </div>
                <div
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => toggleSort("id")}
                >
                  Code
                  <ArrowUpDown className="h-3 w-3" />
                </div>
                <div
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => toggleSort("customer")}
                >
                  Customer
                  <ArrowUpDown className="h-3 w-3" />
                </div>
                <div
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => toggleSort("amount")}
                >
                  Amount
                  <ArrowUpDown className="h-3 w-3" />
                </div>
                <div
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => toggleSort("status")}
                >
                  Status
                  <ArrowUpDown className="h-3 w-3" />
                </div>
                <div>Actions</div>
              </div>

              <div
                className="overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 420px)" }}
              >
                {paginated.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    No orders found
                  </div>
                ) : (
                  paginated.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[40px_1.2fr_1.5fr_1fr_1fr_180px] gap-3 border-b border-slate-200 px-4 py-4 text-sm text-slate-600 items-center"
                    >
                      <div>
                        <input
                          type="checkbox"
                          checked={checkedIds.has(item.id)}
                          onChange={() => toggleCheck(item.id)}
                          className="rounded"
                        />
                      </div>
                      <div className="font-title text-sm font-semibold text-slate-900">
                        {item.id}
                      </div>
                      <div className="text-sm text-slate-700">
                        {item.customer}
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
                          onClick={() => handleView(item)}
                          className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
                          style={{ padding: 5 }}
                        >
                          <Eye style={{ width: 18, height: 18 }} />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition"
                          style={{ padding: 5 }}
                        >
                          <Pencil style={{ width: 18, height: 18 }} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
                          style={{ padding: 5 }}
                        >
                          <Trash2 style={{ width: 18, height: 18 }} />
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
              <ChevronLeft className="h-4 w-4" />
              Previous
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
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {openDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div
            ref={dialogRef}
            className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4"
          >
            {openDialog === "view" && (
              <>
                <h2 className="font-title text-xl font-bold text-slate-900 mb-4">
                  Order Details
                </h2>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-slate-500 uppercase">
                      Order Code
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {selectedOrder?.id}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase">
                      Customer
                    </div>
                    <div className="text-sm text-slate-900">
                      {selectedOrder?.customer}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase">
                      Amount
                    </div>
                    <div className="text-sm text-slate-900">
                      {formatPrice(selectedOrder?.amount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase">
                      Status
                    </div>
                    <span
                      className={`text-xs font-medium ${statusColor[selectedOrder?.status]}`}
                    >
                      {selectedOrder?.status}
                    </span>
                  </div>
                </div>
                <Button
                  className="w-full mt-6"
                  onClick={() => setOpenDialog(null)}
                >
                  Close
                </Button>
              </>
            )}
            {openDialog === "edit" && (
              <>
                <h2 className="font-title text-xl font-bold text-slate-900 mb-4">
                  Edit Order
                </h2>
                <p className="text-sm text-slate-600">
                  Edit coming soon for: <strong>{selectedOrder?.id}</strong>
                </p>
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setOpenDialog(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setOpenDialog(null)}
                  >
                    Save
                  </Button>
                </div>
              </>
            )}
            {openDialog === "delete" && (
              <>
                <h2 className="font-title text-xl font-bold text-slate-900 mb-4">
                  Delete Order
                </h2>
                <p className="text-sm text-slate-600 mb-4">
                  Are you sure? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setOpenDialog(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => setOpenDialog(null)}
                  >
                    Delete
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default OrderApprovalPage;
