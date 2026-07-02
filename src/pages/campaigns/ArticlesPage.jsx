import { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  FilePenLine,
  Languages,
  Pencil,
  Trash2,
  CheckCircle,
} from "lucide-react";

import { articleService } from "@services/articleService";
import { Badge } from "@components/ui/badge";
import { Card } from "@components/ui/card";
import {
  DataTable,
  TableToolbar,
  TablePagination,
  useDataTable,
} from "@components/DataTable";
import useToast from "@hooks/useToast";
import { formatDate } from "@/utils/formatUtils";
import { toSafeNumber } from "@utils/bigint";
import { useUiStore } from "@store/uiStore";
import { useAuthStore } from "@store/authStore";
import { useTranslation } from "@hooks/useTranslation";
import { useExpandableSearch } from "@hooks/useExpandableSearch";
import { useDebounce } from "@hooks/useDebounce";
import SummaryCard from "@/components/SummaryCard";
import { Button } from "@/components/ui/button";

const normalizeArticle = (currentLang, rawItem, index = 0) => {
  const translation =
    rawItem?.translations?.find((t) => t.locale === currentLang) ||
    rawItem?.translations?.[0] ||
    {};
  const articleId = rawItem?.id || rawItem?._id || `article-${index}`;
  return {
    id: articleId,
    slug: rawItem?.slug || String(articleId),
    title: translation.title || `Article ${index + 1}`,
    summary: translation.summary || "",
    locale: translation.locale || rawItem?.locale || "EN",
    author: rawItem?.author?.fullName || rawItem?.authorName || "Unknown",
    status: rawItem?.deletedAt
      ? "Deleted"
      : rawItem?.publishedAt || rawItem?.publishDate
        ? "Published"
        : "Draft",
    publishedAt: rawItem?.publishedAt || rawItem?.publishDate || null,
    views: Number(rawItem?.views ?? rawItem?.viewCount ?? 0),
  };
};

