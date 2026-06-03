import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Edit,
  Trash2,
  Grid3x3,
  List,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  ImageIcon,
  GripVertical,
  Loader2,
  Download,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { useClickOutsideClose } from "@hooks/useClickOutsideClose";
import { useDebounce } from "@hooks/useDebounce";
import { useExpandableSearch } from "@hooks/useExpandableSearch";
import { usePaginatedApi } from "@hooks/usePaginatedApi";
import { useAuthStore } from "@store/authStore";
import ImageGalleryModal from "@/components/ImageGalleryModal";
import { formatDate } from "@utils/formatUtils";
import ImageUploadBox from "@components/ImageUploadBox";
import { useTranslation } from "@hooks/useTranslation";
import { modelsService } from "@services/modelsService";
import { exportToCsv } from "@utils/exportCsv";

const ThumbnailPreview = ({ images, onClick }) => {
  if (!images || images.length === 0) {
    return (
      <div
        onClick={onClick}
        className="h-16 w-16 rounded-lg bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition border border-slate-200"
      >
        <ImageIcon className="h-5 w-5 text-slate-400" />
      </div>
    );
  }
  const firstImg = images[0];
  const imgSrc =
    typeof firstImg === "string" ? firstImg : firstImg?.thumb || firstImg?.url;
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

const ModelsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const validJsonString = user?.permission?.replace(
    /([a-zA-Z0-9_]+)(?=\s*:)/g,
    '"$1"',
  );
  const permission = validJsonString ? JSON.parse(validJsonString) : {};
  const canCreate = isAdmin || permission.create;
  const canUpdate = isAdmin || permission.update;
  const canDelete = isAdmin || permission.del;

  const [viewMode, setViewMode] = useState("table");
  const [filterOpen, setFilterOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    category: null,
    status: null,
  });
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    basePrice: "0",
    stock: "0",
    isActive: true,
    previewFileUrl: "",
    sourceFileUrl: "",
  });
  const [thumbnailBefore, setThumbnailBefore] = useState(null);
  const [thumbnailAfter, setThumbnailAfter] = useState(null);
  const [formGalleryImages, setFormGalleryImages] = useState([]);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const thumbnailBeforeRef = useRef(null);
  const thumbnailAfterRef = useRef(null);
  const galleryInputRef = useRef(null);

  const search = useExpandableSearch();
  const debouncedSearch = useDebounce(search.value, 300);
  const dialogRef = useClickOutsideClose(() => setOpenDialog(null));
  const filterRef = useClickOutsideClose(() => setFilterOpen(false));

  const fetchModels = useCallback(
    (params) =>
      modelsService.getModels({
        ...params,
        search: debouncedSearch || undefined,
        isActive:
          selectedFilters.status === "Active"
            ? true
            : selectedFilters.status === "Inactive"
              ? false
              : undefined,
      }),
    [debouncedSearch, selectedFilters.status],
  );

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

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedFilters.status]);

  const openGallery = (images, index = 0) => {
    setGalleryImages(images || []);
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  const statuses = ["Active", "Inactive"];

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const itemStatus = item.isActive ? "Active" : "Inactive";
        const matchesSearch =
          debouncedSearch === "" ||
          item.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          item.description
            ?.toLowerCase()
            .includes(debouncedSearch.toLowerCase());
        return (
          matchesSearch &&
          (!selectedFilters.status || itemStatus === selectedFilters.status)
        );
      }),
    [items, debouncedSearch, selectedFilters],
  );

  const paginatedItems = filteredItems;

  const handleEdit = (item) => {
    setSelectedItem(item);
    setOpenDialog("edit");
    setForm({
      name: item.name || "",
      slug: item.slug || "",
      description: item.description || "",
      basePrice: item.basePrice?.toString() || "0",
      stock: item.stock?.toString() || "0",
      isActive: item.isActive,
      previewFileUrl: item.model3D?.previewFileUrl || "",
      sourceFileUrl: item.model3D?.sourceFileUrl || "",
    });

    const thumbBefore = item.images?.find(
      (img) => img.role === "THUMBNAIL_BEFORE",
    );
    const thumbAfter = item.images?.find(
      (img) => img.role === "THUMBNAIL_AFTER",
    );
    const gallery = item.images?.filter((img) => img.role === "GALLERY") || [];

    setThumbnailBefore(
      thumbBefore
        ? { preview: thumbBefore.url, id: thumbBefore.id, isExisting: true }
        : null,
    );
    setThumbnailAfter(
      thumbAfter
        ? { preview: thumbAfter.url, id: thumbAfter.id, isExisting: true }
        : null,
    );
    setFormGalleryImages(
      gallery.map((img) => ({
        preview: img.url,
        id: img.id,
        isExisting: true,
        alt: img.altText || "Gallery Image",
        file: null,
      })),
    );
  };

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (selectedItem) {
      setDeleting(true);
      try {
        await modelsService.deleteModel(selectedItem.slug);
        setOpenDialog(null);
        refetch();
      } catch (err) {
        console.error("Delete model failed:", err);
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (openDialog === "edit" && selectedItem) {
      setSaving(true);
      try {
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("description", form.description);
        formData.append("basePrice", form.basePrice);
        formData.append("stock", form.stock);
        formData.append("isActive", form.isActive);
        formData.append("previewFileUrl", form.previewFileUrl);
        formData.append("sourceFileUrl", form.sourceFileUrl);

        if (thumbnailBefore?.file) {
          const ext = thumbnailBefore.file.name.split(".").pop();
          formData.append(
            "thumbnail_before",
            thumbnailBefore.file,
            `thumbnail_before.${ext}`,
          );
        }
        if (thumbnailAfter?.file) {
          const ext = thumbnailAfter.file.name.split(".").pop();
          formData.append(
            "thumbnail_after",
            thumbnailAfter.file,
            `thumbnail_after.${ext}`,
          );
        }
        formGalleryImages.forEach((img) => {
          if (img.file) {
            formData.append("gallery", img.file);
          }
        });

        await modelsService.updateModel(selectedItem.slug, formData);
        setOpenDialog(null);
        refetch();
      } catch (err) {
        console.error("Update model failed:", err);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleImageChange = (setter) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setter({ file, preview: URL.createObjectURL(file), isExisting: false });
    e.target.value = "";
  };

  const handleGalleryAdd = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isExisting: false,
    }));
    setFormGalleryImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const removeGalleryImage = (idx) => {
    setFormGalleryImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRowClick = (slug) => {
    navigate(`/catalog/models/${slug}`);
  };

  const renderActionButtons = (item) => (
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
      {canUpdate && (
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
      )}
      {canDelete && (
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
      )}
    </div>
  );
  const renderFormModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        ref={dialogRef}
        className="bg-white rounded-2xl shadow-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <h2 className="font-title text-xl font-bold text-slate-900 mb-6">
          {t("catalog.editModel")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h3 className="font-title text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
              {t("catalog.info")}
            </h3>
            <div>
              <label className="text-xs font-semibold text-slate-700">
                {t("catalog.name")}
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t("catalog.name")}
                className="placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">
                {t("catalog.slugReadOnly")}
              </label>
              <Input
                value={form.slug}
                readOnly
                className="bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200 placeholder:text-gray-400"
                placeholder={t("catalog.slug")}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">
                {t("catalog.description")}
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none resize-none placeholder:text-gray-500 text-gray-700"
                placeholder={t("catalog.description")}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  {t("catalog.price")} (VND)
                </label>
                <Input
                  type="number"
                  value={form.basePrice}
                  onChange={(e) =>
                    setForm({ ...form, basePrice: e.target.value })
                  }
                  placeholder={t("catalog.price")}
                  className="placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  {t("catalog.stock")}
                </label>
                <Input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="placeholder:text-gray-400"
                  placeholder={t("catalog.stock")}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">
                {t("catalog.status")}
              </label>
              <select
                value={form.isActive ? "active" : "inactive"}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.value === "active" })
                }
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none text-gray-700"
              >
                <option value="active">{t("catalog.active")}</option>
                <option value="inactive">{t("catalog.inactive")}</option>
              </select>
            </div>

            <h3 className="font-title text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2 pt-4">
              {t("catalog.3dModelFiles")}
            </h3>
            <div>
              <label className="text-xs font-semibold text-slate-700">
                {t("catalog.previewFileUrl")}
              </label>
              <Input
                value={form.previewFileUrl}
                onChange={(e) =>
                  setForm({ ...form, previewFileUrl: e.target.value })
                }
                placeholder={t("catalog.previewFileUrl")}
                className="placeholder:text-gray-500 text-gray-700"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">
                {t("catalog.sourceFileUrl")}
              </label>
              <Input
                value={form.sourceFileUrl}
                onChange={(e) =>
                  setForm({ ...form, sourceFileUrl: e.target.value })
                }
                placeholder={t("catalog.sourceFileUrl")}
                className="placeholder:text-gray-500 text-gray-700"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-title text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
              {t("catalog.images")}
            </h3>
            <ImageUploadBox
              label={t("catalog.thumbnailBefore")}
              value={thumbnailBefore}
              onClear={() => setThumbnailBefore(null)}
              inputRef={thumbnailBeforeRef}
              onChange={handleImageChange(setThumbnailBefore)}
              recommended="150x150"
              t={t}
            />
            <ImageUploadBox
              label={t("catalog.thumbnailAfter")}
              value={thumbnailAfter}
              onClear={() => setThumbnailAfter(null)}
              inputRef={thumbnailAfterRef}
              onChange={handleImageChange(setThumbnailAfter)}
              recommended="150x150"
              t={t}
            />
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                {t("catalog.gallery")} ({formGalleryImages.length})
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50/50">
                {formGalleryImages.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-400">
                    {t("catalog.noImages")}
                  </div>
                ) : (
                  formGalleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-white rounded-lg px-2 py-1.5 border border-slate-100 shadow-sm"
                    >
                      <GripVertical className="h-4 w-4 text-slate-300 shrink-0 cursor-grab" />
                      <img
                        src={img.preview}
                        alt={img.alt || `Gallery ${idx + 1}`}
                        className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <span className="flex-1 text-xs text-slate-600 truncate">
                        {img.file?.name || img.alt || `Image ${idx + 1}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="text-rose-500 hover:text-rose-700 shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleGalleryAdd}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 gap-1.5 text-xs w-full border border-dashed border-slate-300"
                onClick={() => galleryInputRef.current?.click()}
              >
                <Plus className="h-3.5 w-3.5" />
                {t("catalog.addImages")}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <Button
            variant="secondary"
            className="flex-1 cursor-pointer"
            onClick={() => setOpenDialog(null)}
            disabled={saving}
          >
            {t("catalog.cancel")}
          </Button>
          <Button
            className="flex-1 gap-2 cursor-pointer"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("catalog.save")}
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
            <div className="text-rose-500 font-semibold mb-2">
              {t("catalog.errorLoading")}
            </div>
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
          <div className="flex items-center gap-2">
            <h1 className="font-title text-2xl font-bold text-slate-950">
              {t("catalog.models")}
            </h1>

            <Button
              variant="outline-orange"
              className="gap-2 rounded-lg px-4 py-2 h-auto text-sm font-semibold cursor-pointer"
              onClick={() => navigate("/catalog/models/create")}
              disabled={!canCreate}
            >
              <Plus className="h-5 w-5" /> {t("catalog.addNew")}
            </Button>

            <Button
              variant="outline"
              className="gap-2 rounded-lg px-4 py-2 h-auto text-sm font-semibold cursor-pointer bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800"
              onClick={() =>
                exportToCsv(
                  filteredItems.map((i) => ({
                    Name: i.name,
                    Slug: i.slug,
                    Price: i.basePrice,
                    Stock: i.stock,
                    Status: i.isActive ? "Active" : "Inactive",
                    Created: i.createdAt,
                  })),
                  "models",
                )
              }
              disabled={!filteredItems.length}
            >
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div ref={search.containerRef} className="flex items-center gap-2">
              {search.isOpen ? (
                <div className="relative w-64">
                  <Input
                    ref={search.inputRef}
                    className="pl-4 pr-10 placeholder:text-gray-400"
                    placeholder={t("catalog.searchPlaceholder")}
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
                className="h-10 w-10 p-0! cursor-pointer"
                onClick={search.submit}
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
            <div className="relative">
              <Button
                variant={filterOpen ? "default" : "ghost"}
                className="h-10 w-10 p-0! cursor-pointer"
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
                        {t("catalog.status")}
                      </div>
                      {statuses.map((status) => (
                        <label
                          key={status}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedFilters.status === status}
                            onChange={() =>
                              setSelectedFilters((prev) => ({
                                ...prev,
                                status: prev.status === status ? null : status,
                              }))
                            }
                            className="rounded"
                          />
                          <span className="text-sm text-slate-600">
                            {status === "Active"
                              ? t("catalog.active")
                              : t("catalog.inactive")}
                          </span>
                        </label>
                      ))}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full cursor-pointer"
                      onClick={() => setSelectedFilters({ status: null })}
                    >
                      {t("catalog.clearFilters")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0!"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4 text-gray-600 cursor-pointer" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0!"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-4 w-4 text-gray-600 cursor-pointer" />
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <span className="ml-3 text-sm text-slate-500">
              {t("catalog.loading")}
            </span>
          </div>
        ) : (
          <>
            {viewMode === "table" && (
              <div
                className="overflow-x-auto"
                style={{ maxHeight: "calc(100vh - 300px)" }}
              >
                <div className="min-w-225">
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <div className="grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_150px] gap-4 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.2em] font-bold text-slate-900 border-b border-slate-300 sticky top-0 z-10">
                      <div>{t("catalog.image")}</div>
                      <div>{t("catalog.name")}</div>
                      <div>{t("catalog.price")}</div>
                      <div>{t("catalog.status")}</div>
                      <div>{t("catalog.createdAt")}</div>
                      <div>{t("catalog.stock")}</div>
                      <div>{t("catalog.actions")}</div>
                    </div>
                    <div
                      className="overflow-y-auto"
                      style={{ maxHeight: "calc(100vh - 380px)" }}
                    >
                      {paginatedItems.length === 0 ? (
                        <div className="px-4 py-8 text-sm text-slate-500 text-center">
                          {t("catalog.noModels")}
                        </div>
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
                              <div className="font-title text-base font-semibold text-slate-900">
                                {item.name}
                              </div>
                            </div>
                            <div>{item.basePrice?.toLocaleString()} VND</div>
                            <div>
                              <Badge>
                                {item.isActive
                                  ? t("catalog.active")
                                  : t("catalog.inactive")}
                              </Badge>
                            </div>
                            <div className="text-xs text-slate-500">
                              {formatDate(item.createdAt)}
                            </div>
                            <div className="text-xs text-slate-500">
                              {item.stock}
                            </div>
                            {renderActionButtons(item)}
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
                  <div className="col-span-full text-center py-8 text-sm text-slate-500">
                    {t("catalog.noModels")}
                  </div>
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
                                <ImageIcon className="h-4 w-4" />{" "}
                                {t("catalog.viewGallery")} ({item.images.length}
                                )
                              </div>
                            </div>
                            {item.images.length > 1 && (
                              <div className="absolute top-2 right-2 flex gap-1">
                                {item.images.slice(0, 3).map((_, idx) => (
                                  <div
                                    key={idx}
                                    className="h-2 w-2 rounded-full bg-white/80"
                                  />
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <div className="text-center text-slate-400">
                              <ImageIcon className="h-10 w-10 mx-auto mb-2" />
                              <span className="text-xs">
                                {t("catalog.noImages")}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="font-title text-base font-semibold text-slate-900 mb-1">
                          {item.name}
                        </div>
                        <div className="text-xs text-slate-500 mb-3">
                          {item.basePrice?.toLocaleString()} VND •{" "}
                          {t("catalog.createdAt")} {formatDate(item.createdAt)}
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge className="mb-0">
                            {item.isActive
                              ? t("catalog.active")
                              : t("catalog.inactive")}
                          </Badge>
                          <div className="flex gap-1">
                            {renderActionButtons(item)}
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
                {total > 0 ? (
                  <>
                    {t("catalog.pageOf", {
                      page: currentPage,
                      total: totalPages,
                      count: total,
                    })}
                  </>
                ) : (
                  t("catalog.noResults")
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevPage}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" /> {t("catalog.previous")}
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) pageNumber = i + 1;
                    else if (currentPage <= 3) pageNumber = i + 1;
                    else if (currentPage >= totalPages - 2)
                      pageNumber = totalPages - 4 + i;
                    else pageNumber = currentPage - 2 + i;
                    return (
                      <Button
                        key={pageNumber}
                        variant={
                          currentPage === pageNumber ? "default" : "ghost"
                        }
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextPage}
                  disabled={currentPage === totalPages || loading}
                >
                  {t("catalog.next")} <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {openDialog === "create" || openDialog === "edit"
        ? renderFormModal()
        : null}

      {openDialog === "delete" && selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div
            ref={dialogRef}
            className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4"
          >
            <h2 className="font-title text-xl font-bold text-slate-900 mb-4">
              {t("catalog.deleteTitle")}
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              {t("catalog.deleteConfirm", { name: selectedItem.name })}
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1 cursor-pointer"
                onClick={() => setOpenDialog(null)}
                disabled={deleting}
              >
                {t("catalog.cancel")}
              </Button>
              <Button
                variant="destructive"
                className="flex-1 cursor-pointer"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {t("catalog.delete")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {galleryOpen && (
        <ImageGalleryModal
          images={galleryImages}
          initialIndex={galleryIndex}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </section>
  );
};

export default ModelsPage;
