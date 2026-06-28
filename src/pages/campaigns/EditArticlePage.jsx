import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import RichTextEditor from "@/components/RichTextEditor";
import { useUiStore } from "@store/uiStore";
import { useAuthStore } from "@store/authStore";
import { useRBAC } from "@hooks/useRBAC";
import { useTranslation } from "@hooks/useTranslation";
import useToast from "@hooks/useToast";
import { articleService } from "@services/articleService";
import Loading from "@components/Loading";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const tabs = [
  { value: "vi", labelKey: "articles.vi" },
  { value: "en", labelKey: "articles.en" },
];

const EditArticlePage = () => {
  const { slug: articleSlug } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("vi");

  const [slug, setSlug] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [currentCoverImage, setCurrentCoverImage] = useState("");

  const [translations, setTranslations] = useState({
    vi: { title: "", summary: "", content: "", locale: "vi" },
    en: { title: "", summary: "", content: "", locale: "en" },
  });

  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { toastTopRight } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "ADMIN" || user?.role === "MANAGER";
  const permission = useMemo(() => {
    if (!user?.permission) return {};
    if (typeof user.permission === "object") return user.permission;
    try {
      const validJsonString = user.permission.replace(/([a-zA-Z0-9_]+)(?=\s*:)/g, '"$1"');
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
  }, [articleSlug]);

  const handleSave = async () => {
    if (!canUpdate) return;
    setError("");

    if (!slug.trim()) {
      setError(t("articles.slugRequired"));
      return;
    }

    const validTranslations = [translations.vi, translations.en].filter((t) => t.title && t.title.trim() !== "");
    if (validTranslations.length === 0) {
      setError(t("articles.translationRequired"));
      return;
    }

    setIsSaving(true);
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
      {error && <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

      <Card className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button onClick={handleCancel} variant="outline" size="icon-sm" className="h-8 w-8 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="font-title text-xl font-bold ">{t("catalog.edit")}</h2>
          </div>
          <Button onClick={handleSave} variant="primary" className="gap-2 px-4 py-2 rounded-xl" disabled={!canUpdate || isSaving}>
            <Save className="h-4 w-4" />
            {isSaving ? t("common.saving") : t("articles.save")}
          </Button>
        </div>
        {/* Slug / URL */}
        <div>
          <Label className="mb-1.5 block text-sm font-medium ">{t("articles.slug")}</Label>
          <Input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={t("articles.slugPlaceholder")}
            className="h-10 w-full rounded-xl border border-slate-300 outline-none transition focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
          />
        </div>

        {/* Cover Image */}
        <div>
          <Label className="mb-1.5 block text-sm font-medium ">{t("articles.coverImage")}</Label>
          {currentCoverImage && !coverImage && (
            <div className="mb-3">
              <img src={currentCoverImage} alt="Current cover" className="h-32 w-auto object-cover rounded-xl border border-slate-200" />
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files[0])}
            className="h-12 w-full rounded-xl border border-slate-300 outline-none transition focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
          />
          <p className="mt-1 text-xs ">{t("articles.coverImage")}</p>
        </div>

        {/* Language Tabs */}
        <div>
          <div className="flex gap-2.5 items-center border-b border-slate-200 mb-4">
            {tabs.map((tab) => (
              <Button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                variant="outline"
                className={`px-4 py-2.5 text-sm font-medium transition ${activeTab === tab.value ? "text-(--color-secondary) bg-(--color-primary)/80" : "border-transparent"}`}
              >
                {t(tab.labelKey)}
              </Button>
            ))}
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium ">
              {t("articles.titleWithLocale", {
                locale: activeTab.toUpperCase(),
              })}
            </label>
            <Input
              value={translations[activeTab]?.title || ""}
              onChange={(e) => handleTranslationChange(activeTab, "title", e.target.value)}
              placeholder={t("articles.enterTitleWithLocale", {
                locale: activeTab.toUpperCase(),
              })}
              className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm  outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Summary */}
          <div className="mb-4">
            <Label className="mb-1.5 block text-sm font-medium ">
              {t("articles.summaryWithLocale", {
                locale: activeTab.toUpperCase(),
              })}
            </Label>
            <Textarea
              value={translations[activeTab]?.summary || ""}
              onChange={(e) => handleTranslationChange(activeTab, "summary", e.target.value)}
              placeholder={t("articles.enterSummaryWithLocale", {
                locale: activeTab.toUpperCase(),
              })}
              className="min-h-20 w-full rounded-xl border border-slate-300 p-3 text-sm  outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Content - Rich Text Editor */}
          <div>
            <Label className="mb-1.5 block text-sm font-medium ">
              {t("articles.contentWithLocale", {
                locale: activeTab.toUpperCase(),
              })}
            </Label>
            <RichTextEditor
              key={activeTab}
              value={translations[activeTab]?.content || ""}
              onChange={(value) => handleTranslationChange(activeTab, "content", value)}
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

export default EditArticlePage;
