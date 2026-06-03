import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@hooks/useTranslation";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  MoreHorizontal,
  Pencil,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { useClickOutsideClose } from "@hooks/useClickOutsideClose";
import { useDebounce } from "@hooks/useDebounce";
import { useExpandableSearch } from "@hooks/useExpandableSearch";
import { customerService } from "@services/customerService";
import { exportToCsv } from "@utils/exportCsv";

const generateMockCustomers = () => {
  const statuses = ["Active", "Inactive", "Suspended"];
  const tiers = ["Standard", "Premium", "VIP"];
  const names = [
    "Nguyen Minh",
    "Tran Anh",
    "Le Hieu",
    "Pham Duc",
    "Hoang Tuan",
    "Vu Linh",
    "Dang Ha",
    "Bui Khanh",
    "Do Phuc",
    "Ngo Dat",
  ];
  const customers = [];

  for (let i = 1; i <= 48; i += 1) {
    customers.push({
      id: i,
      name: `${names[i % 10]} ${i}`,
      email: `customer${i}@example.com`,
      phone: `+84 ${900000000 + i}`,
      status: statuses[i % 3],
      tier: tiers[i % 3],
      totalOrders: Math.floor(Math.random() * 50) + 1,
      totalSpent: Math.floor(Math.random() * 50000000) + 100000,
      joinedAt: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
      ).toLocaleDateString(),
    });
  }

  return customers;
};

const statusColor = {
  Active: "text-emerald-600",
  Inactive: "text-slate-500",
  Suspended: "text-rose-600",
};

const tierOptions = ["Standard", "Premium", "VIP"];

const createDraft = (customer) => ({
  name: customer.name,
  email: customer.email,
  phone: customer.phone,
  tier: customer.tier,
});

const CustomersPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const search = useExpandableSearch();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [draftValues, setDraftValues] = useState({});
  const [actionMenuId, setActionMenuId] = useState(null);
  const itemsPerPage = 20;
  const debouncedSearch = useDebounce(search.value, 300);
  const dialogRef = useClickOutsideClose(() => setOpenDialog(null));
  const actionMenuRef = useRef(null);

  const filtered = useMemo(() => {
    const keyword = debouncedSearch.toLowerCase();

    return customers.filter(
      (customer) =>
        keyword === "" ||
        customer.name.toLowerCase().includes(keyword) ||
        customer.email.toLowerCase().includes(keyword) ||
        customer.phone.toLowerCase().includes(keyword),
    );
  }, [customers, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIdx, startIdx + itemsPerPage);
  const fmt = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  // Fetch customers from API with mock fallback
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await customerService.listCustomers();
        const data = res?.data || res;
        if (mounted)
          setCustomers(
            Array.isArray(data) && data.length ? data : generateMockCustomers(),
          );
      } catch {
        if (mounted) setCustomers(generateMockCustomers());
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    if (!actionMenuId) return undefined;

    const handlePointerDown = (event) => {
      if (actionMenuRef.current?.contains(event.target)) return;
      setActionMenuId(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [actionMenuId]);

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
    setCheckedIds(new Set(paginated.map((customer) => customer.id)));
  };

  const startEditing = (customer, field) => {
    setEditingRowId(customer.id);
    setEditingField(field);
    setDraftValues((prev) => ({
      ...prev,
      [customer.id]: prev[customer.id] || createDraft(customer),
    }));
    setActionMenuId(null);
  };

  const updateDraftField = (customerId, field, value) => {
    setDraftValues((prev) => ({
      ...prev,
      [customerId]: {
        ...(prev[customerId] || {}),
        [field]: value,
      },
    }));
  };

  const saveCustomer = (customerId) => {
    const draft = draftValues[customerId];
    if (!draft) return;

    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === customerId ? { ...customer, ...draft } : customer,
      ),
    );
    setEditingRowId(null);
    setEditingField(null);
    setActionMenuId(null);
  };

  const cancelEditing = () => {
    setEditingRowId(null);
    setEditingField(null);
  };

  const deleteCustomer = () => {
    if (!selectedCustomer) return;
    setCustomers((prev) =>
      prev.filter((customer) => customer.id !== selectedCustomer.id),
    );
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.delete(selectedCustomer.id);
      return next;
    });
    setOpenDialog(null);
    setSelectedCustomer(null);
  };

  const renderEditableCell = (customer, field, className = "") => {
    const isEditing = editingRowId === customer.id && editingField === field;
    const draft = draftValues[customer.id] || createDraft(customer);
    const value = draft[field] ?? customer[field];

    if (isEditing) {
      if (field === "tier") {
        return (
          <select
            className="h-10 w-full rounded-xl border border-amber-300 bg-white px-3 text-sm text-slate-700 outline-none"
            value={value}
            onChange={(event) =>
              updateDraftField(customer.id, field, event.target.value)
            }
            autoFocus
          >
            {tierOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      }

      return (
        <Input
          className="h-10 border-amber-300 px-3 py-2"
          value={value}
          onChange={(event) =>
            updateDraftField(customer.id, field, event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") saveCustomer(customer.id);
            if (event.key === "Escape") cancelEditing();
          }}
          autoFocus
        />
      );
    }

    return (
      <button
        type="button"
        className={`w-full text-left transition hover:text-slate-900 ${className}`}
        onDoubleClick={() => startEditing(customer, field)}
      >
        {customer[field]}
      </button>
    );
  };

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-title text-2xl font-bold text-slate-950">
              {t("customers.title")}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {t("customers.subtitle")}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            ref={search.containerRef}
            className="flex flex-1 items-center gap-2"
          >
            {search.isOpen ? (
              <div className="relative flex-1">
                <Input
                  ref={search.inputRef}
                  className="pl-4 pr-10"
                  placeholder={t("customers.search")}
                  value={search.value}
                  onChange={(event) => search.setValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      search.submit();
                    }
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

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2 rounded-lg px-4 py-2 h-auto text-sm font-semibold cursor-pointer hidden sm:flex"
              aria-label={t("customers.export")}
              onClick={() => exportToCsv(
                filtered.map((c) => ({
                  Name: c.fullName || c.name,
                  Email: c.email,
                  Phone: c.phone,
                  Status: c.status,
                  Tier: c.tier,
                  Orders: c.orderCount || c.totalOrders,
                  Spent: c.totalAmountSpent || c.totalSpent,
                  Joined: c.createdAt || c.joinedAt
                })),
                "customers"
              )}
              disabled={!filtered.length}
            >
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>

        <div
          className="relative overflow-x-auto"
          style={{ maxHeight: "calc(100vh - 340px)" }}
        >
          {actionMenuId ? (
            <button
              type="button"
              className="absolute inset-0 z-10 cursor-default"
              aria-label="Close actions"
              onClick={() => setActionMenuId(null)}
            />
          ) : null}

          <div className="min-w-[900px]">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-[40px_2fr_1.5fr_1.5fr_1fr_1fr_1fr_1fr] gap-3 border-b border-slate-300 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.2em] font-bold text-slate-900 sticky top-0 z-10">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={
                      checkedIds.size === paginated.length &&
                      paginated.length > 0
                    }
                    onChange={toggleAll}
                    className="rounded accent-orange-600"
                  />
                </div>
                <div>{t("customers.columns.name")}</div>
                <div>{t("customers.columns.email")}</div>
                <div>{t("customers.columns.phone")}</div>
                <div>{t("customers.columns.joined")}</div>
                <div>{t("customers.columns.status")}</div>
                <div>{t("customers.columns.tier")}</div>
                <div className="text-center">
                  {t("customers.columns.actions")}
                </div>
              </div>

              <div
                className="overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 420px)" }}
              >
                {paginated.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    {t("customers.noCustomers")}
                  </div>
                ) : (
                  paginated.map((customer) => (
                    <div
                      key={customer.id}
                      className="grid grid-cols-[40px_2fr_1.5fr_1.5fr_1fr_1fr_1fr_1fr] gap-3 border-b border-slate-200 px-4 py-3 text-sm text-slate-600 items-center hover:bg-orange-50 transition"
                    >
                      <div>
                        <input
                          type="checkbox"
                          checked={checkedIds.has(customer.id)}
                          onChange={() => toggleCheck(customer.id)}
                          className="rounded accent-orange-600"
                        />
                      </div>
                      <div className="font-title text-sm font-semibold text-slate-900 truncate">
                        {renderEditableCell(customer, "fullName", "truncate")}
                      </div>
                      <div className="text-xs truncate">
                        {renderEditableCell(customer, "email", "truncate")}
                      </div>
                      <div className="text-xs">
                        {renderEditableCell(customer, "phone")}
                      </div>
                      <div className="text-xs text-slate-500">
                        {customer.createdAt}
                      </div>
                      <div>
                        <span
                          className={`text-xs font-medium ${statusColor[customer.status]}`}
                        >
                          {customer.status}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {customer.orderCount}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {fmt(customer.totalAmountSpent)}
                        </div>
                      </div>
                      <div className="relative z-20 flex justify-end gap-1.5">
                        {editingRowId === customer.id ? (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => saveCustomer(customer.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-[5px] border border-slate-200 text-emerald-600 transition hover:bg-emerald-50"
                              style={{ padding: 5 }}
                            >
                              <Save style={{ width: 18, height: 18 }} />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="flex h-8 w-8 items-center justify-center rounded-[5px] border border-slate-200 text-slate-500 transition hover:bg-slate-100"
                              style={{ padding: 5 }}
                            >
                              <X style={{ width: 18, height: 18 }} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-center gap-1.5 w-full">
                            <button
                              onClick={() =>
                                navigate(`/customers/${customer.id}`)
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-[5px] border border-slate-200 text-blue-600 transition hover:bg-blue-50"
                              style={{ padding: 5 }}
                            >
                              <Eye style={{ width: 18, height: 18 }} />
                            </button>
                            <button
                              onClick={() => startEditing(customer, "name")}
                              className="flex h-8 w-8 items-center justify-center rounded-[5px] border border-slate-200 text-emerald-600 transition hover:bg-emerald-50"
                              style={{ padding: 5 }}
                            >
                              <Pencil style={{ width: 18, height: 18 }} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setOpenDialog("delete");
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-[5px] border border-slate-200 text-rose-600 transition hover:bg-rose-50"
                              style={{ padding: 5 }}
                            >
                              <Trash2 style={{ width: 18, height: 18 }} />
                            </button>
                          </div>
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
            {t("customers.pagination.showing", {
              start: filtered.length ? startIdx + 1 : 0,
              end: Math.min(startIdx + itemsPerPage, filtered.length),
              total: filtered.length,
            })}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              {t("customers.pagination.previous")}
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
              {t("customers.pagination.next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {openDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            ref={dialogRef}
            className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="mb-4 font-title text-xl font-bold text-slate-900">
              {t("customers.deleteDialog.title")}
            </h2>
            <p className="mb-4 text-sm text-slate-600">
              {t("customers.deleteDialog.message", {
                name: selectedCustomer?.name,
              })}
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setOpenDialog(null)}
              >
                {t("customers.deleteDialog.cancel")}
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={deleteCustomer}
              >
                {t("customers.deleteDialog.delete")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default CustomersPage;
