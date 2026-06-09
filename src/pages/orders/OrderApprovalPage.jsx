import { useMemo, useState } from "react";
import { Eye, CircleCheckBig, XCircle, Loader2 } from "lucide-react";
import { Card } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { DataTable, TableToolbar, TablePagination, useDataTable } from "@components/DataTable";
import { orderService } from "@services/orderService";
import { usePaginatedApi } from "@hooks/usePaginatedApi";
import { useExpandableSearch } from "@hooks/useExpandableSearch";
import { useDebounce } from "@hooks/useDebounce";
import { useAuth } from "@hooks/useAuth";
import { useTranslation } from "@hooks/useTranslation";

const statusColor = { PENDING: "text-amber-600", PAID: "text-emerald-600", REFUND_PENDING: "text-rose-600" };
const fmtPrice = (v) => v == null ? "—" : `₫${Number(v).toLocaleString()}`;

const OrderApprovalPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { data: orders, loading, error, page: currentPage, totalPages, totalItems, setPage, prevPage, nextPage, refetch } = usePaginatedApi(
    (params) => orderService.listOrders({ ...params, status: "PENDING" }),
    { defaultLimit: 20, pageParam: "page" },
  );

  const [activeFilters, setActiveFilters] = useState({ status: null });
  const search = useExpandableSearch();
  const debouncedSearch = useDebounce(search.value, 300);

  const filtered = useMemo(() => {
    let r = [...orders];
    const kw = debouncedSearch.toLowerCase();
    if (kw) r = r.filter((o) => {
      const cust = typeof o.customer === "object" ? o.customer?.fullName || o.customer?.name || "" : o.customer || "";
      return (o.id || "").toLowerCase().includes(kw) || cust.toLowerCase().includes(kw);
    });
    if (activeFilters.status) r = r.filter((o) => o.status === activeFilters.status);
    return r;
  }, [orders, debouncedSearch, activeFilters]);

  const dt = useDataTable({
    rows: filtered, keyField: "id", pageSize: 20, exportFilename: "pending-orders",
    onExportRow: (r) => ({ id: r.id, customer: typeof r.customer === "object" ? r.customer?.fullName || "" : r.customer || "", amount: r.amount, status: r.status }),
  });

  const handleApprove = async (id) => { try { await orderService.approveOrder(id); refetch(); } catch (e) { console.error(e); } };
  const handleReject = async (id) => { try { await orderService.rejectOrder(id); refetch(); } catch (e) { console.error(e); } };

  const columns = [
    { key: "id", label: t("orders.code"), width: "1.2fr", render: (r) => <div className="font-semibold text-xs text-slate-900">{r.id}</div> },
    { key: "customer", label: t("orders.customer"), width: "1.5fr", render: (r) => <div>{typeof r.customer === "object" ? r.customer?.fullName || r.customer?.name || "—" : r.customer || "—"}</div> },
    { key: "amount", label: t("orders.amount"), render: (r) => <div className="font-semibold">{fmtPrice(r.amount || r.totalAmount)}</div> },
    { key: "status", label: t("orders.status"), render: (r) => <span className={`text-xs font-medium ${statusColor[r.status] || "text-slate-500"}`}>{r.status}</span> },
    {
      key: "actions", label: t("orders.actions"), sortable: false, width: "150px",
      render: (row) => (
        <div className="flex gap-1.5">
          <button className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-blue-600 hover:bg-blue-50 transition" style={{ padding: 5 }}><Eye style={{ width: 16, height: 16 }} /></button>
          {row.status === "PENDING" && (
            <>
              <button onClick={() => handleApprove(row.id)} title={t("approval.approve")} className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition" style={{ padding: 5 }}><CircleCheckBig style={{ width: 16, height: 16 }} /></button>
              <button onClick={() => handleReject(row.id)} title={t("approval.reject")} className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-rose-600 hover:bg-rose-50 transition" style={{ padding: 5 }}><XCircle style={{ width: 16, height: 16 }} /></button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (error) return (
    <section className="space-y-6">
      <Card className="p-6">
        <div className="text-center py-8">
          <div className="text-rose-500 font-semibold mb-2">{t("approval.failedToLoad")}</div>
          <div className="text-sm text-slate-500 mb-4">{error}</div>
          <Button onClick={refetch}>{t("approval.retry")}</Button>
        </div>
      </Card>
    </section>
  );

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <TableToolbar
          title={t("approval.title")}
          onRefresh={refetch}
          onExportCsv={dt.handleExport}
          search={search}
          searchPlaceholder={t("approval.searchPlaceholder", "Search orders...")}
          filterOptions={[{ key: "status", label: t("orders.filterStatus"), values: ["PENDING", "PAID", "REFUND_PENDING"] }]}
          activeFilters={activeFilters}
          onFilterChange={(key, val) => setActiveFilters((p) => ({ ...p, [key]: val }))}
        />
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <span className="ml-3 text-sm text-slate-500">{t("approval.loading")}</span>
          </div>
        ) : (
          <>
            <DataTable columns={columns} rows={dt.paginated} keyField="id" loading={false} emptyMessage={t("approval.noOrders")} sortField={dt.sortField} sortDir={dt.sortDir} onSort={dt.toggleSort} checkedIds={dt.checkedIds} onToggleRow={dt.toggleRow} onToggleAll={dt.toggleAll} allChecked={dt.allChecked} someChecked={dt.someChecked} />
            <TablePagination currentPage={dt.currentPage} totalPages={dt.totalPages} totalItems={dt.totalItems} pageSize={20} onPage={dt.setPage} />
          </>
        )}
      </Card>
    </section>
  );
};

export default OrderApprovalPage;
