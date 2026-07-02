import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

import { Card } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { useAuthStore } from "@store/authStore";
import { useTranslation } from "@hooks/useTranslation";
import { FormField } from "@components/forms/FormField";
import { articleService } from "@services/articleService";
import useToast from "@hooks/useToast";
import RichTextEditor from "@/components/RichTextEditor";
import { Label } from "@/components/ui/label";
import Loading from "@components/Loading";

const tabs = [
  { value: "vi", labelKey: "articles.vi" },
  { value: "en", labelKey: "articles.en" },
];

const EditArticlePage = () => {
  const { slug: articleSlug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { toastTopRight } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [slug, setSlug] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [currentCoverImage, setCurrentCoverImage] = useState("");
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

  const canUpdate = isAdmin || permission.update;

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const article = await articleService.getArticleBySlug(articleSlug);
        if (article) {
          setSlug(article.slug || "");
          setCurrentCoverImage(article.coverImage || "");

          const newTranslations = {
            vi: { title: "", summary: "", content: "", locale: "vi" },
            en: { title: "", summary: "", content: "", locale: "en" },
          };

          if (article.translations && Array.isArray(article.translations)) {
            article.translations.forEach((trans) => {
              if (trans.locale === "vi" || trans.locale === "en") {
                newTranslations[trans.locale] = {
                  title: trans.title || "",
                  summary: trans.summary || "",
                  content: trans.content || "",
                  locale: trans.locale,
                };
              }
            });
          }
          setTranslations(newTranslations);
        }
      } catch (err) {
        toastTopRight("error", t("articles.loadError"));
      } finally {
        setIsLoading(false);
      }
    };

    if (articleSlug) {
      fetchArticle();
    }
  }, [articleSlug, t, toastTopRight]);

  const handleSave = async () => {
    if (!canUpdate) return;
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
      formData.append("translations", JSON.stringify(validTranslations));

      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      await articleService.updateArticle(articleSlug, formData);
      toastTopRight("success", t("articles.updateSuccess") || "Article updated successfully");
      navigate("/articles");
    } catch (err) {
      console.error("Failed to update article", err);
      toastTopRight("error", t("articles.updateError"));
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

  if (isLoading) return <Loading />;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleCancel}
            className="rounded-lg hover:bg-(--color-primary)/70 p-2.5"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-title text-xl font-bold">
            {t("catalog.edit") || "Edit Article"}
          </h2>
        </div>
        <Button
          onClick={handleSave}
          className="gap-2 px-3 py-2"
          disabled={!canUpdate || isSaving}
        >
          <Save className="h-4 w-4" />
          {isSaving ? t("common.saving") || "Saving..." : t("common.save")}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6 space-y-5">
          {/* Slug / URL */}
          <FormField
            label={t("articles.slug")}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={t("articles.slugPlaceholder")}
          />

          {/* Cover Image */}
          <div>
            {currentCoverImage && !coverImage && (
              <div className="mb-3">
                <Label className="mb-1.5 block text-sm font-medium">
                  {t("articles.currentCoverImage") || "Current Cover Image"}
                </Label>
                <img
                  src={currentCoverImage}
                  alt="Current cover"
                  className="h-32 w-auto object-cover rounded-xl border border-slate-200"
                />
              </div>
            )}
            <FormField
              type="file"
              label={t("articles.coverImage")}
              onChange={(e) => setCoverImage(e.target.files[0])}
              accept="image/*"
            />
          </div>

          {/* Language Tabs */}
          <>
            <div className="flex items-center border-b border-slate-200 mb-4">
              {tabs.map((tab) => (
                <Button
                  key={tab.value}
                  variant="default"
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
                    activeTab === tab.value
                      ? "bg-(--color-primary)/70"
                      : "border-transparent text-slate-500 dark:text-white hover:text-slate-700"
                  }`}
                >
                  {t(tab.labelKey)}
                </Button>
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
              placeholder={t("articles.enterSummaryWithLocale", {
                locale: activeTab.toUpperCase(),
              })}
              className="mb-4 min-h-20"
            />
          </>
        </Card>
        <Card className="p-6 space-y-5">
          <Label className="mb-3 block text-sm font-medium">
            {t("articles.contentWithLocale", {
              locale: activeTab.toUpperCase(),
            })}
          </Label>
          <RichTextEditor
            key={activeTab}
            value={translations[activeTab]?.content || ""}
            onChange={(value) =>
              handleTranslationChange(activeTab, "content", value)
            }
            className="h-full overflow-y-auto"
            placeholder={t("articles.writeContentWithLocale", {
              locale: activeTab.toUpperCase(),
            })}
          />
        </Card>
      </div>
    </section>
  );
};

export default EditArticlePage;
