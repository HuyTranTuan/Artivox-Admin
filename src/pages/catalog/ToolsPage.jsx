import { useTranslation } from "@/hooks/useTranslation";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Eye,
  Edit,
  Trash2,
  X,
  Plus,
  ImageIcon,
  Loader2,
  GripVertical,
} from "lucide-react";

import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { FormField } from "@components/forms/FormField";
import { useClickOutsideClose } from "@hooks/useClickOutsideClose";
import { useDebounce } from "@hooks/useDebounce";
import { useExpandableSearch } from "@hooks/useExpandableSearch";
import { usePaginatedApi } from "@hooks/usePaginatedApi";
import useToast from "@hooks/useToast";
import { toolsService } from "@services/toolsService";
import { collectionService } from "@services/collectionService";
import { useAuthStore } from "@store/authStore";
import { useRBAC } from "@hooks/useRBAC";
import ImageGalleryModal from "@/components/ImageGalleryModal";
import { formatDate, formatPrice } from "@utils/formatUtils";
import ImageUploadBox from "@components/ImageUploadBox";
import { useImageUpload } from "@hooks/useImageUpload";
import {
  DataTable,
  TableToolbar,
  TablePagination,
  useDataTable,
} from "@components/DataTable";
import ThumbnailPreview from "@components/ThumbnailPreview";

const ToolsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toastTopRight } = useToast();
  const { user } = useAuthStore();

  const {
    isAdmin,
    canCreate,
    canUpdate,
    canDelete,
    permissions: permission,
  } = useRBAC();
  const [filterOpen, setFilterOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({ status: null });
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    specifications: "",
    isActive: true,
    stock: "0",
    basePrice: "0",
    collectionId: "",
  });
  const [saving, setSaving] = useState(false);
  const {
    formGalleryImages,
    handleImageChange,
    handleGalleryAdd,
    removeGalleryImage,
    resetGallery,
    appendGalleryToFormData,
  } = useImageUpload();
  const [thumbnailBefore, setThumbnailBefore] = useState(null);
  const [thumbnailAfter, setThumbnailAfter] = useState(null);
  const thumbnailBeforeRef = useRef(null);
  const thumbnailAfterRef = useRef(null);
  const galleryInputRef = useRef(null);
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
  const search = useExpandableSearch();
  const debouncedSearch = useDebounce(search.value, 300);
  const dialogRef = useClickOutsideClose(() => setOpenDialog(null));
  const filterRef = useClickOutsideClose(() => setFilterOpen(false));

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
  } = usePaginatedApi(
    (params) =>
      toolsService.getTools({
        ...params,
        search: debouncedSearch,
        isActive:
          selectedFilters.status === "Active"
            ? true
            : selectedFilters.status === "Inactive"
              ? false
              : undefined,
      }),
    {
      defaultLimit: 20,
      pageParam: "page",
      refreshDeps: [debouncedSearch, selectedFilters.status],
    },
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedFilters.status]);

  const openGallery = (images, index = 0) => {
    console.log("images in openGallery", images);
    setGalleryImages(images || []);
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  const statuses = ["Active", "Inactive"];

  const dt = useDataTable({
    rows: items,
    keyField: "id",
    pageSize: 20,
    exportFilename: "tools",
    onExportRow: (i) => ({
      Name: i.name,
      Slug: i.slug,
      Specifications: i.tool?.specifications,
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
          images={item?.images}
          onClick={(e) => {
            console.log("item", item);
            e.stopPropagation();
            openGallery(item?.images);
          }}
        />
      ),
    },
    {
      key: "name",
      label: t("common.name"),
      width: "2fr",
      render: (item) => (
        <div className="font-semibold text-md ">{item.name}</div>
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
      specifications: item.tool?.specifications || "",
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

  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (selectedItem) {
      setDeleting(true);
      try {
        await toolsService.deleteTool(selectedItem.slug);
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
        formData.append("specifications", form.specifications);
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

        await toolsService.updateTool(selectedItem.slug, formData);
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
    navigate(`/catalog/tools/${slug}`);
  };

  const renderActionButtons = (item) => (
    <div className="flex gap-1.5">
      <Button
        variant="outline"
        size="ghost"
        onClick={(e) => {
          e.stopPropagation();
          handleRowClick(item.slug);
        }}
        className="h-8 w-8 p-0! flex items-center justify-center rounded-xl border border-slate-200 text-blue-600 hover:bg-blue-50 transition cursor-pointer"
      >
        <Eye className="h-4 w-4" />
      </Button>
      {canUpdate && (
        <Button
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(item);
          }}
          className="h-8 w-8 p-0! flex items-center justify-center rounded-xl border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
        >
          <Edit className="h-4 w-4" />
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
          className="h-8 w-8 p-0! flex items-center justify-center rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  const renderFormModal = () => (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div
        ref={dialogRef}
        className="rounded-2xl bg-(--color-background) shadow-xl p-6 max-w-4xl w-full mx-4 my-8 max-h-[calc(100vh-100px)] overflow-y-auto"
      >
        <h2 className="font-title text-xl font-bold  mb-6">
          {openDialog === "create"
            ? t("catalog.addNewTool")
            : t("catalog.editTool")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h3 className="font-title text-sm font-semibold  border-b border-slate-100 pb-2">
              {t("catalog.information")}
            </h3>
            <FormField
              label={t("common.name")}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <FormField
              label={`${t("catalog.slug")} (${t("catalog.readOnly")})`}
              value={form.slug}
              readOnly
              className="cursor-not-allowed"
            />
            <FormField
              type="textarea"
              label={t("catalog.description")}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="w-full resize-none  placeholder-gray-500 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                type="number"
                label={`${t("catalog.price")} (VND)`}
                value={form.basePrice}
                onChange={(e) =>
                  setForm({ ...form, basePrice: e.target.value })
                }
              />
              <FormField
                type="number"
                label={t("catalog.stock")}
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>
            <FormField
              type="select"
              label={t("common.status")}
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
              type="select"
              label={t("collection")}
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
              recommended={t("catalog.recommended", { size: "150x150" })}
              t={t}
            />
            <ImageUploadBox
              label={t("catalog.thumbnailAfter")}
              value={thumbnailAfter}
              onClear={() => setThumbnailAfter(null)}
              inputRef={thumbnailAfterRef}
              onChange={handleImageChange(setThumbnailAfter)}
              recommended={t("catalog.recommended", { size: "150x150" })}
              t={t}
            />
            <div>
              <label className="text-xs font-semibold mb-1.5 block">
                {t("catalog.gallery")} ({formGalleryImages.length})
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2">
                {formGalleryImages.length === 0 ? (
                  <div className="text-center py-4 text-xs ">
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
                      <span className="flex-1 text-xs truncate">
                        {img.file?.name ||
                          img.alt ||
                          `${t("catalog.image")} ${idx + 1}`}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full text-(--color-secondary) hover:text-(--color-error)"
                        onClick={() => removeGalleryImage(idx)}
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
                variant="outline"
                size="sm"
                className="mt-2 px-3 py-2 gap-1.5 text-xs w-full border border-dashed border-slate-300 hover:bg-(--color-secondary)/50"
                onClick={() => galleryInputRef.current?.click()}
              >
                <Plus className="h-3.5 w-3.5" />
                {t("catalog.addImages")}
              </Button>
            </div>
            <h3 className="font-title border-b border-slate-100 pb-2 pt-4 text-sm font-semibold ">
              {t("catalog.toolSpecifics")}
            </h3>
            <FormField
              type="textarea"
              label={t("catalog.specifications")}
              value={form.specifications}
              onChange={(e) =>
                setForm({ ...form, specifications: e.target.value })
              }
              rows={3}
              placeholder={t("dimensionsWeightMaterial")}
              className="w-full resize-none placeholder-gray-500 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
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
            variant="primary"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {openDialog === "create" ? t("common.create") : t("common.save")}
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
          title={t("catalog.tools")}
          onAddNew={canCreate ? () => navigate("/catalog/tools/create") : null}
          onRefresh={refetch}
          onExportCsv={dt.handleExport}
          search={search}
          searchPlaceholder={t("catalog.searchPlaceholder")}
          filterOptions={[
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
            emptyMessage={t("catalog.noTools")}
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
                <Loader2 className="h-8 w-8 animate-spin text-(--color-primary)" />
              </div>
            ) : dt.paginated?.length === 0 ? (
              <div className="col-span-full text-center py-8 text-sm ">
                {t("catalog.noTools")}
              </div>
            ) : (
              dt.paginated?.map((item) => (
                <div
                  key={item.id}
                  className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition group cursor-pointer"
                  onClick={() => handleRowClick(item.slug)}
                >
                  <div
                    className="relative h-48 cursor-pointer overflow-hidden"
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
                          <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ">
                            <ImageIcon className="h-4 w-4" />
                            {t("catalog.viewGallery")} ({item.images.length})
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center ">
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
                    <div className="text-xs  mb-3">
                      {item.category} ¢ {t("catalog.createdAt")}{" "}
                      {formatDate(item.createdAt)}
                    </div>
                    <Badge className="mb-3">{item.status}</Badge>
                    <div className="flex gap-2 mt-2">
                      {renderActionButtons(item)}
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

      {(openDialog === "create" || openDialog === "edit") && renderFormModal()}

      {openDialog === "delete" && selectedItem && (
        <div className="fixed inset-0 bg-(--color-background)/40 z-50 flex items-center justify-center">
          <div
            ref={dialogRef}
            className="rounded-2xl shadow-xl p-6 max-w-md w-full mx-4 bg-(--color-background)"
          >
            <h2 className="font-title text-xl font-bold  mb-4">
              {t("common.delete")}
            </h2>
            <p className="text-sm mb-4">
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

export default ToolsPage;
