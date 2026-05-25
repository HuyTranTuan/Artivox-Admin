import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Edit, Trash2, Grid3x3, List, Search, Filter, ChevronLeft, ChevronRight, X, Plus, ImageIcon, Upload, GripVertical, Loader2 } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { useClickOutsideClose } from "@hooks/useClickOutsideClose";
import { useDebounce } from "@hooks/useDebounce";
import { useExpandableSearch } from "@hooks/useExpandableSearch";
import { usePaginatedApi } from "@hooks/usePaginatedApi";
import { useTranslation } from "@hooks/useTranslation";
import { modelsService } from "@services/modelsService";
import ImageGalleryModal from "@components/ui/ImageGalleryModal";
import { formatDate } from "@utils/formatUtils";

const ModelsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [viewMode, setViewMode] = useState("table");
  const [filterOpen, setFilterOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({ category: null, status: null });
  const [form, setForm] = useState({
    name: "",
    category: "",
    status: "Published",
  });
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [formImages, setFormImages] = useState([]);
  const [formThumbnailPreview, setFormThumbnailPreview] = useState(null);
  const thumbnailInputRef = useRef(null);
  const detailImageInputRef = useRef(null);
  const search = useExpandableSearch();
  const debouncedSearch = useDebounce(search.value, 300);
  const dialogRef = useClickOutsideClose(() => setOpenDialog(null));
  const filterRef = useClickOutsideClose(() => setFilterOpen(false));

  // IMPORTANT: Pass a callback function, NOT the result of calling modelsService.getModels()
  const fetchModels = useCallback((params) => modelsService.getModels({ ...params, search: debouncedSearch || undefined }), [debouncedSearch]);

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
  } = usePaginatedApi(fetchModels, { defaultLimit: 20, pageParam: "page" });

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const openGallery = (images, index = 0) => {
    setGalleryImages(images || []);
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  const categories = [...new Set(items.map((item) => item.category).filter(Boolean))];
  const statuses = [...new Set(items.map((item) => item.status).filter(Boolean))];

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        return (!selectedFilters.category || item.category === selectedFilters.category) && (!selectedFilters.status || item.status === selectedFilters.status);
      }),
    [items, selectedFilters],
  );

  const paginatedItems = filteredItems;

  const resetForm = () => {
    setForm({ name: "", category: "", status: "Published" });
    setFormImages([]);
    setFormThumbnailPreview(null);
  };

  const handleCreate = () => {
    resetForm();
    setSelectedItem(null);
    setOpenDialog("create");
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setOpenDialog("edit");
    setForm({ name: item.name, category: item.category, status: item.status });
    setFormThumbnailPreview(item.images?.[0]?.thumb || item.images?.[0]?.url || null);
    setFormImages(item.images || []);
  };

  const handleSubmit = () => setOpenDialog(null);

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormThumbnailPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleDetailImageAdd = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newImages = files.map((file, idx) => ({
      url: URL.createObjectURL(file),
      thumb: URL.createObjectURL(file),
      alt: `Image ${formImages.length + idx + 1}`,
      _file: file,
    }));
    setFormImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const removeFormImage = (idx) => {
    setFormImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRowClick = (slug) => {
    navigate(`/catalog/models/${slug}`);
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
          handleEdit(item);
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
      <div ref={dialogRef} className="bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="font-title text-xl font-bold text-slate-900 mb-4">{openDialog === "create" ? t("catalog.addNewModel") : t("catalog.editModel")}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">{t("catalog.name")}</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">{t("catalog.category")}</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none"
            >
              <option value="">{t("catalog.selectCategory")}</option>
              <option>Electronics</option>
              <option>Furniture</option>
              <option>Accessories</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">{t("catalog.status")}</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none"
            >
              <option>Published</option>
              <option>Draft</option>
              <option>Review</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">{t("catalog.thumbnail")}</label>
            <div className="flex items-center gap-3">
              <div
                onClick={() => thumbnailInputRef.current?.click()}
                className="h-20 w-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition overflow-hidden"
              >
                {formThumbnailPreview ? (
                  <img src={formThumbnailPreview} alt="thumbnail" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Upload className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400">{t("catalog.upload")}</span>
                  </div>
                )}
              </div>
              <input ref={thumbnailInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
              <div className="text-xs text-slate-400">
                <p>{t("catalog.upload")}</p>
                <p>Recommended 150x150</p>
              </div>
              {formThumbnailPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setFormThumbnailPreview(null);
                  }}
                  className="text-rose-500 hover:text-rose-700 text-xs font-semibold"
                >
                  {t("catalog.remove")}
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
              {t("catalog.detailImages")} ({formImages.length})
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2">
              {formImages.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">{t("catalog.noImages")}</div>
              ) : (
                formImages.map((img, idx) => {
                  const src = img?.thumb || img?.url || img;
                  return (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 rounded-lg px-2 py-1.5">
                      <GripVertical className="h-4 w-4 text-slate-300 shrink-0 cursor-grab" />
                      <img
                        src={typeof src === "string" ? src : ""}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <span className="flex-1 text-xs text-slate-600 truncate">{img.alt || `Image ${idx + 1}`}</span>
                      <button type="button" onClick={() => removeFormImage(idx)} className="text-rose-500 hover:text-rose-700 shrink-0">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
            <input ref={detailImageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleDetailImageAdd} />
            <Button type="button" variant="ghost" size="sm" className="mt-2 gap-1.5 text-xs" onClick={() => detailImageInputRef.current?.click()}>
              <Plus className="h-3.5 w-3.5" />
              {t("catalog.addImages")}
            </Button>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" className="flex-1" onClick={() => setOpenDialog(null)}>
            {t("catalog.cancel")}
          </Button>
          <Button className="flex-1" onClick={handleSubmit}>
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
            <h1 className="font-title text-2xl font-bold text-slate-950">{t("catalog.models")}</h1>
            <Button variant="outline-orange" className="gap-2 rounded-lg px-4 py-2 h-auto text-sm font-semibold" onClick={() => navigate("/catalog/models/create")}>
              <Plus className="h-5 w-5" /> {t("catalog.addNew")}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div ref={search.containerRef} className="flex items-center gap-2">
              {search.isOpen ? (
                <div className="relative w-64">
                  <Input
                    ref={search.inputRef}
                    className="pl-4 pr-10"
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
                      <div className="text-xs font-semibold text-slate-900 mb-2">{t("catalog.category")}</div>
                      {categories.map((category) => (
                        <label key={category} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFilters.category === category}
                            onChange={() => setSelectedFilters((prev) => ({ ...prev, category: prev.category === category ? null : category }))}
                            className="rounded"
                          />
                          <span className="text-sm text-slate-600">{category}</span>
                        </label>
                      ))}
                    </div>
                    <div className="border-t border-slate-200 pt-4">
                      <div className="text-xs font-semibold text-slate-900 mb-2">{t("catalog.status")}</div>
                      {statuses.map((status) => (
                        <label key={status} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFilters.status === status}
                            onChange={() => setSelectedFilters((prev) => ({ ...prev, status: prev.status === status ? null : status }))}
                            className="rounded"
                          />
                          <span className="text-sm text-slate-600">{status}</span>
                        </label>
                      ))}
                    </div>
                    <Button variant="secondary" size="sm" className="w-full" onClick={() => setSelectedFilters({ category: null, status: null })}>
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
                <div className="min-w-225">
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <div className="grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_150px] gap-4 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.2em] font-bold text-slate-900 border-b border-slate-300 sticky top-0 z-10">
                      <div>{t("catalog.image")}</div>
                      <div>{t("catalog.name")}</div>
                      <div>{t("catalog.category")}</div>
                      <div>{t("catalog.status")}</div>
                      <div>{t("catalog.createdAt")}</div>
                      <div>{t("catalog.author")}</div>
                      <div>{t("catalog.actions")}</div>
                    </div>
                    <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 380px)" }}>
                      {paginatedItems.length === 0 ? (
                        <div className="px-4 py-8 text-sm text-slate-500 text-center">{t("catalog.noModels")}</div>
                      ) : (
                        paginatedItems.map((item) => (
                          <div
                            key={item.id}
                            className="grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_150px] gap-4 border-b border-slate-200 px-4 py-3 text-sm text-slate-600 items-center hover:bg-orange-100 cursor-pointer transition"
                            onClick={() => handleRowClick(item.slug)}
                          >
                            <ThumbnailPreview
                              images={item.images}
                              onClick={(e) => {
                                e.stopPropagation();
                                openGallery(item.images);
                              }}
                            />
                            <div>
                              <div className="font-title text-base font-semibold text-slate-900">{item.name}</div>
                            </div>
                            <div>{item.category}</div>
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
                {paginatedItems.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-sm text-slate-500">{t("catalog.noModels")}</div>
                ) : (
                  paginatedItems.map((item) => (
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
                                <ImageIcon className="h-4 w-4" /> {t("catalog.viewGallery")} ({item.images.length})
                              </div>
                            </div>
                            {item.images.length > 1 && (
                              <div className="absolute top-2 right-2 flex gap-1">
                                {item.images.slice(0, 3).map((_, idx) => (
                                  <div key={idx} className="h-2 w-2 rounded-full bg-white/80" />
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <div className="text-center text-slate-400">
                              <ImageIcon className="h-10 w-10 mx-auto mb-2" />
                              <span className="text-xs">{t("catalog.noImages")}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="font-title text-base font-semibold text-slate-900 mb-1">{item.name}</div>
                        <div className="text-xs text-slate-500 mb-3">
                          {item.category} • {t("catalog.createdAt")} {formatDate(item.createdAt)}
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge className="mb-0">{item.status}</Badge>
                          <div className="flex gap-1">
                            <ActionButtons item={item} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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

export default ModelsPage;
