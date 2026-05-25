import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Edit, Trash2, Grid3x3, List, Search, Filter, ChevronLeft, ChevronRight, X, Plus, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { useClickOutsideClose } from "@hooks/useClickOutsideClose";
import { useDebounce } from "@hooks/useDebounce";
import { useExpandableSearch } from "@hooks/useExpandableSearch";
import { usePaginatedApi } from "@hooks/usePaginatedApi";
import { useTranslation } from "@hooks/useTranslation";
import { materialsService } from "@services/materialsService";
import ImageGalleryModal from "@components/ui/ImageGalleryModal";
import { formatDate } from "@utils/formatUtils";

const MaterialsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    data: items,
    loading,
    error,
    page: currentPage,
    totalPages,
    totalItems: total,
    setPage,
    nextPage,
    prevPage,
    refetch,
  } = usePaginatedApi((params) => materialsService.getMaterials({ ...params }), { defaultLimit: 20, pageParam: "page" });
  const [viewMode, setViewMode] = useState("table");
  const [filterOpen, setFilterOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({ type: null, status: null });
  const [form, setForm] = useState({ name: "", type: "", status: "Active", stock: "", price: "" });
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const search = useExpandableSearch();
  const debouncedSearch = useDebounce(search.value, 300);
  const dialogRef = useClickOutsideClose(() => setOpenDialog(null));
  const filterRef = useClickOutsideClose(() => setFilterOpen(false));

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const openGallery = (images, index = 0) => {
    setGalleryImages(images || []);
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  const types = [...new Set(items.map((item) => item.type).filter(Boolean))];
  const statuses = [...new Set(items.map((item) => item.status).filter(Boolean))];

  const filteredItems = useMemo(
    () => items.filter((item) => (!selectedFilters.type || item.type === selectedFilters.type) && (!selectedFilters.status || item.status === selectedFilters.status)),
    [items, selectedFilters],
  );

  const resetForm = () => setForm({ name: "", type: "", status: "Active", stock: "", price: "" });

  const handleRowClick = (slug) => {
    navigate(`/catalog/materials/${slug}`);
  };

  const ActionButtons = ({ item }) => (
    <div className="flex gap-1.5">
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleRowClick(item.slug);
        }}
        className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
        style={{ padding: 5 }}
      >
        <Eye style={{ width: 18, height: 18 }} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedItem(item);
          setOpenDialog("edit");
          setForm({ name: item.name, type: item.type, status: item.status, stock: String(item.stock ?? ""), price: String(item.price ?? "") });
        }}
        className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition"
        style={{ padding: 5 }}
      >
        <Edit style={{ width: 18, height: 18 }} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedItem(item);
          setOpenDialog("delete");
        }}
        className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
        style={{ padding: 5 }}
      >
        <Trash2 style={{ width: 18, height: 18 }} />
      </button>
    </div>
  );

  const ThumbnailPreview = ({ images, onClick }) => {
    if (!images || images.length === 0) {
      return (
        <div onClick={onClick} className="h-16 w-16 rounded-lg bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition border border-slate-200">
          <ImageIcon className="h-5 w-5 text-slate-400" />
        </div>
      );
    }
    const firstImg = images[0];
    const imgSrc = typeof firstImg === "string" ? firstImg : firstImg?.thumb || firstImg?.url;
    return (
      <div className="relative group" onClick={onClick}>
        <img
          src={imgSrc}
          alt="thumbnail"
          className="h-16 w-16 rounded-lg object-cover cursor-pointer border border-slate-200 hover:border-amber-300 transition hover:shadow-md"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
        {images.length > 1 && (
          <span className="absolute -bottom-1.5 -right-1.5 bg-amber-500 text-white text-[9px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow">
            +{images.length - 1}
          </span>
        )}
      </div>
    );
  };

  const FormModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div ref={dialogRef} className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="font-title text-xl font-bold text-slate-900 mb-4">{openDialog === "create" ? t("catalog.addNewMaterial") : t("catalog.editMaterial")}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">{t("catalog.name")}</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">{t("catalog.type")}</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option value="">{t("catalog.selectType")}</option>
              <option>PLA</option>
              <option>ABS</option>
              <option>Resin</option>
              <option>TPU</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">{t("catalog.status")}</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option>Active</option>
              <option>Inactive</option>
              <option>Discontinued</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">{t("catalog.stock")}</label>
              <Input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">{t("catalog.price")} (VND)</label>
              <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" className="flex-1" onClick={() => setOpenDialog(null)}>
            {t("catalog.cancel")}
          </Button>
          <Button className="flex-1" onClick={() => setOpenDialog(null)}>
            {openDialog === "create" ? t("catalog.create") : t("catalog.save")}
          </Button>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <section className="space-y-6">
        <Card className="p-6">
          <div className="text-center py-8">
            <div className="text-rose-500 font-semibold mb-2">{t("catalog.errorLoading")}</div>
            <div className="text-sm text-slate-500 mb-4">{error}</div>
            <Button onClick={refetch}>{t("catalog.retry")}</Button>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-title text-2xl font-bold text-slate-950">{t("catalog.materials")}</h1>
            <Button variant="outline-orange" className="gap-2 rounded-lg px-4 py-2 h-auto text-sm font-semibold" onClick={() => navigate("/catalog/materials/create")}>
              <Plus className="h-5 w-5" /> {t("catalog.addNew")}
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
            <div className="relative">
              <Button variant={filterOpen ? "default" : "ghost"} className="h-10 w-10 p-0" onClick={() => setFilterOpen(!filterOpen)}>
                <Filter className="h-5 w-5" />
              </Button>
              {filterOpen && (
                <div ref={filterRef} className="absolute top-full mt-2 right-0 bg-white border border-slate-200 rounded-2xl shadow-lg p-4 w-64 z-10">
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-semibold text-slate-900 mb-2">{t("catalog.type")}</div>
                      {types.map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFilters.type === type}
                            onChange={() => setSelectedFilters((prev) => ({ ...prev, type: prev.type === type ? null : type }))}
                            className="rounded"
                          />
                          <span className="text-sm">{type}</span>
                        </label>
                      ))}
                    </div>
                    <div className="border-t pt-4">
                      <div className="text-xs font-semibold text-slate-900 mb-2">{t("catalog.status")}</div>
                      {statuses.map((status) => (
                        <label key={status} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFilters.status === status}
                            onChange={() => setSelectedFilters((prev) => ({ ...prev, status: prev.status === status ? null : status }))}
                            className="rounded"
                          />
                          <span className="text-sm">{status}</span>
                        </label>
                      ))}
                    </div>
                    <Button variant="secondary" size="sm" className="w-full" onClick={() => setSelectedFilters({ type: null, status: null })}>
                      {t("catalog.clearFilters")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              <Button variant={viewMode === "table" ? "default" : "ghost"} size="sm" className="h-8 w-8 p-0" onClick={() => setViewMode("table")}>
                <List className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" className="h-8 w-8 p-0" onClick={() => setViewMode("grid")}>
                <Grid3x3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <span className="ml-3 text-sm text-slate-500">{t("catalog.loading")}</span>
          </div>
        ) : (
          <>
            {viewMode === "table" && (
              <div className="overflow-x-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
                <div className="min-w-[800px]">
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <div className="grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_120px] gap-4 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.2em] font-bold text-slate-900 border-b border-slate-300 sticky top-0 z-10">
                      <div>{t("catalog.image")}</div>
                      <div>{t("catalog.name")}</div>
                      <div>{t("catalog.type")}</div>
                      <div>{t("catalog.status")}</div>
                      <div>{t("catalog.createdAt")}</div>
                      <div>{t("catalog.author")}</div>
                      <div>{t("catalog.actions")}</div>
                    </div>
                    <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 380px)" }}>
                      {filteredItems.length === 0 ? (
                        <div className="px-4 py-8 text-sm text-slate-500 text-center">{t("catalog.noMaterials")}</div>
                      ) : (
                        filteredItems.map((item) => (
                          <div
                            key={item.id}
                            className="grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_120px] gap-4 border-b border-slate-200 px-4 py-3 text-sm text-slate-600 items-center hover:bg-orange-100 cursor-pointer transition"
                            onClick={() => handleRowClick(item.slug)}
                          >
                            <ThumbnailPreview
                              images={item.images}
                              onClick={(e) => {
                                e.stopPropagation();
                                openGallery(item.images);
                              }}
                            />
                            <div className="font-title text-base font-semibold text-slate-900">{item.name}</div>
                            <div>{item.type}</div>
                            <div>
                              <Badge>{item.status}</Badge>
                            </div>
                            <div className="text-xs text-slate-500">{formatDate(item.createdAt)}</div>
                            <div className="text-xs text-slate-500">{item.author || "—"}</div>
                            <ActionButtons item={item} />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition group cursor-pointer"
                    onClick={() => handleRowClick(item.slug)}
                  >
                    <div
                      className="relative h-48 bg-slate-100 cursor-pointer overflow-hidden"
                      onClick={(e) => {
                        e.stopPropagation();
                        openGallery(item.images);
                      }}
                    >
                      {item.images && item.images.length > 0 ? (
                        <>
                          <img
                            src={item.images[0].url}
                            alt={item.name}
                            className="h-full w-full object-cover transition group-hover:scale-105"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-2 bg-white/90 rounded-full px-4 py-2 text-sm font-semibold text-slate-800">
                              <ImageIcon className="h-4 w-4" />
                              {t("catalog.viewGallery")} ({item.images.length})
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-400">
                          <div className="text-center">
                            <ImageIcon className="h-10 w-10 mx-auto mb-2" />
                            <span className="text-xs">{t("catalog.noImages")}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="font-title text-base font-semibold text-slate-900 mb-1">{item.name}</div>
                      <div className="text-xs text-slate-500 mb-3">
                        {item.type} • {t("catalog.createdAt")} {formatDate(item.createdAt)}
                      </div>
                      <Badge className="mb-3">{item.status}</Badge>
                      <div className="flex gap-2 mt-2">
                        <ActionButtons item={item} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                {total > 0 ? <>{t("catalog.pageOf", { page: currentPage, total: totalPages, count: total })}</> : t("catalog.noResults")}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={prevPage} disabled={currentPage === 1 || loading}>
                  <ChevronLeft className="h-4 w-4" /> {t("catalog.previous")}
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) pageNumber = i + 1;
                    else if (currentPage <= 3) pageNumber = i + 1;
                    else if (currentPage >= totalPages - 2) pageNumber = totalPages - 4 + i;
                    else pageNumber = currentPage - 2 + i;
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "ghost"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setPage(pageNumber)}
                        disabled={loading}
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>
                <Button variant="ghost" size="sm" onClick={nextPage} disabled={currentPage === totalPages || loading}>
                  {t("catalog.next")} <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {openDialog === "create" || openDialog === "edit" ? <FormModal /> : null}
      {openDialog === "delete" && selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div ref={dialogRef} className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="font-title text-xl font-bold text-slate-900 mb-4">{t("catalog.deleteTitle")}</h2>
            <p className="text-sm text-slate-600 mb-4">{t("catalog.deleteConfirm", { name: selectedItem.name })}</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setOpenDialog(null)}>
                {t("catalog.cancel")}
              </Button>
              <Button variant="destructive" className="flex-1" onClick={() => setOpenDialog(null)}>
                {t("catalog.delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
      {galleryOpen && <ImageGalleryModal images={galleryImages} initialIndex={galleryIndex} onClose={() => setGalleryOpen(false)} />}
    </section>
  );
};

export default MaterialsPage;
