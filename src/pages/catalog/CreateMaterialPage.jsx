import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Upload, X, Plus, GripVertical, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { useTranslation } from "@hooks/useTranslation";
import { materialsService } from "@services/materialsService";

const CreateMaterialPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    basePrice: "",
    stock: "0",
    collectionId: "",
    type: "",
    color: "",
    textureFileUrl: "",
    roughness: "0.5",
    metalness: "0.0",
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
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
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
      
      formData.append("type", form.type);
      if (form.color) formData.append("color", form.color);
      if (form.textureFileUrl) formData.append("textureFileUrl", form.textureFileUrl);
      if (form.roughness) formData.append("roughness", form.roughness);
      if (form.metalness) formData.append("metalness", form.metalness);
      if (form.collectionId) formData.append("collectionId", form.collectionId);

      if (thumbnailBefore?.file) {
        const ext = thumbnailBefore.file.name.split(".").pop();
        formData.append("thumbnail_before", thumbnailBefore.file, `thumbnail_before.${ext}`);
      }
      if (thumbnailAfter?.file) {
        const ext = thumbnailAfter.file.name.split(".").pop();
        formData.append("thumbnail_after", thumbnailAfter.file, `thumbnail_after.${ext}`);
      }
      galleryImages.forEach((img) => {
        formData.append("gallery", img.file);
      });

      await materialsService.createMaterial(formData);
      navigate("/catalog/materials");
    } catch (err) {
      console.error("Create material failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const ImageUploadBox = ({ label, value, onClear, inputRef, onChange, recommended }) => (
    <div>
      <label className="text-xs font-semibold text-slate-700 mb-1.5 block">{label}</label>
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
              <span className="text-[10px] text-slate-400">{t("catalog.upload")}</span>
            </div>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/png,image/jpg,image/jpeg,image/webp" className="hidden" onChange={onChange} />
        <div className="text-xs text-slate-400">
          <p className="font-medium text-slate-600">{label}</p>
          <p>{recommended}</p>
          <p className="text-[10px] mt-0.5">PNG, JPG, WEBP</p>
        </div>
        {value && (
          <button type="button" onClick={onClear} className="text-rose-500 hover:text-rose-700 text-xs font-semibold ml-auto">
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
          <button onClick={() => navigate("/catalog/materials")} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="font-title text-xl font-bold text-slate-900">{t("catalog.addNewMaterial")}</h2>
        </div>
        <Button onClick={handleSubmit} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {t("catalog.create")}
        </Button>
      </div>

      <Card className="p-6 space-y-5">
        <h3 className="font-title text-lg font-semibold text-slate-900 border-b border-slate-200 pb-3">{t("catalog.productInfo")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("catalog.name")}</label>
            <Input value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Material name" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Slug</label>
            <Input value={form.slug} onChange={(e) => handleChange("slug", e.target.value)} placeholder="material-slug" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("catalog.description")}</label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={3}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none resize-none"
            placeholder="Product description..."
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("catalog.price")} (VND)</label>
            <Input type="number" value={form.basePrice} onChange={(e) => handleChange("basePrice", e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("catalog.stock")}</label>
            <Input type="number" value={form.stock} onChange={(e) => handleChange("stock", e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("catalog.status")}</label>
            <select
              value={form.isActive ? "active" : "inactive"}
              onChange={(e) => handleChange("isActive", e.target.value === "active")}
              className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <h3 className="font-title text-lg font-semibold text-slate-900 border-b border-slate-200 pb-3 pt-2">Material Properties</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Type (e.g., leather, wood)</label>
            <Input value={form.type} onChange={(e) => handleChange("type", e.target.value)} placeholder="leather" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Color (Hex/Name)</label>
            <Input value={form.color} onChange={(e) => handleChange("color", e.target.value)} placeholder="#FF0000" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Texture File URL</label>
            <Input value={form.textureFileUrl} onChange={(e) => handleChange("textureFileUrl", e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Roughness (0.0 - 1.0)</label>
            <Input type="number" step="0.1" min="0" max="1" value={form.roughness} onChange={(e) => handleChange("roughness", e.target.value)} placeholder="0.5" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Metalness (0.0 - 1.0)</label>
            <Input type="number" step="0.1" min="0" max="1" value={form.metalness} onChange={(e) => handleChange("metalness", e.target.value)} placeholder="0.0" />
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-5">
        <h3 className="font-title text-lg font-semibold text-slate-900 border-b border-slate-200 pb-3">{t("catalog.productImages")}</h3>

        <ImageUploadBox
          label="Thumbnail Before"
          value={thumbnailBefore}
          onClear={() => setThumbnailBefore(null)}
          inputRef={thumbnailBeforeRef}
          onChange={handleThumbnailChange(setThumbnailBefore)}
          recommended="Recommended 800x800"
        />

        <ImageUploadBox
          label="Thumbnail After"
          value={thumbnailAfter}
          onClear={() => setThumbnailAfter(null)}
          inputRef={thumbnailAfterRef}
          onChange={handleThumbnailChange(setThumbnailAfter)}
          recommended="Recommended 800x800"
        />

        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
            Gallery ({galleryImages.length})
          </label>
          <div className="space-y-2 max-h-60 overflow-y-auto border border-slate-200 rounded-xl p-3">
            {galleryImages.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                {t("catalog.noImages")}
              </div>
            ) : (
              galleryImages.map((img, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 rounded-lg px-2 py-1.5">
                  <GripVertical className="h-4 w-4 text-slate-300 shrink-0 cursor-grab" />
                  <img
                    src={img.preview}
                    srcSet={`${img.preview} 400w, ${img.preview} 800w, ${img.preview} 1200w`}
                    sizes="40px"
                    loading="lazy"
                    alt={`Gallery ${idx + 1}`}
                    className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <span className="flex-1 text-xs text-slate-600 truncate">{img.file.name}</span>
                  <button type="button" onClick={() => removeGalleryImage(idx)} className="text-rose-500 hover:text-rose-700 shrink-0">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
          <input ref={galleryInputRef} type="file" accept="image/png,image/jpg,image/jpeg,image/webp" multiple className="hidden" onChange={handleGalleryAdd} />
          <Button type="button" variant="ghost" size="sm" className="mt-2 gap-1.5 text-xs" onClick={() => galleryInputRef.current?.click()}>
            <Plus className="h-3.5 w-3.5" />
            {t("catalog.addImages")}
          </Button>
        </div>
      </Card>
    </section>
  );
};

export default CreateMaterialPage;
