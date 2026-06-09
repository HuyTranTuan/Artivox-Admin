import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import {
  DataTable,
  TableToolbar,
  TablePagination,
  useDataTable,
} from "@components/DataTable";
import { useExpandableSearch } from "@hooks/useExpandableSearch";
import { useDebounce } from "@hooks/useDebounce";
import { useTranslation } from "@hooks/useTranslation";
import { formatDate } from "@utils/formatUtils";
import { ImageIcon } from "lucide-react";
import { usePaginatedApi } from "@hooks/usePaginatedApi";
import { collectionService } from "@services/collectionService";
import { useAuthStore } from "@store/authStore";
import { useClickOutsideClose } from "@hooks/useClickOutsideClose";

const CollectionsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const isAdmin = user?.role === "ADMIN";
  const permission = (() => {
    try {
      return JSON.parse(
        (user?.permission || "{}").replace(/([a-zA-Z0-9_]+)(?=\s*:)/g, '"$1"'),
      );
    } catch {
      return {};
    }
  })();
  const canCreate = isAdmin || permission.create;
  const canUpdate = isAdmin || permission.update;
  const canDelete = isAdmin || permission.del;

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
      setOpenDialog(null);
      refetch();
    } catch (e) {
      console.error(e);
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
        <div className="h-12 w-12 rounded bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="h-5 w-5 text-slate-400" />
          )}
        </div>
      ),
    },
    {
      key: "name",
      label: t("catalog.name"),
      width: "2fr",
      render: (r) => (
        <div>
          <div className="font-semibold text-slate-900 truncate">
            {r.name || r.title}
          </div>
          <div className="text-xs text-slate-500 mt-1">{r.slug}</div>
        </div>
      ),
    },
    {
      key: "description",
      label: t("catalog.description"),
      width: "2fr",
      render: (r) => (
        <div
          className="text-xs text-slate-500 line-clamp-2"
          title={r.description}
        >
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
      label: t("catalog.status"),
      width: "1fr",
      render: (r) => (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            r.isActive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {r.isActive ? t("catalog.active") : t("catalog.inactive")}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: t("catalog.createdAt"),
      width: "1fr",
      render: (r) => (
        <span className="text-xs text-slate-500">
          {formatDate(r.createdAt)}
        </span>
      ),
    },
    {
      key: "updatedAt",
      label: t("catalog.updatedAt"),
      width: "1fr",
      render: (r) => (
        <span className="text-xs text-slate-500">
          {formatDate(r.updatedAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: t("catalog.actions"),
      sortable: false,
      width: "110px",
      render: (row) => (
        <div className="flex gap-1.5">
          <button
            onClick={() =>
              navigate(`/catalog/collections/${row.slug || row.id}`)
            }
            className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
            style={{ padding: 5 }}
          >
            <Eye style={{ width: 16, height: 16 }} />
          </button>
          {canUpdate && (
            <button
              onClick={() =>
                navigate(`/catalog/collections/edit/${row.slug || row.id}`)
              }
              className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition"
              style={{ padding: 5 }}
            >
              <Edit style={{ width: 16, height: 16 }} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => {
                setSelectedItem(row);
                setOpenDialog("delete");
              }}
              className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
              style={{ padding: 5 }}
            >
              <Trash2 style={{ width: 16, height: 16 }} />
            </button>
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
              label: t("catalog.status"),
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
              <div className="col-span-full text-center py-8 text-sm text-slate-500">
                {t("catalog.noCollections")}
              </div>
            ) : (
              dt.paginated.map((item) => (
                <div
                  key={item.id}
                  className="border border-slate-200 rounded-2xl p-4 hover:shadow-lg transition cursor-pointer"
                  onClick={() => navigate(`/catalog/collections/${item.slug}`)}
                >
                  <div className="font-title text-base font-semibold text-slate-900 mb-1">
                    {item.name}
                  </div>
                  <div className="text-xs text-slate-500 mb-3 font-mono">
                    {item.slug}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className="mb-0">
                      {item.isActive
                        ? t("catalog.active")
                        : t("catalog.inactive")}
                    </Badge>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/catalog/collections/${item.slug}`);
                        }}
                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
                      >
                        <Eye style={{ width: 16, height: 16 }} />
                      </button>
                      {canUpdate && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/catalog/collections/edit/${item.slug || item.id}`);
                          }}
                          className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition"
                        >
                          <Edit style={{ width: 16, height: 16 }} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                            setOpenDialog("delete");
                          }}
                          className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 style={{ width: 16, height: 16 }} />
                        </button>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div
            ref={dialogRef}
            className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4"
          >
            <h2 className="font-title text-xl font-bold mb-3">
              {t("catalog.confirmDelete")}
            </h2>
            <p className="text-sm text-slate-600 mb-5">
              {t("catalog.deleteConfirmMsg", { name: selectedItem?.name })}
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setOpenDialog(null)}
                disabled={deleting}
              >
                {t("catalog.cancel")}
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("catalog.delete")
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
