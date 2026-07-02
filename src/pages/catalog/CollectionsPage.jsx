import { ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Edit, Trash2, Loader2 } from "lucide-react";

import useToast from "@hooks/useToast";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { formatDate } from "@utils/formatUtils";
import { useAuthStore } from "@store/authStore";
import { useDebounce } from "@hooks/useDebounce";
import { useTranslation } from "@hooks/useTranslation";
import { usePaginatedApi } from "@hooks/usePaginatedApi";
import { collectionService } from "@services/collectionService";
import { useExpandableSearch } from "@hooks/useExpandableSearch";
import { useClickOutsideClose } from "@hooks/useClickOutsideClose";
import {
  DataTable,
  TableToolbar,
  TablePagination,
  useDataTable,
} from "@components/DataTable";
import { useRBAC } from "@hooks/useRBAC";

const CollectionsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toastTopRight } = useToast();
  const {
    isAdmin,
    canCreate,
    canUpdate,
    canDelete,
    permissions: permission,
  } = useRBAC();

  const [activeFilters, setActiveFilters] = useState({ status: null });
  const [openDialog, setOpenDialog] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const search = useExpandableSearch();
  const debouncedSearch = useDebounce(search.value, 300);
  const dialogRef = useClickOutsideClose(() => setOpenDialog(null));

  const {
    data: items,
    loading,
    page: currentPage,
    totalPages,
    totalItems,
    setPage,
    refetch,
  } = usePaginatedApi(
    (params) =>
      collectionService.getCollections({
        ...params,
        search: debouncedSearch,
        isActive:
          activeFilters.status === "Active"
            ? true
            : activeFilters.status === "Inactive"
              ? false
              : undefined,
      }),
    {
      defaultLimit: 20,
      pageParam: "page",
      refreshDeps: [debouncedSearch, activeFilters],
    },
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeFilters, setPage]);

  const handleDelete = async () => {
    if (!selectedItem) return;
    setDeleting(true);
    try {
      await collectionService.deleteCollection(selectedItem.slug);
      toastTopRight(
        "success",
        t("catalog.deleteSuccess", "Deleted successfully"),
      );
      setOpenDialog(null);
      refetch();
    } catch (e) {
      console.error(e);
      const msg = e.response?.data?.message || "catalog.deleteError";
      toastTopRight("error", t(msg, msg));
    } finally {
      setDeleting(false);
    }
  };

  const dt = useDataTable({
    rows: items,
    keyField: "id",
    pageSize: 20,
    exportFilename: "collections",
    onExportRow: (i) => ({
      Name: i.name,
      Slug: i.slug,
      Description: i.description,
      Items: i.itemCount,
      Status: i.isActive ? "Active" : "Inactive",
      Created: formatDate(i.createdAt),
      Updated: formatDate(i.updatedAt),
    }),
  });

  const columns = [
    {
      key: "image",
      label: t("catalog.image"),
      width: "80px",
      sortable: false,
      render: (item) => (
        <div className="h-12 w-12 rounded-xl overflow-hidden flex items-center justify-center bg-amber-300">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="h-5 w-5" />
          )}
        </div>
      ),
    },
    {
      key: "name",
      label: t("common.name"),
      width: "2fr",
      render: (r) => (
        <div>
          <div className="text-sm font-semibold">{r.name || r.title}</div>
          <div className="text-xs mt-1">{r.slug}</div>
        </div>
      ),
    },
    {
      key: "description",
      label: t("catalog.description"),
      width: "2fr",
      render: (r) => (
        <div className="text-xs line-clamp-2" title={r.description}>
          {r.description || "-"}
        </div>
      ),
    },
    {
      key: "itemCount",
      label: t("catalog.items"),
      width: "1fr",
      render: (r) => (
        <span className="text-sm font-medium">{r.itemCount || 0}</span>
      ),
    },
    {
      key: "status",
      label: t("common.status"),
      width: "1fr",
      render: (r) => (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${r.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}
        >
          {r.isActive ? t("catalog.active") : t("catalog.inactive")}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: t("catalog.createdAt"),
      width: "1fr",
      render: (r) => <span className="text-xs">{formatDate(r.createdAt)}</span>,
    },
    {
      key: "updatedAt",
      label: t("catalog.updatedAt"),
      width: "1fr",
      render: (r) => <span className="text-xs">{formatDate(r.updatedAt)}</span>,
    },
    {
      key: "actions",
      label: t("common.actions"),
      sortable: false,
      width: "150px",
      render: (row) => (
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            onClick={() =>
              navigate(`/catalog/collections/${row.slug || row.id}`)
            }
            className="h-8 w-8 p-2! flex items-center justify-center rounded-[5px] border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
            style={{ padding: 5 }}
          >
            <Eye style={{ width: 16, height: 16 }} />
          </Button>
          {canUpdate && (
            <Button
              variant="outline"
              onClick={() =>
                navigate(`/catalog/collections/edit/${row.slug || row.id}`)
              }
              className="h-8 w-8 p-2! flex items-center justify-center rounded-[5px] border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition"
              style={{ padding: 5 }}
            >
              <Edit style={{ width: 16, height: 16 }} />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedItem(row);
                setOpenDialog("delete");
              }}
              className="h-8 w-8 p-2! flex items-center justify-center rounded-[5px] border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
              style={{ padding: 5 }}
            >
              <Trash2 style={{ width: 16, height: 16 }} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <TableToolbar
          title={t("catalog.collections")}
          onAddNew={
            canCreate ? () => navigate("/catalog/collections/create") : null
          }
          onRefresh={refetch}
          onExportCsv={dt.handleExport}
          search={search}
          searchPlaceholder={t("catalog.searchPlaceholder")}
          filterOptions={[
            {
              key: "status",
              label: t("common.status"),
              values: ["Active", "Inactive"],
            },
          ]}
          activeFilters={activeFilters}
          onFilterChange={(key, val) =>
            setActiveFilters((p) => ({ ...p, [key]: val }))
          }
          viewMode={dt.viewMode}
          onViewChange={dt.setViewMode}
        />
        {dt.viewMode === "list" ? (
          <DataTable
            columns={columns}
            rows={dt.paginated}
            keyField="id"
            loading={loading}
            emptyMessage={t("catalog.noCollections")}
            sortField={dt.sortField}
            sortDir={dt.sortDir}
            onSort={dt.toggleSort}
            checkedIds={dt.checkedIds}
            onToggleRow={dt.toggleRow}
            onToggleAll={dt.toggleAll}
            allChecked={dt.allChecked}
            someChecked={dt.someChecked}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            ) : dt.paginated.length === 0 ? (
              <div className="col-span-full text-center py-8 text-sm">
                {t("catalog.noCollections")}
              </div>
            ) : (
              dt.paginated.map((item) => (
                <div
                  key={item.id}
                  className="border border-slate-200 rounded-2xl p-4 hover:shadow-lg transition cursor-pointer"
                  onClick={() => navigate(`/catalog/collections/${item.slug}`)}
                >
                  <div className="font-title text-base font-semibold mb-1">
                    {item.name}
                  </div>
                  <div className="text-xs mb-3 font-mono">{item.slug}</div>
                  <div className="flex items-center justify-between">
                    <Badge className="mb-0">
                      {item.isActive
                        ? t("catalog.active")
                        : t("catalog.inactive")}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/catalog/collections/${item.slug}`);
                        }}
                        className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
                      >
                        <Eye style={{ width: 16, height: 16 }} />
                      </Button>
                      {canUpdate && (
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/catalog/collections/edit/${item.slug || item.id}`,
                            );
                          }}
                          className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition"
                        >
                          <Edit style={{ width: 16, height: 16 }} />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                            setOpenDialog("delete");
                          }}
                          className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 style={{ width: 16, height: 16 }} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={20}
          onPage={setPage}
        />
      </Card>

      {openDialog === "delete" && (
        <div className="fixed inset-0 bg-(--color-background)/40 z-50 flex items-center justify-center">
          <div
            ref={dialogRef}
            className="rounded-2xl shadow-xl p-6 max-w-md w-full mx-4 bg-(--color-background)"
          >
            <h2 className="font-title text-xl font-bold mb-3">
              {t("catalog.confirmDelete")}
            </h2>
            <p className="text-sm mb-5">
              {t("catalog.deleteConfirmMsg", { name: selectedItem?.name })}
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1 px-3 py-2"
                onClick={() => setOpenDialog(null)}
                disabled={deleting}
              >
                {t("common.cancel")}
              </Button>
              <Button
                variant="destructive"
                className="flex-1 px-3 py-2"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("common.delete")
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CollectionsPage;
