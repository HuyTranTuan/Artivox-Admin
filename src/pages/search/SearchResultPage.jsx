import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { useTranslation } from "@hooks/useTranslation";
import { productService } from "@services/productService";
import { articleService } from "@services/articleService";
import { discountService } from "@services/discountService";

export default function SearchResultPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [articles, setArticles] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const results = await Promise.allSettled([
          productService.getProducts({ search: q }),
          articleService.getArticles(),
          discountService.getDiscounts(),
        ]);

        const productsRes = results[0].status === "fulfilled" ? results[0].value : [];
        const articlesRes = results[1].status === "fulfilled" ? results[1].value : [];
        const discountsRes = results[2].status === "fulfilled" ? results[2].value : [];

        setProducts(productsRes?.items || productsRes?.data || productsRes || []);

        // Safely extract arrays for articles and discounts
        const articlesList = articlesRes?.items || articlesRes?.data || articlesRes || [];
        const discountsList = discountsRes?.items || discountsRes?.data || discountsRes || [];

        // Filter articles locally
        const filteredArticles = (Array.isArray(articlesList) ? articlesList : []).filter((article) => {
          const title = article.translations?.[0]?.title?.toLowerCase() || "";
          const summary = article.translations?.[0]?.summary?.toLowerCase() || "";
          const lowerQ = q.toLowerCase();
          return title.includes(lowerQ) || summary.includes(lowerQ);
        });
        setArticles(filteredArticles);

        // Filter discounts locally
        const filteredDiscounts = (Array.isArray(discountsList) ? discountsList : []).filter((discount) => {
          const name = discount.name?.toLowerCase() || "";
          const code = discount.code?.toLowerCase() || "";
          const lowerQ = q.toLowerCase();
          return name.includes(lowerQ) || code.includes(lowerQ);
        });
        setDiscounts(filteredDiscounts);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [q]);

  const NoItem = () => (
    <div className="flex flex-col items-center justify-center p-8 text-slate-500">
      <Search className="h-8 w-8 mb-2 opacity-50" />
      <p>{t("search.noResult") || "No items found"}</p>
    </div>
  );

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          {t("search.resultsFor") || "Search results for"}: "{q}"
        </h2>
      </div>

      {loading ? (
        <div>{t("common.loading") || "Loading..."}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle>{t("sidebar.catalog") || "Products"}</CardTitle>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <NoItem />
              ) : (
                <ul className="space-y-2">
                  {products.map((item) => (
                    <li
                      key={item.id}
                      className="cursor-pointer hover:bg-slate-100 p-2 rounded-md transition"
                      onClick={() => {
                        const type = item.type ? item.type.toLowerCase() + "s" : "models";
                        navigate(`/catalog/${type}/${item.slug}`);
                      }}
                    >
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.type || "Model"}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Articles */}
          <Card>
            <CardHeader>
              <CardTitle>{t("sidebar.articles") || "Articles"}</CardTitle>
            </CardHeader>
            <CardContent>
              {articles.length === 0 ? (
                <NoItem />
              ) : (
                <ul className="space-y-2">
                  {articles.map((item) => (
                    <li
                      key={item.id}
                      className="cursor-pointer hover:bg-slate-100 p-2 rounded-md transition"
                      onClick={() => navigate(`/articles/${item.slug}`)}
                    >
                      <p className="font-semibold">
                        {item.translations?.[0]?.title || item.title}
                      </p>
                      <p className="text-sm text-slate-500">
                        {item.translations?.[0]?.summary?.substring(0, 50) || ""}...
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Discounts */}
          <Card>
            <CardHeader>
              <CardTitle>{t("sidebar.discounts") || "Discounts"}</CardTitle>
            </CardHeader>
            <CardContent>
              {discounts.length === 0 ? (
                <NoItem />
              ) : (
                <ul className="space-y-2">
                  {discounts.map((item) => (
                    <li
                      key={item.id}
                      className="cursor-pointer hover:bg-slate-100 p-2 rounded-md transition"
                      onClick={() => navigate(`/discount/${item.slug}`)} 
                    >
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-slate-500">
                        Code: {item.code}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
