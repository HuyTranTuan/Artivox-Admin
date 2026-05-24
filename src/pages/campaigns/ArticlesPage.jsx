import { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  FilePenLine,
  Languages,
  Plus,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { articleService } from "@services/articleService";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { formatDate } from "@/utils/formatUtils";
import { toSafeNumber } from "@utils/bigint";
import { useUiStore } from "@store/uiStore";
import { useTranslation } from "@hooks/useTranslation";

const normalizeArticle = (currentLang, rawItem, index = 0) => {
  const translation =
    rawItem?.translations?.find(
      (translate) => translate.locale === currentLang,
    ) ||
    rawItem?.translations?.[0] ||
    {};
  const articleId = rawItem?.id || rawItem?._id || `article-${index}`;

  return {
    id: articleId,
    slug: rawItem?.slug || String(articleId),
    title: translation.title || `Article ${index + 1}`,
    summary: translation.summary || `Article ${index + 1} summary`,
    content: translation.content || "", // Extracted from translations
    coverImage: rawItem?.coverImage || null, // Extracted from root
    locale: translation.locale || rawItem?.locale || rawItem?.language || "EN",
    author: rawItem?.author?.fullName || rawItem?.authorName || "Unknown",
    status:
      rawItem?.status ||
      (rawItem?.publishedAt || rawItem?.publishDate ? "Published" : "Draft"),
    publishedAt: rawItem?.publishedAt || rawItem?.publishDate || null,
    createdAt: rawItem?.createdAt || null,
    updatedAt: rawItem?.updatedAt || null,
    views: Number(rawItem?.views ?? rawItem?.viewCount ?? 0),
  };
};

const ArticlesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentLanguage: lang } = useUiStore();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const articles = await articleService.getArticles();
      const normalized = articles.map((article) =>
        normalizeArticle(lang, article),
      );
      setArticles(normalized);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleView = (slug) => {
    navigate(`/articles/${slug}`);
  };

  const dynamicStats = useMemo(() => {
    const active = articles.filter(
      (a) =>
        a.status === "Published" ||
        a.status === "ACTIVE" ||
        a.status === "active",
    ).length;
    const localesArray = [
      ...new Set(articles.map((a) => a.locale).filter(Boolean)),
    ];
    const locales = localesArray.length > 0 ? localesArray.join(" / ") : "EN";
    const totalViews = articles.reduce(
      (acc, a) => acc + (Number(a.views) || 0),
      0,
    );
    const formattedViews =
      totalViews >= 1000
        ? (totalViews / 1000).toFixed(1) + "K"
        : totalViews.toString();

    return [
      {
        label: t("articles.activeCampaigns"),
        value: active.toString(),
        icon: FilePenLine,
      },
      { label: t("articles.localeCoverage"), value: locales, icon: Languages },
      { label: t("articles.totalViews"), value: formattedViews, icon: Eye },
    ];
  }, [articles, t]);

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {dynamicStats.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-title text-2xl font-bold text-slate-900">
                  {item.value}
                </div>
                <div className="text-xs text-slate-500">{item.label}</div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="font-title text-xl font-bold text-slate-950">
            {t("articles.title")}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="h-10 w-10 p-0!"
              onClick={loadArticles}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              className="gap-2"
              onClick={() => navigate("/articles/create")}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          className="overflow-x-auto"
          style={{ maxHeight: "calc(100vh - 340px)" }}
        >
          <div className="min-w-200">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_120px] gap-4 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.2em] font-bold text-slate-900 border-b border-slate-300 sticky top-0 z-10">
                <div>{t("articles.titleLabel")}</div>
                <div>{t("articles.locale")}</div>
                <div>{t("articles.author")}</div>
                <div>{t("articles.status")}</div>
                <div>{t("articles.published")}</div>
                <div>{t("articles.actions")}</div>
              </div>

              <div
                className="overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 420px)" }}
              >
                {loading ? (
                  <div className="px-4 py-8 text-sm text-slate-500">
                    {t("articles.loading")}
                  </div>
                ) : articles.length === 0 ? (
                  <div className="px-4 py-8 text-sm text-slate-500">
                    {t("articles.empty")}
                  </div>
                ) : (
                  articles.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_120px] gap-4 border-b border-slate-200 px-4 py-4 text-sm text-slate-600 transition ${idx % 2 === 1 ? "bg-slate-100" : "bg-white"} hover:bg-orange-100`}
                    >
                      <div>
                        <div
                          className="font-title text-base font-semibold text-slate-900 cursor-pointer hover:text-amber-600"
                          onClick={() => navigate(`/articles/${item.slug}`)}
                        >
                          {item.title}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {toSafeNumber(item.views).toLocaleString("en-US")}{" "}
                          {t("articles.views")}
                        </div>
                      </div>
                      <div>{item.locale}</div>
                      <div>{item.author}</div>
                      <div>
                        <Badge>{item.status}</Badge>
                      </div>
                      <div>{formatDate(item.publishedAt)}</div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleView(item.slug)}
                          className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
                          style={{ padding: 5 }}
                        >
                          <Eye style={{ width: 18, height: 18 }} />
                        </button>
                        <button
                          className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition"
                          style={{ padding: 5 }}
                        >
                          <Pencil style={{ width: 18, height: 18 }} />
                        </button>
                        <button
                          className="h-8 w-8 flex items-center justify-center rounded-[5px] border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
                          style={{ padding: 5 }}
                        >
                          <Trash2 style={{ width: 18, height: 18 }} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default ArticlesPage;
