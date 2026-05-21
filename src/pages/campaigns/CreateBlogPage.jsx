import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import RichTextEditor from "@components/ui/RichTextEditor";
import { useUiStore } from "@store/uiStore";
import { useTranslation } from "@hooks/useTranslation";

const statuses = [
  { value: "Draft", labelKey: "articles.draft" },
  { value: "Review", labelKey: "articles.review" },
  { value: "Published", labelKey: "articles.publishedStatus" },
];

const tabs = [
  { value: "vi", labelKey: "articles.vi" },
  { value: "en", labelKey: "articles.en" },
];

const CreateBlogPage = () => {
  const navigate = useNavigate();
  const { currentLanguage: lang } = useUiStore();
  const [activeTab, setActiveTab] = useState("vi");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("Draft");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState("general");
  const [tags, setTags] = useState("");
  const [translations, setTranslations] = useState({
    vi: { title: "", content: "" },
    en: { title: "", content: "" },
  });
  const { t } = useTranslation();

  const handleSave = () => {
    navigate("/blogs");
  };

  const handleCancel = () => {
    navigate("/blogs");
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
          <button onClick={handleCancel} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="font-title text-xl font-bold text-slate-900">{t("articles.createArticle")}</h2>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          {t("articles.save")}
        </Button>
      </div>

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
          <input
            type="text"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder={t("articles.coverImagePlaceholder")}
            className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          />
        </div>

        {/* Category */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          >
            <option value="general">General</option>
            <option value="technology">Technology</option>
            <option value="design">Design</option>
            <option value="materials">Materials</option>
            <option value="news">News</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Tags</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Enter tags separated by commas"
            className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          />
        </div>

        {/* Status */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("articles.status")}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
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

export default CreateBlogPage;
