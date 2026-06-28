import useTranslation from "@/hooks/useTranslation";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, Globe, Eye, CheckCircle, XCircle } from "lucide-react";
import { articleService } from "@services/articleService";
import { Card } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { formatDate } from "@/utils/formatUtils";
import Loading from "@/components/Loading";

const ArticleDetailPage = () => {
  const { t } = useTranslation();

  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadArticle = async () => {
      try {
        const data = await articleService.getArticleBySlug(slug);
        if (mounted && data) setArticle(data);
      } catch (e) {
        console.warn("Failed to load article:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadArticle();
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return <Loading text={false} height={"20"} width={"20"} />;
  }

  if (!article) {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate("/articles")} className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 transition hover:bg-slate-100">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-title text-xl font-bold">{t("articleNotFound")}</h1>
        </div>
        <p className="text-sm">{t("theArticleYoureLookingForDoesntExistOrHasBeenRemoved")}</p>
      </section>
    );
  }

  const authorName = article.author?.fullName || article.authorName || "Unknown";
  const translation = article.translations?.[0] || {};

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          className="flex h-8 w-8 items-center justify-center rounded-xl cursor-pointer hover:bg-(--color-primary) p-0!"
          onClick={() => navigate("/articles")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="font-title text-xl font-bold">{translation.title || article.title || "Untitled"}</h1>
      </div>

      <Card className="p-6 space-y-6">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            <span>{authorName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(article.publishedAt || article.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="h-4 w-4" />
            <span>{article.locale || translation.locale || "N/A"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            <span>{article.viewCount || 0}</span>
          </div>
          <Badge>{article.status || (article?.isPublished ? "Published" : "Draft")}</Badge>
        </div>

        {/* Content */}
        <div className="prose prose-slate max-w-none">
          <div
            className="text-base text-slate-700 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: translation.content || article.content || "No content available.",
            }}
          />
        </div>

        {/* Actions */}
        {article.requiresApproval && (
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle className="h-4 w-4" />
              {t("approval.approve")}
            </Button>
            <Button variant="destructive" className="gap-2">
              <XCircle className="h-4 w-4" />
              {t("approval.reject")}
            </Button>
          </div>
        )}
      </Card>
    </section>
  );
};

export default ArticleDetailPage;
