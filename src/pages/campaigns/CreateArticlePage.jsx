import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

import { Card } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { useAuthStore } from "@store/authStore";
import { useTranslation } from "@hooks/useTranslation";
import { FormField } from "@components/forms/FormField";
import { articleService } from "@services/articleService";
import useToast from "@hooks/useToast";
import RichTextEditor from "@/components/RichTextEditor";

const tabs = [
  { value: "vi", labelKey: "articles.vi" },
  { value: "en", labelKey: "articles.en" },
];

const CreateArticlePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { toastTopRight } = useToast();

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
      toastTopRight("success", t("articles.createSuccess"));
      navigate("/articles");
    } catch (error) {
      console.error("Failed to create article", error);
      toastTopRight("error", t("articles.createError"));
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
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 transition hover:bg-slate-100"
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
        <FormField
          label={t("articles.slug")}
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder={t("articles.slugPlaceholder")}
        />

        {/* Cover Image */}
        <FormField
          type="file"
          label={t("articles.coverImage")}
          onChange={(e) => setCoverImage(e.target.files[0])}
          accept="image/*"
        />

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
                    : "border-transparent text-slate-500 dark:text-white hover:text-slate-700"
                }`}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>

          {/* Title */}
          <FormField
            label={t("articles.titleWithLocale", {
              locale: activeTab.toUpperCase(),
            })}
            value={translations[activeTab]?.title || ""}
            onChange={(e) =>
              handleTranslationChange(activeTab, "title", e.target.value)
            }
            placeholder={t("articles.enterTitleWithLocale", {
              locale: activeTab.toUpperCase(),
            })}
            className="mb-4"
          />

          {/* Summary */}
          <FormField
            type="textarea"
            label={
              t("articles.summaryWithLocale", {
                locale: activeTab.toUpperCase(),
              }) || `Summary (${activeTab.toUpperCase()})`
            }
            value={translations[activeTab]?.summary || ""}
            onChange={(e) =>
              handleTranslationChange(activeTab, "summary", e.target.value)
            }
            placeholder={
              t("articles.enterSummaryWithLocale", {
                locale: activeTab.toUpperCase(),
              }) || "Enter summary"
            }
            className="mb-4 min-h-[80px]"
          />

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
