import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Plus,
  GripVertical,
  ImageIcon,
  Loader2,
  Trash,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { FormField } from "@components/forms/FormField";
import { useTranslation } from "@hooks/useTranslation";
import useToast from "@hooks/useToast";
import { toolsService } from "@services/toolsService";
import { collectionService } from "@services/collectionService";
import { Input } from "@/components/ui/input";

const CreateToolPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toastTopRight } = useToast();
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    collectionService
      .getCollections({ limit: 100, isActive: true })
      .then((res) =>
        setCollections(res.data?.items || res.items || res.data || []),
      )
      .catch(console.error);
  }, []);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    basePrice: "",
    stock: "0",
    collectionId: "",
    specifications: "",
    isActive: true,
  });

  const [thumbnailBefore, setThumbnailBefore] = useState(null);
  const [thumbnailAfter, setThumbnailAfter] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  const thumbnailBeforeRef = useRef(null);
  const thumbnailAfterRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "name" && !form.slug) {
      setForm((prev) => ({
        ...prev,
        [field]: value,
        slug: value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      }));
    }
  };

  const handleThumbnailChange = (setter) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setter({ file, preview: URL.createObjectURL(file) });
    e.target.value = "";
  };

  const handleGalleryAdd = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setGalleryImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const removeGalleryImage = (idx) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("slug", form.slug);
      formData.append("description", form.description);
      formData.append("basePrice", form.basePrice);
      formData.append("stock", form.stock);
      formData.append("isActive", form.isActive);

      if (form.specifications) {
        try {
          const parsed = JSON.parse(form.specifications);
          formData.append("specifications", JSON.stringify(parsed));
        } catch {
          formData.append(
            "specifications",
            JSON.stringify({ notes: form.specifications }),
          );
        }
      }
      if (form.collectionId) formData.append("collectionId", form.collectionId);

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
      galleryImages.forEach((img) => {
        formData.append("gallery", img.file);
      });

      await toolsService.createTool(formData);
      toastTopRight(
        "success",
        t("catalog.createSuccess", "Created successfully"),
      );
      navigate("/catalog/tools");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "catalog.createError";
      toastTopRight("error", t(msg, msg));
    } finally {
      setLoading(false);
    }
  };

  const ImageUploadBox = ({
    label,
    value,
    onClear,
    inputRef,
    onChange,
    recommended,
  }) => (
    <div>
      <label className="text-xs font-semibold mb-1.5 block">{label}</label>
      <div className="flex items-center gap-3">
        <div
          onClick={() => inputRef.current?.click()}
          className="h-28 w-28 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition overflow-hidden shrink-0"
        >
          {value?.preview ? (
            <img
              src={value.preview}
              srcSet={`${value.preview} 400w, ${value.preview} 800w, ${value.preview} 1200w`}
              sizes="112px"
              loading="lazy"
              alt={label}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-center">
              <Upload className="h-5 w-5 text-slate-400 mx-auto mb-1" />
              <span className="text-[10px] text-slate-400">
                {t("catalog.upload")}
              </span>
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpg,image/jpeg,image/webp"
          className="hidden"
          onChange={onChange}
        />
        <div className="text-xs">
          <p className="font-medium">{label}</p>
          <p>{recommended}</p>
          <p className="text-[10px] mt-0.5">{t("pngJpgWebp")}</p>
        </div>
        {value && (
          <Button
            variant="destructive"
            size="icon"
            onClick={onClear}
            className="px-3 py-2 gap-2 cursor-pointer"
          >
            <Trash className="h-4 w-4" />
            {t("catalog.remove")}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/catalog/tools")}
            variant="outline"
            className="gap-2 cursor-pointer border h-9 w-9 p-0! hover:bg-(--color-primary)"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-title text-xl font-bold">
            {t("catalog.addNewTool")}
          </h2>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="gap-2 px-3 py-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {t("common.create")}
        </Button>
      </div>

      <Card className="p-6 space-y-5">
        <h3 className="font-title text-lg font-semibold border-b  pb-3">
          {t("catalog.productInfo")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={t("common.name")}
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder={t("catalog.toolNamePlaceholder", "Tool name")}
          />
          <FormField
            label={t("catalog.slug")}
            value={form.slug}
            onChange={(e) => handleChange("slug", e.target.value)}
            placeholder={t("catalog.slugPlaceholder", "tool-slug")}
          />
        </div>
        <FormField
          type="textarea"
          label={t("catalog.description")}
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={3}
          className="w-full  focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none resize-none placeholder-gray-500"
          placeholder={t(
            "catalog.descriptionPlaceholder",
            "Product description...",
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField
            type="number"
            label={`${t("catalog.price")} (VND)`}
            value={form.basePrice}
            onChange={(e) => handleChange("basePrice", e.target.value)}
            placeholder="0"
            className="placeholder-gray-500"
          />
          <FormField
            type="number"
            label={t("catalog.stock")}
            value={form.stock}
            onChange={(e) => handleChange("stock", e.target.value)}
            placeholder="0"
            className="placeholder-gray-500"
          />
          <FormField
            type="select"
            label={t("collection")}
            value={form.collectionId || ""}
            onChange={(e) => handleChange("collectionId", e.target.value)}
            options={[
              { value: "", label: t("selectCollection") },
              ...collections.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <FormField
            type="select"
            label={t("common.status")}
            value={form.isActive ? "active" : "inactive"}
            onChange={(e) =>
              handleChange("isActive", e.target.value === "active")
            }
            options={[
              { value: "active", label: t("catalog.active") },
              { value: "inactive", label: t("catalog.inactive") },
            ]}
          />
        </div>

        <h3 className="font-title text-lg font-semibold border-b  pb-3 pt-2">
          {t("catalog.toolProperties")}
        </h3>
        <FormField
          type="textarea"
          label={`${t("catalog.specifications")} (JSON or text)`}
          value={form.specifications}
          onChange={(e) => handleChange("specifications", e.target.value)}
          rows={3}
          className="w-full  focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none resize-none font-mono placeholder-gray-500"
          placeholder='{"power": "1000W", "weight": "2kg"}'
        />
      </Card>

      <Card className="p-6 space-y-5">
        <h3 className="font-title text-lg font-semibold border-b  pb-3">
          {t("catalog.productImages")}
        </h3>

        <ImageUploadBox
          label={t("catalog.thumbnailBefore")}
          value={thumbnailBefore}
          onClear={() => setThumbnailBefore(null)}
          inputRef={thumbnailBeforeRef}
          onChange={handleThumbnailChange(setThumbnailBefore)}
          recommended={t("catalog.recommended", { size: "800x800" })}
        />

        <ImageUploadBox
          label={t("catalog.thumbnailAfter")}
          value={thumbnailAfter}
          onClear={() => setThumbnailAfter(null)}
          inputRef={thumbnailAfterRef}
          onChange={handleThumbnailChange(setThumbnailAfter)}
          recommended={t("catalog.recommended", { size: "800x800" })}
        />

        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
            {t("catalog.gallery")} ({galleryImages.length})
          </label>
          <div className="space-y-2 max-h-60 overflow-y-auto border  rounded-xl p-3">
            {galleryImages.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                {t("catalog.noImages")}
              </div>
            ) : (
              galleryImages.map((img, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5"
                >
                  <GripVertical className="h-4 w-4 text-slate-300 shrink-0 cursor-grab" />
                  <img
                    src={img.preview}
                    srcSet={`${img.preview} 400w, ${img.preview} 800w, ${img.preview} 1200w`}
                    sizes="40px"
                    loading="lazy"
                    alt={`Gallery ${idx + 1}`}
                    className="h-10 w-10 rounded-xl object-cover border  shrink-0"
                  />
                  <span className="flex-1 text-xs  truncate">
                    {img.file.name}
                  </span>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="shrink-0 bg-transparent hover:bg-transparent hover:text-rose-500 cursor-pointer"
                    onClick={() => removeGalleryImage(idx)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
          <Input
            ref={galleryInputRef}
            type="file"
            accept="image/png,image/jpg,image/jpeg,image/webp"
            multiple
            className="hidden"
            onChange={handleGalleryAdd}
          />
          <Button
            variant="primary"
            size="sm"
            className="mt-2 px-3 py-2 gap-1.5 text-xs cursor-pointer"
            onClick={() => galleryInputRef.current?.click()}
          >
            <Plus className="h-3.5 w-3.5" />
            {t("catalog.addImages")}
          </Button>
        </div>
      </Card>
    </section>
  );
};

export default CreateToolPage;
