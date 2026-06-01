import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import RichTextEditor from "@components/ui/RichTextEditor";
import { useUiStore } from "@store/uiStore";
import { useAuthStore } from "@store/authStore";
import { useTranslation } from "@hooks/useTranslation";
import { articleService } from "@services/articleService";
import Loading from "@components/Loading";

const statuses = [
  { value: "Draft", labelKey: "articles.draft" },
  { value: "Review", labelKey: "articles.review" },
  { value: "Published", labelKey: "articles.publishedStatus" },
];

const tabs = [
  { value: "vi", labelKey: "articles.vi" },
  { value: "en", labelKey: "articles.en" },
];

const EditArticlePage = () => {
  const { slug: articleSlug } = useParams();
  const navigate = useNavigate();
  const { currentLanguage: lang } = useUiStore();
  const [activeTab, setActiveTab] = useState("vi");
  
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("Draft");
  const [coverImage, setCoverImage] = useState(null);
  const [currentCoverImage, setCurrentCoverImage] = useState("");
  
  const [translations, setTranslations] = useState({
    vi: { title: "", content: "", locale: "vi" },
    en: { title: "", content: "", locale: "en" },
  });
  
  const { t } = useTranslation();
  const { user } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

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
          setStatus(article.status || "Draft");
          setCurrentCoverImage(article.coverImage || "");
          
          const newTranslations = {
            vi: { title: "", content: "", locale: "vi" },
            en: { title: "", content: "", locale: "en" },
          };
          
          if (article.translations && Array.isArray(article.translations)) {
            article.translations.forEach(trans => {
              if (trans.locale === "vi" || trans.locale === "en") {
                newTranslations[trans.locale] = {
                  title: trans.title || "",
                  content: trans.content || "",
                  locale: trans.locale,
                };
              }
            });
          }
          setTranslations(newTranslations);
        }
      } catch (err) {
        console.error("Failed to fetch article", err);
        setError("Failed to load article");
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
      setError(t("articles.slugRequired") || "Slug is required");
      return;
    }
    
    const validTranslations = [translations.vi, translations.en].filter(t => t.title && t.title.trim() !== "");
    if (validTranslations.length === 0) {
      setError(t("articles.translationRequired") || "At least one translation with a title is required");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("slug", slug);
      formData.append("status", status);
      formData.append("translations", JSON.stringify(validTranslations));

      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      await articleService.updateArticle(articleSlug, formData);
      navigate("/articles");
    } catch (err) {
      console.error("Failed to update article", err);
      setError("Failed to update article");
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
          <button onClick={handleCancel} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="font-title text-xl font-bold text-slate-900">{t("articles.editArticle")}</h2>
        </div>
        <Button onClick={handleSave} className="gap-2" disabled={!canUpdate || isSaving}>
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : t("articles.save")}
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <Card className="p-6 space-y-5">
        {/* Slug / URL */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("articles.slug")}</label>
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
          <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("articles.coverImage")}</label>
          {currentCoverImage && !coverImage && (
            <div className="mb-3">
              <img src={currentCoverImage} alt="Current cover" className="h-32 w-auto object-cover rounded-lg border border-slate-200" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files[0])}
            className="h-10 w-full rounded-xl border border-slate-300 px-3 py-1.5 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          />
          <p className="mt-1 text-xs text-slate-500">
            {t("articles.coverImageHelp") || "Upload a new image to replace the current one."}
          </p>
        </div>

        {/* Status */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("articles.status")}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            disabled={user?.role !== "ADMIN" && user?.role !== "MANAGER"}
          >
            {statuses.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </option>
            ))}
          </select>
        </div>

        {/* Language Tabs */}
        <div>
          <div className="flex items-center border-b border-slate-200 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
                  activeTab === tab.value ? "border-amber-500 text-amber-600" : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("articles.titleWithLocale", { locale: activeTab.toUpperCase() })}</label>
            <input
              type="text"
              value={translations[activeTab]?.title || ""}
              onChange={(e) => handleTranslationChange(activeTab, "title", e.target.value)}
              placeholder={t("articles.enterTitleWithLocale", { locale: activeTab.toUpperCase() })}
              className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Content - Rich Text Editor */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("articles.contentWithLocale", { locale: activeTab.toUpperCase() })}</label>
            <RichTextEditor
              key={activeTab}
              value={translations[activeTab]?.content || ""}
              onChange={(value) => handleTranslationChange(activeTab, "content", value)}
              placeholder={t("articles.writeContentWithLocale", { locale: activeTab.toUpperCase() })}
            />
          </div>
        </div>
      </Card>
    </section>
  );
};

export default EditArticlePage;
