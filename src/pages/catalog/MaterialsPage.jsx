import { useTranslation } from "@/hooks/useTranslation";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Eye,
  Edit,
  Trash2,
  X,
  Plus,
  Loader2,
  GripVertical,
  ImageIcon,
} from "lucide-react";

import { Button } from "@components/ui/button";
import { FormField } from "@components/forms/FormField";
import { useClickOutsideClose } from "@hooks/useClickOutsideClose";
import ImageUploadBox from "@components/ImageUploadBox";
import { useImageUpload } from "@hooks/useImageUpload";
import { useDebounce } from "@hooks/useDebounce";
import { useExpandableSearch } from "@hooks/useExpandableSearch";
import { usePaginatedApi } from "@hooks/usePaginatedApi";
import { materialsService } from "@services/materialsService";
import { collectionService } from "@services/collectionService";
import useToast from "@hooks/useToast";
import { useRBAC } from "@hooks/useRBAC";
import { formatDate, formatPrice } from "@utils/formatUtils";
import {
  DataTable,
  TablePagination,
  TableToolbar,
  useDataTable,
} from "@components/DataTable";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import ThumbnailPreview from "@components/ThumbnailPreview";
import { Card } from "@components/ui/card";
import ImageGalleryModal from "@components/ImageGalleryModal";
import { Badge } from "@components/ui/badge";

const MaterialsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toastTopRight } = useToast();
  const { isAdmin, canCreate, canUpdate, canDelete } = useRBAC();

  const [openDialog, setOpenDialog] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    type: null,
    status: null,
  });
  const [galleryOpen, setGalleryOpen] = useState(false);

  const search = useExpandableSearch();
  const debouncedSearch = useDebounce(search.value, 300);

  const {
    data: items,
    loading,
    error,
    page: currentPage,
    totalPages,
    totalItems: total,
    setPage,
    refetch,
  } = usePaginatedApi(
    (params) =>
      materialsService.getMaterials({
        ...params,
        search: debouncedSearch,
        isActive:
          selectedFilters.status === "Active"
            ? true
            : selectedFilters.status === "Inactive"
              ? false
              : undefined,
        type: selectedFilters.type || undefined,
      }),
    {
      defaultLimit: 20,
      pageParam: "page",
      refreshDeps: [debouncedSearch, selectedFilters],
    },
  );

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    materialType: "",
    color: "#000000",
    unit: "ROLL",
    isActive: true,
    stock: "0",
    basePrice: "0",
    collectionId: "",
  });

  const {
    formGalleryImages,
    handleGalleryAdd,
    removeGalleryImage,
    resetGallery,
    appendGalleryToFormData,
  } = useImageUpload();

  const [thumbnailAfter, setThumbnailAfter] = useState(null);
  const [thumbnailBefore, setThumbnailBefore] = useState(null);
  const [collections, setCollections] = useState([]);
  const [saving, setSaving] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const thumbnailBeforeRef = useRef(null);
  const thumbnailAfterRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    collectionService
      .getCollections({ limit: 100, isActive: true })
      .then((res) =>
        setCollections(res.data?.items || res.items || res.data || []),
      )
      .catch(console.error);
  }, []);

  const dialogRef = useClickOutsideClose(() => setOpenDialog(null));

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedFilters, setPage]);

  const openGallery = (images, index = 0) => {
    setGalleryImages(images || []);
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  const types = ["FDM", "SLA", "SLS"];
  const statuses = ["Active", "Inactive"];

  const dt = useDataTable({
    rows: items,
    keyField: "id",
    pageSize: 20,
    exportFilename: "materials",
    onExportRow: (i) => ({
      Name: i.name,
      Slug: i.slug,
      Type: i.material?.type,
      Color: i.material?.color,
      Unit: i.material?.unit,
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
      label: t("common.name"),
      width: "2fr",
      render: (item) => (
        <div className="font-semibold text-md">{item.name}</div>
      ),
    },
    {
      key: "basePrice",
      label: t("catalog.price"),
      width: "1fr",
      render: (item) => <div>{formatPrice(item.basePrice)}</div>,
    },
    {
      key: "isActive",
      label: t("common.status"),
      width: "160px",
      render: (item) => (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${item.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}
        >
          {item.isActive ? t("catalog.active") : t("catalog.inactive")}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: t("catalog.createdAt"),
      width: "1fr",
      render: (item) => (
        <div className="text-xs ">{formatDate(item.createdAt)}</div>
      ),
    },
    {
      key: "stock",
      label: t("catalog.stock"),
      width: "1fr",
      render: (item) => <div className="text-xs ">{item.stock}</div>,
    },
    {
      key: "actions",
      label: t("common.actions"),
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
      materialType: item.material?.type || "",
      color: item.material?.color || "#000000",
      unit: item.material?.unit || "ROLL",
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
    resetGallery(gallery);
  };

  const handleImageChange = (setter) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setter({ file, preview: URL.createObjectURL(file), isExisting: false });
    e.target.value = "";
  };

  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (selectedItem) {
      setDeleting(true);
      try {
        await materialsService.deleteMaterial(selectedItem.slug);
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
        formData.append("materialType", form.materialType);
        formData.append("color", form.color);
        formData.append("unit", form.unit);
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

        appendGalleryToFormData(formData);

        await materialsService.updateMaterial(selectedItem.slug, formData);
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

  const handleRowClick = (slug) => {
    navigate(`/catalog/materials/${slug}`);
  };

  const renderActionButtons = (item) => (
    <div className="flex gap-1.5">
      <Button
        onClick={(e) => {
          e.stopPropagation();
          handleRowClick(item.slug);
        }}
        variant="outline"
        size="sm"
        className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
      >
        <Eye style={{ width: 18, height: 18 }} />
      </Button>
      {canUpdate && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(item);
          }}
          variant="outline"
          size="sm"
          className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition"
        >
          <Edit style={{ width: 18, height: 18 }} />
        </Button>
      )}
      {canDelete && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedItem(item);
            setOpenDialog("delete");
          }}
          variant="outline"
          size="sm"
          className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
        >
          <Trash2 style={{ width: 18, height: 18 }} />
        </Button>
      )}
    </div>
  );
  const renderFormModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div
        ref={dialogRef}
        className="rounded-2xl shadow-xl p-6 max-w-4xl w-full mx-4 my-8 bg-(--color-background) max-h-[calc(100vh-100px)] overflow-y-auto"
      >
        <h2 className="font-title text-xl font-bold  mb-6">
          {openDialog === "create"
            ? t("catalog.addNewMaterial")
            : t("catalog.editMaterial")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h3 className="font-title text-sm font-semibold  border-b border-slate-100 pb-2">
              {t("catalog.info")}
            </h3>
            <FormField
              label={t("common.name")}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t("common.name")}
            />
            <FormField
              label={t("catalog.slugReadOnly")}
              value={form.slug}
              readOnly
              placeholder={t("catalog.slug")}
              className="cursor-not-allowed"
            />
            <FormField
              label={t("catalog.description")}
              type="textarea"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder={t("catalog.description")}
              rows={3}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label={`${t("catalog.price")} (VND)`}
                type="number"
                value={form.basePrice}
                onChange={(e) =>
                  setForm({ ...form, basePrice: e.target.value })
                }
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
              label={t("common.status")}
              type="select"
              value={form.isActive ? "active" : "inactive"}
              onChange={(e) =>
                setForm({ ...form, isActive: e.target.value === "active" })
              }
              options={[
                { value: "active", label: t("catalog.active") },
                { value: "inactive", label: t("catalog.inactive") },
              ]}
            />
            <FormField
              label={t("collection")}
              type="select"
              value={form.collectionId || ""}
              onChange={(e) =>
                setForm({ ...form, collectionId: e.target.value })
              }
              options={[
                { value: "", label: t("selectCollection") },
                ...collections.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          </div>
          <div className="space-y-4">
            <h3 className="font-title text-sm font-semibold  border-b border-slate-100 pb-2">
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
              <Label className="text-xs font-semibold mb-1.5 block">
                {t("catalog.gallery")} ({formGalleryImages.length})
              </Label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2">
                {formGalleryImages.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-400">
                    {t("catalog.noImages")}
                  </div>
                ) : (
                  formGalleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-xl px-2 py-1.5 border border-slate-100 shadow-sm"
                    >
                      <GripVertical className="h-4 w-4 text-slate-300 shrink-0 cursor-grab" />
                      <img
                        src={img.preview}
                        alt={img.alt || `Gallery ${idx + 1}`}
                        className="h-10 w-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <span className="flex-1 text-xs  truncate">
                        {img.file?.name || img.alt || `Image ${idx + 1}`}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => removeGalleryImage(idx)}
                        className="p-2 text-(--color-secondary) hover:text-(--color-error) "
                      >
                        <X className="h-4 w-4" />
                      </Button>
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
                variant="ghost"
                size="sm"
                className="mt-2 px-3 py-2 gap-1.5 text-xs w-full border border-dashed border-slate-300 cursor-pointer"
                onClick={() => galleryInputRef.current?.click()}
              >
                <Plus className="h-3.5 w-3.5" />
                {t("catalog.addImages")}
              </Button>
            </div>
            <h3 className="font-title text-sm font-semibold  border-b border-slate-100 pb-2 pt-4">
              {t("catalog.materialSpecifics")}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <FormField
                label={t("common.type")}
                value={form.materialType}
                onChange={(e) =>
                  setForm({ ...form, materialType: e.target.value })
                }
                placeholder={t("plaAbs")}
              />
              <div>
                <Label className="text-xs font-semibold">
                  {t("catalog.color")}
                </Label>
                <div className="flex gap-2 h-10 mt-[2px]">
                  <Input
                    type="color"
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    className="h-12 w-12 cursor-pointer border border-slate-200 rounded shrink-0"
                  />
                </div>
              </div>
              <FormField
                label={t("catalog.unit")}
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder={t("rollBottle")}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <Button
            variant="destructive"
            className="flex-1 px-3 py-2"
            onClick={() => setOpenDialog(null)}
            disabled={saving}
          >
            {t("common.cancel")}
          </Button>
          <Button
            className="flex-1 px-3 py-2"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("common.save")}
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
            <div className="text-sm  mb-4">{error}</div>
            <Button onClick={refetch} className="cursor-pointer">
              {t("common.retry")}
            </Button>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <TableToolbar
          title={t("catalog.materials")}
          onAddNew={
            canCreate ? () => navigate("/catalog/materials/create") : null
          }
          onRefresh={refetch}
          onExportCsv={dt.handleExport}
          search={search}
          searchPlaceholder={t("catalog.searchPlaceholder")}
          filterOptions={[
            {
              key: "type",
              label: t("common.type"),
              values: types,
            },
            {
              key: "status",
              label: t("common.status"),
              values: statuses,
            },
          ]}
          activeFilters={selectedFilters}
          onFilterChange={(key, val) =>
            setSelectedFilters((p) => ({ ...p, [key]: val }))
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
            emptyMessage={t("catalog.noMaterials")}
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
                <span className="ml-3 text-sm ">{t("common.loading")}</span>
              </div>
            ) : dt.paginated.length === 0 ? (
              <div className="col-span-full text-center py-8 text-sm ">
                {t("catalog.noMaterials")}
              </div>
            ) : (
              dt.paginated.map((item) => (
                <div
                  key={item.id}
                  className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition group cursor-pointer"
                  onClick={() => handleRowClick(item.slug)}
                >
                  <div
                    className="relative h-48 bg-(--color-border) cursor-pointer overflow-hidden"
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
                          <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-2/90 rounded-full px-4 py-2 text-sm font-semibold text-slate-800">
                            <ImageIcon className="h-4 w-4" />{" "}
                            {t("catalog.viewGallery")} ({item.images.length})
                          </div>
                        </div>
                        {item.images.length > 1 && (
                          <div className="absolute top-2 right-2 flex gap-1">
                            {item.images.slice(0, 3).map((_, idx) => (
                              <div
                                key={idx}
                                className="h-2 w-2 rounded-full/80"
                              />
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="h-10 w-10 mx-auto mb-2" />
                          <span className="text-xs">
                            {t("catalog.noImages")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="font-title text-base font-semibold  mb-1">
                      {item.name}
                    </div>
                    <div className="text-xs mb-3">
                      {item.material?.type || "N/A"} {t("catalog.createdAt")}{" "}
                      {formatDate(item.createdAt)}
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
        <div className="fixed inset-0 bg-(--color-background)/50 z-50 flex items-center justify-center">
          <div
            ref={dialogRef}
            className="rounded-2xl shadow-xl p-6 max-w-md w-full mx-4 bg-(--color-background)"
          >
            <h2 className="font-title text-xl font-bold  mb-4">
              {t("common.delete")}
            </h2>
            <p className="text-sm  mb-4">
              {t("catalog.deleteConfirm", { name: selectedItem.name })}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
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
                {deleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {t("common.delete")}
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

export default MaterialsPage;
