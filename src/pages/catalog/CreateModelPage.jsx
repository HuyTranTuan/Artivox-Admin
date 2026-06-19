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
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { FormField } from "@components/forms/FormField";
import { useTranslation } from "@hooks/useTranslation";
import useToast from "@hooks/useToast";
import { modelsService } from "@services/modelsService";
import { collectionService } from "@services/collectionService";

const CreateModelPage = () => {
  const { t } = useTranslation();
  const { toastTopRight } = useToast();

  const navigate = useNavigate();
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
    previewFileUrl: "",
    isActive: true,
  });

  const [thumbnailBefore, setThumbnailBefore] = useState(null);
  const [thumbnailAfter, setThumbnailAfter] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [sourceFile, setSourceFile] = useState(null);
  const [imgMobile, setImgMobile] = useState(null);
  const [imgTablet, setImgTablet] = useState(null);
  const [imgPc, setImgPc] = useState(null);

  const thumbnailBeforeRef = useRef(null);
  const thumbnailAfterRef = useRef(null);
  const galleryInputRef = useRef(null);
  const sourceFileRef = useRef(null);
  const imgMobileRef = useRef(null);
  const imgTabletRef = useRef(null);
  const imgPcRef = useRef(null);

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

  const handle3DFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toastTopRight("error", t("catalog.fileTooLarge", "File exceeds 50MB limit"));
      e.target.value = "";
      return;
    }
    setSourceFile(file);
    e.target.value = "";
  };

  const handleSrcsetImageChange = (setter) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setter({ file, preview: URL.createObjectURL(file) });
    e.target.value = "";
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
      formData.append("previewFileUrl", form.previewFileUrl);
      if (form.collectionId) formData.append("collectionId", form.collectionId);

      if (sourceFile) formData.append("source_file", sourceFile, sourceFile.name);
      if (imgMobile?.file) formData.append("img_mobile", imgMobile.file, imgMobile.file.name);
      if (imgTablet?.file) formData.append("img_tablet", imgTablet.file, imgTablet.file.name);
      if (imgPc?.file) formData.append("img_pc", imgPc.file, imgPc.file.name);

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

      await modelsService.createModel(formData);
      toastTopRight("success", t("catalog.createSuccess", "Created successfully"));
      navigate("/catalog/models");
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
      <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
        {label}
      </label>
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
        <div className="text-xs text-slate-400">
          <p className="font-medium text-slate-600">{label}</p>
          <p>{recommended}</p>
          <p className="text-[10px] mt-0.5">{t("pngJpgWebp")}</p>
        </div>
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="text-rose-500 hover:text-rose-700 text-xs font-semibold ml-auto"
          >
            {t("catalog.remove")}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/catalog/models")}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="font-title text-xl font-bold">
            {t("catalog.addNewModel")}
          </h2>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="gap-2 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {t("catalog.create")}
        </Button>
      </div>

      <Card className="p-6 space-y-5">
        <h3 className="font-title text-lg font-semibold text-slate-900 border-b border-slate-200 pb-3">
          {t("catalog.productInfo")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={t("catalog.name")}
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder={t("catalog.modelNamePlaceholder")}
            className="placeholder:text-gray-600"
          />
          <FormField
            label={t("catalog.slug")}
            value={form.slug}
            onChange={(e) => handleChange("slug", e.target.value)}
            placeholder={t("catalog.modelSlugPlaceholder")}
            className="placeholder:text-gray-600"
          />
        </div>
        <FormField
          type="textarea"
          label={t("catalog.description")}
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={3}
          className="w-full border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none resize-none placeholder:text-gray-600 bg-slate-50 "
          placeholder={t("catalog.productDescriptionPlaceholder")}
        />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField
            type="number"
            label={`${t("catalog.price")} (VND)`}
            value={form.basePrice}
            onChange={(e) => handleChange("basePrice", e.target.value)}
            placeholder="0"
            className="placeholder:text-gray-600"
          />
          <FormField
            type="number"
            label={t("catalog.stock")}
            value={form.stock}
            onChange={(e) => handleChange("stock", e.target.value)}
            placeholder="0"
            className="placeholder:text-gray-600"
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
            label={t("catalog.status")}
            value={form.isActive ? "active" : "inactive"}
            onChange={(e) => handleChange("isActive", e.target.value === "active")}
            options={[
              { value: "active", label: t("catalog.active") },
              { value: "inactive", label: t("catalog.inactive") },
            ]}
          />
        </div>

        <h3 className="font-title text-lg font-semibold text-slate-900 border-b border-slate-200 pb-3 pt-2">
          {t("catalog.3dModelFiles")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={t("catalog.previewFileUrl")}
            value={form.previewFileUrl}
            onChange={(e) => handleChange("previewFileUrl", e.target.value)}
            placeholder={t("catalog.urlPlaceholder")}
            className="placeholder:text-gray-600"
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {t("catalog.sourceFile")} <span className="text-rose-500">*</span>
              <span className="ml-1 text-xs font-normal text-slate-400">(max 50MB)</span>
            </label>
            <div
              onClick={() => sourceFileRef.current?.click()}
              className="flex h-12 cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 px-4 hover:border-orange-400 hover:bg-orange-50/50 transition"
            >
              <Upload className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="flex-1 truncate text-sm text-slate-500">
                {sourceFile ? sourceFile.name : t("catalog.chooseFile", "Choose 3D file (glb, gltf, fbx, obj…)")}
              </span>
              {sourceFile && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSourceFile(null); }}
                  className="text-rose-500 hover:text-rose-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <input
              ref={sourceFileRef}
              type="file"
              accept=".glb,.gltf,.fbx,.obj,.stl,.ply,.3ds,.dae"
              className="hidden"
              onChange={handle3DFileChange}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-5">
        <h3 className="font-title text-lg font-semibold text-slate-900 border-b border-slate-200 pb-3">
          {t("catalog.productImages")}
        </h3>

        <ImageUploadBox
          label={t("catalog.thumbnailBefore")}
          value={thumbnailBefore}
          onClear={() => setThumbnailBefore(null)}
          inputRef={thumbnailBeforeRef}
          onChange={handleThumbnailChange(setThumbnailBefore)}
          recommended={t("catalog.recommendedSize", { size: "800x800" })}
        />

        <ImageUploadBox
          label={t("catalog.thumbnailAfter")}
          value={thumbnailAfter}
          onClear={() => setThumbnailAfter(null)}
          inputRef={thumbnailAfterRef}
          onChange={handleThumbnailChange(setThumbnailAfter)}
          recommended={t("catalog.recommendedSize", { size: "800x800" })}
        />

        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
            {t("catalog.gallery")} ({galleryImages.length})
          </label>
          <div className="space-y-2 max-h-60 overflow-y-auto border border-slate-200 rounded-xl p-3">
            {galleryImages.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                {t("catalog.noImages")}
              </div>
            ) : (
              galleryImages.map((img, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-slate-50 rounded-lg px-2 py-1.5"
                >
                  <GripVertical className="h-4 w-4 text-slate-300 shrink-0 cursor-grab" />
                  <img
                    src={img.preview}
                    srcSet={`${img.preview} 400w, ${img.preview} 800w, ${img.preview} 1200w`}
                    sizes="40px"
                    loading="lazy"
                    alt={`Gallery ${idx + 1}`}
                    className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <span className="flex-1 text-xs text-slate-600 truncate">
                    {img.file.name}
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
            accept="image/png,image/jpg,image/jpeg,image/webp"
            multiple
            className="hidden"
            onChange={handleGalleryAdd}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-2 gap-1.5 text-xs cursor-pointer hover:bg-slate-50"
            onClick={() => galleryInputRef.current?.click()}
          >
            <Plus className="h-3.5 w-3.5" />
            {t("catalog.addImages")}
          </Button>
        </div>
      </Card>

      <Card className="p-6 space-y-5">
        <h3 className="font-title text-lg font-semibold text-slate-900 border-b border-slate-200 pb-3">
          {t("catalog.srcsetImages", "Responsive Images (srcset)")}
        </h3>
        <p className="text-xs text-slate-400">{t("catalog.srcsetHint", "Upload separate images for mobile (≤640px), tablet (641–1024px), and desktop (>1024px) for optimized loading.")}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { label: t("catalog.imgMobile", "Mobile (≤640px)"), state: imgMobile, setter: setImgMobile, ref: imgMobileRef, hint: "360x480" },
            { label: t("catalog.imgTablet", "Tablet (641–1024px)"), state: imgTablet, setter: setImgTablet, ref: imgTabletRef, hint: "768x1024" },
            { label: t("catalog.imgPc", "Desktop (>1024px)"), state: imgPc, setter: setImgPc, ref: imgPcRef, hint: "1200x900" },
          ].map((v) => (
            <div key={v.label}>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">{v.label}</label>
              <div
                onClick={() => v.ref.current?.click()}
                className="relative h-32 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition overflow-hidden"
              >
                {v.state?.preview ? (
                  <img src={v.state.preview} alt={v.label} className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Upload className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400">{v.hint}</span>
                  </div>
                )}
                {v.state && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); v.setter(null); }}
                    className="absolute top-1.5 right-1.5 bg-white/80 rounded-full p-0.5 text-rose-500 hover:text-rose-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <input
                ref={v.ref}
                type="file"
                accept="image/png,image/jpg,image/jpeg,image/webp"
                className="hidden"
                onChange={handleSrcsetImageChange(v.setter)}
              />
              {v.state && <p className="mt-1 text-[10px] text-slate-400 truncate">{v.state.file?.name}</p>}
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
};

export default CreateModelPage;
