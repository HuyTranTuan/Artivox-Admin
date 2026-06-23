import { useTranslation } from "@hooks/useTranslation";
import useToast from "@hooks/useToast";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Upload, Loader2 } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { collectionService } from "@services/collectionService";

const CreateCollectionPage = () => {
  const { slug } = useParams();
  const isEditMode = !!slug;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toastTopRight } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true,
  });

  const [image, setImage] = useState(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (isEditMode) {
      const fetchCollection = async () => {
        try {
          const res = await collectionService.getCollectionBySlug(slug);
          if (res) {
            const data = res;
            setForm({
              name: data.name || "",
              slug: data.slug || "",
              description: data.description || "",
              isActive: data.isActive ?? true,
            });
            if (data.image) {
              setImage({ preview: data.image }); // Set existing image URL
            }
          }
        } catch (err) {
          console.error("Failed to fetch collection:", err);
        } finally {
          setInitialLoading(false);
        }
      };
      fetchCollection();
    }
  }, [slug, isEditMode]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "name" && !isEditMode && !form.slug) {
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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage({ file, preview: URL.createObjectURL(file) });
    e.target.value = "";
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("slug", form.slug);
      formData.append("description", form.description);
      formData.append("isActive", form.isActive);

      if (image?.file) {
        const ext = image.file.name.split(".").pop();
        formData.append("image", image.file, `image.${ext}`);
      }

      if (isEditMode) {
        await collectionService.updateCollection(slug, formData);
        toastTopRight(
          "success",
          t("catalog.updateSuccess", "Updated successfully"),
        );
      } else {
        await collectionService.createCollection(formData);
        toastTopRight(
          "success",
          t("catalog.createSuccess", "Created successfully"),
        );
      }
      navigate("/catalog/collections");
    } catch (err) {
      console.error(
        isEditMode ? "Update collection failed:" : "Create collection failed:",
        err,
      );
      toastTopRight(
        "error",
        isEditMode
          ? t("catalog.updateError", "Failed to update")
          : t("catalog.createError", "Failed to create"),
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <section className="flex flex-col lg:flex-row lg:space-x-6 lg:space-y-0 space-y-6">
      <Card className="p-6 space-y-5 lg:w-2/3 w-full">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate("/catalog/collections")}
            className="flex h-11 w-11! p-0! items-center justify-center rounded-lg hover:bg-(--color-primary)! cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-title text-xl font-bold">
            {isEditMode
              ? t("catalog.editCollection")
              : t("catalog.addNewCollection")}
          </h2>
          <Button onClick={handleSubmit} disabled={loading} className="gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEditMode ? (
              <span className="lg:block hidden">
                {t("catalog.saveChanges")}
              </span>
            ) : (
              <span className="lg:block hidden">{t("catalog.create")}</span>
            )}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t("catalog.name")}
            </label>
            <Input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder={t("catalog.collectionNamePlaceholder")}
              className="h-13 border border-slate-200 rounded-xl px-3 text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none bg-amber-50 placeholder:text-slate-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t("catalog.slug")}
            </label>
            <Input
              value={form.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              placeholder={t("catalog.collectionSlugPlaceholder")}
              className="h-13 border border-slate-200 rounded-xl px-3 text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none bg-amber-50 placeholder:text-slate-500"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            {t("catalog.description")}
          </label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={6}
            placeholder={t("catalog.collectionDescriptionPlaceholder")}
            className="h-36 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none placeholder:text-slate-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            {t("catalog.status")}
          </label>
          <select
            value={form.isActive ? "active" : "inactive"}
            onChange={(e) =>
              handleChange("isActive", e.target.value === "active")
            }
            className="h-13 w-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none placeholder:text-slate-500"
          >
            <option value="active">{t("catalog.active")}</option>
            <option value="inactive">{t("catalog.inactive")}</option>
          </select>
        </div>
      </Card>

      <Card className="p-6 space-y-5">
        <h3 className="font-title text-lg font-semibold text-slate-900 border-b border-slate-200 pb-3">
          {t("catalog.collectionImage")}
        </h3>

        <div>
          <label className="text-xs font-semibold mb-1.5 block">
            {t("catalog.image")}
          </label>
          <div className="flex items-center gap-3">
            <div
              onClick={() => imageRef.current?.click()}
              className="h-28 w-28 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition overflow-hidden shrink-0"
            >
              {image?.preview ? (
                <img
                  src={image.preview}
                  srcSet={`${image.preview} 400w, ${image.preview} 800w, ${image.preview} 1200w`}
                  sizes="112px"
                  loading="lazy"
                  alt={t("catalog.collection")}
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
              ref={imageRef}
              type="file"
              accept="image/png,image/jpg,image/jpeg,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
            <div className="text-xs text-slate-700">
              <p className="font-medium text-slate-700">{t("catalog.image")}</p>
              <p>{t("catalog.recommendedSize", { size: "1200x800" })}</p>
              <p className="text-[10px] mt-0.5">{t("pngJpgWebp")}</p>
            </div>
            {image && (
              <button
                type="button"
                onClick={() => setImage(null)}
                className="text-rose-500 hover:text-rose-700 text-xs font-semibold ml-auto"
              >
                {t("catalog.remove")}
              </button>
            )}
          </div>
        </div>
      </Card>
    </section>
  );
};

export default CreateCollectionPage;
