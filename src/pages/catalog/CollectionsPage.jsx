import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, X, Plus, Eye, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { useClickOutsideClose } from "@hooks/useClickOutsideClose";
import { useDebounce } from "@hooks/useDebounce";
import { useExpandableSearch } from "@hooks/useExpandableSearch";
import { useTranslation } from "@hooks/useTranslation";
import { collectionService } from "@services/collectionService";

const ROWS_PER_PAGE = 20;

const CollectionsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilters, setSelectedFilters] = useState({ status: null });
  const [openDialog, setOpenDialog] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const search = useExpandableSearch();
  const debouncedSearch = useDebounce(search.value, 300);
  const filterRef = useClickOutsideClose(() => setFilterOpen(false));
  const dialogRef = useClickOutsideClose(() => setOpenDialog(null));

  const load = async () => {
    try {
      setLoading(true);
      const data = await collectionService.getCollections();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedItem) {
      setDeleting(true);
      try {
        await collectionService.deleteCollection(selectedItem.slug);
        setOpenDialog(null);
        load();
      } catch (err) {
        console.error("Delete collection failed:", err);
      } finally {
        setDeleting(false);
      }
    }
  };

  // Fetch collections from API
  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedFilters]);

  // Filter collections based on search
  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesSearch =
          debouncedSearch === "" || item.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) || item.description?.toLowerCase().includes(debouncedSearch.toLowerCase());
        return matchesSearch && (!selectedFilters.status || item.status === selectedFilters.status);
      }),
    [items, debouncedSearch, selectedFilters],
  );

  const totalPages = Math.ceil(filteredItems.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + ROWS_PER_PAGE);

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-title text-2xl font-bold text-slate-950">{t("catalog.collections")}</h1>
            <Button className="h-8 w-8 p-0 rounded-lg" onClick={() => navigate("/catalog/collections/create")}>
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div ref={search.containerRef} className="flex items-center gap-2">
              {search.isOpen ? (
                <div className="relative w-64">
                  <Input
                    ref={search.inputRef}
                    className="pr-10"
                    placeholder={t("catalog.searchPlaceholder")}
                    value={search.value}
                    onChange={(e) => search.setValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") search.submit();
                    }}
                  />
                  {search.value ? (
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700" onClick={search.clear}>
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              ) : null}
              <Button variant="ghost" className="h-10 w-10 p-0" onClick={search.submit}>
                <Search style={{ width: 18, height: 18 }} />
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
          <div className="min-w-[700px]">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-[2fr_1fr_2fr_120px] gap-4 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.2em] font-bold text-slate-900 border-b border-slate-300 sticky top-0 z-10">
                <div>{t("catalog.name")}</div>
                <div>{t("catalog.slug")}</div>
                <div>{t("catalog.description")}</div>
                <div>{t("catalog.actions")}</div>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 380px)" }}>
                {loading ? (
                  <div className="px-4 py-8 text-sm text-slate-500 text-center">{t("catalog.loading")}</div>
                ) : paginatedItems.length === 0 ? (
                  <div className="px-4 py-8 text-sm text-slate-500 text-center">{t("catalog.noResults")}</div>
                ) : (
                  paginatedItems.map((item) => (
                    <div
                      key={item.id || item.slug}
                      className="grid grid-cols-[2fr_1fr_2fr_120px] gap-4 border-b border-slate-200 px-4 py-4 text-sm text-slate-600 hover:bg-orange-100 transition cursor-pointer"
                      onClick={() => navigate(`/catalog/collections/${item.slug}`)}
                    >
                      <div>
                        <div className="font-title text-base font-semibold text-slate-900">{item.name}</div>
                      </div>
                      <div className="text-slate-500 font-mono text-xs self-center">{item.slug}</div>
                      <div className="text-xs text-slate-500 truncate self-center">{item.description || "—"}</div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/catalog/collections/${item.slug}`);
                          }}
                          className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
                          style={{ padding: 5 }}
                        >
                          <Eye style={{ width: 18, height: 18 }} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/catalog/collections/edit/${item.slug}`);
                          }}
                          className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                          style={{ padding: 5 }}
                        >
                          <Edit style={{ width: 16, height: 16 }} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                            setOpenDialog("delete");
                          }}
                          className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-red-200 text-red-600 hover:bg-red-50 transition"
                          style={{ padding: 5 }}
                        >
                          <Trash2 style={{ width: 16, height: 16 }} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
          <div className="text-sm text-slate-600">
            {filteredItems.length > 0 ? <>{t("catalog.pageOf", { page: currentPage, total: totalPages, count: filteredItems.length })}</> : t("catalog.noResults")}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
              {t("catalog.previous")}
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) pageNumber = i + 1;
                else if (currentPage <= 3) pageNumber = i + 1;
                else if (currentPage >= totalPages - 2) pageNumber = totalPages - 4 + i;
                else pageNumber = currentPage - 2 + i;
                return (
                  <Button key={pageNumber} variant={currentPage === pageNumber ? "default" : "ghost"} size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentPage(pageNumber)}>
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
              {t("catalog.next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      {openDialog === "delete" && selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div ref={dialogRef} className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="font-title text-xl font-bold text-slate-900 mb-4">{t("catalog.deleteTitle")}</h2>
            <p className="text-sm text-slate-600 mb-4">{t("catalog.deleteConfirm", { name: selectedItem.name })}</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setOpenDialog(null)} disabled={deleting}>
                {t("catalog.cancel")}
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleting}>
                {deleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {t("catalog.delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CollectionsPage;
