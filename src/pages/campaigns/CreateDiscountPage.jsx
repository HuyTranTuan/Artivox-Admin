import { useTranslate } from "@/i18n/useTranslate";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { useTranslation } from "@hooks/useTranslation";
import { discountService } from "@services/discountService";

const discountTypes = [
  { value: "PERCENT", label: "Percentage (%)" },
  { value: "FIXED", label: "Fixed Amount (₫)" },
];

const CreateDiscountPage = () => {
  const { t } = useTranslate();

  const { slug } = useParams();
  const isEditMode = !!slug;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  const [form, setForm] = useState({
    code: "",
    name: "",
    slug: "",
    type: "PERCENT",
    value: "",
    minOrderAmount: "",
    maxUses: "",
    isActive: true,
    startsAt: "",
    expiresAt: "",
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchDiscount = async () => {
        try {
          const res = await discountService.getDiscountBySlug(slug);
          if (res.data?.data) {
            const data = res.data.data;
            setForm({
              code: data.code || "",
              name: data.name || "",
              slug: data.slug || "",
              type: data.type || "PERCENT",
              value: data.value?.toString() || "",
              minOrderAmount: data.minOrderAmount?.toString() || "",
              maxUses: data.maxUses?.toString() || "",
              isActive: data.isActive ?? true,
              startsAt: data.startsAt ? data.startsAt.split("T")[0] : "",
              expiresAt: data.expiresAt ? data.expiresAt.split("T")[0] : "",
            });
          }
        } catch (error) {
          console.error("Failed to fetch discount:", error);
        } finally {
          setInitialLoading(false);
        }
      };
      fetchDiscount();
    }
  }, [slug, isEditMode]);

  const handleChange = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (field === "name" && !isEditMode && !form.slug) {
      setForm((prev) => ({
        ...prev,
        [field]: val,
        slug: val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (isEditMode) {
        await discountService.updateDiscount(slug, form);
      } else {
        await discountService.createDiscount(form);
      }
      navigate("/discounts");
    } catch (error) {
      console.error("Save discount failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/discounts");
  };

  if (initialLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="flex h-13 w-13 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="font-title text-xl font-bold">
            {isEditMode ? "Edit Discount" : "Create Discount"}
          </h2>
        </div>
        <Button onClick={handleSave} disabled={loading} className="gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isEditMode ? "Save Changes" : t("articles.save")}
        </Button>
      </div>

      <Card className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Discount Code (ex. SUMMER20)
            </label>
            <Input
              value={form.code}
              onChange={(e) =>
                handleChange("code", e.target.value.toUpperCase())
              }
              placeholder={t('summer20')}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Campaign Name (Internal)
            </label>
            <Input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder={t('summerSale2026')}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('articles.slug')}</label>
          <Input
            value={form.slug}
            onChange={(e) => handleChange("slug", e.target.value)}
            placeholder={t('summersale2026')}
          />
        </div>

        {/* Discount Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('catalog.discountType')}</label>
            <select
              value={form.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            >
              {discountTypes.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Value {form.type === "PERCENT" ? "(%)" : "(₫)"}
            </label>
            <Input
              type="number"
              value={form.value}
              onChange={(e) => handleChange("value", e.target.value)}
              placeholder={form.type === "PERCENT" ? "e.g. 20" : "e.g. 50000"}
              min="0"
            />
          </div>
        </div>

        {/* Min Order & Max Usage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Minimum Order (₫)
            </label>
            <Input
              type="number"
              value={form.minOrderAmount}
              onChange={(e) => handleChange("minOrderAmount", e.target.value)}
              placeholder={t('eg100000')}
              min="0"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('maxUsageLimit')}</label>
            <Input
              type="number"
              value={form.maxUses}
              onChange={(e) => handleChange("maxUses", e.target.value)}
              placeholder={t('eg100')}
              min="1"
            />
          </div>
        </div>

        {/* Start & End Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('catalog.startDate')}</label>
            <Input
              type="date"
              value={form.startsAt}
              onChange={(e) => handleChange("startsAt", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('catalog.endDate')}</label>
            <Input
              type="date"
              value={form.expiresAt}
              onChange={(e) => handleChange("expiresAt", e.target.value)}
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('articles.status')}</label>
          <select
            value={form.isActive ? "active" : "inactive"}
            onChange={(e) =>
              handleChange("isActive", e.target.value === "active")
            }
            className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          >
            <option value="active">{t('catalog.active')}</option>
            <option value="inactive">{t('catalog.inactive')}</option>
          </select>
        </div>
      </Card>
    </section>
  );
};

export default CreateDiscountPage;