const ArticlesPage = () => {
  const { t } = useTranslation();
  const { toastTopRight } = useToast();
  const navigate = useNavigate();
  const { currentLanguage: lang } = useUiStore();
  const { user } = useAuthStore();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const search = useExpandableSearch();
  const debouncedSearch = useDebounce(search.value, 300);

  const isAdmin = user?.role === "ADMIN";
  const permission = useMemo(() => {
    if (!user?.permission) return {};
    if (typeof user.permission === "object") return user.permission;
    try {
      return JSON.parse(
        user.permission.replace(/([a-zA-Z0-9_]+)(?=\s*:)/g, '"$1"'),
      );
    } catch {
      return {};
    }
  }, [user]);
  const canCreate = isAdmin || permission.create;
  const canUpdate = isAdmin || permission.update;
  const canDelete = isAdmin || permission.del;

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await articleService.getArticles();
      setArticles(data.map((a, i) => normalizeArticle(lang, a, i)));
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const filtered = useMemo(() => {
    const kw = debouncedSearch.toLowerCase();
    if (!kw) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(kw) ||
        a.author.toLowerCase().includes(kw) ||
        a.status.toLowerCase().includes(kw),
    );
  }, [articles, debouncedSearch]);

  const dt = useDataTable({
    rows: filtered,
    keyField: "id",
    pageSize: 20,
    exportFilename: "articles",
    onExportRow: (r) => ({
      title: r.title,
      author: r.author,
      locale: r.locale,
      status: r.status,
      views: r.views,
      publishedAt: r.publishedAt,
    }),
  });

  const handleDelete = async (slug) => {
    if (!window.confirm(t("articles.confirmDelete", "Delete this article?")))
      return;
    try {
      await articleService.deleteArticle(slug);
      toastTopRight("success", t("articles.deleteSuccess"));
      loadArticles();
    } catch (e) {
      console.error(e);
      toastTopRight("error", t("articles.deleteError"));
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm(t("articles.confirmPublish", "Publish this article?")))
      return;
    try {
      await articleService.approveArticle(id);
      toastTopRight("success", t("articles.approveSuccess"));
      loadArticles();
    } catch (e) {
      console.error(e);
      toastTopRight("error", t("articles.approveError"));
    }
  };

  const dynamicStats = useMemo(() => {
    const active = filtered.filter((a) => a.status === "Published").length;
    const locales =
      [...new Set(articles.map((a) => a.locale).filter(Boolean))].join(" / ") ||
      "EN";
    const totalViews = articles
      .filter((a) => a.status === "Published")
      .reduce((acc, a) => acc + a.views, 0);
    return [
      {
        label: t("articles.activeCampaigns"),
        value: String(active),
        icon: FilePenLine,
      },
      { label: t("articles.localeCoverage"), value: locales, icon: Languages },
      {
        label: t("articles.totalViews"),
        value:
          totalViews >= 1000
            ? (totalViews / 1000).toFixed(1) + "K"
            : String(totalViews),
        icon: Eye,
      },
    ];
  }, [articles, filtered, t]);

  const columns = [
    {
      key: "title",
      label: t("articles.titleLabel"),
      width: "3fr",
      render: (row) => (
        <div className="">
          <div
            className="font-semibold cursor-pointer text-(--color-secondary) hover:text-(--color-primary)/90 transition-colors line-clamp-1 text-ellipsis"
            onClick={() => navigate(`/articles/${row.slug}`)}
          >
            {row.title}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {toSafeNumber(row.views).toLocaleString("en-US")}{" "}
            {t("articles.views")}
          </div>
        </div>
      ),
    },
    { key: "locale", label: t("articles.locale") },
    {
      key: "author",
      label: t("articles.author"),
      width: "2fr",
      render: (row) => (
        <div className="line-clamp-1 text-ellipsis">{row.author}</div>
      ),
    },
    {
      key: "status",
      label: t("common.status"),
      render: (row) => <Badge>{t(`status.${row.status}`, row.status)}</Badge>,
    },
    {
      key: "publishedAt",
      label: t("articles.published"),
      render: (row) => formatDate(row.publishedAt),
    },
    {
      key: "actions",
      label: t("common.actions"),
      sortable: false,
      width: "150px",
      render: (row) => (
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            className="h-8 w-8 p-2! flex items-center justify-center rounded-[5px] border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
            onClick={() => navigate(`/articles/${row.slug}`)}
          >
            <Eye className="h-5 w-5" />
          </Button>
          {canUpdate && (
            <Button
              variant="outline"
              className="h-8 w-8 p-2! flex items-center justify-center rounded-[5px] border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition"
              onClick={() => navigate(`/articles/${row.slug}/edit`)}
            >
              <Pencil className="h-5 w-5" />
            </Button>
          )}
          {isAdmin && !row.publishedAt && (
            <Button
              variant="outline"
              className="h-8 w-8 p-2! flex items-center justify-center rounded-[5px] border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition"
              onClick={() => handleApprove(row.id)}
            >
              <CheckCircle className="h-5 w-5" />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              className="h-8 w-8 p-2! flex items-center justify-center rounded-[5px] border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
              onClick={() => handleDelete(row.slug)}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {dynamicStats.map((item) => (
          <SummaryCard
            key={item.label}
            label={item.label}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </div>

      <Card className="p-6">
        <TableToolbar
          title={t("articles.title")}
          onAddNew={canCreate ? () => navigate("/articles/create") : null}
          onRefresh={loadArticles}
          onExportCsv={dt.handleExport}
          search={search}
          searchPlaceholder={t(
            "articles.searchPlaceholder",
            "Search articles...",
          )}
          filterOptions={[
            {
              key: "status",
              label: t("common.status", "Status"),
              values: ["Published", "Draft", "Deleted"],
              valuePrefix: "status.",
            },
          ]}
          activeFilters={{}}
          onFilterChange={() => {}}
        />

        <DataTable
          columns={columns}
          rows={dt.paginated}
          keyField="id"
          loading={loading}
          emptyMessage={t("articles.empty")}
          sortField={dt.sortField}
          sortDir={dt.sortDir}
          onSort={dt.toggleSort}
          checkedIds={dt.checkedIds}
          onToggleRow={dt.toggleRow}
          onToggleAll={dt.toggleAll}
          allChecked={dt.allChecked}
          someChecked={dt.someChecked}
        />

        <TablePagination
          currentPage={dt.currentPage}
          totalPages={dt.totalPages}
          totalItems={dt.totalItems}
          pageSize={20}
          onPage={dt.setPage}
        />
      </Card>
    </section>
  );
};

export default ArticlesPage;
