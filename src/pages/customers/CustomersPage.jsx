import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@hooks/useTranslation";
import useToast from "@hooks/useToast";
import { Eye, Pencil, Save, Trash2, X } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { FormField } from "@components/forms/FormField";
import {
  DataTable,
  TableToolbar,
  TablePagination,
  useDataTable,
} from "@components/DataTable";
import { useExpandableSearch } from "@hooks/useExpandableSearch";
import { useDebounce } from "@hooks/useDebounce";
import { customerService } from "@services/customerService";
import { useClickOutsideClose } from "@hooks/useClickOutsideClose";
import { formatDate } from "@/utils/formatUtils";

const tierOptions = ["Standard", "Premium", "VIP"];
const fmt = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    v,
  );
const createDraft = (c) => ({
  name: c.name,
  email: c.email,
  phone: c.phone,
  tier: c.tier,
});

const CustomersPage = () => {
  const { t } = useTranslation();
  const { toastTopRight } = useToast();
  const navigate = useNavigate();
  const search = useExpandableSearch();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [draftValues, setDraftValues] = useState({});
  const debouncedSearch = useDebounce(search.value, 300);
  const dialogRef = useClickOutsideClose(() => setOpenDialog(null));

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await customerService.listCustomers();
        const data = res?.data || res;
        if (mounted) setCustomers(Array.isArray(data) ? data : []);
      } catch {
        if (mounted) setCustomers([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const kw = debouncedSearch.toLowerCase();
    if (!kw) return customers;
    return customers.filter(
      (c) =>
        (c.name || c.fullName || "").toLowerCase().includes(kw) ||
        (c.email || "").toLowerCase().includes(kw) ||
        (c.phone || "").toLowerCase().includes(kw),
    );
  }, [customers, debouncedSearch]);

  const dt = useDataTable({
    rows: filtered,
    keyField: "id",
    pageSize: 20,
    exportFilename: "customers",
    onExportRow: (c) => ({
      Name: c.fullName || c.name,
      Email: c.email,
      Phone: c.phone,
      Status: c.status,
      Tier: c.tier,
      Orders: c.orderCount || c.totalOrders,
      Spent: c.totalAmountSpent || c.totalSpent,
      Joined: c.createdAt || c.joinedAt,
    }),
  });

  const startEditing = (customer, field) => {
    setEditingRowId(customer.id);
    setEditingField(field);
    setDraftValues((p) => ({
      ...p,
      [customer.id]: p[customer.id] || createDraft(customer),
    }));
  };
  const updateDraft = (id, field, val) =>
    setDraftValues((p) => ({ ...p, [id]: { ...(p[id] || {}), [field]: val } }));
  const saveCustomer = async (id) => {
    const draft = draftValues[id];
    if (!draft) return;
    try {
      await customerService.updateCustomer(id, draft);
      setCustomers((p) => p.map((c) => (c.id === id ? { ...c, ...draft } : c)));
      toastTopRight(
        "success",
        t("catalog.updateSuccess", "Updated successfully"),
      );
    } catch (e) {
      console.error(e);
      toastTopRight("error", t("catalog.updateError", "Failed to update"));
    } finally {
      setEditingRowId(null);
      setEditingField(null);
    }
  };
  const cancelEditing = () => {
    setEditingRowId(null);
    setEditingField(null);
  };
  const deleteCustomer = async () => {
    if (!selectedCustomer) return;
    try {
      await customerService.deleteCustomer(selectedCustomer.id);
      setCustomers((p) => p.filter((c) => c.id !== selectedCustomer.id));
      toastTopRight(
        "success",
        t("catalog.deleteSuccess", "Deleted successfully"),
      );
    } catch (e) {
      console.error(e);
      toastTopRight("error", t("catalog.deleteError", "Failed to delete"));
    } finally {
      setOpenDialog(null);
      setSelectedCustomer(null);
    }
  };

  const renderCell = (customer, field) => {
    const isEditing = editingRowId === customer.id && editingField === field;
    const draft = draftValues[customer.id] || createDraft(customer);
    const value = draft[field] ?? customer[field];
    if (isEditing) {
      if (field === "tier")
        return (
          <FormField
            type="select"
            className="space-y-0!"
            value={value}
            onChange={(e) => updateDraft(customer.id, field, e.target.value)}
            autoFocus
            options={tierOptions.map((o) => ({ value: o, label: o }))}
          />
        );
      return (
        <FormField
          className="space-y-0!"
          value={value}
          onChange={(e) => updateDraft(customer.id, field, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveCustomer(customer.id);
            if (e.key === "Escape") cancelEditing();
          }}
          autoFocus
        />
      );
    }
    return (
      <Button
        variant="link"
        className="w-full text-left transition truncate"
        onDoubleClick={() => startEditing(customer, field)}
      >
        {customer[field] || ""}
      </Button>
    );
  };

  const columns = [
    {
      key: "name",
      label: t("customers.columns.name"),
      width: "2fr",
      render: (r) => (
        <div className="font-semibold truncate text-left">
          {renderCell(r, "fullName")}
        </div>
      ),
    },
    {
      key: "email",
      label: t("customers.columns.email"),
      width: "2fr",
      render: (r) => (
        <div className="text-xs truncate text-left">
          {renderCell(r, "email")}
        </div>
      ),
    },
    {
      key: "phone",
      label: t("customers.columns.phone"),
      width: "1.5fr",
      render: (r) => <div className="text-xs">{renderCell(r, "phone")}</div>,
    },
    {
      key: "createdAt",
      label: t("customers.columns.joined"),
      render: (r) => (
        <span className="text-xs">
          {formatDate(r.createdAt || r.joinedAt || "")}
        </span>
      ),
    },
    {
      key: "status",
      label: t("customers.columns.status"),
      render: (r) => (
        <span
          className={`text-xs font-medium ${r.verifiedAt ? "text-emerald-600" : ""}`}
        >
          {r.verifiedAt ? "Verified" : "Not verified"}
        </span>
      ),
    },
    {
      key: "tier",
      label: t("customers.columns.tier"),
      sortable: false,
      render: (r) => {
        const spent = r.totalAmountSpent || r.totalSpent || 0;
        let tierName = "Bronze";
        if (spent >= 1000000000) tierName = "Diamond";
        else if (spent >= 200000000) tierName = "Platinum";
        else if (spent >= 50000000) tierName = "Gold";
        else if (spent >= 10000000) tierName = "Silver";

        return (
          <div>
            <div className="text-sm font-medium">{tierName}</div>
            <div className="text-[10px] text-slate-400">
              {fmt(spent)} ({r.orderCount || r.totalOrders || 0} orders)
            </div>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: t("customers.columns.actions"),
      sortable: false,
      width: "120px",
      render: (row) => (
        <div className="flex gap-1.5">
          {editingRowId === row.id ? (
            <>
              <Button
                variant="outline"
                onClick={() => saveCustomer(row.id)}
                className="h-8 w-8 p-0! flex items-center justify-center rounded-lg border border-slate-200 text-emerald-600 transition cursor-pointer"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={cancelEditing}
                className="h-8 w-8 p-0! flex items-center justify-center rounded-lg border border-slate-200 text-red-600 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => navigate(`/customers/${row.id}`)}
                className="h-8! w-8! flex items-center justify-center rounded-lg border border-slate-200 text-blue-600 transition cursor-pointer"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => startEditing(row, "fullName")}
                className="h-8! w-8! flex items-center justify-center rounded-lg border border-slate-200 text-emerald-600 transition cursor-pointer"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCustomer(row);
                  setOpenDialog("delete");
                }}
                className="h-8! w-8! flex items-center justify-center rounded-lg border border-slate-200 text-rose-600 transition cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <h1 className="font-title text-2xl font-bold text-slate-950">
          {t("customers.title")}
        </h1>
        <TableToolbar
          title=""
          onRefresh={() => {
            setLoading(true);
            customerService
              .listCustomers()
              .then((res) => {
                const d = res?.data || res;
                setCustomers(Array.isArray(d) ? d : []);
              })
              .catch(() => setCustomers([]))
              .finally(() => setLoading(false));
          }}
          onExportCsv={dt.handleExport}
          search={search}
          searchPlaceholder={t("customers.search")}
        />
        <DataTable
          columns={columns}
          rows={dt.paginated}
          keyField="id"
          loading={loading}
          emptyMessage={t("customers.noCustomers")}
          sortField={dt.sortField}
          sortDir={dt.sortDir}
          onSort={dt.toggleSort}
          checkedIds={dt.checkedIds}
          onToggleRow={dt.toggleRow}
          onToggleAll={dt.toggleAll}
          allChecked={dt.allChecked}
          someChecked={dt.someChecked}
        />
        <TablePagination
          currentPage={dt.currentPage}
          totalPages={dt.totalPages}
          totalItems={dt.totalItems}
          pageSize={20}
          onPage={dt.setPage}
        />
      </Card>

      {openDialog === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            ref={dialogRef}
            className="mx-4 w-full max-w-md rounded-2xl p-6 shadow-xl bg-(--color-background)"
          >
            <h2 className="mb-4 font-title text-xl font-bold">
              {t("customers.deleteDialog.title")}
            </h2>
            <p className="mb-4 text-sm">
              {t("customers.deleteDialog.message", {
                name: selectedCustomer?.name,
              })}
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1 cursor-pointer"
                onClick={() => setOpenDialog(null)}
              >
                {t("customers.deleteDialog.cancel")}
              </Button>
              <Button
                variant="destructive"
                className="flex-1 cursor-pointer"
                onClick={deleteCustomer}
              >
                {t("customers.deleteDialog.delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CustomersPage;
