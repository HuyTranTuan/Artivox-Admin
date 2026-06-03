import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import RichTextEditor from "@/components/RichTextEditor";
import { useAuthStore } from "@store/authStore";
import { useTranslation } from "@hooks/useTranslation";
import { articleService } from "@services/articleService";

const tabs = [
  { value: "vi", labelKey: "articles.vi" },
  { value: "en", labelKey: "articles.en" },
];

const CreateArticlePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [isSaving, setIsSaving] = useState(false);
  const [slug, setSlug] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [activeTab, setActiveTab] = useState("vi");
  const [translations, setTranslations] = useState({
    vi: { title: "", summary: "", content: "", locale: "vi" },
    en: { title: "", summary: "", content: "", locale: "en" },
  });

  const isAdmin = user?.role === "ADMIN" || user?.role === "MANAGER";
  const permission = useMemo(() => {
    if (!user?.permission) return {};
    if (typeof user.permission === "object") return user.permission;
    try {
      const validJsonString = user.permission.replace(
        /([a-zA-Z0-9_]+)(?=\s*:)/g,
        '"$1"',
      );
      return JSON.parse(validJsonString);
    } catch (e) {
      console.error("Failed to parse permission string", e);
      return {};
    }
  }, [user]);

  const canCreate = isAdmin || permission.create;

  const handleSave = async () => {
    if (!canCreate) return;
    setIsSaving(true);

    if (!slug.trim()) {
      alert(t("articles.slugRequired") || "Slug is required");
      setIsSaving(false);
      return;
    }

    const validTranslations = [translations.vi, translations.en].filter(
      (t) => t.title && t.title.trim() !== "",
    );
    if (validTranslations.length === 0) {
      alert(
        t("articles.translationRequired") ||
          "At least one translation with a title is required",
      );
      setIsSaving(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("slug", slug);
      formData.append("status", "Draft");

      formData.append("translations", JSON.stringify(validTranslations));

      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      await articleService.createArticle(formData);
      navigate("/articles");
    } catch (error) {
      console.error("Failed to create article", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/articles");
  };

  const handleTranslationChange = (locale, field, value) => {
    setTranslations((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [field]: value },
    }));
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="font-title text-xl font-bold">
            {t("articles.createArticle")}
          </h2>
        </div>
        <Button
          onClick={handleSave}
          className="gap-2"
          disabled={!canCreate || isSaving}
        >
          <Save className="h-4 w-4" />
          {isSaving ? t("common.saving") || "Saving..." : t("articles.save")}
        </Button>
      </div>

      <Card className="p-6 space-y-5">
        {/* Slug / URL */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {t("articles.slug")}
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={t("articles.slugPlaceholder")}
            className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          />
        </div>

        {/* Cover Image */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {t("articles.coverImage")}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files[0])}
            className="h-10 w-full rounded-xl border border-slate-300 px-3 py-1.5 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          />
        </div>

        {/* Language Tabs */}
        <div>
          <div className="flex items-center border-b border-slate-200 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
                  activeTab === tab.value
                    ? "border-amber-500 text-amber-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {t("articles.titleWithLocale", {
                locale: activeTab.toUpperCase(),
              })}
            </label>
            <input
              type="text"
              value={translations[activeTab]?.title || ""}
              onChange={(e) =>
                handleTranslationChange(activeTab, "title", e.target.value)
              }
              placeholder={t("articles.enterTitleWithLocale", {
                locale: activeTab.toUpperCase(),
              })}
              className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Summary */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {t("articles.summaryWithLocale", {
                locale: activeTab.toUpperCase(),
              }) || `Summary (${activeTab.toUpperCase()})`}
            </label>
            <textarea
              value={translations[activeTab]?.summary || ""}
              onChange={(e) =>
                handleTranslationChange(activeTab, "summary", e.target.value)
              }
              placeholder={
                t("articles.enterSummaryWithLocale", {
                  locale: activeTab.toUpperCase(),
                }) || "Enter summary"
              }
              className="min-h-[80px] w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Content - Rich Text Editor */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {t("articles.contentWithLocale", {
                locale: activeTab.toUpperCase(),
              })}
            </label>
            <RichTextEditor
              key={activeTab}
              value={translations[activeTab]?.content || ""}
              onChange={(value) =>
                handleTranslationChange(activeTab, "content", value)
              }
              placeholder={t("articles.writeContentWithLocale", {
                locale: activeTab.toUpperCase(),
              })}
            />
          </div>
        </div>
      </Card>
    </section>
  );
};

export default CreateArticlePage;
