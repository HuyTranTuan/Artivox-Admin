import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Edit,
  Trash2,
  X,
  Plus,
  ImageIcon,
  GripVertical,
  Loader2,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { FormField } from "@components/forms/FormField";
import {
  DataTable,
  TableToolbar,
  TablePagination,
  useDataTable,
} from "@components/DataTable";
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
import { collectionService } from "@services/collectionService";
import useToast from "@hooks/useToast";

const ThumbnailPreview = ({ images, onClick }) => {
  const { t } = useTranslation();

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
  const { toastTopRight } = useToast();

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

  const [openDialog, setOpenDialog] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
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
    collectionId: "",
  });
  const [thumbnailBefore, setThumbnailBefore] = useState(null);
  const [thumbnailAfter, setThumbnailAfter] = useState(null);
  const [formGalleryImages, setFormGalleryImages] = useState([]);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    collectionService
      .getCollections({ limit: 100, isActive: true })
      .then((res) =>
        setCollections(res.data?.items || res.items || res.data || []),
      )
      .catch(console.error);
  }, []);

  const thumbnailBeforeRef = useRef(null);
  const thumbnailAfterRef = useRef(null);
  const galleryInputRef = useRef(null);

  const search = useExpandableSearch();
  const debouncedSearch = useDebounce(search.value, 300);
  const dialogRef = useClickOutsideClose(() => setOpenDialog(null));

  const fetchModels = useCallback(
    (params) =>
      modelsService.getModels({
        ...params,
        search: debouncedSearch || undefined,
        isActive:
          activeFilters.status === "Active"
            ? true
            : activeFilters.status === "Inactive"
              ? false
              : undefined,
      }),
    [debouncedSearch, activeFilters.status],
  );

  const {
    data: items,
    loading,
    error,
    page: currentPage,
    totalPages,
    totalItems: total,
    setPage,
    refetch,
  } = usePaginatedApi(fetchModels, {
    defaultLimit: 20,
    pageParam: "page",
    refreshDeps: [debouncedSearch, activeFilters.status],
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeFilters.status]);

  const openGallery = (images, index = 0) => {
    setGalleryImages(images || []);
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  const dt = useDataTable({
    rows: items,
    keyField: "id",
    pageSize: 20,
    exportFilename: "models",
    onExportRow: (i) => ({
      Name: i.name,
      Slug: i.slug,
      Price: i.basePrice,
      Stock: i.stock,
      Status: i.isActive ? "Active" : "Inactive",
      Created: formatDate(i.createdAt),
    }),
  });

  const columns = [
    {
      key: "image",
      label: t("catalog.image"),
      width: "80px",
      sortable: false,
      render: (item) => (
        <ThumbnailPreview
          images={item.images}
          onClick={(e) => {
            e.stopPropagation();
            openGallery(item.images);
          }}
        />
      ),
    },
    {
      key: "name",
      label: t("catalog.name"),
      width: "2fr",
      render: (item) => (
        <div className="font-title text-base font-semibold text-slate-900">
          {item.name}
        </div>
      ),
    },
    {
      key: "basePrice",
      label: t("catalog.price"),
      width: "1fr",
      render: (item) => <div>{item.basePrice?.toLocaleString()} VND</div>,
    },
    {
      key: "isActive",
      label: t("catalog.status"),
      width: "1fr",
      render: (item) => (
        <Badge>
          {item.isActive ? t("catalog.active") : t("catalog.inactive")}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: t("catalog.createdAt"),
      width: "1fr",
      render: (item) => (
        <div className="text-xs text-slate-500">
          {formatDate(item.createdAt)}
        </div>
      ),
    },
    {
      key: "stock",
      label: t("catalog.stock"),
      width: "1fr",
      render: (item) => (
        <div className="text-xs text-slate-500">{item.stock}</div>
      ),
    },
    {
      key: "actions",
      label: t("catalog.actions"),
      width: "150px",
      sortable: false,
      render: (item) => renderActionButtons(item),
    },
  ];

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
      collectionId: item.collectionId?.toString() || "",
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
        toastTopRight(
          "success",
          t("catalog.deleteSuccess", "Deleted successfully"),
        );
        setOpenDialog(null);
        refetch();
      } catch (err) {
        console.error(err);
        const msg = err.response?.data?.message || "catalog.deleteError";
        toastTopRight("error", t(msg, msg));
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
        if (form.collectionId) {
          formData.append("collectionId", form.collectionId);
        } else {
          formData.append("collectionId", "");
        }

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
        toastTopRight(
          "success",
          t("catalog.updateSuccess", "Updated successfully"),
        );
        setOpenDialog(null);
        refetch();
      } catch (err) {
        console.error(err);
        const msg = err.response?.data?.message || "catalog.updateError";
        toastTopRight("error", t(msg, msg));
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
            <FormField
              label={t("catalog.name")}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t("catalog.name")}
            />
            <FormField
              label={t("catalog.slugReadOnly")}
              value={form.slug}
              readOnly
              placeholder={t("catalog.slug")}
              className="bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200"
            />
            <FormField
              label={t("catalog.description")}
              type="textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={t("catalog.description")}
              rows={3}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label={`${t("catalog.price")} (VND)`}
                type="number"
                value={form.basePrice}
                onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                placeholder={t("catalog.price")}
              />
              <FormField
                label={t("catalog.stock")}
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder={t("catalog.stock")}
              />
            </div>
            <FormField
              label={t("catalog.status")}
              type="select"
              value={form.isActive ? "active" : "inactive"}
              onChange={(e) => setForm({ ...form, isActive: e.target.value === "active" })}
              options={[
                { value: "active", label: t("catalog.active") },
                { value: "inactive", label: t("catalog.inactive") }
              ]}
            />
            <FormField
              label={t("collection")}
              type="select"
              value={form.collectionId || ""}
              onChange={(e) => setForm({ ...form, collectionId: e.target.value })}
              options={[
                { value: "", label: t("selectCollection") },
                ...collections.map((c) => ({ value: c.id, label: c.name }))
              ]}
            />

            <h3 className="font-title text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2 pt-4">
              {t("catalog.3dModelFiles")}
            </h3>
            <FormField
              label={t("catalog.previewFileUrl")}
              value={form.previewFileUrl}
              onChange={(e) => setForm({ ...form, previewFileUrl: e.target.value })}
              placeholder={t("catalog.previewFileUrl")}
            />
            <FormField
              label={t("catalog.sourceFileUrl")}
              value={form.sourceFileUrl}
              onChange={(e) => setForm({ ...form, sourceFileUrl: e.target.value })}
              placeholder={t("catalog.sourceFileUrl")}
            />
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
        <TableToolbar
          title={t("catalog.models")}
          onAddNew={canCreate ? () => navigate("/catalog/models/create") : null}
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
            emptyMessage={t("catalog.noModels")}
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
                <span className="ml-3 text-sm text-slate-500">
                  {t("catalog.loading")}
                </span>
              </div>
            ) : dt.paginated.length === 0 ? (
              <div className="col-span-full text-center py-8 text-sm text-slate-500">
                {t("catalog.noModels")}
              </div>
            ) : (
              dt.paginated.map((item) => (
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
                            {t("catalog.viewGallery")} ({item.images.length})
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

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={total}
          pageSize={20}
          onPage={setPage}
        />
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
